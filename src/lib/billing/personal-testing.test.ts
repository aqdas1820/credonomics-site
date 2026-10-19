import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('server-only',()=>({}))
import { PDFDocument } from 'pdf-lib'
import { applyTestCommand, amountFor, type TestLedger } from './personal-model'
import { localOwner, localRuntime, personalReady, ownerIdentity, sealLedger, openLedger, localSession, validLocalSession, trustedLocalHost, personalOriginAllowed } from './personal-security'
import { personalPdf } from './personal-pdf'
const draft={customer:'Synthetic Customer',date:'2026-10-19',items:[{description:'Synthetic service',quantity:'2',rate:'1234.50'},{description:'Second line',quantity:'1',rate:'250.00'}]}
const id='11111111-1111-4111-8111-111111111111'
const now='2026-10-19T12:00:00.000Z'
const blank=():TestLedger=>({version:1,owner:localOwner,revision:0,records:[]})
beforeEach(()=>{vi.stubEnv('PERSONAL_TESTING_ENCRYPTION_KEY','25'.repeat(32));vi.stubEnv('PERSONAL_TESTING_ENABLED','true')})
afterEach(()=>vi.unstubAllEnvs())
describe('separate TEST ledger',()=>{
 it('calculates multiple INR lines in integer paise',()=>expect(amountFor(draft).totalPaise).toBe(271900))
 it.each(['1e3','0x10','-5','1.001'])('rejects noncanonical rate %s',rate=>expect(()=>amountFor({...draft,items:[{...draft.items[0],rate}]})).toThrow())
 it('saves and edits drafts without mutating previous snapshots',()=>{
  const first=applyTestCommand(blank(),{action:'save',draft},id,now)
  const next=applyTestCommand(first,{action:'save',id,draft:{...draft,customer:'Edited synthetic'}},id,now)
  expect(first.records[0].customer).toBe('Synthetic Customer');expect(next.records[0].customer).toBe('Edited synthetic')
  expect(next.records[0].number).toBe('TEST-2026-00001')
 })
 it('supports failure, retry, success, refund and never produces PAID/real receipts',()=>{
  let ledger=applyTestCommand(blank(),{action:'save',draft},id,now)
  for(const status of ['ISSUED_TEST','SIMULATED_PENDING','SIMULATED_FAILURE','SIMULATED_PENDING','SIMULATED_SUCCESS','SIMULATED_REFUND'])ledger=applyTestCommand(ledger,{action:'transition',id,status},id,now)
  expect(ledger.records[0]).toMatchObject({kind:'TEST',realSettlement:'NONE',status:'SIMULATED_REFUND',totalPaise:271900})
  expect(JSON.stringify(ledger)).not.toContain('PAID');expect(JSON.stringify(ledger)).not.toContain('receiptNumber')
 })
 it('locks issued content and rejects real statuses and bypass transitions',()=>{
  const saved=applyTestCommand(blank(),{action:'save',draft},id,now)
  expect(()=>applyTestCommand(saved,{action:'transition',id,status:'SIMULATED_SUCCESS'},id,now)).toThrow()
  const issued=applyTestCommand(saved,{action:'transition',id,status:'ISSUED_TEST'},id,now)
  expect(()=>applyTestCommand(issued,{action:'save',id,draft},id,now)).toThrow()
  expect(()=>applyTestCommand(issued,{action:'transition',id,status:'PAID'},id,now)).toThrow()
  expect(()=>applyTestCommand(issued,{action:'settle',id},id,now)).toThrow()
 })
 it('encrypts history, uses fresh nonces, rejects tampering and cross-owner access',()=>{
  const ledger=applyTestCommand(blank(),{action:'save',draft},id,now);const sealed=sealLedger(ledger)
  expect(sealed).not.toContain('Synthetic');expect(sealLedger(ledger)).not.toBe(sealed)
  expect(openLedger(sealed,localOwner)).toEqual(ledger)
  expect(()=>openLedger(sealed,id)).toThrow()
  const changed=Buffer.from(sealed,'base64url');changed[30]^=1
  expect(()=>openLedger(changed.toString('base64url'),localOwner)).toThrow()
  vi.stubEnv('PERSONAL_TESTING_ENCRYPTION_KEY','ff'.repeat(32));expect(()=>openLedger(sealed,localOwner)).toThrow()
 })
 it('produces an actual watermarked printable PDF with no real receipt metadata',async()=>{
  const ledger=applyTestCommand(blank(),{action:'save',draft},id,now)
  const pdf=await PDFDocument.load(await personalPdf(ledger.records[0]))
  expect(pdf.getTitle()).toContain('TEST');expect(pdf.getSubject()).toContain('No real invoice');expect(pdf.getPages().length).toBeGreaterThan(0)
 },30000)
})
describe('owner authorization and loopback isolation',()=>{
 it('pins hosted mutation origin and Host to the real canonical domain, independently of Next internal URL',()=>{
  vi.stubEnv('NODE_ENV','production');vi.stubEnv('PERSONAL_TESTING_RUNTIME','hosted')
  const request=(origin:string,host:string)=>({url:'http://localhost:3000/api/personal-testing',headers:new Headers({origin,host})})
  expect(personalOriginAllowed(request('https://www.credonomics.in','www.credonomics.in'))).toBe(true)
  expect(personalOriginAllowed(request('https://evil.example','www.credonomics.in'))).toBe(false)
  expect(personalOriginAllowed(request('https://www.credonomics.in','evil.example'))).toBe(false)
  expect(personalOriginAllowed(request('http://www.credonomics.in','www.credonomics.in'))).toBe(false)
 })
 it('requires trusted admin claim and exact owner, not another admin or user_metadata',()=>{
  vi.stubEnv('PERSONAL_TESTING_OWNER_ID',id)
  expect(ownerIdentity({id,app_metadata:{billing_admin:true}})).toBe(true)
  for(const user of [null,{id},{id,app_metadata:{billing_admin:'true'}},{id:localOwner,app_metadata:{billing_admin:true}},{id,user_metadata:{billing_admin:true}}])expect(ownerIdentity(user)).toBe(false)
 })
 it('local fallback cannot run in production even with a forged localhost host',()=>{
  vi.stubEnv('NODE_ENV','production');vi.stubEnv('PERSONAL_TESTING_RUNTIME','loopback');vi.stubEnv('PERSONAL_TESTING_LOCAL_SESSION_KEY','26'.repeat(32));vi.stubEnv('PERSONAL_TESTING_UNLOCK_CODE','SYNTHETIC-OWNER-UNLOCK-ONLY-1234567890')
  expect(localRuntime()).toBe(false);expect(personalReady()).toBe(false);expect(trustedLocalHost('127.0.0.1:3018')).toBe(false)
 })
 it('fails closed if production Auth/project/owner/encryption configuration is missing',()=>{
  vi.stubEnv('PERSONAL_TESTING_RUNTIME','hosted');vi.stubEnv('PERSONAL_TESTING_OWNER_ID','');expect(personalReady()).toBe(false)
 })
 it('signs expiring local HttpOnly-session values and rejects modified/expired cookies',()=>{
  vi.stubEnv('NODE_ENV','development');vi.stubEnv('PERSONAL_TESTING_RUNTIME','loopback');vi.stubEnv('VERCEL','');vi.stubEnv('RAILWAY_ENVIRONMENT_ID','');vi.stubEnv('PERSONAL_TESTING_LOCAL_SESSION_KEY','26'.repeat(32));vi.stubEnv('PERSONAL_TESTING_UNLOCK_CODE','SYNTHETIC-OWNER-UNLOCK-ONLY-1234567890')
  const now=Date.parse('2026-10-19T12:00:00Z');const cookie=localSession(now)
  expect(validLocalSession(cookie,now)).toBe(true);expect(validLocalSession(cookie+'0',now)).toBe(false);expect(validLocalSession(cookie,now+9*60*60*1000)).toBe(false)
  expect(trustedLocalHost('evil.example:3018')).toBe(false)
 })
})
