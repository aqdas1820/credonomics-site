import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { authenticatedUser } from '../../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../../src/lib/supabase/admin'
import { isBillingAdmin } from '../../../admin-policy'
import { canRenderPaidReceipt } from '../../../receipt-policy'
import PrintInvoiceButton from '../../../PrintInvoiceButton'
import styles from '../invoice.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Verified Payment Receipt — CredoNomics Admin',
  robots: { index: false, follow: false, noarchive: true },
}
type PaymentReceiptInvoice = {
  id: string; invoiceNumber: string; date: string; customer: string
  totalPaise: number; paidPaise: number; status: string
}
const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100)

/**
 * Human-verifiable PAID receipt view, NEVER offered on gateway SUCCESS alone.
 * Browser printing is available; immutable PDF archival is not implemented.
 */
export default async function VerifiedReceiptPage({ params }: { params: { id: string } }) {
  if (process.env.BILLING_PORTAL_ENABLED !== 'true' || process.env.BILLING_API_ENABLED !== 'true') notFound()
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(params.id)) notFound()
  const { user } = await authenticatedUser()
  if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) notFound()
  const service = createSupabaseAdminClient()
  if (!service) notFound()
  const { data, error } = await service.rpc('billing_get_invoice', { p_invoice_id: params.id })
  if (error || !data || typeof data !== 'object') notFound()
  const invoice = data as PaymentReceiptInvoice
  if (!canRenderPaidReceipt(invoice)) notFound()
  return (
    <main className={styles.page}>
      <nav className={styles.controls}>
        <Link href={'/billing/invoices/' + encodeURIComponent(invoice.id)}>← Invoice details</Link>
        <PrintInvoiceButton />
      </nav>
      <article className={styles.sheet}>
        <header className={styles.header}>
          <div><h1>CredoNomics Investment Solutions</h1><p>Verified bank-credit acknowledgment</p></div>
          <div><strong>PAYMENT RECEIPT VIEW</strong><p>Invoice #{invoice.invoiceNumber}</p><p>Invoice date: {invoice.date}</p></div>
        </header>
        <div className={styles.status}>PAID · FULL SLICE BANK CREDIT INDEPENDENTLY VERIFIED</div>
        <section><strong>Received From</strong><p>{invoice.customer}</p></section>
        <section className={styles.totals}>
          <p><span>Invoice amount</span><strong>{money(invoice.totalPaise)}</strong></p>
          <p><span>Verified bank credits</span><strong>{money(invoice.paidPaise)}</strong></p>
          <p><span>Outstanding</span><strong>{money(0)}</strong></p>
        </section>
        <footer className={styles.note}>
          Generated from server-side verified credit records for this invoice. A YouPI SUCCESS notification
          does not independently verify Slice credit. This is a printable receipt view, NOT a separately
          stored or digitally signed immutable PDF. Do not represent it as tax documentation.
        </footer>
      </article>
    </main>
  )
}
