import { createHmac, timingSafeEqual } from 'node:crypto'

const PAY_ORIGIN = 'https://pay.credonomics.in'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const COOKIE = 'credonomics_contribution'
const HEADERS = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' }
type Env = Record<string, string | undefined>
type Receipt = { paymentId: string; orderId: string; amount: number; expires: number }
type Options = { env?: Env; fetch?: typeof fetch; now?: () => number }
const allowedAmount = (value: unknown): value is number => typeof value === 'number' && [10, 100, 500].includes(value)
const reply = (status: number, data: object, extra = {}) => Response.json(data, { status, headers: { ...HEADERS, ...extra } })

// One process-wide conservative budget. Deployment must also apply the host's
// durable edge rate limit before operator approval; forwarded IPs are not trusted.
const calls: number[] = []
export function createContributionHandlers(options: Options = {}) {
  const env = options.env || process.env
  const request = options.fetch || fetch
  const now = options.now || Date.now
  function config() {
    if (env.YOUPI_CONTRIBUTIONS_ENABLED !== 'true') throw new Error('COLLECTION_DISABLED')
    const site = new URL(env.CONTRIBUTIONS_SITE_ORIGIN || 'https://credonomics.in')
    const core = new URL(env.YOUPI_PRIVATE_CORE_URL || 'http://127.0.0.1:6100')
    if (site.protocol !== 'https:' || site.origin !== (env.CONTRIBUTIONS_SITE_ORIGIN || 'https://credonomics.in') ||
      core.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(core.hostname) || core.port !== '6100' ||
      core.username || core.password || core.pathname !== '/' || core.search || core.hash ||
      !UUID.test(env.YOUPI_MERCHANT_ID || '') || (env.YOUPI_MERCHANT_KEY || '').length < 32) throw new Error('PRIVATE_CONNECTION_UNCONFIGURED')
    return { site: site.origin, core: core.origin, merchant: env.YOUPI_MERCHANT_ID!, key: env.YOUPI_MERCHANT_KEY! }
  }
  async function json(url: string, init: RequestInit = {}) {
    const response = await request(url, { ...init, redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error('GATEWAY_UNAVAILABLE')
    const reader = response.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0
    if (!reader) throw new Error('EMPTY_RESPONSE')
    try { for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 65536) throw new Error('RESPONSE_TOO_LARGE'); chunks.push(value) } }
    finally { await reader.cancel().catch(() => {}) }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  }
  async function ready() {
    const c = config()
    const [portal, core] = await Promise.all([json(PAY_ORIGIN + '/health'), json(c.core + '/health')])
    if (portal.service !== 'checkout-portal' || portal.securityProfile !== 'public-checkout-v1' ||
      portal.collectionEnabled !== true || portal.otpDeliveryEnabled !== true || core.service !== 'payment-api' ||
      core.securityProfile !== 'original-checkout-lifecycle-v1' || core.productionMode !== true || core.privateDeployment !== true) throw new Error('PAYMENT_ACCEPTANCE_NOT_APPROVED')
    return c
  }
  function mac(data: string, key: string) { return createHmac('sha256', key).update('credonomics-contribution-v1:' + data).digest('hex') }
  function credentials(c: ReturnType<typeof config>) { return { 'X-Merchant-Id': c.merchant, 'X-Merchant-Key': c.key } }
  return {
    async GET() {
      try { await ready(); return reply(200, { available: true }) }
      catch { return reply(200, { available: false }) }
    },
    async POST(req: Request) {
      try {
        // Origin uses configured canonical website origin, never forwarded headers.
        const expectedOrigin = env.CONTRIBUTIONS_SITE_ORIGIN || 'https://credonomics.in'
        if (req.headers.get('origin') !== expectedOrigin || req.headers.get('sec-fetch-site') === 'cross-site' ||
          !/^application\/json(?:;|$)/i.test(req.headers.get('content-type') || '')) return reply(403, { error: 'Request rejected' })
        const nonce = req.headers.get('idempotency-key') || ''
        if (!UUID.test(nonce)) return reply(400, { error: 'Invalid request' })
        const reader = req.body?.getReader(); let size = 0; const chunks: Uint8Array[] = []
        if (!reader) return reply(400, { error: 'Invalid amount' })
        try { for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 1024) return reply(413, { error: 'Request too large' }); chunks.push(value) } }
        finally { await reader.cancel().catch(() => {}) }
        let body
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { return reply(400, { error: 'Invalid request' }) }
        if (!body || Array.isArray(body) || Object.keys(body).some(k => k !== 'amount') || !allowedAmount(body.amount)) return reply(400, { error: 'Choose 10, 100 or 500 rupees' })
        const c = await ready() // Must pass before any session-creation request.
        while (calls.length && calls[0] <= now() - 3600000) calls.shift()
        if (calls.length >= 20) return reply(429, { error: 'Please try later' })
        calls.push(now())
        const amount = body.amount as number
        const orderId = 'contribution_' + mac(`${c.merchant}:${nonce}:${amount}`, c.key).slice(0, 40)
        const result = await json(c.core + '/api/v1/payments', {
          method: 'POST', headers: { ...credentials(c), 'Content-Type': 'application/json', 'Idempotency-Key': orderId },
          body: JSON.stringify({ orderId, amount: amount.toFixed(2), currency: 'INR', method: 'UPI',
            returnUrl: c.site + '/', metadata: { purpose: 'credonomics_contribution' } }),
        })
        if (!UUID.test(result.paymentId) || result.orderId !== orderId || result.amountPaise !== String(amount * 100) ||
          result.currency !== 'INR' || result.checkoutUrl !== `${PAY_ORIGIN}/checkout/${result.paymentId}`) throw new Error('INVALID_GATEWAY_RESPONSE')
        const receipt: Receipt = { paymentId: result.paymentId, orderId, amount, expires: now() + 86400000 }
        const encoded = Buffer.from(JSON.stringify(receipt)).toString('base64url')
        return reply(201, { checkoutUrl: result.checkoutUrl }, {
          'Set-Cookie': `${COOKIE}=${encoded}.${mac(encoded, c.key)}; Path=/api/contributions; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`,
        })
      } catch { return reply(503, { error: 'Online contributions unavailable', fallback: 'email' }) }
    },
    async confirmation(req: Request) {
      try {
        const c = config()
        const token = req.headers.get('cookie')?.match(/(?:^|;\s*)credonomics_contribution=([A-Za-z0-9_-]+\.[0-9a-f]{64})(?:;|$)/)?.[1]
        if (!token || token.length > 1024) return reply(401, { error: 'Contribution receipt required' })
        const [encoded, signature] = token.split('.')
        if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(mac(encoded, c.key), 'hex'))) return reply(401, { error: 'Invalid receipt' })
        const receipt: Receipt = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
        if (!UUID.test(receipt.paymentId) || !allowedAmount(receipt.amount) || !(receipt.expires > now())) return reply(401, { error: 'Expired receipt' })
        const payment = await json(c.core + '/api/v1/payments/' + receipt.paymentId, { headers: credentials(c) })
        if (payment.paymentId !== receipt.paymentId || payment.orderId !== receipt.orderId || payment.amountPaise !== String(receipt.amount * 100) ||
          payment.currency !== 'INR' || payment.method !== 'UPI' || payment.metadata?.purpose !== 'credonomics_contribution') throw new Error('CONTRIBUTION_MISMATCH')
        const verified = payment.status === 'SUCCESS' && payment.internalStatus === 'SUCCESS' &&
          payment.verificationLevel >= 1 && Array.isArray(payment.verificationSources) && payment.verificationSources.includes('GMAIL') && !!payment.completedAt
        return reply(200, { status: verified ? 'SUCCESS' : 'PENDING' })
      } catch { return reply(503, { error: 'Confirmation unavailable' }) }
    },
  }
}
