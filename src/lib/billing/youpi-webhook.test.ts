import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyYoupiObservation } from './youpi-webhook'
const secret = 'test-only-example-secret-keep-out-of-production'
const now = 1792300000000
const delivery = '12345678-1234-4234-8234-123456789012'
const payload = { event: 'SUCCESS', orderId: 'CN-2026-00000001', amountPaise: 150000,
  utr: '405901769153', paymentId: '12345678-1234-4234-8234-123456789012' }
const body = Buffer.from(JSON.stringify(payload))
const sign = (b: Buffer) => 'sha256=' + createHmac('sha256', secret).update(b).digest('hex')
describe('YouPI raw signed webhook observation', () => {
  it('marks valid signed SUCCESS for bank review, NOT PAID', () => {
    expect(verifyYoupiObservation(body, sign(body), String(now), delivery, secret, now).decision).toBe('REVIEW_REQUIRED')
  })
  it('rejects a forged signature', () => expect(() => verifyYoupiObservation(body, 'sha256='+'0'.repeat(64), String(now), delivery, secret, now)).toThrow())
  it('rejects stale signed replay', () => expect(() => verifyYoupiObservation(body, sign(body), String(now-360000), delivery, secret, now)).toThrow())
  it('rejects malformed payload despite matching HMAC', () => {
    const wrong = Buffer.from(JSON.stringify({ ...payload, amountPaise: -5 }))
    expect(() => verifyYoupiObservation(wrong, sign(wrong), String(now), delivery, secret, now)).toThrow()
  })
  it('rejects missing server secret', () => expect(() => verifyYoupiObservation(body, sign(body), String(now), delivery, '', now)).toThrow())
  it('rejects invalid delivery id', () => expect(() => verifyYoupiObservation(body, sign(body), String(now), 'bad-id', secret, now)).toThrow())
})
