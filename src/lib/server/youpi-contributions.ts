import { createHmac, timingSafeEqual, createHash, randomUUID } from 'node:crypto'

const PAY_ORIGIN = 'https://pay.credonomics.in'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const COOKIE = 'credonomics_contribution'
const HEADERS = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' }
type Env = Record<string, string | undefined>
type Receipt = { paymentId: string; orderId: string; amount: number; attemptId: string; expires: number }
type Options = { env?: Env; fetch?: typeof fetch; now?: () => number }
const allowedAmount = (value: unknown): value is number => typeof value === 'number' && [10, 100, 500].includes(value)
const reply = (status: number, data: object, extra = {}) => Response.json(data, { status, headers: { ...HEADERS, ...extra } })

// Extra website-process budget. The existing Windows adapter enforces the
// authoritative durable cross-instance/restart budget; forwarded IPs are ignored.
const calls: number[] = []
export function createContributionHandlers(options: Options = {}) {
  const env = options.env || process.env
  const request = options.fetch || fetch
  const now = options.now || Date.now
  function config(requireEnabled = true) {
    if (requireEnabled && env.YOUPI_CONTRIBUTIONS_ENABLED !== 'true') throw new Error('COLLECTION_DISABLED')
    const site = new URL(env.CONTRIBUTIONS_SITE_ORIGIN || 'https://credonomics.in')
    if (site.protocol !== 'https:' || !['https://credonomics.in', 'https://www.credonomics.in'].includes(site.origin) || site.href !== site.origin + '/' ||
      !UUID.test(env.YOUPI_MERCHANT_ID || '') || !/^[a-f0-9]{64}$/.test(env.YOUPI_CONTRIBUTION_SECRET || '') ||
      new Set(env.YOUPI_CONTRIBUTION_SECRET).size < 8) throw new Error('CONTRIBUTION_CONNECTION_UNCONFIGURED')
    return { site: site.origin, merchant: env.YOUPI_MERCHANT_ID!, key: env.YOUPI_CONTRIBUTION_SECRET! }
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
  async function gateway(c: ReturnType<typeof config>, operation: 'readiness' | 'create' | 'status', fields: object = {}) {
    const endpoint = '/api/v1/merchant/contributions'
    const raw = JSON.stringify({ operation, origin: c.site, merchantId: c.merchant, ...fields })
    const timestamp = String(now()); const nonce = randomUUID()
    const hash = createHash('sha256').update(raw).digest('hex')
    const signature = createHmac('sha256', c.key).update(`POST\n${endpoint}\n${timestamp}\n${nonce}\n${hash}`).digest('hex')
    return json(PAY_ORIGIN + endpoint, { method: 'POST', body: raw, headers: {
      'Content-Type': 'application/json', 'X-Youpi-Timestamp': timestamp, 'X-Youpi-Nonce': nonce, 'X-Youpi-Signature': signature,
    } })
  }
  async function ready() {
    const c = config()
    const result = await gateway(c, 'readiness')
    // Gateway owns the installed authentication capability; no Vercel OTP guess.
    if (result.available !== true) throw new Error('PAYMENT_ACCEPTANCE_NOT_APPROVED')
    return c
  }
  function mac(data: string, key: string) { return createHmac('sha256', key).update('credonomics-contribution-v1:' + data).digest('hex') }
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
        const result = await gateway(c, 'create', { orderId, amount, attemptId: nonce })
        if (!UUID.test(result.paymentId) || result.orderId !== orderId || result.amountPaise !== String(amount * 100) ||
          result.currency !== 'INR' || result.checkoutUrl !== `${PAY_ORIGIN}/checkout/${result.paymentId}`) throw new Error('INVALID_GATEWAY_RESPONSE')
        const receipt: Receipt = { paymentId: result.paymentId, orderId, amount, attemptId: nonce, expires: now() + 86400000 }
        const encoded = Buffer.from(JSON.stringify(receipt)).toString('base64url')
        return reply(201, { checkoutUrl: result.checkoutUrl }, {
          'Set-Cookie': `${COOKIE}=${encoded}.${mac(encoded, c.key)}; Path=/api/contributions; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`,
        })
      } catch { return reply(503, { error: 'Online contributions unavailable', fallback: 'email' }) }
    },
    async confirmation(req: Request) {
      try {
        const c = config(false)
        const token = req.headers.get('cookie')?.match(/(?:^|;\s*)credonomics_contribution=([A-Za-z0-9_-]+\.[0-9a-f]{64})(?:;|$)/)?.[1]
        if (!token || token.length > 1024) return reply(401, { error: 'Contribution receipt required' })
        const [encoded, signature] = token.split('.')
        if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(mac(encoded, c.key), 'hex'))) return reply(401, { error: 'Invalid receipt' })
        const receipt: Receipt = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
        if (!UUID.test(receipt.paymentId) || !allowedAmount(receipt.amount) || !(receipt.expires > now())) return reply(401, { error: 'Expired receipt' })
        if (!UUID.test(receipt.attemptId)) return reply(401, { error: 'Invalid receipt' })
        const payment = await gateway(c, 'status', { paymentId: receipt.paymentId, orderId: receipt.orderId, amount: receipt.amount, attemptId: receipt.attemptId })
        if (!['SUCCESS', 'PENDING'].includes(payment.status)) throw new Error('INVALID_CONFIRMATION')
        return reply(200, { status: payment.status })
      } catch { return reply(503, { error: 'Confirmation unavailable' }) }
    },
  }
}
