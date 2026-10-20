/** Server-to-server YouPI contract. Gateway SUCCESS never proves bank credit. */
import { createHmac, timingSafeEqual } from 'node:crypto'
import { isIP } from 'node:net'

export type YoupiGatewayConfig = { apiOrigin: string; checkoutOrigin: string; merchantId: string; allowLocal: boolean }
export type YoupiInvoice = { id: string; totalPaise: number; status: 'UNPAID'; paidPaise: number; invoiceNumber: string }
export type YoupiCheckout = { paymentId: string; orderId: string; amountPaise: number; checkoutUrl: string; status: string }
const uuid = /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i
const statuses = new Set(['INITIATED', 'ACTIVE', 'QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED'])

export class YoupiBridgeError extends Error {
  constructor(message = 'YouPI integration unavailable') { super(message); this.name = 'YoupiBridgeError' }
}
export function parseOrigin(value: string, allowLocal = false): string {
  try {
    const url = new URL(value)
    const local = url.hostname === '127.0.0.1' || url.hostname === 'localhost'
    if ((url.protocol !== 'https:' && !(allowLocal && local && url.protocol === 'http:')) ||
      (local && !allowLocal) || url.hostname.startsWith('[') || (isIP(url.hostname) !== 0 && !local) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash ||
      ['.localhost', '.internal', '.local'].some(x => url.hostname.endsWith(x))) throw new Error('unsafe')
    return url.origin
  } catch { throw new YoupiBridgeError('Invalid YouPI gateway origin') }
}
export function gatewayConfig(env: NodeJS.ProcessEnv = process.env): YoupiGatewayConfig {
  const allowLocal = env.NODE_ENV !== 'production' && env.YOUPI_ALLOW_LOCAL === 'true' && !env.VERCEL && !env.RAILWAY_ENVIRONMENT_ID
  if (!env.YOUPI_API_ORIGIN || !env.YOUPI_CHECKOUT_ORIGIN ||
    !env.YOUPI_MERCHANT_ID || !uuid.test(env.YOUPI_MERCHANT_ID)) throw new YoupiBridgeError('YouPI gateway not configured')
  return { apiOrigin: parseOrigin(env.YOUPI_API_ORIGIN, allowLocal), checkoutOrigin: parseOrigin(env.YOUPI_CHECKOUT_ORIGIN, allowLocal), merchantId: env.YOUPI_MERCHANT_ID, allowLocal }
}
export function validateInvoice(input: unknown, id: string): YoupiInvoice {
  if (!uuid.test(id) || !input || typeof input !== 'object') throw new YoupiBridgeError('Invalid invoice')
  const invoice = input as Record<string, unknown>
  if (typeof invoice.id !== 'string' || invoice.id.toLowerCase() !== id.toLowerCase() ||
    invoice.status !== 'UNPAID' || invoice.paidPaise !== 0 || !Number.isSafeInteger(invoice.totalPaise) ||
    (invoice.totalPaise as number) <= 0 || (invoice.totalPaise as number) > 100_000_000 ||
    typeof invoice.invoiceNumber !== 'string' || invoice.invoiceNumber.length > 80) {
    throw new YoupiBridgeError('Invoice not eligible for payment session')
  }
  return invoice as YoupiInvoice
}
async function boundedJson(res: Response): Promise<unknown> {
  if (Number(res.headers.get('content-length') || 0) > 16384) throw new YoupiBridgeError('Oversized gateway response')
  const text = await res.text()
  if (text.length > 16384) throw new YoupiBridgeError('Oversized gateway response')
  try { return JSON.parse(text) as unknown } catch { throw new YoupiBridgeError('Invalid gateway response') }
}
export async function probeYoupi(config: YoupiGatewayConfig, fetcher: typeof fetch = fetch): Promise<boolean> {
  const api = parseOrigin(config.apiOrigin, config.allowLocal)
  try {
    const res = await fetcher(api + '/api/v1/health', { method: 'GET', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(5000) })
    if (!res.ok) return false
    const data = await boundedJson(res) as Record<string, unknown>
    return data?.status === 'UP' && data?.service === 'payment-api'
  } catch { return false }
}
function checkedCheckout(raw: unknown, config: YoupiGatewayConfig, orderId: string, amountPaise: number): YoupiCheckout {
  if (!raw || typeof raw !== 'object') throw new YoupiBridgeError('Invalid gateway response')
  const value = raw as Record<string, unknown>
  if (typeof value.paymentId !== 'string' || !uuid.test(value.paymentId) ||
    value.orderId !== orderId || value.currency !== 'INR' || !statuses.has(String(value.status)) ||
    String(value.amountPaise) !== String(amountPaise) || value.amount !== (amountPaise / 100).toFixed(2) ||
    typeof value.checkoutUrl !== 'string') throw new YoupiBridgeError('Gateway returned mismatched order/amount')
  let url: URL
  try { url = new URL(value.checkoutUrl) } catch { throw new YoupiBridgeError('Invalid checkout URL') }
  if (url.origin !== parseOrigin(config.checkoutOrigin, config.allowLocal) ||
    url.pathname !== '/checkout/' + value.paymentId || url.username || url.password || url.search || url.hash) {
    throw new YoupiBridgeError('Checkout URL failed origin and session checks')
  }
  return { paymentId: value.paymentId, orderId, amountPaise, checkoutUrl: url.href, status: String(value.status) }
}
/** This creates a session only; no billed credit, financial status mutation or receipt. */
export async function createYoupiSession(config: YoupiGatewayConfig, invoice: YoupiInvoice, fetcher: typeof fetch = fetch): Promise<YoupiCheckout> {
  const safe = validateInvoice(invoice, invoice.id)
  const api = parseOrigin(config.apiOrigin, config.allowLocal)
  if (!uuid.test(config.merchantId)) throw new YoupiBridgeError('Merchant identity invalid')
  const orderId = 'CN-' + safe.id.toLowerCase()
  const amountPaise = safe.totalPaise
  const idem = createHmac('sha256', config.merchantId).update(orderId + ':' + amountPaise).digest('hex')
  let res: Response
  try {
    res = await fetcher(api + '/api/v1/payments', {
      method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8000),
      headers: { 'Content-Type': 'application/json', 'X-Merchant-Id': config.merchantId, 'Idempotency-Key': idem },
      body: JSON.stringify({ orderId, amount: (amountPaise / 100).toFixed(2), currency: 'INR', description: 'CredoNomics invoice ' + safe.invoiceNumber }),
    })
  } catch { throw new YoupiBridgeError('Gateway request failed') }
  if (res.status !== 200 && res.status !== 201) throw new YoupiBridgeError('Gateway refused session')
  return checkedCheckout(await boundedJson(res), config, orderId, amountPaise)
}
/** Authenticity only. No webhook listener is enabled until a durable replay-safe inbox exists. */
export function verifyYoupiWebhook(raw: Buffer, signature: string | null, secret: string): boolean {
  if (!secret || secret.length < 32 || raw.length > 16384 || !signature ||
    !/^sha256=[a-f0-9]{64}$/.test(signature)) return false
  return timingSafeEqual(Buffer.from(signature.slice(7), 'hex'), createHmac('sha256', secret).update(raw).digest())
}
