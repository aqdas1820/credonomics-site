import { NextRequest, NextResponse } from 'next/server'
import { manualUpiAdmin,manualReply } from '../../../../../../../../src/lib/billing/manual-upi-admin'
import { prepareManualBankReview } from '../../../../../../../../src/lib/billing/manual-upi'
import { readBoundedJsonBody } from '../../../../../../../billing/bounded-json-body'
export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  if (process.env.BILLING_SETTLEMENT_ENABLED!=='true') return manualReply(503,{error:'Bank review unavailable'})
  try {
    const {id}=await params,auth=await manualUpiAdmin(request,id)
    if (auth instanceof NextResponse) return auth
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||'')) return manualReply(415,{error:'JSON required'})
    const body=await readBoundedJsonBody(request,8192)
    if (!body.ok) return manualReply(body.reason==='too-large'?413:400,{error:'Invalid bank review'})
    let credit:ReturnType<typeof prepareManualBankReview>
    try {credit=prepareManualBankReview(JSON.parse(body.text))} catch {return manualReply(400,{error:'Official bank-credit review required'})}
    const {data,error}=await auth.service.rpc('billing_verify_manual_upi_credit',{p_invoice:id,p_intent:credit.intentId,
      p_fingerprint:auth.config!.fingerprint,p_utr:credit.utr,p_amount:credit.amountPaise,p_booked:credit.bookedAt,
      p_evidence:credit.evidenceReference,p_actor:auth.actor})
    if (error) return manualReply(409,{error:'Bank review conflict; verify invoice, beneficiary and booked credit'})
    if (!data || data.invoiceId!==id || data.status!=='PAID' || data.paidPaise!==credit.amountPaise || data.outstandingPaise!==0 || data.canIssuePaidReceipt!==true) {
      return manualReply(503,{error:'Ambiguous review response; inspect ledger before retry'})
    }
    return manualReply(200,{settlement:data,verificationMode:'MANUAL_OFFICIAL_BANK_RECORD'})
  } catch {return manualReply(503,{error:'Bank review unavailable'})}
}
