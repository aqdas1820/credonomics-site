import QRCode from 'qrcode'
import { manualUpiUri, type ManualUpiConfig, type ManualUpiView } from './manual-upi'
const esc=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))

/** Standalone private HTML: no analytics, external QR service, JS or customer PII. */
export async function manualUpiHtml(view:ManualUpiView, config:ManualUpiConfig):Promise<string> {
  const uri=view.status==='UNPAID'?manualUpiUri(view,config):null
  const qr=uri?await QRCode.toString(uri,{type:'svg',errorCorrectionLevel:'M',margin:4,width:288}):''
  const amount=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(view.amountPaise/100)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Private invoice payment | CredoNomics</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f6f8f7;color:#16352e;font:16px/1.5 system-ui,sans-serif}main{max-width:560px;margin:32px auto;padding:24px;background:white;border:1px solid #c7d8d2;border-radius:12px;overflow-wrap:anywhere}h1{font-size:28px;margin:12px 0}.amount{font-size:36px;font-weight:750;margin:8px 0}.notice{padding:14px;background:#fff5de;border-left:4px solid #936d28}.qr{max-width:288px;margin:20px auto}.qr svg{width:100%;height:auto;display:block}a{display:block;background:#155742;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;margin:18px 0}small{display:block;color:#536a61}dl{display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px}dd{margin:0}dt{font-weight:650}@media(max-width:600px){main{margin:12px;padding:18px}h1{font-size:25px}.amount{font-size:32px}}
  </style></head><body><main><small>CREDONOMICS INVESTMENT SOLUTIONS</small><h1>Invoice payment</h1><p>Invoice <strong>${esc(view.invoiceNumber)}</strong></p><p class="amount">${esc(amount)}</p>
  ${uri?`<p class="notice"><strong>UNPAID — bank verification pending.</strong><br>Pay directly by UPI. CredoNomics manually checks the bank credit before issuing a PAID receipt.</p><dl><dt>Payee</dt><dd>${esc(config.payee)}</dd><dt>UPI ID</dt><dd>${esc(config.vpa)}</dd></dl><div class="qr" role="img" aria-label="UPI payment QR for the exact invoice amount">${qr}</div><a href="${esc(uri!)}" rel="noreferrer">Open UPI app</a><p>Check the receiving name and exact amount in your UPI app. If they differ, stop and contact CredoNomics.</p><small>Your UPI app may allow an amount change; only the exact booked credit can settle this invoice. A successful app screen is not a receipt. Refresh this page after CredoNomics confirms the bank credit. Never share your UPI PIN or OTP.</small>`:
  '<p class="notice"><strong>PAID — bank credit manually verified.</strong><br>Payment instructions have been removed. Contact CredoNomics for your verified receipt.</p>'}
  <p><small>Direct UPI transfer with manual bank review. This is not an automated payment gateway.</small></p></main></body></html>`
}
