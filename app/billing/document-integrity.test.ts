import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { rpc, auth, admin, scope } = vi.hoisted(() => ({ rpc: vi.fn(), auth: vi.fn(), admin: vi.fn(), scope: vi.fn() }))
vi.mock('../../src/lib/supabase/server', () => ({ authenticatedUser: auth }))
vi.mock('../../src/lib/supabase/admin', () => ({ createSupabaseAdminClient: admin }))
vi.mock('./db-scope', () => ({ billingDatabaseScopeReady: scope }))
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND') } }))
vi.mock('./PrintInvoiceButton', () => ({ default: () => null }))
import InvoiceDocumentPage from './invoices/[id]/page'
import ReceiptPage from './invoices/[id]/receipt/page'
import styles from './invoices/[id]/invoice.module.css'

const id = '12345678-1234-4234-8234-123456789012'
const params = { id }
const invoice = { id, invoiceNumber: 'CN-2026-00000001', customer: 'Persisted customer',
  address: 'Persisted address', date: '2026-10-18', totalPaise: 10001, paidPaise: 0, status: 'UNPAID',
  items: [{ position: 0, description: 'Persisted service', quantity: 1, ratePaise: 10001, lineTotalPaise: 10001 }] }

beforeEach(() => {
  vi.stubEnv('BILLING_API_ENABLED', 'true')
  vi.stubEnv('BILLING_PORTAL_ENABLED', 'true')
  vi.stubEnv('BILLING_ADMIN_USER_IDS', id)
  scope.mockReturnValue(true)
  auth.mockResolvedValue({ user: { id, app_metadata: { billing_admin: true } } })
  admin.mockReturnValue({ rpc })
  rpc.mockResolvedValue({ data: invoice, error: null })
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetAllMocks() })

// Optional synthetic HTML export for the standalone Chromium layout checks.
// This never changes application auth, writes invoices, or archives real PDFs.
function exportFixture(name: string, html: string) {
  if (process.env.BILLING_DOCUMENT_FIXTURES !== '1') return
  let css = readFileSync(join(process.cwd(), 'app/billing/invoices/[id]/invoice.module.css'), 'utf8')
  css = css.replace(/\.([a-zA-Z][\w-]*)/g, (_match, key: string) => '.' + styles[key])
  const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
  const directory = join(process.cwd(), 'artifacts/billing-documents')
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, name + '.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' + globals + css + '</style></head><body>' + html + '</body></html>')
}

describe('persisted private document rendering', () => {
  it('loads identity, customer, date, lines and exact paise from the authorized database read', async () => {
    const html = renderToStaticMarkup(await InvoiceDocumentPage({ params }))
    for (const value of ['CN-2026-00000001', 'Persisted customer', 'Persisted address', 'Persisted service', '2026-10-18', '100.01']) {
      expect(html).toContain(value)
    }
    expect(rpc).toHaveBeenCalledWith('billing_get_invoice', { p_invoice_id: id })
    expect(html).not.toContain('Verified PAID receipt view')
    exportFixture('unpaid', html)
  })
  it('shows partial verified credit and outstanding balance without a PAID receipt', async () => {
    rpc.mockResolvedValue({ data: { ...invoice, paidPaise: 4000, status: 'PARTIAL' }, error: null })
    const html = renderToStaticMarkup(await InvoiceDocumentPage({ params }))
    expect(html).toContain('PARTIAL')
    expect(html).toContain('40.00')
    expect(html).toContain('60.01')
    expect(html).not.toContain('Verified PAID receipt view')
    exportFixture('partial', html)
  })
  it('links to a separate receipt only on full verified payment', async () => {
    rpc.mockResolvedValue({ data: { ...invoice, paidPaise: 10001, status: 'PAID' }, error: null })
    const html = renderToStaticMarkup(await InvoiceDocumentPage({ params }))
    expect(html).toContain('Verified PAID receipt view')
    expect(html).toContain('/receipt')
    exportFixture('paid', html)
  })
  it('preserves maximum supported amounts and long original lines', async () => {
    rpc.mockResolvedValue({ data: { ...invoice, customer: 'C'.repeat(120), totalPaise: 10000000000,
      items: [
        { position: 0, description: 'D'.repeat(300), quantity: 2147483647, ratePaise: 0, lineTotalPaise: 0 },
        { position: 1, description: 'Payable', quantity: 1, ratePaise: 10000000000, lineTotalPaise: 10000000000 },
      ] }, error: null })
    const html = renderToStaticMarkup(await InvoiceDocumentPage({ params }))
    expect(html).toContain('2147483647')
    expect(html).toContain('10,00,00,000.00')
    exportFixture('boundary', html)
  })
  it('renders the distinct immutable receipt snapshot rather than recalculating an invoice', async () => {
    rpc.mockResolvedValue({ data: { invoiceId: id, invoiceNumber: invoice.invoiceNumber,
      receiptNumber: 'CN-R-2026-00000001', version: 1, status: 'PAID',
      customer: 'Snapshot customer', invoiceDate: invoice.date,
      issuedAt: '2026-10-18T09:00:00Z', issuedBy: id, totalPaise: 10001, paidPaise: 10001, currency: 'INR',
      verifiedCredits: [{ utr: 'TESTUTR00001', amountPaise: 10001, bookedAt: '2026-10-18T08:00:00Z' }],
    }, error: null })
    const html = renderToStaticMarkup(await ReceiptPage({ params }))
    expect(rpc).toHaveBeenCalledWith('billing_get_receipt', { p_invoice_id: id })
    expect(html).toContain('Snapshot customer')
    expect(html).toContain('CN-R-2026-00000001')
    exportFixture('receipt', html)
  })
  it('fails closed for an unauthenticated or unauthorized caller', async () => {
    for (const user of [null, { id, app_metadata: {} }, { id: 'other', app_metadata: { billing_admin: true } }]) {
      auth.mockResolvedValue({ user })
      await expect(InvoiceDocumentPage({ params })).rejects.toThrow('NOT_FOUND')
      await expect(ReceiptPage({ params })).rejects.toThrow('NOT_FOUND')
    }
    expect(rpc).not.toHaveBeenCalled()
  })
  it('refuses both document reads on mismatched project identity', async () => {
    scope.mockReturnValue(false)
    await expect(InvoiceDocumentPage({ params })).rejects.toThrow('NOT_FOUND')
    await expect(ReceiptPage({ params })).rejects.toThrow('NOT_FOUND')
    expect(auth).not.toHaveBeenCalled()
    expect(rpc).not.toHaveBeenCalled()
  })
})
