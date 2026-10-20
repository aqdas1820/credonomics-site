import { NextRequest } from 'next/server'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
vi.mock('server-only',()=>({}))
const mock=vi.hoisted(()=>({auth:vi.fn(),scope:vi.fn(),client:vi.fn(),rpc:vi.fn()}))
vi.mock('../../src/lib/supabase/server',()=>({authenticatedUser:mock.auth}))
vi.mock('../../src/lib/supabase/admin',()=>({createSupabaseAdminClient:mock.client}))
vi.mock('../../app/billing/db-scope',()=>({billingDatabaseScopeReady:mock.scope}))
import {POST,DELETE,GET as adminGet} from '../../app/api/billing/admin/invoices/[id]/manual-upi/route'
import {POST as reconcile} from '../../app/api/billing/admin/invoices/[id]/manual-upi/reconcile/route'
import {GET as checkout} from '../../app/pay/upi/[token]/route'
import {signManualUpiLink} from '../../src/lib/billing/manual-upi'
const invoice='11111111-1111-4111-8111-111111111111',actor='22222222-2222-4222-8222-222222222222',intent='33333333-3333-4333-8333-333333333333',key='ab'.repeat(32)
const origin='https://www.credonomics.in',path=origin+'/api/billing/admin/invoices/'+invoice+'/manual-upi',issuedAt=Date.now()
const params={params:Promise.resolve({id:invoice})}
const req=(body:unknown={},method='POST',headers:Record<string,string>={})=>new NextRequest(path,{method,headers:{origin,'content-type':'application/json',...headers},...(method==='GET'?{}:{body:JSON.stringify(body)})})
const token=signManualUpiLink(intent,issuedAt,key)
const publicCall=(t=token)=>checkout(new Request(origin+'/pay/upi/'+t),{params:Promise.resolve({token:t})})
const view={intentId:intent,invoiceId:invoice,invoiceNumber:'CN-2026-00000001',amountPaise:100,issuedAt,status:'UNPAID',bankVerified:false,vpa:'synthetic@banktest',payee:'Synthetic Merchant'}
const review={intentId:intent,utr:'SYNTHETICBANK001',amountPaise:100,bookedAt:new Date().toISOString(),evidenceReference:'SYNTHETIC OFFICIAL BANK RECORD ONLY',
  confirmedOfficialBankCredit:true,confirmedBeneficiaryAccount:true,confirmedInvoiceMatch:true}
