import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { validateInvoice, verifyYoupiWebhook } from './invoice-domain.mjs';
import { sealPaymentLink, openPaymentLink } from './payment-link.mjs';

process.umask(0o077);
if(process.env.PHASE29_SCOPE!=='ISOLATED_SYNTHETIC'||process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.DATABASE_URL)throw Error('ISOLATED_SCOPE_REQUIRED');
const origin=new URL(process.env.PHASE29_PUBLIC_ORIGIN||'');
if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.username||origin.password||origin.search||origin.hash)throw Error('SECURE_PUBLIC_ORIGIN_REQUIRED');
const gateway=new URL(process.env.PHASE29_GATEWAY_ORIGIN||'');
if(gateway.protocol!=='https:'||!['localhost','127.0.0.1'].includes(gateway.hostname)||gateway.pathname!=='/'||gateway.username||gateway.password||gateway.search)throw Error('PRIVATE_PINNED_GATEWAY_REQUIRED');
const root=path.resolve(process.env.PHASE29_STATE_DIR||'/state');
if(root!=='/state')throw Error('ISOLATED_STATE_PATH_REQUIRED');
const ttl=Number(process.env.PHASE29_LINK_TTL_SECONDS||300);
if(!Number.isInteger(ttl)||ttl<10||ttl>300)throw Error('INVALID_TTL');
fs.mkdirSync(root,{recursive:true,mode:0o700});
const secretFile=path.join(root,'credentials.json');
if(!fs.existsSync(secretFile))fs.writeFileSync(secretFile,JSON.stringify({admin:crypto.randomBytes(32).toString('hex'),signing:crypto.randomBytes(32).toString('hex'),webhook:crypto.randomBytes(32).toString('hex')}),{flag:'wx',mode:0o600});
const secrets=JSON.parse(fs.readFileSync(secretFile));
for(const k of ['admin','signing','webhook'])if(!/^[a-f0-9]{64}$/.test(secrets[k]))throw Error('CREDENTIALS_INVALID');
const owner=fs.readFileSync(process.env.PHASE29_GATEWAY_OWNER_FILE,'utf8').trim();
const ca=fs.readFileSync(process.env.PHASE29_GATEWAY_CA);
const tls={cert:fs.readFileSync(process.env.PHASE29_TLS_CERT),key:fs.readFileSync(process.env.PHASE29_TLS_KEY),minVersion:'TLSv1.2'};
const db=new DatabaseSync(path.join(root,'invoices.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS invoices(id TEXT PRIMARY KEY,number TEXT UNIQUE NOT NULL,amount INTEGER NOT NULL CHECK(amount>0),status TEXT NOT NULL DEFAULT 'UNPAID' CHECK(status='UNPAID'),paid INTEGER NOT NULL DEFAULT 0 CHECK(paid=0),phase TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL,payment_id TEXT UNIQUE,gateway_invoice TEXT UNIQUE,gateway_path TEXT,gateway_cookie TEXT,link TEXT,scope TEXT NOT NULL CHECK(scope='PHASE29_SYNTHETIC'));
 CREATE TABLE IF NOT EXISTS observations(delivery TEXT PRIMARY KEY,invoice_id TEXT NOT NULL REFERENCES invoices(id),utr TEXT UNIQUE,event TEXT NOT NULL,received INTEGER NOT NULL);
`);
const merchant='00000000-0000-0000-0000-000000000001';
// Retried deliveries cannot evade replay checks by changing unsigned delivery headers.
if(!db.prepare('PRAGMA table_info(observations)').all().some(c=>c.name==='raw_hash'))db.exec('ALTER TABLE observations ADD COLUMN raw_hash TEXT');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS observation_raw_hash ON observations(raw_hash); CREATE UNIQUE INDEX IF NOT EXISTS observation_invoice_event ON observations(invoice_id,event)');
const baseHeaders={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Strict-Transport-Security':'max-age=86400','Content-Security-Policy':"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&crypto.timingSafeEqual(crypto.createHash('sha256').update(a).digest(),crypto.createHash('sha256').update(b).digest());
function fail(status,code){throw Object.assign(Error(code),{status,code});}
function send(res,status,value,type='application/json'){const body=type==='application/json'?JSON.stringify(value):value;res.writeHead(status,{...baseHeaders,'Content-Type':type,'Content-Length':Buffer.byteLength(body)});res.end(body);}
async function rawBody(req){let size=0;const parts=[];for await(const b of req){size+=b.length;if(size>16384)fail(413,'BODY_TOO_LARGE');parts.push(b);}return Buffer.concat(parts);}
async function body(req){if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))fail(415,'JSON_REQUIRED');try{return JSON.parse(await rawBody(req));}catch(e){if(e.status)throw e;fail(400,'INVALID_JSON');}}
function auth(req){if(!equal(req.headers.authorization,'Bearer '+secrets.admin))fail(401,'AUTH_REQUIRED');}
function request(url,{method='GET',headers={},data,limit=1024*1024}={}){return new Promise((resolve,reject)=>{
 const r=https.request(url,{method,ca,headers},s=>{let size=0;const chunks=[];s.on('data',b=>{size+=b.length;if(size>limit){s.destroy();reject(Error('OVERSIZED'));}else chunks.push(b);});s.on('end',()=>{const bytes=Buffer.concat(chunks);let json;try{json=JSON.parse(bytes);}catch{}resolve({status:s.statusCode,headers:s.headers,bytes,json});});s.on('error',reject);});r.setTimeout(8000,()=>r.destroy(Error('TIMEOUT')));r.on('error',reject);if(data)r.write(data);r.end();
 });}
const gw=(route,options={})=>request(new URL(route,gateway),options);
function canonical(row){return validateInvoice({id:row.id,totalPaise:row.amount,status:row.status,paidPaise:row.paid,invoiceNumber:row.number},row.id);}
async function issue(invoice){
 const existing=db.prepare('SELECT * FROM invoices WHERE id=? OR number=?').get(invoice.id,invoice.invoiceNumber);
 if(existing){if(existing.id!==invoice.id||existing.amount!==invoice.totalPaise||existing.number!==invoice.invoiceNumber)fail(409,'INVOICE_CONFLICT');canonical(existing);if(existing.expires<=Date.now())fail(410,'LINK_EXPIRED');if(existing.phase==='READY')return result(existing);fail(409,'SESSION_RESERVED');}
 const now=Date.now();db.prepare("INSERT INTO invoices(id,number,amount,phase,created,expires,scope)VALUES(?,?,?,'CREATING',?,?,'PHASE29_SYNTHETIC')").run(invoice.id,invoice.invoiceNumber,invoice.totalPaise,now,now+ttl*1000);
 try{
  const raw=JSON.stringify({orderId:'CN-P29-'+invoice.id,amountPaise:invoice.totalPaise});
  const response=await gw('/owner/invoices',{method:'POST',headers:{Authorization:'Bearer '+owner,'Content-Type':'application/json'},data:raw,limit:16384});
  const g=response.json;
  if(response.status!==201||g?.mode!=='SYNTHETIC_ONLY'||g.amountPaise!==invoice.totalPaise||!g.paymentId||!g.invoiceId)throw Error('GATEWAY_CONTRACT');
  const link=new URL(g.link);
  if(link.origin!==gateway.origin||!/^\/p\/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(link.pathname)||link.search)throw Error('GATEWAY_REDIRECT');
  const opened=await gw(link.pathname,{limit:16384});
  if(opened.status!==303||opened.headers.location!=='/customer/'+g.invoiceId||!opened.headers['set-cookie']?.[0])throw Error('CUSTOMER_SESSION');
  const token=sealPaymentLink({invoiceId:invoice.id,invoiceNumber:invoice.invoiceNumber,paymentId:g.paymentId,amountPaise:invoice.totalPaise,merchantId:merchant},secrets.signing,now);
  db.prepare("UPDATE invoices SET phase='READY',payment_id=?,gateway_invoice=?,gateway_path=?,gateway_cookie=?,link=? WHERE id=?").run(g.paymentId,g.invoiceId,opened.headers.location,opened.headers['set-cookie'][0].split(';')[0],token,invoice.id);
  return result(db.prepare('SELECT * FROM invoices WHERE id=?').get(invoice.id));
 }catch{db.prepare("UPDATE invoices SET phase='UNCERTAIN' WHERE id=?").run(invoice.id);fail(502,'GATEWAY_UNAVAILABLE_REVIEW_REQUIRED');}
}
function result(row){return {invoiceId:row.id,invoiceNumber:row.number,amountPaise:row.amount,paymentId:row.payment_id,customerPaymentLink:origin.origin+'/pay/i/'+row.link,invoiceStatus:'PENDING',invoicePaid:false,bankVerified:false,scope:'PHASE29_SYNTHETIC'};}
function authorize(token){const p=openPaymentLink(token,secrets.signing,merchant);if(!p)fail(401,'INVALID_OR_EXPIRED_LINK');const row=db.prepare('SELECT * FROM invoices WHERE id=?').get(p.invoiceId);if(!row||row.phase!=='READY'||row.expires<=Date.now())fail(410,'LINK_EXPIRED');canonical(row);if(row.number!==p.invoiceNumber||row.amount!==p.amountPaise||row.payment_id!==p.paymentId||!equal(row.link,token))fail(409,'LINK_MISMATCH');return row;}
async function status(row){const g=await gw(row.gateway_path+'/status',{headers:{Cookie:row.gateway_cookie},limit:16384});if(g.status!==200||g.json?.amountPaise!==row.amount||g.json.invoicePaid!==false)fail(g.status===410?410:502,'GATEWAY_STATUS_UNAVAILABLE');return {...result(row),customerPaymentLink:undefined,paymentStatus:g.json.state,independentBankVerified:false};}
function page(title,content){return '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>'+title+'</title><style>body{font:18px system-ui;max-width:650px;margin:3rem auto;padding:1rem}a,button{padding:12px}img{width:260px;max-width:90%}strong{color:#923}</style><h1>CredoNomics × YouPI</h1>'+content+'</html>';}
function formToken(){const text=String(Math.floor(Date.now()/60000));return text+'.'+crypto.createHmac('sha256',secrets.signing).update('demo:'+text).digest('hex');}
const limits=new Map();let demoCreating=null;
function demoLimit(req){const now=Date.now(),ip=req.headers['cf-connecting-ip']||req.socket.remoteAddress;for(const [k,v]of limits)if(v.until<now)limits.delete(k);const v=limits.get(ip)||{n:0,until:now+60000};if(++v.n>4||limits.size>1024)fail(429,'RATE_LIMIT');limits.set(ip,v);}
const publicHandler=async(req,res)=>{try{
 if(req.url.length>1600)fail(414,'URL_TOO_LONG');const u=new URL(req.url,origin);if(u.search)fail(400,'QUERY_NOT_ALLOWED');
 if(req.method==='GET'&&u.pathname==='/health'){const g=await gw('/health',{limit:16384});return send(res,g.status===200?200:503,{status:g.status===200?'UP':'DOWN',service:'credonomics-phase29',scope:'PHASE29_SYNTHETIC',livePayments:false,paymentMethods:['UPI'],gatewayHttps:g.status===200});}
 if(req.method==='GET'&&u.pathname==='/'){const token=formToken();return send(res,200,page('CredoNomics Phase 29 staging','<h2>Invoice payment-link integration</h2><strong>Synthetic only — do not pay</strong><p>Creates an isolated CredoNomics invoice using the existing billing validators and signed payment-link implementation, then calls the real AWS YouPI gateway over authenticated HTTPS.</p><form method="post" action="/demo"><input type="hidden" name="csrf" value="'+token+'"><button>Create test invoice and checkout</button></form><p>Invoice remains PENDING until independent bank verification. Real collections disabled.</p>'),'text/html; charset=utf-8');}
 if(req.method==='POST'&&u.pathname==='/demo'){
  if(req.headers.origin!==origin.origin)fail(403,'ORIGIN_REJECTED');demoLimit(req);const raw=await rawBody(req);const token=new URLSearchParams(raw.toString()).get('csrf');if(!equal(token,formToken()))fail(403,'CSRF_REJECTED');
  let row=db.prepare("SELECT * FROM invoices WHERE number LIKE 'P29-DEMO-%' AND phase='READY' AND expires>? ORDER BY created DESC LIMIT 1").get(Date.now()+15000);
  let out;
  if(row)out=result(row);else{if(!demoCreating)demoCreating=(async()=>{const id=crypto.randomUUID();const data=JSON.stringify({id,invoiceNumber:'P29-DEMO-'+id,totalPaise:100});const r=await request('https://localhost:'+(process.env.PHASE29_PRIVATE_HTTPS_PORT||8445)+'/api/staging/invoices',{method:'POST',headers:{Authorization:'Bearer '+secrets.admin,'Content-Type':'application/json'},data,limit:16384});if(![200,201].includes(r.status))fail(502,'INVOICE_API_UNAVAILABLE');return r.json;})();try{out=await demoCreating;}finally{demoCreating=null;}}
  res.writeHead(303,{...baseHeaders,Location:new URL(out.customerPaymentLink).pathname,'Content-Length':0});return res.end();
 }
 const m=u.pathname.match(/^\/pay\/i\/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43})(?:\/(status|qr\.svg))?$/);
 if(req.method==='GET'&&m){const row=authorize(m[1]);
  if(m[2]==='status')return send(res,200,await status(row));
  if(m[2]==='qr.svg'){const g=await gw(row.gateway_path+'/qr.svg',{headers:{Cookie:row.gateway_cookie}});if(g.status!==200||!g.bytes.toString().includes('<svg'))fail(g.status===410?409:502,'QR_NOT_ACTIVE');return send(res,200,g.bytes,'image/svg+xml');}
  await status(row);return send(res,200,page('CredoNomics test invoice checkout','<strong>SYNTHETIC — DO NOT PAY</strong><h2>Invoice '+row.number+'</h2><p>INR '+(row.amount/100).toFixed(2)+'</p><p>Financial status: PENDING — bank credit not verified</p><img alt="Dynamic synthetic UPI QR" src="'+u.pathname+'/qr.svg"><p><a href="'+u.pathname+'/status">Protected payment status</a></p>'),'text/html; charset=utf-8');
 }
 fail(404,'NOT_FOUND');
 }catch(e){if(!res.headersSent)send(res,e.status||500,{error:e.code||'REQUEST_FAILED'});else res.destroy();}};
const privateHandler=async(req,res)=>{try{
 auth(req);if(req.method==='POST'&&req.url==='/api/staging/invoices'){
  const input=await body(req);if(!input.id||Object.keys(input).some(k=>!['id','invoiceNumber','totalPaise'].includes(k)))fail(400,'INVALID_INVOICE');
  const invoice=validateInvoice({id:input.id,totalPaise:input.totalPaise,status:'UNPAID',paidPaise:0,invoiceNumber:input.invoiceNumber},input.id);return send(res,201,await issue(invoice));
 }
 if(req.method==='POST'&&req.url==='/api/staging/observations'){
  const raw=await rawBody(req);const stamp=Number(req.headers['x-gateway-timestamp']),delivery=req.headers['x-gateway-delivery-id'];
  if(!Number.isSafeInteger(stamp)||Math.abs(Date.now()-stamp)>60000||!/^[a-f0-9-]{36}$/i.test(delivery||'')||!verifyYoupiWebhook(raw,req.headers['x-gateway-signature']||null,secrets.webhook))fail(401,'INVALID_WEBHOOK');
  let p;try{p=JSON.parse(raw);}catch{fail(400,'INVALID_JSON');}
  const row=db.prepare('SELECT * FROM invoices WHERE id=?').get(p.invoiceId);
  if(p.method!=='UPI')fail(409,'UPI_ONLY');
  if(!row||p.paymentId!==row.payment_id||p.amountPaise!==row.amount||p.currency!=='INR'||p.beneficiary!=='validation@invalid'||!['SUCCESS','FAILED','EXPIRED','CANCELLED'].includes(p.event)||p.bankVerified===true)fail(409,'OBSERVATION_MISMATCH');
  if(p.event==='SUCCESS'&&!/^[A-Za-z0-9-]{8,80}$/.test(p.utr||''))fail(400,'INVALID_UTR');
  try{db.prepare('INSERT INTO observations(delivery,invoice_id,utr,event,received,raw_hash) VALUES(?,?,?,?,?,?)').run(delivery,row.id,p.utr?.toUpperCase()||null,p.event,Date.now(),crypto.createHash('sha256').update(raw).digest('hex'));}catch{fail(409,'REPLAY_OR_DUPLICATE_UTR');}
  return send(res,202,{decision:'REVIEW_REQUIRED',invoiceStatus:'PENDING',invoicePaid:false,independentBankVerified:false});
 }
 fail(404,'NOT_FOUND');
 }catch(e){if(!res.headersSent)send(res,e.status||400,{error:e.code||'REQUEST_REJECTED'});else res.destroy();}};
const pub=http.createServer(publicHandler),priv=https.createServer(tls,privateHandler);
for(const s of [pub,priv]){s.requestTimeout=10000;s.headersTimeout=10000;s.maxHeadersCount=32;s.maxConnections=32;}
pub.listen(Number(process.env.PHASE29_HTTP_PORT||8090),'127.0.0.1');priv.listen(Number(process.env.PHASE29_PRIVATE_HTTPS_PORT||8445),'127.0.0.1');
console.log(JSON.stringify({event:'phase29_ready',scope:'ISOLATED_SYNTHETIC',livePayments:false}));
for(const sig of ['SIGTERM','SIGINT'])process.on(sig,()=>{pub.close();priv.close(()=>{db.close();process.exit(0);});setTimeout(()=>process.exit(1),5000).unref();});
