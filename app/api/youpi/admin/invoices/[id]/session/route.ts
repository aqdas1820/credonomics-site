import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser } from '../../../../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../../../../src/lib/supabase/admin'
import { gatewayConfig, createYoupiSession, readYoupiSession, validateInvoice } from '../../../../../../../src/lib/billing/youpi-contract'
import { reserveLink, completeLink, LinkRateLimitError } from '../../../../../../../src/lib/billing/youpi-link-ledger'
import { approvedPaymentSiteOrigin, paymentLinkSigningReady, sealPaymentLink } from '../../../../../../../src/lib/billing/youpi-payment-link'
import { isBillingAdmin } from '../../../../../../billing/admin-policy'
import { isBillingUuid } from '../../../../../../billing/uuid-policy'
import { sameOrigin } from '../../../../../../billing/request-policy'
import { billingDatabaseScopeReady } from '../../../../../../billing/db-scope'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
const unavailable = () => NextResponse.json({ error: 'YouPI session creation unavailable' }, { status: 503, headers })

/** Operator-initiated only; never changes invoice status or claims bank settlement. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.YOUPI_BRIDGE_ENABLED !== 'true' ||
      process.env.YOUPI_PAYMENT_LINK_ENABLED !== 'true' ||
      process.env.YOUPI_LINK_LEDGER_APPROVED !== 'true' ||
      !process.env.YOUPI_MERCHANT_KEY || process.env.YOUPI_MERCHANT_KEY.length < 32 ||
      !paymentLinkSigningReady(process.env.YOUPI_PAYMENT_LINK_SIGNING_KEY) ||
      !approvedPaymentSiteOrigin(process.env.YOUPI_PUBLIC_SITE_ORIGIN) ||
      process.env.YOUPI_SESSION_CREATION_APPROVED !== 'true' ||
      process.env.YOUPI_LICENSE_CONFIRMED !== 'true' ||
      process.env.YOUPI_SECURITY_REVIEW_APPROVED !== 'true' ||
      process.env.BILLING_API_ENABLED !== 'true' ||
      !billingDatabaseScopeReady()) return unavailable()
  if (request.nextUrl.origin !== approvedPaymentSiteOrigin(process.env.YOUPI_PUBLIC_SITE_ORIGIN) ||
      !sameOrigin(request.headers.get('origin'), request.nextUrl.origin) ||
      (request.headers.get('sec-fetch-site') !== null && request.headers.get('sec-fetch-site') !== 'same-origin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers })
  }
  const { id } = await params
  if (!isBillingUuid(id)) return NextResponse.json({ error: 'Invalid invoice' }, { status: 400, headers })
  try {
    const { user } = await authenticatedUser()
    if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers })
    const service = createSupabaseAdminClient()
    if (!service) return unavailable()
    const { data, error } = await service.rpc('billing_get_invoice', { p_invoice_id: id })
    if (error) return unavailable()
    const invoice = validateInvoice(data, id)
    const cfg = gatewayConfig()
    // Never create a local gateway session for a public share link.
    if (cfg.allowLocal || !cfg.checkoutOrigin.startsWith('https:')) return unavailable()
    const reservation = await reserveLink(service, invoice.id, cfg.merchantId, user!.id)
    // Pending/uncertain reservations cannot be automatically retried after a timeout.
    const created = reservation.decision === 'CREATE' ? await createYoupiSession(cfg, invoice) : null
    const session = await readYoupiSession(cfg, created?.paymentId ?? reservation.paymentId!, invoice, process.env.YOUPI_MERCHANT_KEY)
    const sealed = sealPaymentLink({
      invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber,
      paymentId: session.paymentId, amountPaise: invoice.totalPaise,
      merchantId: cfg.merchantId,
    }, process.env.YOUPI_PAYMENT_LINK_SIGNING_KEY!, reservation.issuedAt)
    await completeLink(service, invoice.id, cfg.merchantId, session.paymentId, sealed)
    const site = approvedPaymentSiteOrigin(process.env.YOUPI_PUBLIC_SITE_ORIGIN)
    if (!site) return unavailable()
    const customerPaymentLink = site + '/pay/i/' + sealed
    // This is not evidence of bank credit and never creates a PAID receipt.
    return NextResponse.json({ customerPaymentLink, gatewayStatus: session.status, paymentId: session.paymentId, settlement: 'NOT_VERIFIED' }, { status: reservation.decision === 'CREATE' ? 201 : 200, headers })
  } catch (error) {
    if (error instanceof LinkRateLimitError) return NextResponse.json({ error: 'Payment link rate limited' },
      { status: 429, headers: { ...headers, 'Retry-After': '60' } })
    return unavailable()
  }
}
