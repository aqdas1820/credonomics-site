import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { authenticatedUser } from '../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../src/lib/supabase/admin'
import { isBillingAdmin } from '../../admin-policy'
import { canRenderPaidReceipt } from '../../receipt-policy'
import { billingDatabaseScopeReady } from '../../db-scope'
import PrintInvoiceButton from '../../PrintInvoiceButton'
import ArchiveDocumentButton from '../../ArchiveDocumentButton'
import styles from './invoice.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Private Invoice Document — CredoNomics',
  robots: { index: false, follow: false, noarchive: true },
}
type Line = { position: number; description: string; quantity: number; ratePaise: number; lineTotalPaise: number }
type Invoice = {
  id: string; invoiceNumber: string; customer: string; address: string; date: string
  totalPaise: number; paidPaise: number; status: string; items: Line[]
}
const inr = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100)

/** Historical invoice document. Not a separately numbered PAID receipt. */
export default async function InvoiceDocumentPage({ params: promisedParams }: { params: Promise<{ id: string }> }) {
  const params = await promisedParams
  if (process.env.BILLING_PORTAL_ENABLED !== 'true' || (process.env.BILLING_API_ENABLED !== 'true' || !billingDatabaseScopeReady())) notFound()
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(params.id)) notFound()
  const { user } = await authenticatedUser()
  if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) notFound()
  const service = createSupabaseAdminClient()
  if (!service) notFound()
  const { data, error } = await service.rpc('billing_get_invoice', { p_invoice_id: params.id })
  if (error || !data || typeof data !== 'object') notFound()
  const invoice = data as Invoice
  if (!Array.isArray(invoice.items) || typeof invoice.totalPaise !== 'number' ||
      typeof invoice.paidPaise !== 'number' || typeof invoice.invoiceNumber !== 'string') notFound()
  const outstanding = invoice.totalPaise - invoice.paidPaise
  return (
    <main className={styles.page}>
      <nav className={styles.controls}>
        <Link href="/billing">← Back to admin billing</Link>
        <PrintInvoiceButton />
        {process.env.BILLING_PDF_ARCHIVE_ENABLED === 'true' && <ArchiveDocumentButton id={invoice.id} kind="invoice" />}
        {canRenderPaidReceipt(invoice) && <Link href={'/billing/invoices/' + encodeURIComponent(invoice.id) + '/receipt'}>Verified PAID receipt view</Link>}
      </nav>
      <article className={styles.sheet}>
        <header className={styles.header}>
          <div>
            <h1>CredoNomics Investment Solutions</h1>
            <p>Invoice document · INR</p>
          </div>
          <div>
            <strong>INVOICE</strong>
            <p>#{invoice.invoiceNumber}</p>
            <p>Issued: {invoice.date}</p>
          </div>
        </header>
        <div className={styles.status}>
          Original invoice issued UNPAID · Current verified status: {invoice.status}
        </div>
        <section aria-label="Customer">
          <strong>Bill To</strong>
          <p>{invoice.customer}</p>
          <p>{invoice.address || '—'}</p>
        </section>
        <table className={styles.items}>
          <thead><tr><th>Description</th><th>Qty</th><th className={styles.right}>Rate</th><th className={styles.right}>Line total</th></tr></thead>
          <tbody>{invoice.items.map(line => (
            <tr key={line.position}>
              <td>{line.description}</td>
              <td>{line.quantity}</td>
              <td className={styles.right}>{inr(line.ratePaise)}</td>
              <td className={styles.right}>{inr(line.lineTotalPaise)}</td>
            </tr>
          ))}</tbody>
        </table>
        <section className={styles.totals} aria-label="Total and payments">
          <p><span>Invoice total</span><strong>{inr(invoice.totalPaise)}</strong></p>
          <p><span>Verified Slice credits</span><strong>{inr(invoice.paidPaise)}</strong></p>
          <p><span>Outstanding</span><strong>{inr(outstanding)}</strong></p>
        </section>
        <footer className={styles.note}>
          This is a private invoice status copy, not a separately issued payment receipt.
          A PAID receipt requires a distinct, versioned document after independently verified full Slice bank credit.
          No QR/payment session is created by this page.
        </footer>
      </article>
    </main>
  )
}
