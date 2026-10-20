// Run inside the isolated Phase29 container. Uses real HTTPS, never mock transports.
import fs from 'node:fs';import https from 'node:https';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
const secrets=JSON.parse(fs.readFileSync('/state/credentials.json'));
const ca=fs.readFileSync(process.env.PHASE29_GATEWAY_CA),origin=process.env.PHASE29_PUBLIC_ORIGIN;
const privateOrigin='https://localhost:'+(process.env.PHASE29_PRIVATE_HTTPS_PORT||8445);
function api(path,data,headers={},auth=true){return new Promise((resolve,reject)=>{const raw=Buffer.isBuffer(data)?data:Buffer.from(JSON.stringify(data));const r=https.request(privateOrigin+path,{method:'POST',ca,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+secrets.admin}:{}),...headers}},s=>{let text='';s.on('data',b=>text+=b);s.on('end',()=>resolve({status:s.statusCode,value:JSON.parse(text)}));});r.setTimeout(10000,()=>r.destroy(Error('TIMEOUT')));r.on('error',reject);r.end(raw);});}
const checks={};
const health=await fetch(origin+'/health');assert.equal(health.status,200);assert.equal((await health.json()).service,'credonomics-phase29');checks.publicHttpsHealth=200;
const home=await fetch(origin+'/');const html=await home.text();const csrf=/name="csrf" value="([^"]+)"/.exec(html)?.[1];assert.ok(csrf);
const demo=await fetch(origin+'/demo',{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf})});assert.equal(demo.status,303);const link=demo.headers.get('location');assert.match(link,/^\/pay\/i\//);checks.authenticatedInvoiceApiAndSignedLink=303;
const page=await fetch(origin+link);assert.equal(page.status,200);assert.match(await page.text(),/Financial status: PENDING/);checks.customerCheckout=200;
const qr=await fetch(origin+link+'/qr.svg');assert.equal(qr.status,200);const svg=await qr.text();assert.match(svg,/<svg/);checks.actualDynamicQR={status:200,bytes:svg.length,sha256:crypto.createHash('sha256').update(svg).digest('hex')};
const status=await fetch(origin+link+'/status');assert.equal(status.status,200);const view=await status.json();assert.equal(view.invoiceStatus,'PENDING');assert.equal(view.invoicePaid,false);assert.notEqual(view.invoiceId,view.paymentId);checks.protectedStatus={status:200,invoicePaid:false,invoiceStatus:view.invoiceStatus,paymentStatus:view.paymentStatus};
const altered=link.slice(0,-1)+(link.endsWith('A')?'B':'A');assert.equal((await fetch(origin+altered+'/status')).status,401);checks.forgedLink=401;
for(const path of ['/api/staging/invoices','/api/staging/observations','/admin','/owner/invoices','/api/v1/payments','/.env','/data/youpi_pg.sqlite'])assert.equal((await fetch(origin+path)).status,404);checks.internalPaths='404';
assert.equal((await api('/api/staging/invoices',{}, {},false)).status,401);checks.merchantBackendAuthentication=401;
const invoice={id:crypto.randomUUID(),invoiceNumber:'P29-CONCURRENT-'+crypto.randomUUID(),totalPaise:100};
const concurrent=await Promise.all([api('/api/staging/invoices',invoice),api('/api/staging/invoices',invoice)]);assert.ok(concurrent.every(x=>[201,409].includes(x.status)));assert.ok(concurrent.some(x=>x.status===201));const issued=concurrent.find(x=>x.status===201).value;
const again=await api('/api/staging/invoices',invoice);assert.equal(again.status,201);assert.equal(again.value.paymentId,issued.paymentId);assert.equal((await api('/api/staging/invoices',{...invoice,totalPaise:101})).status,409);checks.concurrentCheckoutAndIdempotency='PASS';
assert.equal((await api('/api/staging/invoices',{...invoice,id:'invalid'})).status,400);checks.invalidInvoice=400;
function headers(raw,delivery=crypto.randomUUID()){return {'X-Gateway-Signature':'sha256='+crypto.createHmac('sha256',secrets.webhook).update(raw).digest('hex'),'X-Gateway-Timestamp':String(Date.now()),'X-Gateway-Delivery-Id':delivery};}
const event={invoiceId:issued.invoiceId,paymentId:issued.paymentId,amountPaise:100,currency:'INR',beneficiary:'validation@invalid',event:'SUCCESS',utr:'P29-TEST-'+crypto.randomUUID()};const raw=Buffer.from(JSON.stringify(event)),signed=headers(raw);
assert.equal((await api('/api/staging/observations',raw,{...signed,'X-Gateway-Signature':'sha256'+'0'.repeat(64)})).status,401);checks.forgedWebhook=401;
assert.equal((await api('/api/staging/observations',raw,{...signed,'X-Gateway-Timestamp':String(Date.now()-120000)})).status,401);checks.staleWebhook=401;
const valid=await api('/api/staging/observations',raw,signed);assert.equal(valid.status,202);assert.equal(valid.value.decision,'REVIEW_REQUIRED');assert.equal(valid.value.invoicePaid,false);checks.syntheticSuccess=valid.value;
assert.equal((await api('/api/staging/observations',raw,signed)).status,409);assert.equal((await api('/api/staging/observations',raw,headers(raw))).status,409);checks.replayAndDuplicateUTR=409;
const bad=Buffer.from(JSON.stringify({...event,amountPaise:101,utr:undefined}));assert.equal((await api('/api/staging/observations',bad,headers(bad))).status,409);checks.amountMismatch=409;
const db=new DatabaseSync('/state/invoices.sqlite');assert.equal(db.prepare('SELECT COUNT(*) AS n FROM invoices WHERE id=?').get(invoice.id).n,1);assert.throws(()=>db.prepare("UPDATE invoices SET status='PAID',paid=100 WHERE id=?").run(invoice.id));checks.paidStorageConstraint='PASS';
db.prepare('UPDATE invoices SET expires=? WHERE id=?').run(Date.now()-1000,invoice.id);assert.equal((await fetch(issued.customerPaymentLink+'/status')).status,410);checks.expiredIsolatedFixture=410;assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');db.close();
const failed=Buffer.from(JSON.stringify({...event,event:'FAILED',utr:undefined}));assert.equal((await api('/api/staging/observations',failed,headers(failed))).status,202);checks.failedObservation=202;
console.log(JSON.stringify({result:'PASS',transport:'ACTUAL_HTTPS',scope:'PHASE29_SYNTHETIC',checks,realPaymentExecuted:false,productionDatabaseAccess:false}));
