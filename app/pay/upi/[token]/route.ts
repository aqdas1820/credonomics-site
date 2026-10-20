import { billingDatabaseScopeReady } from '../../../billing/db-scope'
import { createSupabaseAdminClient } from '../../../../src/lib/supabase/admin'
import { manualUpiConfig,openManualUpiLink,validateManualUpiView } from '../../../../src/lib/billing/manual-upi'
import { manualUpiHtml } from '../../../../src/lib/billing/manual-upi-html'
export const dynamic='force-dynamic'
export const runtime='nodejs'
const manualHeaders={'Cache-Control':'private, no-store, max-age=0','Referrer-Policy':'no-referrer',
  'X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet','X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'"}
export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}) {
  const deny=()=>new Response('Not Found',{status:404,headers:manualHeaders})
  try {
    if (!billingDatabaseScopeReady()) return deny()
    const config=manualUpiConfig(),{token}=await params,link=openManualUpiLink(token,config.signingKey)
    if (!link) return deny()
    const db=createSupabaseAdminClient()
    if (!db) return deny()
    const {data,error}=await db.rpc('billing_manual_upi_view',{p_intent:link.intentId,p_issued:link.issuedAt,p_fingerprint:config.fingerprint})
    if (error || !data) return deny()
    const view=validateManualUpiView(data)
    if (view.intentId!==link.intentId || view.issuedAt!==link.issuedAt) return deny()
    return new Response(await manualUpiHtml(view,config),{status:200,headers:{...manualHeaders,'Content-Type':'text/html; charset=utf-8'}})
  } catch {return deny()}
}
