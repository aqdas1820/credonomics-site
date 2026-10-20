import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser } from '../supabase/server'
import { createSupabaseAdminClient } from '../supabase/admin'
import { billingDatabaseScopeReady } from '../../../app/billing/db-scope'
import { isBillingAdmin } from '../../../app/billing/admin-policy'
import { isBillingUuid } from '../../../app/billing/uuid-policy'
import { sameOrigin } from '../../../app/billing/request-policy'
import { manualUpiConfig } from './manual-upi'

export const manualReply=(status:number,body:unknown)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive','Referrer-Policy':'no-referrer'}})
export async function manualUpiAdmin(request:NextRequest,id:string,requireConfig=true) {
  if (process.env.BILLING_API_ENABLED!=='true' || !billingDatabaseScopeReady()) return manualReply(503,{error:'Manual UPI unavailable'})
  if (((request.method!=='GET' || request.headers.has('origin')) && !sameOrigin(request.headers.get('origin'),request.nextUrl.origin)) ||
    (request.headers.has('sec-fetch-site') && request.headers.get('sec-fetch-site')!=='same-origin')) return manualReply(403,{error:'Forbidden'})
  if (!isBillingUuid(id)) return manualReply(400,{error:'Invalid invoice'})
  const {user}=await authenticatedUser()
  if (!isBillingAdmin(user,process.env.BILLING_ADMIN_USER_IDS)) return manualReply(403,{error:'Forbidden'})
  const service=createSupabaseAdminClient()
  if (!service) return manualReply(503,{error:'Manual UPI unavailable'})
  const config=requireConfig?manualUpiConfig():null
  if (config && config.origin!==request.nextUrl.origin) return manualReply(403,{error:'Forbidden'})
  return {service,actor:user!.id,config}
}
