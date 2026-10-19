import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { gatewayConfig, validateInvoice } from '../../../../src/lib/billing/youpi-contract'
import { billingDatabaseScopeReady } from '../../../billing/db-scope'
import { createSupabaseAdminClient } from '../../../../src/lib/supabase/admin'
import { approvedPaymentSiteOrigin, openPaymentLink } from '../../../../src/lib/billing/youpi-payment-link'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export const metadata: Metadata = {
  title: 'Private invoice payment link | CredoNomics',
  description: 'Restricted invoice checkout link. No payment is confirmed until an independently verified bank credit.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}
const money = (amountPaise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amountPaise / 100)

/**
 * A signed bearer URL can be forwarded; display only minimal invoice details.
 * This page DOES NOT create payments, send messages, call settlement APIs or issue receipts.
 * It cannot run without an approved secure remote YouPI gateway and operator review.
 */
export default async function InvoicePaymentLinkPage({
  params,
}: { params: Promise<{ token: string }> }) {
  if (process.env.YOUPI_PAYMENT_LINK_ENABLED !== 'true' ||
    process.env.YOUPI_BRIDGE_ENABLED !== 'true' ||
    process.env.YOUPI_SESSION_CREATION_APPROVED !== 'true' ||
    process.env.YOUPI_LICENSE_CONFIRMED !== 'true' ||
    process.env.YOUPI_SECURITY_REVIEW_APPROVED !== 'true' ||
    process.env.BILLING_API_ENABLED !== 'true' ||
    !billingDatabaseScopeReady() ||
    !approvedPaymentSiteOrigin(process.env.YOUPI_PUBLIC_SITE_ORIGIN)) notFound()

  const { token } = await params
  let checkoutOrigin: string
  let merchantId: string
  try {
    const cfg = gatewayConfig()
    // Hosted checkout only. A customer's localhost is never the merchant's server.
    if (cfg.allowLocal || !cfg.checkoutOrigin.startsWith('https://')) notFound()
    checkoutOrigin = cfg.checkoutOrigin
    merchantId = cfg.merchantId
  } catch { notFound() }
  const payload = openPaymentLink(token, process.env.YOUPI_PAYMENT_LINK_SIGNING_KEY, merchantId)
  if (!payload) notFound()
  // Validate the live, canonical invoice before exposing checkout. A signed token
  // alone must never reopen an invoice already PAID, PARTIAL, VOID or repriced.
  const client = createSupabaseAdminClient()
  if (!client) notFound()
  try {
    const { data, error } = await client.rpc('billing_get_invoice', { p_invoice_id: payload.invoiceId })
    if (error) notFound()
    const invoice = validateInvoice(data, payload.invoiceId)
    if (invoice.totalPaise !== payload.amountPaise || invoice.invoiceNumber !== payload.invoiceNumber) notFound()
  } catch { notFound() }

  // Also reject completed/failed/processing YouPI sessions and mismatched orders.
  // This GET is only a status lookup; it does not create or advance payment.
  try {
    const cfg = gatewayConfig()
    const res = await fetch(cfg.apiOrigin + '/api/v1/payments/' + payload.paymentId, {
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(6000),
    })
    if (!res.ok || Number(res.headers.get('content-length') || 0) > 16384) notFound()
    const raw = await res.text()
    if (raw.length > 16384) notFound()
    const state = JSON.parse(raw) as Record<string, unknown>
    if (state.paymentId !== payload.paymentId || state.orderId !== 'CN-' + payload.invoiceId ||
        state.currency !== 'INR' || String(state.amountPaise) !== String(payload.amountPaise) ||
        !['INITIATED', 'ACTIVE', 'QUEUED'].includes(String(state.status))) notFound()
  } catch { notFound() }

  const checkout = checkoutOrigin + '/checkout/' + payload.paymentId

  return <main style={{ maxWidth: 650, margin: '60px auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', color: '#0f2923' }}>
    <article style={{ border: '1px solid #c5d8d2', borderRadius: 14, background: '#fff', padding: '32px 24px' }}>
      <p style={{ fontSize: 12, letterSpacing: '.12em', fontWeight: 700 }}>CREDONOMICS INVESTMENT SOLUTIONS</p>
      <h1 style={{ fontSize: 29, marginBottom: 10 }}>Invoice payment</h1>
      <p>Invoice <strong>{payload.invoiceNumber}</strong></p>
      <p style={{ fontSize: 14, color: '#51625c' }}>Amount requested</p>
      <p style={{ fontSize: 34, marginTop: 5, fontWeight: 800 }}>{money(payload.amountPaise)}</p>
      <p style={{ background: '#f5f6f1', borderLeft: '3px solid #aa762a', padding: 14, fontSize: 13 }}>
        This payment request is not a receipt. Opening checkout or seeing a gateway SUCCESS
        does not confirm that the bank credited the merchant.
      </p>
      <a href={checkout} referrerPolicy="no-referrer" rel="noopener noreferrer" style={{
        display: 'block', textAlign: 'center', borderRadius: 8, background: '#135846',
        color: '#fff', fontWeight: 700, textDecoration: 'none', padding: '15px 20px', marginTop: 24,
      }}>Proceed to YouPI checkout</a>
      <p style={{ fontSize: 12, color: '#51625c', marginTop: 18 }}>
        Confirm the amount and verified receiving name in your UPI app before paying.
        Never give anyone your UPI PIN or OTP.
      </p>
    </article>
  </main>
}
