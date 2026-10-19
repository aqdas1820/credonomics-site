import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('server-only', () => ({}))
const { auth, client, scope, store, archive, render, rpc } = vi.hoisted(() => ({ auth: vi.fn(), client: vi.fn(), scope: vi.fn(), store: vi.fn(), archive: vi.fn(), render: vi.fn(), rpc: vi.fn() }))
vi.mock('../supabase/server', () => ({ authenticatedUser: auth }))
vi.mock('../supabase/admin', () => ({ createSupabaseAdminClient: client }))
vi.mock('../../../app/billing/db-scope', () => ({ billingDatabaseScopeReady: scope }))
vi.mock('./document-storage', () => ({ privateDocumentStore: store }))
vi.mock('./document-archive', () => ({ archivedDocument: archive }))
vi.mock('./document-pdf', () => ({ renderDocumentPdf: render }))
import { handleArchivedDocument as handle } from './document-handler'
const id = '12345678-1234-4234-8234-123456789012'
const params = { id, kind: 'invoice' }
const invoice = { id, invoiceNumber: 'CN-2026-00000001', customer: 'Synthetic', address: '', date: '2026-10-18', totalPaise: 100,
  items: [{ position: 0, description: 'Service', quantity: 1, ratePaise: 100, lineTotalPaise: 100 }] }
const request = (method = 'GET', origin = 'https://example.test') => new NextRequest('https://example.test/api/document', { method, headers: { origin } })
beforeEach(() => {
  vi.stubEnv('BILLING_API_ENABLED', 'true'); vi.stubEnv('BILLING_PDF_ARCHIVE_ENABLED', 'true'); vi.stubEnv('BILLING_ADMIN_USER_IDS', id)
  scope.mockReturnValue(true); auth.mockResolvedValue({ user: { id, app_metadata: { billing_admin: true } } })
  client.mockReturnValue({ rpc }); rpc.mockResolvedValue({ data: invoice, error: null }); store.mockResolvedValue({})
  archive.mockResolvedValue({ pdf: Buffer.from('%PDF-synthetic-only'), sha256: 'a'.repeat(64) })
})
afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs() })
describe('archived document authorization boundaries', () => {
  it('returns private attachment on authenticated GET and never generates on GET', async () => {
    const r = await handle(request(), params)
    expect(r.status).toBe(200); expect(r.headers.get('cache-control')).toContain('no-store')
    expect(r.headers.get('content-disposition')).toContain('attachment;')
    expect(archive.mock.calls[0][2]).toBeUndefined()
  })
  it('only POST permits initial archive generation', async () => {
    expect((await handle(request('POST'), params)).status).toBe(200)
    expect(archive.mock.calls[0][2]).toBe(render)
  })
  it.each(['BILLING_API_ENABLED', 'BILLING_PDF_ARCHIVE_ENABLED'])('denies disabled %s before auth/storage', async key => {
    vi.stubEnv(key, 'false'); expect((await handle(request(), params)).status).toBe(404); expect(auth).not.toHaveBeenCalled()
  })
  it('denies wrong project before database access', async () => {
    scope.mockReturnValue(false); expect((await handle(request(), params)).status).toBe(404); expect(client).not.toHaveBeenCalled()
  })
  it.each([null, { id }, { id, user_metadata: { billing_admin: true } }, { id, app_metadata: { billing_admin: 'true' } },
    { id: '87654321-1234-4234-8234-123456789012', app_metadata: { billing_admin: true } }])('denies missing/forged/unlisted identities', async user => {
    auth.mockResolvedValue({ user }); expect((await handle(request(), params)).status).toBe(403); expect(client).not.toHaveBeenCalled()
  })
  it.each(['https://evil.test', 'null', ''])('denies cross-origin POST %s before auth', async origin => {
    expect((await handle(request('POST', origin), params)).status).toBe(403); expect(auth).not.toHaveBeenCalled()
  })
  it('denies arbitrary document kind and traversal', async () => {
    expect((await handle(request(), { id: '../secret', kind: 'invoice' })).status).toBe(404)
    expect((await handle(request(), { id, kind: '../receipt' })).status).toBe(404)
  })
  it('does not disclose another invoice returned by a misbound RPC', async () => {
    rpc.mockResolvedValue({ data: { ...invoice, id: '87654321-1234-4234-8234-123456789012' }, error: null })
    expect((await handle(request(), params)).status).toBe(503); expect(store).not.toHaveBeenCalled()
  })
  it('does not treat invoice PAID/gateway success as a receipt snapshot', async () => {
    rpc.mockResolvedValue({ data: { ...invoice, status: 'PAID', paidPaise: 100 }, error: null })
    expect((await handle(request(), { id, kind: 'receipt' })).status).toBe(503); expect(store).not.toHaveBeenCalled()
  })
  it('contains provider errors without leaking paths or records', async () => {
    store.mockRejectedValue(new Error('private provider details'))
    const r = await handle(request(), params); expect(r.status).toBe(503); expect(await r.text()).not.toContain('private provider')
  })
  it('denies RPC failure before archive access', async () => {
    rpc.mockResolvedValue({ data: null, error: {} }); expect((await handle(request(), params)).status).toBe(404); expect(store).not.toHaveBeenCalled()
  })
})
