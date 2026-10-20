import {build} from 'esbuild'
import {unstable_dev} from 'wrangler'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const folder='.wrangler/phase32';await fs.mkdir(folder,{recursive:true})
await build({entryPoints:['scripts/cloudflare/compat-probe.ts'],outfile:folder+'/probe.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',external:['node:*'],alias:{'server-only':path.resolve('scripts/cloudflare/empty.mjs')},plugins:[{name:'licensed-font-bytes',setup(b){b.onLoad({filter:/\.(ttf|png)$/},async a=>({contents:`export default ${JSON.stringify('data:application/octet-stream;base64,'+(await fs.readFile(a.path.replace(/\?inline$/,''))).toString('base64'))}`,loader:'js'}))}}]})
// Entirely local: no account token, routes, remote bindings, uploads or real data.
await fs.writeFile(folder+'/wrangler.json',JSON.stringify({name:'phase32-synthetic-only',main:'probe.mjs',compatibility_date:'2026-10-20',compatibility_flags:['nodejs_compat'],workers_dev:false,preview_urls:false,observability:{enabled:false}}))
let worker
try {
  worker=await unstable_dev(folder+'/probe.mjs',{config:folder+'/wrangler.json',ip:'127.0.0.1',port:8788,local:true,experimental:{disableExperimentalWarning:true}})
  const response=await worker.fetch();assert.equal(response.status,200,await response.clone().text())
  const result=await response.json();for(const k of ['nodeCrypto','qr','supabaseSsrAnonymous','invoicePdf','personalPdf'])assert.equal(result[k],true)
  console.log('Local workerd: actual HMAC/tamper rejection, QR, Supabase SSR anonymous denial and Hindi invoice PDF and branded TEST PDF PASS; hosted login/bank credit NOT tested.')
}finally{await worker?.stop()}
try {
  worker=await unstable_dev('.wrangler/phase32/full/worker.js',{config:'wrangler.jsonc',ip:'127.0.0.1',port:8788,local:true,experimental:{disableExperimentalWarning:true}})
  for(const route of ['/pay/upi/forged','/billing','/api/billing/admin/invoices']){
    const res=await worker.fetch(route);assert.equal(res.status,404,route);assert.match(res.headers.get('cache-control')??'',/no-store/)
  }
  const session=await worker.fetch('/api/account/session');assert.equal(session.status,200)
  assert.equal((await session.json()).data.configured,false)
  console.log('Full OpenNext app in local workerd: disabled checkout/admin routes and unconfigured Auth PASS.')
}finally{await worker?.stop()}
