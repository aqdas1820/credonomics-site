import { NextResponse } from 'next/server'
import { authenticatedUser } from '../../../../../src/lib/supabase/server'
import { isBillingAdmin } from '../../../../billing/admin-policy'
import { gatewayConfig, probeYoupi } from '../../../../../src/lib/billing/youpi-contract'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' }

/** Operator-only connectivity check. Not a customer payment initiation route. */
export async function GET() {
  if (process.env.YOUPI_BRIDGE_ENABLED !== 'true') return new NextResponse('Not Found', { status: 404, headers })
  try {
    const { user } = await authenticatedUser()
    if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) return new NextResponse('Not Found', { status: 404, headers })
    const reachable = await probeYoupi(gatewayConfig())
    return NextResponse.json({ gatewayReachable: reachable, paymentCollectionEnabled: false }, { status: reachable ? 200 : 503, headers })
  } catch {
    return NextResponse.json({ gatewayReachable: false, paymentCollectionEnabled: false }, { status: 503, headers })
  }
}
