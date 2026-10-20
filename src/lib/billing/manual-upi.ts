import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { isBillingUuid } from '../../../app/billing/uuid-policy'
import { approvedPaymentSiteOrigin, paymentLinkSigningReady } from './youpi-payment-link'

export const MANUAL_UPI_TTL = 24 * 60 * 60 * 1000
export type ManualUpiConfig = { origin: string; beneficiaryId: string; vpa: string; payee: string; bankRef: string; fingerprint: string; signingKey: string }

/** Configuration is an owner-reviewed assertion, not an automated VPA verification. */
export function manualUpiConfig(env: Record<string,string|undefined> = process.env): ManualUpiConfig {
  for (const flag of ['BILLING_API_ENABLED','MANUAL_UPI_ENABLED','MANUAL_UPI_PILOT_APPROVED',
    'MANUAL_UPI_BENEFICIARY_VERIFIED','MANUAL_UPI_SCHEMA_APPROVED','MANUAL_UPI_BANK_REVIEW_APPROVED',
    'MANUAL_UPI_MERCHANT_AUTHORIZED','MANUAL_UPI_HOSTING_APPROVED']) {
    if (env[flag] !== 'true') throw Error('Manual UPI unavailable')
  }
  const origin=approvedPaymentSiteOrigin(env.MANUAL_UPI_SITE_ORIGIN)
  const beneficiaryId=env.MANUAL_UPI_BENEFICIARY_ID?.toLowerCase()
  const vpa=env.MANUAL_UPI_VPA, payee=env.MANUAL_UPI_PAYEE_NAME, bankRef=env.MANUAL_UPI_BANK_ACCOUNT_REF
  // The existing ledger verifies Slice only. Never label another bank as Slice.
  if (!origin || !isBillingUuid(beneficiaryId) || env.MANUAL_UPI_BANK_NAME !== 'Slice' || env.MANUAL_UPI_ACCOUNT_TYPE !== 'BUSINESS_CURRENT' ||
      !vpa || !/^[a-zA-Z0-9._-]{2,128}@[a-zA-Z0-9.-]{2,64}$/.test(vpa) ||
      /@(invalid|example)(\.|$)/i.test(vpa) || !payee || payee !== payee.trim() ||
      payee.length < 2 || payee.length > 100 || /[\p{C}]/u.test(payee) ||
      !bankRef || !/^[a-zA-Z0-9_-]{8,80}$/.test(bankRef) || !paymentLinkSigningReady(env.MANUAL_UPI_SIGNING_KEY)) {
    throw Error('Manual UPI configuration unavailable')
  }
  const fingerprint=createHash('sha256').update(JSON.stringify([beneficiaryId,vpa,payee,'Slice',bankRef])).digest('hex')
  return { origin,beneficiaryId:beneficiaryId!,vpa,payee,bankRef,fingerprint,signingKey:env.MANUAL_UPI_SIGNING_KEY! }
}

export function signManualUpiLink(intentId: string, issuedAt: number, key: string): string {
  if (!isBillingUuid(intentId) || !Number.isSafeInteger(issuedAt) || issuedAt<=0 ||
      !Number.isSafeInteger(issuedAt+MANUAL_UPI_TTL) || !paymentLinkSigningReady(key)) throw Error('Invalid manual link')
  const message='m1.'+intentId.toLowerCase()+'.'+issuedAt
  return message+'.'+createHmac('sha256',Buffer.from(key,'hex')).update('credonomics:manual-upi:'+message).digest('base64url')
}
export function openManualUpiLink(token: string, key: string, now=Date.now()): { intentId: string; issuedAt: number } | null {
  if (typeof token!=='string' || token.length>160 || !paymentLinkSigningReady(key)) return null
  const parts=token.split('.'), issuedAt=Number(parts[2])
  if (parts.length!==4 || parts[0]!=='m1' || !isBillingUuid(parts[1]) || !/^[1-9]\d{12}$/.test(parts[2]) ||
      !/^[a-zA-Z0-9_-]{43}$/.test(parts[3]) || !Number.isSafeInteger(now) || issuedAt>now+60000 || issuedAt+MANUAL_UPI_TTL<=now) return null
  const expected=signManualUpiLink(parts[1],issuedAt,key)
  if (expected.length!==token.length || !timingSafeEqual(Buffer.from(expected),Buffer.from(token))) return null
  return { intentId:parts[1],issuedAt }
}

export type ManualUpiView = { intentId:string; invoiceId:string; invoiceNumber:string; amountPaise:number; issuedAt:number; status:'UNPAID'|'PAID'; bankVerified:boolean; vpa?:string; payee?:string }
export function validateManualUpiView(data: unknown): ManualUpiView {
  const view=z.object({ intentId:z.string().uuid(),invoiceId:z.string().uuid(),invoiceNumber:z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/# -]{0,79}$/),
    amountPaise:z.number().int().positive().max(100_000_000),issuedAt:z.number().int().positive(),status:z.enum(['UNPAID','PAID']),bankVerified:z.boolean(),
    vpa:z.string().optional(),payee:z.string().optional() }).parse(data)
  if ((view.status==='PAID')!==view.bankVerified || (view.status==='UNPAID' && (!view.vpa || !view.payee))) throw Error('Invalid manual payment state')
  return view
}
export function manualUpiUri(view: ManualUpiView, config: ManualUpiConfig): string {
  if (view.status!=='UNPAID' || view.bankVerified || view.vpa!==config.vpa || view.payee!==config.payee ||
      !Number.isSafeInteger(view.amountPaise) || view.amountPaise<1 || view.amountPaise>100_000_000) throw Error('Invoice not payable')
  const params=new URLSearchParams({ pa:config.vpa,pn:config.payee,am:(view.amountPaise/100).toFixed(2),cu:'INR',
    tr:view.intentId.replaceAll('-',''),tn:'CredoNomics '+view.invoiceNumber })
  return 'upi://pay?'+params.toString()
}
export function prepareManualBankReview(body: unknown) {
  const data=z.object({ intentId:z.string().uuid(),utr:z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{8,80}$/),
    amountPaise:z.number().int().positive().max(100_000_000),bookedAt:z.string().datetime({offset:true}),evidenceReference:z.string().trim().min(8).max(500),
    confirmedOfficialBankCredit:z.literal(true),confirmedBeneficiaryAccount:z.literal(true),confirmedInvoiceMatch:z.literal(true) }).strict().parse(body)
  if (Date.parse(data.bookedAt)>Date.now()+60000) throw Error('Future bank credit')
  return data
}
