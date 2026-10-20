import { NextRequest, NextResponse } from 'next/server'
import { manualUpiAdmin, manualReply } from '../../../../../../../src/lib/billing/manual-upi-admin'
import { signManualUpiLink } from '../../../../../../../src/lib/billing/manual-upi'
import { readBoundedJsonBody } from '../../../../../../billing/bounded-json-body'
import { isBillingUuid } from '../../../../../../billing/uuid-policy'
export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params,auth=await manualUpiAdmin(request,id)
    if (auth instanceof NextResponse) return auth
    const {data,error}=await auth.service.rpc('billing_manual_upi_admin_state',{p_invoice:id,p_fingerprint:auth.config!.fingerprint})
    if (error) return manualReply(503,{error:'Manual UPI unavailable'})
    if (!data) return manualReply(200,{intentId:null})
    if (!isBillingUuid(data.intentId)) return manualReply(503,{error:'Manual UPI unavailable'})
    return manualReply(200,{intentId:data.intentId,state:data.state})
  } catch {return manualReply(503,{error:'Manual UPI unavailable'})}
}
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params, auth=await manualUpiAdmin(request,id)
    if (auth instanceof NextResponse) return auth
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||'')) return manualReply(415,{error:'JSON required'})
    const body=await readBoundedJsonBody(request,256)
    if (!body.ok) return manualReply(body.reason==='too-large'?413:400,{error:'Invalid request'})
    let parsed:unknown
    try {parsed=JSON.parse(body.text)} catch {return manualReply(400,{error:'Invalid JSON'})}
    if (!parsed || Array.isArray(parsed) || typeof parsed!=='object' || Object.keys(parsed).length) return manualReply(400,{error:'No payment fields accepted'})
    const cfg=auth.config!
    const {data,error}=await auth.service.rpc('billing_manual_upi_reserve',{p_invoice:id,p_beneficiary:cfg.beneficiaryId,
      p_vpa:cfg.vpa,p_payee:cfg.payee,p_bank_ref:cfg.bankRef,p_fingerprint:cfg.fingerprint,p_actor:auth.actor})
    if (error?.code==='P0031') return manualReply(429,{error:'Rate limited'})
    if (error || !data || !isBillingUuid(data.intentId) || !Number.isSafeInteger(data.issuedAt)) return manualReply(409,{error:'Payment instructions unavailable; review required'})
    const token=signManualUpiLink(data.intentId,data.issuedAt,cfg.signingKey)
    return manualReply(200,{intentId:data.intentId,customerPaymentLink:cfg.origin+'/pay/upi/'+token,settlement:'NOT_VERIFIED',mode:'MANUAL_BANK_REVIEW'})
  } catch { return manualReply(503,{error:'Manual UPI unavailable'}) }
}
/** Revocation remains available when collection flags are OFF. */
export async function DELETE(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params, auth=await manualUpiAdmin(request,id,false)
    if (auth instanceof NextResponse) return auth
    const {data,error}=await auth.service.rpc('billing_manual_upi_revoke',{p_invoice:id,p_actor:auth.actor})
    if (error || typeof data!=='boolean') return manualReply(503,{error:'Revocation unavailable'})
    return manualReply(200,{revoked:data})
  } catch { return manualReply(503,{error:'Revocation unavailable'}) }
}
