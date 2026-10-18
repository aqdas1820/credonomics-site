import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyYoupiObservation } from './youpi-webhook'
const secret = 'test-only-example-secret-keep-out-of-production'
const payload = {
  event: 'SUCCESS',
  orderId: 'CN-2026-00000001',
  amount: '1500.00',
  amountPaise: 150000,
  currency: 'INR',
  utr: '405901769153',
  paymentId: '12345678-1234-4234-8234-123456789012',
}
const body = Buffer.from(JSON.stringify(payload))
const sign = (b: Buffer) => 'sha256=' + createHmac('sha256', secret).update(b).digest('hex')
const observe = (b: Buffer = body) => verifyYoupiObservation(b, sign(b), secret)

describe('YouPI V2 documented merchant webhook observation', () => {
  it('rejects invalid UTF-8 even with a valid signature', () => {
    const invalid = Buffer.concat([Buffer.from('{"extra":"'), Buffer.from([0xff]), Buffer.from('",'), body.subarray(1)])
    expect(() => observe(invalid)).toThrow('Invalid webhook JSON')
  })
  it.each(['COD', 'PAID', 'REFUNDED'])('refuses unsupported event %s', event => {
    expect(() => observe(Buffer.from(JSON.stringify({ ...payload, event })))).toThrow('Invalid signed')
  })
  it('ignores signed authority-looking extensions and returns review-only data', () => {
    const r = observe(Buffer.from(JSON.stringify({ ...payload, status: 'PAID', settled: true, beneficiary: 'forged' })))
    expect(r.decision).toBe('REVIEW_REQUIRED'); expect(r).not.toHaveProperty('settled'); expect(r).not.toHaveProperty('beneficiary')
  })
  it('accepts signed SUCCESS with documented headers and NEVER marks PAID', () => {
    const result = observe()
    expect(result.decision).toBe('REVIEW_REQUIRED')
    expect(result.event).toBe('SUCCESS')
    expect(result.amountPaise).toBe(150000)
    expect(result.utr).toBe(payload.utr)
    expect(result.rawSha256).toMatch(/^[0-9a-f]{64}$/)
  })
  it('generates deterministic raw SHA-256 for durable replay detection', () => {
    expect(observe().rawSha256).toBe(observe().rawSha256)
    expect(observe().rawSha256).not.toBe(observe(Buffer.from(JSON.stringify({ ...payload, utr: '405901769154' }))).rawSha256)
  })
  it('rejects forged signature', () =>
    expect(() => verifyYoupiObservation(body, 'sha256=' + '0'.repeat(64), secret)).toThrow())
  it('rejects unsigned request', () =>
    expect(() => verifyYoupiObservation(body, null, secret)).toThrow())
  it('rejects missing shared secret', () =>
    expect(() => verifyYoupiObservation(body, sign(body), undefined)).toThrow())
  it('rejects signed amount mismatch', () => {
    const bad = Buffer.from(JSON.stringify({ ...payload, amount: '1499.99' }))
    expect(() => observe(bad)).toThrow('Mismatched')
  })
  it('rejects missing UTR on SUCCESS', () => {
    const bad = Buffer.from(JSON.stringify({ ...payload, utr: null }))
    expect(() => observe(bad)).toThrow('Missing UTR')
  })
  it('rejects forged paid status fields', () => {
    const bad = Buffer.from(JSON.stringify({ ...payload, status: 'PAID', amountPaise: 150001 }))
    expect(() => observe(bad)).toThrow('Mismatched')
  })
  it('allows FAILED without UTR as review-only observation', () => {
    const bad = Buffer.from(JSON.stringify({ ...payload, event: 'FAILED', utr: null }))
    expect(observe(bad)).toMatchObject({ decision: 'REVIEW_REQUIRED', event: 'FAILED', utr: null })
  })
  it('rejects INR currency mismatch', () => {
    const bad = Buffer.from(JSON.stringify({ ...payload, currency: 'USD' }))
    expect(() => observe(bad)).toThrow('Invalid signed')
  })
  it('rejects malformed JSON even with a valid signature', () => {
    const invalid = Buffer.from('not JSON')
    expect(() => observe(invalid)).toThrow('Invalid webhook JSON')
  })
  it('rejects empty and oversized payloads', () => {
    expect(() => observe(Buffer.alloc(0))).toThrow()
    expect(() => verifyYoupiObservation(Buffer.alloc(65537), 'sha256='+'0'.repeat(64), secret)).toThrow()
  })
})
