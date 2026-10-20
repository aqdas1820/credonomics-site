import { createHmac } from 'node:crypto'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
vi.mock('server-only', () => ({}))
const mocks = vi.hoisted(() => ({ scope: vi.fn(), service: vi.fn(), rpc: vi.fn() }))
vi.mock('../../app/billing/db-scope', () => ({ billingDatabaseScopeReady: mocks.scope }))
vi.mock('../../src/lib/supabase/admin', () => ({ createSupabaseAdminClient: mocks.service }))
import { POST } from '../../app/api/youpi/webhook/route'

const secret = 'synthetic-webhook-secret-for-tests-only'
const invoice = '11111111-1111-4111-8111-111111111111'
const payload = { event: 'SUCCESS', method: 'UPI', orderId: 'CN-' + invoice,
  paymentId: '33333333-3333-4333-8333-333333333333', currency: 'INR', amount: '1.00', amountPaise: 100, utr: 'TESTUTR00001' }
const body = Buffer.from(JSON.stringify(payload))
const sign = (raw: Buffer) => 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex')
const request = (raw: Buffer = body, headers: Record<string, string> = {}) => new NextRequest('https://www.credonomics.in/api/youpi/webhook', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-gateway-signature': sign(raw), ...headers }, body: new Uint8Array(raw),
})
beforeEach(() => {
  vi.resetAllMocks()
  for (const key of ['BILLING_API_ENABLED', 'BILLING_YOUPI_OBSERVATION_ENABLED', 'BILLING_YOUPI_WEBHOOK_ENABLED',
    'BILLING_YOUPI_UTR_LEDGER_APPROVED', 'YOUPI_LINK_LEDGER_APPROVED']) vi.stubEnv(key, 'true')
  vi.stubEnv('BILLING_YOUPI_WEBHOOK_SECRET', secret)
  vi.stubEnv('YOUPI_MERCHANT_ID', '22222222-2222-4222-8222-222222222222')
  vi.stubEnv('YOUPI_API_ORIGIN', 'https://api.example.org'); vi.stubEnv('YOUPI_CHECKOUT_ORIGIN', 'https://pay.example.org')
  mocks.scope.mockReturnValue(true)
  mocks.service.mockReturnValue({ rpc: mocks.rpc })
  mocks.rpc.mockResolvedValue({ data: { recorded: true, duplicate: false, decision: 'REVIEW_REQUIRED' }, error: null })
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs() })

