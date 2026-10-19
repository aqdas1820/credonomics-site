import { afterEach, beforeEach, expect, it, vi } from 'vitest'
vi.mock('server-only',()=>({}))
const actor=vi.hoisted(()=>vi.fn())
vi.mock('./personal-access',()=>({personalActor:actor}))
import { POST } from '../../../app/api/personal-testing/route'
const id='11111111-1111-4111-8111-111111111111'
beforeEach(()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('PERSONAL_TESTING_RUNTIME','hosted');vi.stubEnv('PERSONAL_TESTING_ENABLED','true');vi.stubEnv('PERSONAL_TESTING_OWNER_ID',id)
 vi.stubEnv('PERSONAL_TESTING_ENCRYPTION_KEY','25'.repeat(32));vi.stubEnv('PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF','a'.repeat(20));vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL',`https://${'a'.repeat(20)}.supabase.co`);vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','synthetic-publishable')
 actor.mockResolvedValue(id)
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No integration/network call allowed')}))
})
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.clearAllMocks()})
const request=(value:unknown,origin='https://www.credonomics.in')=>new Request('https://www.credonomics.in/api/personal-testing',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(value)})
it('denies every action including PDF before reading/decrypting data for anonymous users',async()=>{
 actor.mockResolvedValue(null)
 for(const action of ['read','save','transition','pdf']){
  const response=await POST(request({blob:'UNTRUSTED',command:{action,id}}));expect(response.status).toBe(403);expect(response.headers.get('cache-control')).toContain('no-store')
 }
})
it('rejects disabled configuration, wrong origin, oversized bodies and malformed commands',async()=>{
 vi.stubEnv('PERSONAL_TESTING_ENABLED','false');expect((await POST(request({}))).status).toBe(404);vi.stubEnv('PERSONAL_TESTING_ENABLED','true')
 expect((await POST(request({command:{action:'read'}},'https://evil.example'))).status).toBe(403)
 expect((await POST(request({blob:'x'.repeat(270000),command:{action:'read'}}))).status).toBe(413)
 expect((await POST(request({command:{action:'settle',status:'PAID'}}))).status).toBe(400)
})
it('runs create/edit/issue/simulation/history/PDF entirely without real integrations',async()=>{
 let blob:string|undefined;let recordId=''
 async function call(command:unknown){const response=await POST(request({blob,command}));expect(response.status).toBe(200);const value=await response.json();blob=value.blob;return value.ledger}
 const draft={customer:'Synthetic API Customer',date:'2026-10-19',items:[{description:'One',quantity:'2',rate:'10.25'}]}
 let ledger=await call({action:'save',draft});recordId=ledger.records[0].id
 ledger=await call({action:'save',id:recordId,draft:{...draft,customer:'Edited synthetic'}})
 for(const status of ['ISSUED_TEST','SIMULATED_PENDING','SIMULATED_SUCCESS'])ledger=await call({action:'transition',id:recordId,status})
 expect(ledger.records[0]).toMatchObject({kind:'TEST',realSettlement:'NONE',status:'SIMULATED_SUCCESS',totalPaise:2050})
 const retained=blob;await call({action:'read'});expect(blob).toBe(retained)
 const pdf=await POST(request({blob,command:{action:'pdf',id:recordId}}));expect(pdf.status).toBe(200);expect(pdf.headers.get('content-type')).toBe('application/pdf');expect(Buffer.from(await pdf.arrayBuffer()).subarray(0,5).toString()).toBe('%PDF-')
 expect(fetch).not.toHaveBeenCalled()
},30000)
