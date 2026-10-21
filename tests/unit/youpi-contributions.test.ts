import { describe, it, expect, vi } from 'vitest'
import { createContributionHandlers } from '../../src/lib/server/youpi-contributions'
import { initiateSupport } from '../../app/components/support-payment'

const nonce = '11111111-1111-4111-8111-111111111111'
const id = '22222222-2222-4222-8222-222222222222'
const env = { YOUPI_CONTRIBUTIONS_ENABLED: 'true', YOUPI_MERCHANT_ID: nonce,
  YOUPI_MERCHANT_KEY: 'synthetic-only-merchant-secret-never-live-0123456789', CONTRIBUTIONS_SITE_ORIGIN: 'https://credonomics.in' }
const req = (amount: unknown, extra = {}) => new Request('https://credonomics.in/api/contributions', {
  method: 'POST', headers: { Origin: 'https://credonomics.in', 'Content-Type': 'application/json', 'Idempotency-Key': nonce },
  body: JSON.stringify({ amount, ...extra }),
})
function fixture(closed = false) {
  const creates: any[] = []
  let payment: any = {}
  const transport = vi.fn(async (input: any, init?: RequestInit) => {
    const url = String(input)
    if (url === 'https://pay.credonomics.in/health') return Response.json({ service: 'checkout-portal', securityProfile: 'public-checkout-v1', collectionEnabled: !closed, otpDeliveryEnabled: !closed })
    if (url === 'http://127.0.0.1:6100/health') return Response.json({ service: 'payment-api', securityProfile: 'original-checkout-lifecycle-v1', productionMode: true, privateDeployment: true })
    if (url === 'http://127.0.0.1:6100/api/v1/payments' && init?.method === 'POST') {
      const body = JSON.parse(init.body as string); creates.push(body)
      const paymentId = body.orderId.slice(-8) + '-2222-4222-8222-222222222222'
      payment = { paymentId, orderId: body.orderId, amountPaise: String(Number(body.amount) * 100), currency: 'INR',
        method: 'UPI', metadata: body.metadata, checkoutUrl: `https://pay.credonomics.in/checkout/${paymentId}`, status: 'INITIATED' }
      return Response.json(payment, { status: 201 })
    }
    if (url === `http://127.0.0.1:6100/api/v1/payments/${payment.paymentId}`) return Response.json(payment)
    throw new Error('Non-fixture transport forbidden')
  }) as unknown as typeof fetch
  const handlers = createContributionHandlers({ env, fetch: transport })
  return { handlers, creates, transport, get payment() { return payment }, mutate: (value: object) => Object.assign(payment, value) }
}
describe('server-owned existing YouPI contributions', () => {
  for (const amount of [10, 100, 500] as const) it(`button action ${amount} obtains the exact returned order-specific checkout URL`, async () => {
    const f = fixture()
    const client = vi.fn(async (_url: any, init: RequestInit) => {
      const body = JSON.parse(init.body as string)
      return f.handlers.POST(req(body.amount))
    }) as unknown as typeof fetch
    const url = await initiateSupport(amount, nonce, client)
    expect(url).toBe(f.payment.checkoutUrl)
    expect(url).toMatch(/^https:\/\/pay\.credonomics\.in\/checkout\/[a-f0-9-]{36}$/)
    expect(f.creates[0]).toMatchObject({ amount: amount.toFixed(2), currency: 'INR', method: 'UPI', metadata: { purpose: 'credonomics_contribution' } })
    expect(f.creates[0].orderId).toMatch(/^contribution_[a-f0-9]{40}$/)
    expect(f.creates[0]).not.toHaveProperty('autoActivate')
  })
  it('same attempt is idempotent; separate nonce or amount receives a distinct server order', async () => {
    const f = fixture(); await f.handlers.POST(req(10)); await f.handlers.POST(req(10)); await f.handlers.POST(req(100))
    const another = req(10); another.headers.set('Idempotency-Key', id); await f.handlers.POST(another)
    expect(f.creates[0].orderId).toBe(f.creates[1].orderId)
    expect(new Set(f.creates.map(c => c.orderId)).size).toBe(3)
  })
  it('all three amounts receive distinct order-specific URLs from the merchant API', async () => {
    const f = fixture(); const urls = []
    for (const amount of [10, 100, 500]) {
      const response = await f.handlers.POST(req(amount))
      urls.push((await response.json()).checkoutUrl)
      expect(f.payment.amountPaise).toBe(String(amount * 100))
    }
    expect(new Set(urls).size).toBe(3)
  })
  it('disabled approval gate performs no network or creation; fallback is retained', async () => {
    const transport = vi.fn(() => { throw new Error('Forbidden') }) as unknown as typeof fetch
    const h = createContributionHandlers({ env: {}, fetch: transport })
    expect(await (await h.GET()).json()).toEqual({ available: false })
    expect((await h.POST(req(10))).status).toBe(503)
    expect(transport).not.toHaveBeenCalled()
    const closed = fixture(true)
    expect((await closed.handlers.POST(req(100))).status).toBe(503)
    expect(closed.creates).toHaveLength(0)
  })
  for (const amount of [0, 1, 11, 1000, '10', null, -10, 10.01]) it(`rejects invalid amount ${amount}`, async () => {
    const f = fixture(); expect((await f.handlers.POST(req(amount))).status).toBe(400); expect(f.transport).not.toHaveBeenCalled()
  })
  it('rejects browser amount/state/VPA fields and cross-origin requests', async () => {
    const f = fixture()
    expect((await f.handlers.POST(req(10, { payeeVpa: 'attacker@invalid', status: 'SUCCESS' }))).status).toBe(400)
    const cross = req(10); cross.headers.set('origin', 'https://attacker.invalid')
    expect((await f.handlers.POST(cross)).status).toBe(403); expect(f.transport).not.toHaveBeenCalled()
  })
  it('does not accept public Core, wrong domain, substituted session or amount', async () => {
    const f = fixture()
    const h = createContributionHandlers({ env: { ...env, YOUPI_PRIVATE_CORE_URL: 'https://pay.credonomics.in' }, fetch: f.transport })
    expect((await h.POST(req(10))).status).toBe(503); expect(f.transport).not.toHaveBeenCalled()
    const badFetch = vi.fn(async () => Response.json({ checkoutUrl: 'https://attacker.invalid' })) as unknown as typeof fetch
    expect(await initiateSupport(10, nonce, badFetch)).toBeNull()
  })
  it('rejects upstream amount and redirect tampering and does not expose credentials', async () => {
    for (const tamper of [{ amountPaise: '1' }, { checkoutUrl: 'https://attacker.invalid/checkout/' + id }]) {
      const f = fixture()
      const transport = (async (url, init) => {
        const response = await f.transport(url, init)
        if (init?.method === 'POST') return Response.json({ ...await response.json(), ...tamper })
        return response
      }) as typeof fetch
      const h = createContributionHandlers({ env, fetch: transport })
      const response = await h.POST(req(10))
      expect(response.status).toBe(503)
      expect(await response.text()).not.toContain(env.YOUPI_MERCHANT_KEY)
    }
  })
  it('only private Core bank verification can produce SUCCESS; redirect/query/email assertions cannot', async () => {
    const f = fixture(); const result = await f.handlers.POST(req(10))
    const cookie = result.headers.get('set-cookie')!.split(';')[0]
    const check = () => f.handlers.confirmation(new Request('https://credonomics.in/api/contributions/confirmation?status=SUCCESS', { headers: { Cookie: cookie } }))
    expect(await (await check()).json()).toEqual({ status: 'PENDING' })
    f.mutate({ status: 'SUCCESS', internalStatus: 'SUCCESS', verificationLevel: 0, verificationSources: [], completedAt: new Date().toISOString() })
    expect(await (await check()).json()).toEqual({ status: 'PENDING' })
    f.mutate({ verificationLevel: 1, verificationSources: ['GMAIL'] })
    expect(await (await check()).json()).toEqual({ status: 'SUCCESS' })
    f.mutate({ amountPaise: '1' }); expect((await check()).status).toBe(503)
    expect((await f.handlers.confirmation(new Request('https://credonomics.in/api/contributions/confirmation?status=SUCCESS'))).status).toBe(401)
    const forged = cookie.slice(0, -1) + (cookie.endsWith('0') ? '1' : '0')
    expect((await f.handlers.confirmation(new Request('https://credonomics.in/api/contributions/confirmation', { headers: { Cookie: forged } }))).status).toBe(401)
  })
  it('bounds anonymous creation globally instead of trusting forwarded IP headers', async () => {
    const f = fixture(); let limited = false
    for (let n = 0; n < 25; n++) { const r = await f.handlers.POST(req(10)); if (r.status === 429) limited = true }
    expect(limited).toBe(true)
  })
})
