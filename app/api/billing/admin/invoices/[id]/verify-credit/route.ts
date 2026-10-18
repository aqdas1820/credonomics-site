import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser } from '../../../../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../../../../src/lib/supabase/admin'
import { isBillingAdmin } from '../../../../../../billing/admin-policy'
import { prepareBookedCredit } from '../../../../../../billing/credit-input'
import { sameOrigin } from '../../../../../../billing/request-policy'
import { readBoundedJsonBody } from '../../../../../../billing/bounded-json-body'
import { billingDatabaseScopeReady } from '../../../../../../billing/db-scope'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const reply = (body: unknown, status: number) => NextResponse.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
})

/**
 * No automatic settlement. Only an authenticated, allowlisted admin who
 * independently checked a booked Slice credit may attest to this operation.
 * The service-role-only Postgres RPC must be installed separately after review.
 */
export async function POST(request: NextRequest, { params: promisedParams }: { params: Promise<{ id: string }> }) {
  const params = await promisedParams
  if (process.env.BILLING_API_ENABLED !== 'true' ||
      process.env.BILLING_SETTLEMENT_ENABLED !== 'true' || !billingDatabaseScopeReady()) {
    return reply({ error: 'Bank reconciliation unavailable' }, 503)
  }
  if (!sameOrigin(request.headers.get('origin'), request.nextUrl.origin)) {
    return reply({ error: 'Forbidden' }, 403)
  }
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(params.id)) return reply({ error: 'Invalid invoice' }, 400)
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return reply({ error: 'JSON required' }, 415)
  }
  try {
    const { user } = await authenticatedUser()
    if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) return reply({ error: 'Forbidden' }, 403)
    const service = createSupabaseAdminClient()
    if (!service) return reply({ error: 'Private billing database unavailable' }, 503)
    const body = await readBoundedJsonBody(request, 8192)
    if (!body.ok) return reply({ error: body.reason === 'too-large' ? 'Request too large' : 'Invalid request body' }, body.reason === 'too-large' ? 413 : 400)
    let credit: ReturnType<typeof prepareBookedCredit>
    try { credit = prepareBookedCredit(JSON.parse(body.text)) }
    catch { return reply({ error: 'Invalid independent bank-credit evidence' }, 400) }
    const { data, error } = await service.rpc('billing_verify_slice_credit', {
      p_invoice_id: params.id,
      p_utr: credit.utr,
      p_amount_paise: credit.amountPaise,
      p_booked_at: credit.bookedAt,
      p_evidence_reference: credit.evidenceReference,
      p_operator_id: user!.id,
    })
    if (error) return reply({ error: 'Reconciliation rejected; check bank entry, UTR and invoice amount' }, 409)
    return reply({ settlement: data }, 200)
  } catch {
    return reply({ error: 'Reconciliation unavailable' }, 503)
  }
}
