import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { createYoupiSession, gatewayConfig, parseOrigin, probeYoupi, validateInvoice, verifyYoupiWebhook, type YoupiGatewayConfig } from './youpi-contract'

const invoice = { id: '11111111-1111-4111-8111-111111111111', totalPaise: 50000, paidPaise: 0, status: 'UNPAID' as const, invoiceNumber: '1200' }
const cfg: YoupiGatewayConfig = { apiOrigin: 'https://api.example.org', checkoutOrigin: 'https://pay.example.org', merchantId: '22222222-2222-4222-8222-222222222222', allowLocal: false }
const reply = { paymentId: '33333333-3333-4333-8333-333333333333', orderId: 'CN-' + invoice.id, amount: '500.00', amountPaise: '50000', currency: 'INR', status: 'INITIATED', checkoutUrl: 'https://pay.example.org/checkout/33333333-3333-4333-8333-333333333333' }
const respond = (data: unknown) => new Response(JSON.stringify(data), { status: 201, headers: { 'content-type': 'application/json' } })

describe('YouPI REST integration, disabled by default', () => {
  it('requires explicit merchant and gateway config', () => {
    expect(() => gatewayConfig({ NODE_ENV: 'production' })).toThrow()
    for (const origin of ['http://127.0.0.1:6100', 'http://example.org', 'https://u:p@example.org', 'https://example.org/path', 'https://192.168.1.4', 'https://[::1]:6100']) {
      expect(() => parseOrigin(origin)).toThrow()
    }
    expect(parseOrigin('http://127.0.0.1:6100', true)).toBe('http://127.0.0.1:6100')
  })
  it('rejects other invoice, PAID or partial bank credit', () => {
    expect(() => validateInvoice({ ...invoice, id: 'other' }, invoice.id)).toThrow()
    expect(() => validateInvoice({ ...invoice, status: 'PAID' }, invoice.id)).toThrow()
    expect(() => validateInvoice({ ...invoice, paidPaise: 1 }, invoice.id)).toThrow()
    expect(() => validateInvoice({ ...invoice, totalPaise: -1 }, invoice.id)).toThrow()
  })
  it('binds exact amount, order, and merchant to a server-side session', async () => {
    const fetcher = vi.fn(async (_url: string | Request | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST')
      expect(init?.redirect).toBe('error')
      const headers = init?.headers as Record<string, string>
      expect(headers['X-Merchant-Id']).toBe(cfg.merchantId)
      expect(headers['Idempotency-Key']).toMatch(/^[a-f0-9]{64}$/)
      expect(JSON.parse(String(init?.body))).toEqual({ orderId: reply.orderId, amount: '500.00', currency: 'INR', description: 'CredoNomics invoice 1200' })
      return respond(reply)
    }) as unknown as typeof fetch
    const session = await createYoupiSession(cfg, invoice, fetcher)
    expect(session.checkoutUrl).toBe(reply.checkoutUrl)
    expect(session.status).toBe('INITIATED')
  })
  it('rejects mismatched order, paise, and external checkout URL', async () => {
    for (const bad of [{ ...reply, orderId: 'OTHER' }, { ...reply, amountPaise: '49900' }, { ...reply, checkoutUrl: 'https://attacker.example/checkout/' + reply.paymentId }]) {
      await expect(createYoupiSession(cfg, invoice, (async () => respond(bad)) as typeof fetch)).rejects.toThrow()
    }
  })
  it('health requires real payment-api identity', async () => {
    const test = (value: unknown) => (async () => new Response(JSON.stringify(value))) as typeof fetch
    await expect(probeYoupi(cfg, test({ status: 'UP', service: 'payment-api' }))).resolves.toBe(true)
    await expect(probeYoupi(cfg, test({ status: 'UP', service: 'coin-store' }))).resolves.toBe(false)
  })
  it('verifies raw webhook signature without declaring a bank settlement', () => {
    const data = Buffer.from('{"event":"SUCCESS"}')
    const secret = 'long-test-secret-please-never-use-in-production'
    const signature = 'sha256=' + createHmac('sha256', secret).update(data).digest('hex')
    expect(verifyYoupiWebhook(data, signature, secret)).toBe(true)
    expect(verifyYoupiWebhook(Buffer.from('{"event":"FAILED"}'), signature, secret)).toBe(false)
    expect(verifyYoupiWebhook(data, null, secret)).toBe(false)
  })
})
