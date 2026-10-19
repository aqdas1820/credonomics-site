import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
const { rpc, client, scope } = vi.hoisted(() => ({
  rpc: vi.fn(), client: vi.fn(), scope: vi.fn(),
}))
vi.mock('../supabase/admin', () => ({ createSupabaseAdminClient: client }))
vi.mock('../../../app/billing/db-scope', () => ({ billingDatabaseScopeReady: scope }))
import { issueAutomaticInvoiceFromTrustedEvent as issue } from './system-issuance'

const input = { date: '2026-10-18', customer: ' Example ', items: [
  { description: ' Service ', quantity: '2', rate: '1.50' },
] }
const existing = { id: '12345678-1234-4234-8234-123456789012', invoiceNumber: 'CN-2026-00000001', totalPaise: 300, status: 'UNPAID' }

beforeEach(() => {
  vi.stubEnv('BILLING_API_ENABLED', 'true')
  vi.stubEnv('BILLING_SYSTEM_ENABLED', 'true')
  vi.stubEnv('BILLING_SYSTEM_ACTOR_ID', existing.id)
  scope.mockReturnValue(true)
  client.mockReturnValue({ rpc })
  rpc.mockResolvedValue({ data: existing, error: null })
})
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks() })

describe('trusted SYSTEM issuance adapter (database is mocked)', () => {
  it('sends normalized financial inputs and an immutable source identity', async () => {
    expect(await issue('sale:12345678', input)).toEqual(existing)
    expect(rpc).toHaveBeenCalledWith('billing_create_invoice', expect.objectContaining({
      p_customer_name: 'Example', p_origin: 'SYSTEM', p_source_event_key: 'sale:12345678',
      p_lines: [{ position: 0, description: 'Service', quantity: 2, rate_paise: 150, line_total_paise: 300 }],
    }))
  })
  it('returns the database retry result even after the invoice has been paid', async () => {
    await issue('sale:12345678', input)
    rpc.mockResolvedValue({ data: { ...existing, status: 'PAID' }, error: null })
    expect(await issue('sale:12345678', input)).toEqual({ ...existing, status: 'PAID' })
  })
  it('surfaces payload conflict explicitly without leaking database details', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'P1701', message: 'private details' } })
    await expect(issue('sale:12345678', input)).rejects.toThrow('SYSTEM_EVENT_PAYLOAD_CONFLICT')
  })
  it.each(['BILLING_API_ENABLED', 'BILLING_SYSTEM_ENABLED'])('fails closed when %s is disabled', async flag => {
    vi.stubEnv(flag, 'false')
    await expect(issue('sale:12345678', input)).rejects.toThrow('disabled')
    expect(rpc).not.toHaveBeenCalled()
  })
  it('denies mismatched database project scope', async () => {
    scope.mockReturnValue(false)
    await expect(issue('sale:12345678', input)).rejects.toThrow('disabled')
    expect(client).not.toHaveBeenCalled()
  })
  it.each([{ ...input, status: 'PAID' }, { ...input, amountPaise: 1 }])('rejects client-selected financial authority', async bad => {
    await expect(issue('sale:12345678', bad)).rejects.toThrow('Invalid invoice fields')
    expect(rpc).not.toHaveBeenCalled()
  })
  it('rejects invalid event IDs before database access', async () => {
    await expect(issue('bad event', input)).rejects.toThrow('Invalid trusted')
    expect(rpc).not.toHaveBeenCalled()
  })
})
