import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { authenticatedUser } from '../../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../../src/lib/supabase/admin'
import { isBillingAdmin } from '../../../admin-policy'
import { isValidStoredPaidReceipt } from '../../../receipt-policy'
import { billingDatabaseScopeReady } from '../../../db-scope'
import { isBillingUuid } from '../../../uuid-policy'
import PrintInvoiceButton from '../../../PrintInvoiceButton'
import styles from '../invoice.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Verified Payment Receipt — CredoNomics Admin',
  robots: { index: false, follow: false, noarchive: true },
}
type VerifiedReceiptSnapshot = {
  invoiceId: string; invoiceNumber: string; receiptNumber: string; invoiceDate: string
  issuedAt: string; customer: string; totalPaise: number; paidPaise: number
  status: 'PAID'; version: number
  verifiedCredits: { utr: string; amountPaise: number; bookedAt: string }[]
}
const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100)

/**
 * Human-verifiable PAID receipt view, NEVER offered on gateway SUCCESS alone.
 * Receipt data is copied from an append-only database snapshot. PDF binary archival is not implemented.
 */
export default async function VerifiedReceiptPage({ params }: { params: { id: string } }) {
  if (process.env.BILLING_PORTAL_ENABLED !== 'true' || (process.env.BILLING_API_ENABLED !== 'true' || !billingDatabaseScopeReady())) notFound()
  if (!isBillingUuid(params.id)) notFound()
  const { user } = await authenticatedUser()
  if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) notFound()
  const service = createSupabaseAdminClient()
  if (!service) notFound()
  const { data, error } = await service.rpc('billing_get_receipt', { p_invoice_id: params.id })
  if (error || !data || typeof data !== 'object') notFound()
  const receipt = data as VerifiedReceiptSnapshot
  if (!isValidStoredPaidReceipt(receipt) || receipt.invoiceId.toLowerCase() !== params.id.toLowerCase()) notFound()
  return (
    <main className={styles.page}>
      <nav className={styles.controls}>
        <Link href={'/billing/invoices/' + encodeURIComponent(receipt.invoiceId)}>← Invoice details</Link>
        <PrintInvoiceButton />
      </nav>
      <article className={styles.sheet}>
        <header className={styles.header}>
          <div><h1>CredoNomics Investment Solutions</h1><p>Verified bank-credit acknowledgment</p></div>
          <div><strong>PAYMENT RECEIPT VIEW</strong><p>Receipt #{receipt.receiptNumber}</p><p>Invoice #{receipt.invoiceNumber}</p><p>Issued: {receipt.issuedAt}</p></div>
        </header>
        <div className={styles.status}>PAID · FULL SLICE BANK CREDIT INDEPENDENTLY VERIFIED</div>
        <section><strong>Received From</strong><p>{receipt.customer}</p></section>
        <section className={styles.totals}>
          <p><span>Invoice amount</span><strong>{money(receipt.totalPaise)}</strong></p>
          <p><span>Verified bank credits</span><strong>{money(receipt.paidPaise)}</strong></p>
          <p><span>Outstanding</span><strong>{money(0)}</strong></p>
        </section>
        <section aria-label="Verified bank references">
          <strong>Independently verified Slice credits</strong>
          {receipt.verifiedCredits.map(credit => <p key={credit.utr}>UTR {credit.utr} · {money(credit.amountPaise)} · Bank booked {credit.bookedAt}</p>)}
        </section>
        <footer className={styles.note}>
          Generated from an append-only, version {receipt.version} database receipt snapshot upon full
          independently verified Slice credit. A YouPI SUCCESS notification alone cannot trigger issuance.
          Printable document only; an immutable archived PDF file and digital signature are not yet enabled.
        </footer>
      </article>
    </main>
  )
}
