import { afterEach, beforeEach, expect, it, vi } from 'vitest'
vi.mock('server-only',()=>({}))
const auth=vi.hoisted(()=>vi.fn())
vi.mock('../supabase/server',()=>({authenticatedUser:auth}))
vi.mock('next/headers',()=>({headers:async()=>new Headers({host:'www.credonomics.in'}),cookies:async()=>({get:()=>undefined})}))
import { personalActor } from './personal-access'
const id='11111111-1111-4111-8111-111111111111'
beforeEach(()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('PERSONAL_TESTING_ENABLED','true');vi.stubEnv('PERSONAL_TESTING_RUNTIME','hosted')
 vi.stubEnv('PERSONAL_TESTING_ENCRYPTION_KEY','25'.repeat(32));vi.stubEnv('PERSONAL_TESTING_OWNER_ID',id)
 vi.stubEnv('PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF','a'.repeat(20));vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL',`https://${'a'.repeat(20)}.supabase.co`);vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','synthetic')
})
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks()})
it('uses verified server identity for the singular production owner',async()=>{
 auth.mockResolvedValue({user:{id,app_metadata:{billing_admin:true}}});expect(await personalActor()).toBe(id);expect(auth).toHaveBeenCalledOnce()
})
it('denies anonymous, untrusted metadata, other admins and authentication outages',async()=>{
 for(const user of [null,{id,user_metadata:{billing_admin:true}},{id:'22222222-2222-4222-8222-222222222222',app_metadata:{billing_admin:true}}]){
  auth.mockResolvedValue({user});expect(await personalActor()).toBeNull()
 }
 auth.mockRejectedValue(new Error('Synthetic Auth outage'));expect(await personalActor()).toBeNull()
})
it('fails closed before invoking Auth when configuration is incomplete',async()=>{
 vi.stubEnv('PERSONAL_TESTING_ENCRYPTION_KEY','');expect(await personalActor()).toBeNull();expect(auth).not.toHaveBeenCalled()
})
