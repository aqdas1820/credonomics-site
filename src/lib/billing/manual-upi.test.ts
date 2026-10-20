import { describe,it,expect,vi,afterEach } from 'vitest'
import { manualUpiConfig,signManualUpiLink,openManualUpiLink,manualUpiUri,MANUAL_UPI_TTL,prepareManualBankReview,validateManualUpiView } from './manual-upi'
import { manualUpiHtml } from './manual-upi-html'
const id='11111111-1111-4111-8111-111111111111',key='ab'.repeat(32)
const env={BILLING_API_ENABLED:'true',MANUAL_UPI_ENABLED:'true',MANUAL_UPI_PILOT_APPROVED:'true',MANUAL_UPI_BENEFICIARY_VERIFIED:'true',MANUAL_UPI_MERCHANT_AUTHORIZED:'true',MANUAL_UPI_HOSTING_APPROVED:'true',
  MANUAL_UPI_SCHEMA_APPROVED:'true',MANUAL_UPI_BANK_REVIEW_APPROVED:'true',MANUAL_UPI_SITE_ORIGIN:'https://www.credonomics.in',
  MANUAL_UPI_BENEFICIARY_ID:id,MANUAL_UPI_VPA:'synthetic@banktest',MANUAL_UPI_PAYEE_NAME:'Synthetic Merchant',MANUAL_UPI_BANK_NAME:'Slice',MANUAL_UPI_ACCOUNT_TYPE:'BUSINESS_CURRENT',
  MANUAL_UPI_BANK_ACCOUNT_REF:'synthetic-account',MANUAL_UPI_SIGNING_KEY:key}
const config=manualUpiConfig(env),issuedAt=Date.now()
const view={intentId:id,invoiceId:id,invoiceNumber:'CN-2026-00000001',amountPaise:12345,issuedAt,status:'UNPAID' as const,bankVerified:false,vpa:config.vpa,payee:config.payee}
afterEach(()=>vi.unstubAllEnvs())
describe('independent manual UPI contract',()=>{
  it('requires all owner gates, exact beneficiary configuration and supported bank',()=>{
    for(const flag of ['BILLING_API_ENABLED','MANUAL_UPI_ENABLED','MANUAL_UPI_PILOT_APPROVED','MANUAL_UPI_BENEFICIARY_VERIFIED','MANUAL_UPI_SCHEMA_APPROVED','MANUAL_UPI_BANK_REVIEW_APPROVED','MANUAL_UPI_MERCHANT_AUTHORIZED','MANUAL_UPI_HOSTING_APPROVED'])
      expect(()=>manualUpiConfig({...env,[flag]:'false'})).toThrow()
    for(const patch of [{MANUAL_UPI_ACCOUNT_TYPE:undefined},{MANUAL_UPI_ACCOUNT_TYPE:'SAVINGS'},{MANUAL_UPI_BANK_NAME:'Other bank'},{MANUAL_UPI_VPA:'attacker@invalid'},{MANUAL_UPI_PAYEE_NAME:'Wrong\nname'},
      {MANUAL_UPI_SITE_ORIGIN:'https://evil.example.org'},{MANUAL_UPI_SIGNING_KEY:'weak'}]) expect(()=>manualUpiConfig({...env,...patch})).toThrow()
    expect(manualUpiConfig({...env,MANUAL_UPI_VPA:'changed@banktest'}).fingerprint).not.toBe(config.fingerprint)
  })
  it('rejects altered, expired, future, wrong-key and noncanonical tokens',()=>{
    const token=signManualUpiLink(id,issuedAt,key)
    expect(openManualUpiLink(token,key,issuedAt)).toEqual({intentId:id,issuedAt})
    for(const [t,k,now] of [[token+'A',key,issuedAt],[token,'bc'.repeat(32),issuedAt],[token,key,issuedAt+MANUAL_UPI_TTL],
      [token,key,issuedAt-61000],[token.replace('m1.','v1.'),key,issuedAt]] as const) expect(openManualUpiLink(t,k,now)).toBeNull()
    expect(token).not.toContain(config.vpa);expect(token).not.toContain('12345')
  })
  it('encodes the exact invoice amount, currency, intent reference and configured beneficiary',()=>{
    const uri=new URL(manualUpiUri(view,config))
    expect(uri.protocol).toBe('upi:');expect(uri.hostname).toBe('pay')
    expect(Object.fromEntries(uri.searchParams)).toMatchObject({pa:config.vpa,pn:config.payee,am:'123.45',cu:'INR',tr:id.replaceAll('-','')})
    expect(()=>manualUpiUri({...view,vpa:'attacker@banktest'},config)).toThrow()
    expect(()=>manualUpiUri({...view,amountPaise:1.5},config)).toThrow()
    expect(()=>manualUpiUri({...view,status:'PAID',bankVerified:true},config)).toThrow()
  })
  it('requires three explicit manual attestations; customer SUCCESS is never bank evidence',()=>{
    const review={intentId:id,utr:'TESTBANKUTR001',amountPaise:12345,bookedAt:new Date().toISOString(),evidenceReference:'Official test record',
      confirmedOfficialBankCredit:true,confirmedBeneficiaryAccount:true,confirmedInvoiceMatch:true}
    expect(prepareManualBankReview(review).utr).toBe('TESTBANKUTR001')
    for(const patch of [{confirmedOfficialBankCredit:false},{confirmedBeneficiaryAccount:false},{confirmedInvoiceMatch:false},{gatewayStatus:'SUCCESS'},
      {bookedAt:new Date(Date.now()+120000).toISOString()}]) expect(()=>prepareManualBankReview({...review,...patch})).toThrow()
  })
  it('rejects contradictory state and produces no payment instructions after verification',async()=>{
    expect(()=>validateManualUpiView({...view,status:'PAID'})).toThrow()
    const html=await manualUpiHtml(view,config)
    expect(html).toContain('<svg');expect(html).toContain('UNPAID');expect(html).not.toContain('<script');expect(html).not.toContain('https://')
    const paid=await manualUpiHtml({...view,status:'PAID',bankVerified:true,vpa:undefined,payee:undefined},config)
    expect(paid).toContain('bank credit manually verified');expect(paid).not.toContain('<svg');expect(paid).not.toContain('upi://')
  })
  it('escapes displayed labels and never exposes bank-account references',async()=>{
    const hostile={...config,payee:'Merchant <img onerror="x">'}
    const html=await manualUpiHtml({...view,payee:hostile.payee},hostile)
    expect(html).toContain('&lt;img');expect(html).not.toContain('<img');expect(html).not.toContain(config.bankRef)
  })
})
