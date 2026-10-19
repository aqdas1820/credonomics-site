import 'server-only'
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { isBillingAdmin, type BillingIdentity } from '../../../app/billing/admin-policy'
import { isBillingDatabaseScopeConfirmed } from '../../../app/billing/db-scope'
import { validateLedger, type TestLedger } from './personal-model'

export const personalCookie = 'cn_personal_local'
export const localOwner = '25000000-0000-4000-8000-000000000001'
export const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' }
export function localRuntime() {
  return process.env.NODE_ENV === 'development' && process.env.PERSONAL_TESTING_RUNTIME === 'loopback' &&
    !process.env.VERCEL && !process.env.RAILWAY_ENVIRONMENT_ID && /^[a-f0-9]{64}$/.test(process.env.PERSONAL_TESTING_LOCAL_SESSION_KEY ?? '') &&
    /^[a-zA-Z0-9_-]{32,80}$/.test(process.env.PERSONAL_TESTING_UNLOCK_CODE ?? '')
}
export function personalReady() {
  if (process.env.PERSONAL_TESTING_ENABLED !== 'true' || !/^[a-f0-9]{64}$/.test(process.env.PERSONAL_TESTING_ENCRYPTION_KEY ?? '')) return false
  if (localRuntime()) return true
  return process.env.PERSONAL_TESTING_RUNTIME !== 'loopback' &&
    /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(process.env.PERSONAL_TESTING_OWNER_ID ?? '') &&
    isBillingDatabaseScopeConfirmed(process.env.PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF, process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}
export function ownerIdentity(user: BillingIdentity | null) {
  return isBillingAdmin(user, process.env.PERSONAL_TESTING_OWNER_ID) && user?.id.toLowerCase() === process.env.PERSONAL_TESTING_OWNER_ID?.toLowerCase()
}
export function trustedLocalHost(host: string | null) {
  return localRuntime() && host === `127.0.0.1:${process.env.PERSONAL_TESTING_LOCAL_PORT ?? '3018'}`
}
const sign = (value: string) => createHmac('sha256', process.env.PERSONAL_TESTING_LOCAL_SESSION_KEY!).update('cn-personal-session-v1:' + value).digest('hex')
export function localSession(now = Date.now()) { const payload = String(now + 8 * 60 * 60 * 1000); return payload + '.' + sign(payload) }
export function validLocalSession(value: string | undefined, now = Date.now()) {
  if (!localRuntime() || !value || !/^\d{13}\.[a-f0-9]{64}$/.test(value)) return false
  const [expires, signature] = value.split('.')
  return Number(expires) > now && Number(expires) <= now + 8 * 60 * 60 * 1000 && timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(sign(expires), 'hex'))
}
export function validUnlock(code: string) {
  const expected = process.env.PERSONAL_TESTING_UNLOCK_CODE ?? ''
  return localRuntime() && code.length === expected.length && timingSafeEqual(Buffer.from(code), Buffer.from(expected))
}
const aad = (owner: string) => Buffer.from('cn-personal-TEST-ledger-v1:' + owner)
export function sealLedger(ledger: TestLedger) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(process.env.PERSONAL_TESTING_ENCRYPTION_KEY!, 'hex'), iv)
  cipher.setAAD(aad(ledger.owner))
  const data = Buffer.concat([cipher.update(JSON.stringify(ledger), 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url')
}
export function openLedger(blob: string | undefined, owner: string): TestLedger {
  if (blob === undefined) return { version: 1, owner, revision: 0, records: [] }
  if (!/^[a-zA-Z0-9_-]+$/.test(blob) || blob.length > 240_000) throw new Error('Invalid encrypted TEST workspace')
  const bytes = Buffer.from(blob, 'base64url')
  if (bytes.length < 29 || bytes.toString('base64url') !== blob) throw new Error('Invalid encrypted TEST workspace')
  const cipher = createDecipheriv('aes-256-gcm', Buffer.from(process.env.PERSONAL_TESTING_ENCRYPTION_KEY!, 'hex'), bytes.subarray(0, 12))
  cipher.setAAD(aad(owner)); cipher.setAuthTag(bytes.subarray(12, 28))
  return validateLedger(JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString('utf8')), owner)
}
