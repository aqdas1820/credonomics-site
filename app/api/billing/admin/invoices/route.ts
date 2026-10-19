import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser } from '../../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../../src/lib/supabase/admin'
import { isBillingAdmin } from '../../../../billing/admin-policy'
import { prepareInvoiceCreation } from '../../../../billing/invoice-input'
import { sameOrigin } from '../../../../billing/request-policy'
import { readBoundedJsonBody } from '../../../../billing/bounded-json-body'
import { billingDatabaseScopeReady } from '../../../../billing/db-scope'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const noStore = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
const json = (body: unknown, status: number) => NextResponse.json(body, { status, headers: noStore })

/**
 * Restricted invoice creation. Requires:
 * - BILLING_API_ENABLED=true and BILLING_WRITE_ENABLED=true (both default off)
 * - authenticated Supabase user, trusted app_metadata and UUID allowlist
 * - server-only service role + reviewed atomic RPC in database
 * - exact same-origin POST. No customer/public/payment endpoint.
 */
export async function POST(request: NextRequest) {
  if (process.env.BILLING_API_ENABLED !== 'true' || process.env.BILLING_WRITE_ENABLED !== 'true' || !billingDatabaseScopeReady()) {
    return json({ error: 'Billing creation unavailable' }, 503)
  }
  if (!sameOrigin(request.headers.get('origin'), request.nextUrl.origin)) {
    return json({ error: 'Forbidden' }, 403)
  }
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return json({ error: 'JSON required' }, 415)
  }
  try {
    const { user } = await authenticatedUser()
    if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) {
      return json({ error: 'Forbidden' }, 403)
    }
    const service = createSupabaseAdminClient()
    if (!service) return json({ error: 'Billing database unavailable' }, 503)
    const body = await readBoundedJsonBody(request, 65536)
    if (!body.ok) return json({ error: body.reason === 'too-large' ? 'Request too large' : 'Invalid request body' }, body.reason === 'too-large' ? 413 : 400)
    let prepared: ReturnType<typeof prepareInvoiceCreation>
    try { prepared = prepareInvoiceCreation(JSON.parse(body.text)) }
    catch { return json({ error: 'Invalid invoice fields' }, 400) }
    const { data, error } = await service.rpc('billing_create_invoice', {
      p_customer_name: prepared.customerName,
      p_customer_address: prepared.customerAddress,
      p_issued_on: prepared.issuedOn,
      p_customer_phone_e164: prepared.customerPhone,
      p_lines: prepared.lines,
      p_operator_id: user!.id,
    })
    if (error) return json({ error: 'Invoice could not be stored; verify private billing migration' }, 503)
    return json({ invoice: data }, 201)
  } catch {
    return json({ error: 'Billing creation unavailable' }, 503)
  }
}

/** Authenticated operator history, never a public customer invoice lookup. */
export async function GET() {
  if (process.env.BILLING_API_ENABLED !== 'true' || !billingDatabaseScopeReady()) return json({ error: 'Billing unavailable' }, 404)
  try {
    const { user } = await authenticatedUser()
    if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) return json({ error: 'Forbidden' }, 403)
    const service = createSupabaseAdminClient()
    if (!service) return json({ error: 'Private billing database unavailable' }, 503)
    const { data, error } = await service.rpc('billing_list_invoices', { p_limit: 25 })
    if (error || !Array.isArray(data)) return json({ error: 'Invoice history unavailable' }, 503)
    return json({ invoices: data }, 200)
  } catch {
    return json({ error: 'Invoice history unavailable' }, 503)
  }
}
