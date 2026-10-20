import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const { auth, client, rpc, scope } = vi.hoisted(() => ({ auth: vi.fn(), client: vi.fn(), rpc: vi.fn(), scope: vi.fn() }))
vi.mock('../../src/lib/supabase/server', () => ({ authenticatedUser: auth }))
vi.mock('../../src/lib/supabase/admin', () => ({ createSupabaseAdminClient: client }))
vi.mock('./db-scope', () => ({ billingDatabaseScopeReady: scope }))
import { GET as list, POST as create } from '../api/billing/admin/invoices/route'
import { GET as get } from '../api/billing/admin/invoices/[id]/route'
import { POST as credit } from '../api/billing/admin/invoices/[id]/verify-credit/route'
const id = '12345678-1234-4234-8234-123456789012'
const req = (body = '{}', origin = 'https://example.test') => new NextRequest('https://example.test/api/billing', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body })
beforeEach(() => {
  for (const key of ['BILLING_API_ENABLED', 'BILLING_WRITE_ENABLED', 'BILLING_SETTLEMENT_ENABLED']) vi.stubEnv(key, 'true')
  vi.stubEnv('BILLING_ADMIN_USER_IDS', id); scope.mockReturnValue(true)
  auth.mockResolvedValue({ user: { id, app_metadata: { billing_admin: true } } }); client.mockReturnValue({ rpc })
})
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks() })
describe('admin API denial boundaries (all database calls mocked)', () => {
  it.each([null, { id }, { id, user_metadata: { billing_admin: true } }, { id: '87654321-1234-4234-8234-123456789012', app_metadata: { billing_admin: true } }])('denies all read/write endpoints without trusted allowlisted identity', async user => {
    auth.mockResolvedValue({ user })
    for (const response of [await list(), await get(req(), { params: Promise.resolve({ id }) }), await create(req()), await credit(req(), { params: Promise.resolve({ id }) })]) {
      expect(response.status).toBe(403); expect(response.headers.get('cache-control')).toContain('no-store')
    }
    expect(client).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled()
  })
  it('denies wrong project before authentication and database access', async () => {
    scope.mockReturnValue(false)
    expect((await list()).status).toBe(404); expect((await create(req())).status).toBe(503)
    expect((await credit(req(), { params: Promise.resolve({ id }) })).status).toBe(503); expect(auth).not.toHaveBeenCalled()
  })
  it('rejects cross-origin mutation before authentication', async () => {
    expect((await create(req('{}', 'https://attacker.test'))).status).toBe(403)
    expect((await credit(req('{}', ''), { params: Promise.resolve({ id }) })).status).toBe(403)
    expect(auth).not.toHaveBeenCalled()
  })
  it('rejects client-forged financial fields and unbooked credit evidence before RPC', async () => {
    expect((await create(req(JSON.stringify({ date: '2026-10-18', customer: 'Synthetic', status: 'PAID', items: [{ description: 'Test', quantity: '1', rate: '1.00' }] })))).status).toBe(400)
    expect((await credit(req(JSON.stringify({ status: 'PAID', event: 'SUCCESS' })), { params: Promise.resolve({ id }) })).status).toBe(400)
    expect(rpc).not.toHaveBeenCalled()
  })
  it('rejects oversized stream even without a length header', async () => {
    expect((await create(req('x'.repeat(65537)))).status).toBe(413)
    expect((await credit(req('x'.repeat(8193)), { params: Promise.resolve({ id }) })).status).toBe(413)
    expect(rpc).not.toHaveBeenCalled()
  })
  it('contains authentication service failures without exposing internals', async () => {
    auth.mockRejectedValue(new Error('private authentication details'))
    const response = await list(); expect(response.status).toBe(503); expect(await response.text()).not.toContain('private authentication')
  })
})
