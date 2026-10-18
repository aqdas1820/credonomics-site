import { NextResponse } from 'next/server'
import { authenticatedUser } from '../../../../../../src/lib/supabase/server'
import { createSupabaseAdminClient } from '../../../../../../src/lib/supabase/admin'
import { isBillingAdmin } from '../../../../../billing/admin-policy'
import { billingDatabaseScopeReady } from '../../../../../billing/db-scope'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const response = (body: unknown, status: number) => NextResponse.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
})

/** Read an invoice only after independent server-side admin authorization. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (process.env.BILLING_API_ENABLED !== 'true' || !billingDatabaseScopeReady()) return response({ error: 'Unavailable' }, 404)
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(params.id)) return response({ error: 'Invalid invoice' }, 400)
  try {
    const { user } = await authenticatedUser()
    if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) return response({ error: 'Forbidden' }, 403)
    const service = createSupabaseAdminClient()
    if (!service) return response({ error: 'Database unavailable' }, 503)
    const { data, error } = await service.rpc('billing_get_invoice', { p_invoice_id: params.id })
    if (error || !data) return response({ error: 'Invoice unavailable' }, 404)
    return response({ invoice: data }, 200)
  } catch {
    return response({ error: 'Invoice unavailable' }, 503)
  }
}
