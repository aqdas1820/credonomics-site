import { describe, expect, it, vi } from 'vitest'
import { boundedJson, isPublicAddress, readYoupiSession, validateInvoice, type YoupiGatewayConfig } from './youpi-contract'
import { authorizeLinkView, completeLink, reserveLink, tokenDigest } from './youpi-link-ledger'
import { openPaymentLink, sealPaymentLink } from './youpi-payment-link'

const invoice = { id: '11111111-1111-4111-8111-111111111111', totalPaise: 50000, paidPaise: 0, status: 'UNPAID' as const, invoiceNumber: '1200' }
const config: YoupiGatewayConfig = { apiOrigin: 'https://api.example.org', checkoutOrigin: 'https://pay.example.org', merchantId: '22222222-2222-4222-8222-222222222222', allowLocal: false }
const paymentId = '33333333-3333-4333-8333-333333333333'
const state = { paymentId, merchantId: config.merchantId, orderId: 'CN-' + invoice.id, amount: '500.00', amountPaise: '50000', currency: 'INR', method: 'UPI', status: 'ACTIVE' }
const key = 'synthetic-owner-key-not-a-real-secret-1234'

describe('Phase28 gateway hardening', () => {
  it('requires authenticated merchant identity, amount and payable state', async () => {
    const fetcher = vi.fn(async (_url: unknown, init?: RequestInit) => {
      expect(init?.headers).toEqual({ 'X-Merchant-Key': key })
      expect(init?.redirect).toBe('error')
      return new Response(JSON.stringify(state))
    })
    await expect(readYoupiSession(config, paymentId, invoice, key, fetcher as typeof fetch)).resolves.toMatchObject({ status: 'ACTIVE' })
    for (const change of [{ merchantId: undefined }, { merchantId: paymentId }, { method: 'COD' }, { method: 'CASH_COUNTER' }, { method: undefined }, { amount: '499.99' },
      { amountPaise: '050000' }, { orderId: 'OTHER' }, { currency: 'USD' }, { paymentId: invoice.id },
      ...['SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED', 'PROCESSING', 'SUSPICIOUS'].map(status => ({ status }))]) {
      await expect(readYoupiSession(config, paymentId, invoice, key,
        (async () => new Response(JSON.stringify({ ...state, ...change }))) as typeof fetch)).rejects.toThrow()
    }
    await expect(readYoupiSession(config, paymentId, invoice, undefined, fetcher as typeof fetch)).rejects.toThrow()
  })
  it('cancels a chunked body when it crosses the byte limit', async () => {
    const cancel = vi.fn()
    const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(16000)); c.enqueue(new Uint8Array(500)); }, cancel })
    await expect(boundedJson(new Response(stream))).rejects.toThrow('Oversized')
    expect(cancel).toHaveBeenCalledOnce()
  })
  it('rejects private, link-local, metadata, mapped and reserved addresses', () => {
    for (const address of ['127.0.0.1', '10.2.3.4', '169.254.169.254', '100.64.0.1', '172.16.1.1',
      '192.168.1.1', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', '2001:db8::1', '0.0.0.0', '224.0.0.1']) expect(isPublicAddress(address)).toBe(false)
    expect(isPublicAddress('1.1.1.1')).toBe(true)
    expect(isPublicAddress('2606:4700:4700::1111')).toBe(true)
  })
  it('canonicalizes IDs, strips unexpected fields and rejects invalid invoice numbers', () => {
    expect(validateInvoice({ ...invoice, customerEmail: 'PRIVATE' }, invoice.id)).not.toHaveProperty('customerEmail')
    for (const invoiceNumber of ['', '<script>', 'x'.repeat(81)]) expect(() => validateInvoice({ ...invoice, invoiceNumber }, invoice.id)).toThrow()
  })
  it('bounds future-issued and expiry tokens, invalidates on key rotation', () => {
    const now = Date.now(), secret = '4a'.repeat(32)
    const token = sealPaymentLink({ invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, paymentId,
      merchantId: config.merchantId, amountPaise: invoice.totalPaise }, secret, now)
    expect(openPaymentLink(token, secret, config.merchantId, now - 61000)).toBeNull()
    expect(openPaymentLink(token, secret, config.merchantId, now + 259200000)).toBeNull()
    expect(openPaymentLink(token, '5b'.repeat(32), config.merchantId, now)).toBeNull()
  })
})

describe('durable reservations and access', () => {
  it('rejects pending, rate-limited, absent and malformed database responses', async () => {
    for (const data of [null, {}, { decision: 'BLOCKED' }, { decision: 'RATE_LIMITED' },
      { decision: 'REUSE', issuedAt: Date.now(), paymentId: 'invalid' }]) {
      const db = { rpc: vi.fn(async () => ({ data, error: null })) }
      await expect(reserveLink(db, invoice.id, config.merchantId, invoice.id)).rejects.toThrow()
    }
  })
  it('allows a reserved session to be reused without asking for a new payment', async () => {
    const db = { rpc: vi.fn(async () => ({ data: { decision: 'REUSE', issuedAt: Date.now(), paymentId }, error: null })) }
    expect((await reserveLink(db, invoice.id, config.merchantId, invoice.id)).paymentId).toBe(paymentId)
  })
  it('stores only token digest and requires positive persistence acknowledgement', async () => {
    const db = { rpc: vi.fn(async () => ({ data: true, error: null })) }
    await completeLink(db, invoice.id, config.merchantId, paymentId, 'private-token')
    expect(JSON.stringify(db.rpc.mock.calls)).not.toContain('private-token')
    expect(tokenDigest('private-token')).toHaveLength(64)
    await expect(authorizeLinkView(db, 'private-token')).resolves.toBe(true)
    const bad = { rpc: async () => ({ data: true, error: Error('offline') }) }
    await expect(authorizeLinkView(bad, 'private-token')).resolves.toBe(false)
    await expect(completeLink(bad, invoice.id, config.merchantId, paymentId, 'token')).rejects.toThrow()
  })
})