it.each(['BILLING_API_ENABLED', 'BILLING_YOUPI_OBSERVATION_ENABLED', 'BILLING_YOUPI_WEBHOOK_ENABLED',
  'BILLING_YOUPI_UTR_LEDGER_APPROVED', 'YOUPI_LINK_LEDGER_APPROVED'])('fails closed with %s disabled', async key => {
  vi.stubEnv(key, 'false'); expect((await POST(request())).status).toBe(503)
  expect(mocks.service).not.toHaveBeenCalled()
})
it('denies wrong database scope and missing signing key', async () => {
  mocks.scope.mockReturnValue(false); expect((await POST(request())).status).toBe(503)
  mocks.scope.mockReturnValue(true); vi.stubEnv('BILLING_YOUPI_WEBHOOK_SECRET', '')
  expect((await POST(request())).status).toBe(503); expect(mocks.service).not.toHaveBeenCalled()
})
it('records exact signed bytes as a bound observation and exposes no invoice data', async () => {
  const response = await POST(request())
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ recorded: true, duplicate: false, decision: 'REVIEW_REQUIRED', settlement: 'NOT_VERIFIED' })
  expect(response.headers.get('cache-control')).toContain('no-store')
  expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith('billing_record_youpi_link_observation', expect.objectContaining({
    p_invoice: invoice, p_payment: payload.paymentId, p_amount: 100, p_utr: payload.utr,
  }))
})
it('acknowledges identical persisted retries without additional settlement calls', async () => {
  mocks.rpc.mockResolvedValue({ data: { recorded: false, duplicate: true, decision: 'REVIEW_REQUIRED' }, error: null })
  const response = await POST(request()); expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({ duplicate: true, settlement: 'NOT_VERIFIED' })
  expect(mocks.rpc).toHaveBeenCalledTimes(1)
})
it.each(['23505', 'conflict'])('returns a review conflict for %s without leaking database errors', async kind => {
  mocks.rpc.mockResolvedValue(kind === '23505' ? { data: null, error: { code: kind, message: 'PRIVATE DATABASE DETAIL' } } :
    { data: { decision: 'SECURITY_REVIEW_CONFLICT' }, error: null })
  const response = await POST(request()); expect(response.status).toBe(409)
  expect(JSON.stringify(await response.json())).not.toContain('PRIVATE')
})
it('requests retry on database outage or ambiguous acknowledgement', async () => {
  for (const result of [{ data: null, error: { message: 'PRIVATE ERROR' } }, { data: { decision: 'REVIEW_REQUIRED', recorded: true, duplicate: true }, error: null }]) {
    mocks.rpc.mockResolvedValue(result); expect((await POST(request())).status).toBe(503)
  }
})
it('rejects forged, malformed and altered payloads before any database access', async () => {
  expect((await POST(request(body, { 'x-gateway-signature': 'sha256=' + '0'.repeat(64) }))).status).toBe(401)
  for (const change of [{ method: 'COD' }, { method: 'CARD_COUNTER' }, { method: undefined }, { amount: '2.00' }, { currency: 'USD' }, { utr: null }]) {
    const raw = Buffer.from(JSON.stringify({ ...payload, ...change }))
    expect((await POST(request(raw))).status).toBe(401)
  }
  expect((await POST(request(Buffer.from('{')))).status).toBe(401)
  expect((await POST(request(body, { 'x-gateway-signature': 'bad' }))).status).toBe(401)
  expect(mocks.service).not.toHaveBeenCalled()
})
it('rejects legacy number-only orders, compression and wrong content types', async () => {
  expect((await POST(request(Buffer.from(JSON.stringify({ ...payload, orderId: 'CN-2026-00000001' }))))).status).toBe(400)
  expect((await POST(request(body, { 'content-encoding': 'gzip' }))).status).toBe(415)
  expect((await POST(request(body, { 'content-type': 'application/jsonp' }))).status).toBe(415)
  expect(mocks.service).not.toHaveBeenCalled()
})
it('bounds real chunked bytes even with a false length header, and cancels the stream', async () => {
  const cancel = vi.fn()
  const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(65536)); c.enqueue(new Uint8Array(1)) }, cancel })
  const req = new NextRequest('https://www.credonomics.in/api/youpi/webhook', {
    method: 'POST', headers: { 'content-type': 'application/json', 'content-length': '1', 'x-gateway-signature': sign(body) },
    body: stream, duplex: 'half',
  } as ConstructorParameters<typeof NextRequest>[1])
  expect((await POST(req)).status).toBe(413); expect(cancel).toHaveBeenCalledOnce()
  expect((await POST(request(body, { 'content-length': '65537' }))).status).toBe(413)
  expect((await POST(request(body, { 'content-length': '-1' }))).status).toBe(400)
  expect(mocks.service).not.toHaveBeenCalled()
})
it('cancels a stalled delivery at the total read deadline', async () => {
  vi.useFakeTimers(); const cancel = vi.fn()
  const req = new NextRequest('https://www.credonomics.in/api/youpi/webhook', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-gateway-signature': sign(body) },
    body: new ReadableStream({ cancel }), duplex: 'half',
  } as ConstructorParameters<typeof NextRequest>[1])
  const pending = POST(req); await vi.advanceTimersByTimeAsync(5000)
  expect((await pending).status).toBe(400); expect(cancel).toHaveBeenCalledOnce(); expect(mocks.service).not.toHaveBeenCalled()
})
