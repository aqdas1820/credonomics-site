// Synthetic local workerd entry only; never referenced by the application or deployed.
import { createServerClient } from '@supabase/ssr'
import { PDFDocument } from 'pdf-lib'
import { personalPdf } from '../../src/lib/billing/personal-pdf'
import { applyTestCommand } from '../../src/lib/billing/personal-model'
import { renderDocumentPdf } from '../../src/lib/billing/document-pdf'
import { manualUpiHtml } from '../../src/lib/billing/manual-upi-html'
import { signManualUpiLink,openManualUpiLink } from '../../src/lib/billing/manual-upi'
const id='11111111-1111-4111-8111-111111111111'
export default {async fetch(){
  try {
    const key='ab'.repeat(32),now=Date.now(),token=signManualUpiLink(id,now,key)
    if(!openManualUpiLink(token,key,now) || openManualUpiLink(token+'x',key,now))throw Error()
    const html=await manualUpiHtml({intentId:id,invoiceId:id,invoiceNumber:'CN-2026-00000001',amountPaise:12345,issuedAt:now,status:'UNPAID',bankVerified:false,vpa:'synthetic@banktest',payee:'Synthetic Merchant'},
      {origin:'https://www.credonomics.in',beneficiaryId:id,vpa:'synthetic@banktest',payee:'Synthetic Merchant',bankRef:'synthetic-account',fingerprint:'d'.repeat(64),signingKey:key})
    if(!html.includes('<svg') || !html.includes('123.45'))throw Error()
    const client=createServerClient('https://synthetic.supabase.co','sb_publishable_synthetic_local_only',{cookies:{getAll:()=>[],setAll:()=>{}}})
    const {data:{user}}=await client.auth.getUser()
    if(user)throw Error()
    const pdf=await renderDocumentPdf({kind:'invoice',version:1,data:{id,invoiceNumber:'CN-2026-00000001',customer:'Synthetic ग्राहक',address:'Synthetic only',date:'2026-10-20',totalPaise:12345,items:[{position:0,description:'Synthetic service',quantity:1,ratePaise:12345,lineTotalPaise:12345}]}})
    if((await PDFDocument.load(pdf)).getPageCount()<1)throw Error()
    const ledger=applyTestCommand({version:1,owner:id,revision:0,records:[]},{action:'save',draft:{customer:'Synthetic only',date:'2026-10-20',items:[{description:'Synthetic service',quantity:'1',rate:'123.45'}]}},id,'2026-10-20T12:00:00.000Z')
    if((await PDFDocument.load(await personalPdf(ledger.records[0]))).getPageCount()<1)throw Error()
    return Response.json({personalPdf:true,nodeCrypto:true,qr:true,supabaseSsrAnonymous:true,invoicePdf:true,realBankCredit:false})
  }catch(error){return Response.json({compatibility:false,error:error instanceof Error?error.message:'failed'},{status:500})}
}}
