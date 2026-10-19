import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
const { rpc, client, scope } = vi.hoisted(() => ({ rpc: vi.fn(), client: vi.fn(), scope: vi.fn() }))
vi.mock('../supabase/admin', () => ({ createSupabaseAdminClient: client }))
vi.mock('../../../app/billing/db-scope', () => ({ billingDatabaseScopeReady: scope }))
import { recordSignedYoupiObservation as record } from './youpi-observation-store'

const secret = 'synthetic-only-webhook-secret-for-tests'
const payload = { event: 'SUCCESS', method: 'UPI', orderId: 'CN-2026-00000001',
  paymentId: '12345678-1234-4234-8234-123456789012', currency: 'INR',
  amount: '1.00', amountPaise: 100, utr: 'TESTUTR00001' }
const body = Buffer.from(JSON.stringify(payload))
const sign = (b: Buffer) => 'sha256=' + createHmac('sha256', secret).update(b).digest('hex')

beforeEach(() => {
  vi.stubEnv('BILLING_API_ENABLED', 'true')
  vi.stubEnv('BILLING_YOUPI_OBSERVATION_ENABLED', 'true')
  vi.stubEnv('BILLING_YOUPI_WEBHOOK_SECRET', secret)
  scope.mockReturnValue(true)
  client.mockReturnValue({ rpc })
  rpc.mockResolvedValue({ data: { recorded: true, duplicate: false, decision: 'REVIEW_REQUIRED' }, error: null })
})
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks() })

describe('signed observation adapter (database is mocked)', () => {
  it('binds UUID-order observations through the saved merchant/session ledger', async () => {
    vi.stubEnv('YOUPI_MERCHANT_ID','22222222-2222-4222-8222-222222222222')
    vi.stubEnv('YOUPI_API_ORIGIN','https://api.example.org')
    vi.stubEnv('YOUPI_CHECKOUT_ORIGIN','https://pay.example.org')
    const uuidOrder = Buffer.from(JSON.stringify({ ...payload, orderId: 'CN-11111111-1111-4111-8111-111111111111' }))
    await record(uuidOrder, sign(uuidOrder))
    expect(rpc).toHaveBeenCalledWith('billing_record_youpi_link_observation', expect.objectContaining({
      p_invoice: '11111111-1111-4111-8111-111111111111', p_merchant: '22222222-2222-4222-8222-222222222222', p_payment: payload.paymentId,
    }))
  })
  it('does not put COD placement into the bank observation ledger', async () => {
    const cod = Buffer.from(JSON.stringify({ ...payload, method: 'COD', utr: null }))
    await expect(record(cod, sign(cod))).rejects.toThrow('Unsupported payment method')
    expect(client).not.toHaveBeenCalled()
  })
  it('rejects noninvoice order binding before creating a database client', async () => {
    const invalid = Buffer.from(JSON.stringify({ ...payload, orderId: 'arbitrary-order' }))
    await expect(record(invalid, sign(invalid))).rejects.toThrow('order binding')
    expect(client).not.toHaveBeenCalled()
  })
  it('records only review observations and acknowledges identical retries', async () => {
    expect(await record(body, sign(body))).toEqual({ recorded: true, duplicate: false, decision: 'REVIEW_REQUIRED' })
    rpc.mockResolvedValue({ data: { recorded: false, duplicate: true, decision: 'REVIEW_REQUIRED' }, error: null })
    expect(await record(body, sign(body))).toEqual({ recorded: false, duplicate: true, decision: 'REVIEW_REQUIRED' })
    expect(rpc.mock.calls.every(([name]) => name === 'billing_record_youpi_observation')).toBe(true)
  })
  it.each([
    { amount: '2.00', amountPaise: 200 }, { utr: 'TESTUTR00002' },
    { orderId: 'CN-2026-00000002' }, { extra: 'contradictory raw payload' },
  ])('surfaces contradictory signed delivery as a security conflict', async changes => {
    await record(body, sign(body))
    rpc.mockResolvedValue({ data: { recorded: false, duplicate: false, decision: 'SECURITY_REVIEW_CONFLICT' }, error: null })
    const changed = Buffer.from(JSON.stringify({ ...payload, ...changes }))
    await expect(record(changed, sign(changed))).rejects.toThrow('YOUPI_SECURITY_REVIEW_CONFLICT')
    expect(rpc.mock.calls[1][1].p_raw_sha256).not.toBe(rpc.mock.calls[0][1].p_raw_sha256)
  })
  it('rejects forgery before opening a database client', async () => {
    await expect(record(body, 'sha256=' + '0'.repeat(64))).rejects.toThrow('Unauthenticated')
    expect(client).not.toHaveBeenCalled()
  })
  it('rejects unknown orders returned by the database', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'Unknown invoice order' } })
    await expect(record(body, sign(body))).rejects.toThrow('not durably recorded')
  })
  it('rejects ambiguous acknowledgements', async () => {
    rpc.mockResolvedValue({ data: { recorded: true, duplicate: true, decision: 'REVIEW_REQUIRED' }, error: null })
    await expect(record(body, sign(body))).rejects.toThrow('Invalid YouPI')
  })
  it('denies disabled or wrong-scope observation writes', async () => {
    scope.mockReturnValue(false)
    await expect(record(body, sign(body))).rejects.toThrow('disabled')
    expect(client).not.toHaveBeenCalled()
  })
})
