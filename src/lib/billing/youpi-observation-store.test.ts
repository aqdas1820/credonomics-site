import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
const { rpc, client, scope } = vi.hoisted(() => ({ rpc: vi.fn(), client: vi.fn(), scope: vi.fn() }))
vi.mock('../supabase/admin', () => ({ createSupabaseAdminClient: client }))
vi.mock('../../../app/billing/db-scope', () => ({ billingDatabaseScopeReady: scope }))
import { recordSignedYoupiObservation as record } from './youpi-observation-store'

const secret = 'synthetic-only-webhook-secret-for-tests'
const payload = { event: 'SUCCESS', orderId: 'CN-2026-00000001',
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