beforeEach(()=>{
  vi.resetAllMocks()
  for(const f of ['BILLING_API_ENABLED','BILLING_SETTLEMENT_ENABLED','MANUAL_UPI_ENABLED','MANUAL_UPI_PILOT_APPROVED','MANUAL_UPI_BENEFICIARY_VERIFIED','MANUAL_UPI_SCHEMA_APPROVED','MANUAL_UPI_BANK_REVIEW_APPROVED','MANUAL_UPI_MERCHANT_AUTHORIZED','MANUAL_UPI_HOSTING_APPROVED'])vi.stubEnv(f,'true')
  for(const [k,v]of Object.entries({MANUAL_UPI_SITE_ORIGIN:origin,MANUAL_UPI_BENEFICIARY_ID:actor,MANUAL_UPI_VPA:'synthetic@banktest',MANUAL_UPI_PAYEE_NAME:'Synthetic Merchant',
    MANUAL_UPI_BANK_NAME:'Slice',MANUAL_UPI_BANK_ACCOUNT_REF:'synthetic-account',MANUAL_UPI_SIGNING_KEY:key,BILLING_ADMIN_USER_IDS:actor}))vi.stubEnv(k,v)
  mock.auth.mockResolvedValue({user:{id:actor,app_metadata:{billing_admin:true}}});mock.scope.mockReturnValue(true);mock.client.mockReturnValue({rpc:mock.rpc})
  mock.rpc.mockResolvedValue({data:{intentId:intent,issuedAt},error:null})
})
afterEach(()=>vi.unstubAllEnvs())
it('authorizes admin and derives payment details entirely from server configuration',async()=>{
  const r=await POST(req(),params);expect(r.status).toBe(200)
  expect(await r.json()).toMatchObject({intentId:intent,customerPaymentLink:origin+'/pay/upi/'+token,settlement:'NOT_VERIFIED'})
  expect(mock.rpc).toHaveBeenCalledWith('billing_manual_upi_reserve',expect.objectContaining({p_invoice:invoice,p_actor:actor,p_vpa:'synthetic@banktest'}))
})
it.each([null,{id:actor,user_metadata:{billing_admin:true}},{id:invoice,app_metadata:{billing_admin:true}}])('denies absent, self-promoted or unallowlisted identities',async user=>{
  mock.auth.mockResolvedValue({user});expect((await POST(req(),params)).status).toBe(403);expect(mock.client).not.toHaveBeenCalled()
})
it('denies wrong scope, cross-origin and modified payment requests',async()=>{
  mock.scope.mockReturnValue(false);expect((await POST(req(),params)).status).toBe(503)
  mock.scope.mockReturnValue(true);expect((await POST(req({},'POST',{origin:'https://evil.example.org'}),params)).status).toBe(403)
  expect((await POST(req({},'POST',{'sec-fetch-site':'cross-site'}),params)).status).toBe(403)
  for(const b of [{amountPaise:1},{vpa:'attacker@banktest'},{method:'COD'},{invoiceId:actor}])expect((await POST(req(b),params)).status).toBe(400)
  expect(mock.rpc).not.toHaveBeenCalled()
})
it.each(['MANUAL_UPI_ENABLED','MANUAL_UPI_PILOT_APPROVED','MANUAL_UPI_BENEFICIARY_VERIFIED','MANUAL_UPI_SCHEMA_APPROVED','MANUAL_UPI_BANK_REVIEW_APPROVED','MANUAL_UPI_MERCHANT_AUTHORIZED','MANUAL_UPI_HOSTING_APPROVED'])('denies %s when off',async flag=>{
  vi.stubEnv(flag,'false');expect((await POST(req(),params)).status).toBe(503);expect(mock.rpc).not.toHaveBeenCalled()
})
it('returns conflict/rate limit without exposing database details',async()=>{
  mock.rpc.mockResolvedValue({data:null,error:{code:'P0031',message:'PRIVATE DATABASE DETAIL'}})
  const limited=await POST(req(),params);expect(limited.status).toBe(429);expect(JSON.stringify(await limited.json())).not.toContain('PRIVATE')
  mock.rpc.mockResolvedValue({data:null,error:{code:'23505'}});expect((await POST(req(),params)).status).toBe(409)
})
it('recovers a durable intent for later review and allows revocation with collection off',async()=>{
  mock.rpc.mockResolvedValue({data:{intentId:intent,state:'REVOKED'},error:null})
  const r=await adminGet(req({},'GET'),params);expect(r.status).toBe(200);expect(await r.json()).toEqual({intentId:intent,state:'REVOKED'})
  vi.stubEnv('MANUAL_UPI_ENABLED','false');mock.rpc.mockResolvedValue({data:true,error:null})
  expect((await DELETE(req({},'DELETE'),params)).status).toBe(200)
  expect(mock.rpc).toHaveBeenLastCalledWith('billing_manual_upi_revoke',{p_invoice:invoice,p_actor:actor})
})
it('only accepts an authorized explicit bank review with a matching durable acknowledgement',async()=>{
  mock.rpc.mockResolvedValue({data:{invoiceId:invoice,status:'PAID',paidPaise:100,outstandingPaise:0,canIssuePaidReceipt:true},error:null})
  const r=await reconcile(req(review),params);expect(r.status).toBe(200)
  expect(await r.json()).toMatchObject({verificationMode:'MANUAL_OFFICIAL_BANK_RECORD'})
  expect(mock.rpc).toHaveBeenCalledWith('billing_verify_manual_upi_credit',expect.objectContaining({p_invoice:invoice,p_intent:intent,p_actor:actor,p_amount:100}))
})
it('rejects fake success, missing bank attestations, disabled settlement and ambiguous replies',async()=>{
  expect((await reconcile(req({...review,confirmedInvoiceMatch:false}),params)).status).toBe(400)
  expect((await reconcile(req({...review,event:'SUCCESS'}),params)).status).toBe(400)
  expect(mock.rpc).not.toHaveBeenCalled()
  vi.stubEnv('BILLING_SETTLEMENT_ENABLED','false');expect((await reconcile(req(review),params)).status).toBe(503)
  vi.stubEnv('BILLING_SETTLEMENT_ENABLED','true');mock.rpc.mockResolvedValue({data:{status:'PAID'},error:null});expect((await reconcile(req(review),params)).status).toBe(503)
})
it('rechecks signed link, canonical state and beneficiary before showing a QR',async()=>{
  mock.rpc.mockResolvedValue({data:view,error:null})
  const r=await publicCall();expect(r.status).toBe(200);const html=await r.text();expect(html).toContain('<svg');expect(html).toContain('UNPAID')
  expect(r.headers.get('referrer-policy')).toBe('no-referrer');expect(r.headers.get('cache-control')).toContain('no-store')
  mock.rpc.mockResolvedValue({data:{...view,vpa:'attacker@banktest'},error:null});expect((await publicCall()).status).toBe(404)
  mock.rpc.mockResolvedValue({data:{...view,status:'SUCCESS'},error:null});expect((await publicCall()).status).toBe(404)
})
it('rejects forged/expired URLs before opening the database and fails closed on outage/revocation',async()=>{
  expect((await publicCall(token+'x')).status).toBe(404)
  expect((await publicCall(signManualUpiLink(intent,issuedAt-86400000,key))).status).toBe(404);expect(mock.client).not.toHaveBeenCalled()
  mock.rpc.mockResolvedValue({data:null,error:null});expect((await publicCall()).status).toBe(404)
})
it('rejects cross-deployment origins and query-bearing URLs before database access',async()=>{
  for(const url of ['https://unapproved.example.org/pay/upi/'+token,origin+'/pay/upi/'+token+'?tracking=1'])
    expect((await checkout(new Request(url),{params:Promise.resolve({token})})).status).toBe(404)
  expect(mock.client).not.toHaveBeenCalled()
})
it('shows verified state without QR or a new payment action',async()=>{
  mock.rpc.mockResolvedValue({data:{...view,status:'PAID',bankVerified:true,vpa:undefined,payee:undefined},error:null})
  const r=await publicCall();expect(r.status).toBe(200);const html=await r.text();expect(html).toContain('bank credit manually verified');expect(html).not.toContain('<svg')
})
