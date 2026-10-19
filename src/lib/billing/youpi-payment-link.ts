/**
 * Short-lived customer checkout links. The signed link carries only an invoice reference,
 * displayed amount/number, and the YouPI session ID. No personal data or receiving VPA.
 * A gateway session is not a bank-credit receipt.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import { isBillingUuid } from '../../../app/billing/uuid-policy'

const TOKEN_VERSION = 1
const LIFETIME_MS = 72 * 60 * 60 * 1000
const MAX_TOKEN_LENGTH = 1200
const MERCHANT_UUID = /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i

export type PaymentLinkDetails = {
  invoiceId: string
  invoiceNumber: string
  paymentId: string
  amountPaise: number
  merchantId: string
}
type SignedLinkPayload = PaymentLinkDetails & { v: 1; iat: number; exp: number }

function keyFromHex(secret: string | undefined): Buffer {
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) throw new Error('Payment link signing key unavailable')
  return Buffer.from(secret, 'hex')
}
function validateDetails(value: unknown): value is PaymentLinkDetails {
  if (!value || typeof value !== 'object') return false
  const p = value as Partial<PaymentLinkDetails>
  return isBillingUuid(p.invoiceId) &&
    isBillingUuid(p.paymentId) &&
    typeof p.merchantId === 'string' && MERCHANT_UUID.test(p.merchantId) &&
    typeof p.invoiceNumber === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._/# -]{0,79}$/.test(p.invoiceNumber) &&
    Number.isSafeInteger(p.amountPaise) && (p.amountPaise as number) > 0 && (p.amountPaise as number) <= 100_000_000
}

export function paymentLinkSigningReady(secret: string | undefined): boolean {
  try { keyFromHex(secret); return true } catch { return false }
}

export function sealPaymentLink(details: PaymentLinkDetails, secret: string, now = Date.now()): string {
  const key = keyFromHex(secret)
  if (!validateDetails(details) || !Number.isSafeInteger(now) || !Number.isSafeInteger(now + LIFETIME_MS) || now <= 0) throw new Error('Invalid payment link payload')
  const payload: SignedLinkPayload = {
    v: TOKEN_VERSION,
    invoiceId: details.invoiceId.toLowerCase(),
    invoiceNumber: details.invoiceNumber,
    paymentId: details.paymentId.toLowerCase(),
    amountPaise: details.amountPaise,
    merchantId: details.merchantId.toLowerCase(),
    iat: now,
    exp: now + LIFETIME_MS,
  }
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const mac = createHmac('sha256', key).update(encoded).digest('base64url')
  return encoded + '.' + mac
}

export function openPaymentLink(
  token: string,
  secret: string | undefined,
  expectedMerchantId: string,
  now = Date.now(),
): SignedLinkPayload | null {
  if (!paymentLinkSigningReady(secret) || typeof token !== 'string' ||
    token.length === 0 || token.length > MAX_TOKEN_LENGTH ||
    !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) ||
    !MERCHANT_UUID.test(expectedMerchantId) || !Number.isSafeInteger(now)) return null
  const [encoded, supplied] = token.split('.')
  if (!encoded || !supplied || supplied.length !== 43) return null
  const expected = createHmac('sha256', keyFromHex(secret)).update(encoded).digest('base64url')
  const a = Buffer.from(expected, 'ascii')
  const b = Buffer.from(supplied, 'ascii')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const value: unknown = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
    if (!value || typeof value !== 'object') return null
    const p = value as SignedLinkPayload
    if (p.v !== TOKEN_VERSION || !validateDetails(p) ||
      p.merchantId !== expectedMerchantId.toLowerCase() ||
      !Number.isSafeInteger(p.iat) || !Number.isSafeInteger(p.exp) ||
      p.iat <= 0 || p.iat > now + 60_000 ||
      p.exp <= now || p.exp - p.iat !== LIFETIME_MS) return null
    return p
  } catch { return null }
}

export function approvedPaymentSiteOrigin(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.origin !== value || url.protocol !== 'https:' ||
      !['www.credonomics.in', 'credonomics.in'].includes(url.hostname) ||
      url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) return null
    return url.origin
  } catch { return null }
}
