import { describe, expect, it } from 'vitest'
import { approvedPaymentSiteOrigin, openPaymentLink, paymentLinkSigningReady, sealPaymentLink } from './youpi-payment-link'

const SECRET = '4a'.repeat(32)
const OTHER = '9b'.repeat(32)
const details = {
  invoiceId: '11111111-1111-4111-8111-111111111111',
  paymentId: '22222222-2222-4222-8222-222222222222',
  invoiceNumber: 'INV-2026-1200',
  amountPaise: 50000,
  merchantId: '00000000-0000-0000-0000-000000000001',
}
const now = Date.UTC(2026, 9, 19, 12)
describe('sealed YouPI customer link (no real payment)', () => {
  it('binds invoice, amount, gateway session, merchant and 72h expiry', () => {
    const token = sealPaymentLink(details, SECRET, now)
    const opened = openPaymentLink(token, SECRET, details.merchantId, now + 4000)
    expect(opened).toMatchObject({ ...details, iat: now, exp: now + 72 * 60 * 60 * 1000, v: 1 })
    expect(openPaymentLink(token, SECRET, details.merchantId, now + 72 * 60 * 60 * 1000)).toBeNull()
  })
  it('rejects tampered token, other key and other merchant', () => {
    const token = sealPaymentLink(details, SECRET, now)
    const [payload, mac] = token.split('.')
    const rewritten = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    rewritten.amountPaise = 1
    const falsified = Buffer.from(JSON.stringify(rewritten)).toString('base64url') + '.' + mac
    expect(openPaymentLink(falsified, SECRET, details.merchantId, now)).toBeNull()
    expect(openPaymentLink(token, OTHER, details.merchantId, now)).toBeNull()
    expect(openPaymentLink(token, SECRET, '99999999-9999-4999-8999-999999999999', now)).toBeNull()
    expect(openPaymentLink(token + '.', SECRET, details.merchantId, now)).toBeNull()
  })
  it('rejects unsafely long, absent and malformed signing keys', () => {
    expect(paymentLinkSigningReady(undefined)).toBe(false)
    expect(paymentLinkSigningReady('123')).toBe(false)
    expect(() => sealPaymentLink(details, 'test')).toThrow()
    expect(openPaymentLink('junk', SECRET, details.merchantId, now)).toBeNull()
    expect(openPaymentLink('x'.repeat(2000), SECRET, details.merchantId, now)).toBeNull()
  })
  it('rejects zero and unsafe amounts, malformed references and bad invoice numbers', () => {
    expect(() => sealPaymentLink({ ...details, amountPaise: 0 }, SECRET, now)).toThrow()
    expect(() => sealPaymentLink({ ...details, amountPaise: 101_000_000 }, SECRET, now)).toThrow()
    expect(() => sealPaymentLink({ ...details, paymentId: 'not-a-uuid' }, SECRET, now)).toThrow()
    expect(() => sealPaymentLink({ ...details, invoiceNumber: '<script />' }, SECRET, now)).toThrow()
  })
  it('restricts share-link site to the approved production canonical domains', () => {
    expect(approvedPaymentSiteOrigin('https://www.credonomics.in')).toBe('https://www.credonomics.in')
    expect(approvedPaymentSiteOrigin('https://credonomics.in')).toBe('https://credonomics.in')
    for (const value of ['http://www.credonomics.in', 'https://evil.test', 'https://www.credonomics.in.evil.test', 'https://www.credonomics.in/path', 'https://www.credonomics.in:443', 'https://www.credonomics.in/?x=1']) {
      expect(approvedPaymentSiteOrigin(value)).toBeNull()
    }
  })
})
