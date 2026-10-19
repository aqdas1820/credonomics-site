import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser } from '../../../../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../../../../src/lib/supabase/admin'
import { gatewayConfig, createYoupiSession, validateInvoice } from '../../../../../../../src/lib/billing/youpi-contract'
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
      process.env.YOUPI_SESSION_CREATION_APPROVED !== 'true' ||
      process.env.YOUPI_LICENSE_CONFIRMED !== 'true' ||
      process.env.YOUPI_SECURITY_REVIEW_APPROVED !== 'true' ||
      process.env.BILLING_API_ENABLED !== 'true' ||
      !billingDatabaseScopeReady()) return unavailable()
  if (!sameOrigin(request.headers.get('origin'), request.nextUrl.origin)) {
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
    const session = await createYoupiSession(gatewayConfig(), invoice)
    // A gateway session is not evidence of bank credit, and can never create a PAID receipt.
    return NextResponse.json({ checkoutUrl: session.checkoutUrl, gatewayStatus: session.status, paymentId: session.paymentId, settlement: 'NOT_VERIFIED' }, { status: 201, headers })
  } catch { return unavailable() }
}
