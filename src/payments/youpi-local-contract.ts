/**
 * CredoNomics x YouPI PG — local fixture-only contract.
 * The uploaded Phase 11 BridgeKit provides fake transport ONLY.
 * This file does not implement network requests, live payments or bank verification.
 */
export type TestInvoice = Readonly<{
  source: 'LOCAL_FIXTURE_ONLY'
  invoiceId: string
  orderId: string
  merchantId: string
  amountPaise: number
  currency: 'INR'
}>

export type TransportRequest = Readonly<{
  method: 'GET' | 'POST'
  url: string
  headers: Readonly<Record<string, string>>
  body?: string
}>

export type FixtureTransport = (request: TransportRequest) => Promise<unknown>

export type LocalCheckoutReview = Readonly<{
  mode: 'LOCAL_FIXTURE_ONLY'
  orderId: string
  amountPaise: number
  paymentId: string
  checkoutUrl: string
  gatewayStatus: 'INITIATED' | 'ACTIVE' | 'QUEUED' | 'PROCESSING'
  invoiceStatus: 'PENDING'
  independentBankVerified: false
  canSettleInvoice: false
}>

const LOCAL_API = 'http://127.0.0.1:6100'
const LOCAL_CHECKOUT = new Set(['http://127.0.0.1:7000', 'http://localhost:7000'])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ACTIVE = new Set(['INITIATED', 'ACTIVE', 'QUEUED', 'PROCESSING'])
const ALL_STATUSES = new Set([...ACTIVE, 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED'])

function asObject(raw: unknown): Record<string, unknown> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('INVALID_GATEWAY_RESPONSE')
  return raw as Record<string, unknown>
}

function assertInvoice(invoice: TestInvoice): string {
  if (invoice.source !== 'LOCAL_FIXTURE_ONLY' ||
      !/^FAKE-[0-9a-f-]{36}$/i.test(invoice.invoiceId) ||
      !/^CNP-[A-Z0-9-]{8,80}$/.test(invoice.orderId) ||
      !UUID.test(invoice.merchantId) ||
      invoice.currency !== 'INR' ||
      !Number.isSafeInteger(invoice.amountPaise) ||
      invoice.amountPaise < 1 || invoice.amountPaise > 100_000_000) {
    throw new TypeError('ONLY_VALID_LOCAL_FIXTURE_INVOICES_ALLOWED')
  }
  return String(Math.floor(invoice.amountPaise / 100)) + '.' + String(invoice.amountPaise % 100).padStart(2, '0')
}

function validateCheckoutUrl(raw: unknown, paymentId: string): string {
  if (typeof raw !== 'string') throw new Error('INVALID_CHECKOUT_URL')
  let url: URL
  try { url = new URL(raw) } catch { throw new Error('INVALID_CHECKOUT_URL') }
  if (!LOCAL_CHECKOUT.has(url.origin) ||
      url.pathname !== '/checkout/' + paymentId ||
      url.username || url.password || url.search || url.hash) {
    throw new Error('BLOCKED_CHECKOUT_REDIRECT')
  }
  return url.href
}

/** Requires an explicitly injected fake transport; never invokes fetch itself. */
export async function createLocalFixtureCheckout(invoice: TestInvoice, fakeTransport: FixtureTransport): Promise<LocalCheckoutReview> {
  const amount = assertInvoice(invoice)
  if (typeof fakeTransport !== 'function') throw new TypeError('FAKE_TRANSPORT_REQUIRED')
  const request: TransportRequest = {
    method: 'POST', url: LOCAL_API + '/api/v1/payments',
    headers: {
      'Content-Type': 'application/json',
      'X-Merchant-Id': invoice.merchantId,
      'Idempotency-Key': 'cns-' + invoice.orderId,
    },
    body: JSON.stringify({ orderId: invoice.orderId, amount, currency: 'INR', description: 'CredoNomics local fixture only' }),
  }
  const response = asObject(await fakeTransport(request))
  if (response.orderId !== invoice.orderId || response.amount !== amount || response.currency !== 'INR' ||
      typeof response.paymentId !== 'string' || !UUID.test(response.paymentId) || !ACTIVE.has(String(response.status))) {
    throw new Error('GATEWAY_CONTRACT_MISMATCH')
  }
  const checkoutUrl = validateCheckoutUrl(response.checkoutUrl, response.paymentId)
  return Object.freeze({
    mode: 'LOCAL_FIXTURE_ONLY', orderId: invoice.orderId, amountPaise: invoice.amountPaise,
    paymentId: response.paymentId, checkoutUrl,
    gatewayStatus: response.status as LocalCheckoutReview['gatewayStatus'],
    invoiceStatus: 'PENDING', independentBankVerified: false, canSettleInvoice: false,
  })
}

/** Gateway SUCCESS remains an observation, not verified Slice credit. */
export async function observeLocalFixtureStatus(paymentId: string, fakeTransport: FixtureTransport) {
  if (!UUID.test(paymentId)) throw new TypeError('INVALID_PAYMENT_ID')
  if (typeof fakeTransport !== 'function') throw new TypeError('FAKE_TRANSPORT_REQUIRED')
  const response = asObject(await fakeTransport({
    method: 'GET', url: LOCAL_API + '/api/v1/payments/' + paymentId, headers: {},
  }))
  if (response.paymentId !== paymentId || !ALL_STATUSES.has(String(response.status))) {
    throw new Error('GATEWAY_STATUS_CONTRACT_MISMATCH')
  }
  return Object.freeze({
    gatewayStatus: response.status as string,
    reconciliationState: 'REVIEW_REQUIRED' as const,
    invoiceStatus: 'PENDING' as const,
    independentBankVerified: false as const,
    canSettleInvoice: false as const,
  })
}
