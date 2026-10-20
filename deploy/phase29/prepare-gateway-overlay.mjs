import fs from 'node:fs';import crypto from 'node:crypto';
const [input,output]=process.argv.slice(2);
const original=fs.readFileSync(input,'utf8');
const from='return { invoiceId: invoice.id, orderId: invoice.order_id, amountPaise: invoice.amount_paise,';
if(original.split(from).length!==2)throw Error('UNEXPECTED_GATEWAY_SOURCE');
const result=original.replace(from,'return { paymentId: invoice.payment_id, invoiceId: invoice.id, orderId: invoice.order_id, amountPaise: invoice.amount_paise,');
fs.writeFileSync(output,result,{flag:'wx',mode:0o644});
console.log(JSON.stringify({gatewayOverlaySha256:crypto.createHash('sha256').update(result).digest('hex')}));
