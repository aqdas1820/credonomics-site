// Real built Next server; synthetic configuration, no cloud keys or calls.
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
assert.equal(readFileSync('app/data/search-index.generated.ts','utf8').includes('/personal-testing'),false,'Public search must not advertise owner tools')
const origin='http://127.0.0.1:3020'
const env={...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',PERSONAL_TESTING_ENABLED:'true',PERSONAL_TESTING_RUNTIME:'hosted',
  PERSONAL_TESTING_ENCRYPTION_KEY:'25'.repeat(32),PERSONAL_TESTING_OWNER_ID:'11111111-1111-4111-8111-111111111111',
  PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF:'a'.repeat(20),NEXT_PUBLIC_SUPABASE_URL:'',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'',
  BILLING_API_ENABLED:'false',BILLING_PORTAL_ENABLED:'false',BILLING_SETTLEMENT_ENABLED:'false'}
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3020'],{env,stdio:['ignore','ignore','inherit'],windowsHide:true})
try{
  let ready=false
  for(let i=0;i<60;i++){
    if(child.exitCode!==null)throw Error('Built server exited before denial verification')
    try{const response=await fetch(origin+'/personal-testing',{signal:AbortSignal.timeout(2000)});if(response.status===404){ready=true;break}}catch{}
    await new Promise(resolve=>setTimeout(resolve,500))
  }
  assert.equal(ready,true,'Production page must remain unavailable without Auth')
  for(const path of ['/api/personal-testing','/api/personal-testing/session']){
    const response=await fetch(origin+path,{method:'POST',headers:{origin,'Content-Type':'application/json',Cookie:'cn_personal_local=SYNTHETIC-FORGED-COOKIE'},body:JSON.stringify({command:{action:'read'}})})
    assert.equal(response.status,404)
    assert.match(response.headers.get('cache-control')??'',/no-store/)
  }
  console.log('PASS built production server: enabled TEST flag with missing Auth still denies page, data API and local session API (404)')
}finally{child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(resolve,5000)})}
