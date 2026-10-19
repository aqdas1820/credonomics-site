import { randomBytes } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const fixture=process.argv.includes('--fixture')
if(process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT_ID)throw Error('Local personal testing launcher cannot run on a hosted platform')
if(fixture && process.env.PERSONAL_TESTING_FIXTURE_RUN!=='1')throw Error('Synthetic fixture launcher not approved')
let key
if(fixture)key='25'.repeat(32)
else if(process.platform==='win32'){
  const result=spawnSync('powershell.exe',['-NoProfile','-File',fileURLToPath(new URL('./personal-testing-key.ps1',import.meta.url))],{encoding:'utf8',windowsHide:true})
  if(result.status!==0 || !/^[a-f0-9]{64}$/.test(result.stdout.trim()))throw Error('Windows protected TEST key unavailable; no server started')
  key=result.stdout.trim()
}else{
  key=process.env.PERSONAL_TESTING_ENCRYPTION_KEY
  if(!/^[a-f0-9]{64}$/.test(key??''))throw Error('Supply a privately held 32-byte hex TEST encryption key on non-Windows; no key file is written')
}
const code=fixture?'SYNTHETIC-OWNER-UNLOCK-ONLY-1234567890':randomBytes(36).toString('base64url')
const port=fixture?'3019':'3018'
const env={...process.env,NODE_ENV:'development',NEXT_TELEMETRY_DISABLED:'1',PERSONAL_TESTING_ENABLED:'true',PERSONAL_TESTING_RUNTIME:'loopback',
  PERSONAL_TESTING_ENCRYPTION_KEY:key,PERSONAL_TESTING_LOCAL_SESSION_KEY:fixture?'26'.repeat(32):randomBytes(32).toString('hex'),
  PERSONAL_TESTING_UNLOCK_CODE:code,PERSONAL_TESTING_LOCAL_PORT:port,NEXT_PUBLIC_SUPABASE_URL:'',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'',
  BILLING_PORTAL_ENABLED:'false',BILLING_API_ENABLED:'false',BILLING_SETTLEMENT_ENABLED:'false',BILLING_SYSTEM_ISSUANCE_ENABLED:'false',BILLING_PDF_ARCHIVE_ENABLED:'false'}
if(!fixture){process.stdout.write(`\nPersonal TEST workspace: http://127.0.0.1:${port}/personal-testing\nLocal session code: ${code}\nKeep this terminal private. Real billing is disabled. Ctrl+C stops the server.\n\n`)}
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port',port],{env,stdio:'inherit',windowsHide:true})
child.on('exit',code=>process.exit(code??1))
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal))
