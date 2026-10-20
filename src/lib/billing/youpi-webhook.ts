import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

// Confirmed against YouPI PG V2's documented X-Gateway-Signature webhook.
// The merchant spec signs the RAW JSON BODY ONLY: it does not promise
// timestamp/delivery-ID headers. Replay is therefore handled by a durable
// unique paymentId + event ledger, never by an invented header.
const eventSchema = z.object({
  event: z.enum(['SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED']),
  orderId: z.string().regex(/^[A-Za-z0-9:_-]{1,128}$/),
  paymentId: z.string().uuid(),
  currency: z.literal('INR'),
  method: z.literal('UPI'),
  amount: z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/),
  amountPaise: z.number().int().positive().max(10_000_000_000),
  utr: z.string().regex(/^[A-Za-z0-9-]{8,80}$/).nullish(),
}).passthrough()

export type YoupiGatewayObservation = {
  decision: 'REVIEW_REQUIRED'
  event: 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELLED'
  orderId: string
  amountPaise: number
  currency: 'INR'
  method: 'UPI'
  utr: string | null
  paymentId: string
  /** Use this with (paymentId, event) as a durable database replay key. */
  rawSha256: string
}

function exactAmountPaise(amount: string): number {
  const [rupees, fraction = ''] = amount.split('.')
  return Number(rupees) * 100 + Number(fraction.padEnd(2, '0'))
}

/**
 * Verifies a YouPI V2 HMAC-SHA256 merchant webhook.
 * A valid signed SUCCESS is an OBSERVATION, never Slice booked-bank evidence.
 * No public route, checkout or automatic invoice settlement is enabled here.
 */
export function verifyYoupiObservation(
  body: Buffer,
  signature: string | null,
  sharedSecret: string | undefined,
): YoupiGatewayObservation {
  if (!sharedSecret || sharedSecret.length < 32) throw new Error('Webhook secret unavailable')
  if (!Buffer.isBuffer(body) || body.length === 0 || body.length > 65536) {
    throw new Error('Invalid webhook length')
  }
  if (!signature || !/^sha256=[0-9a-f]{64}$/i.test(signature)) {
    throw new Error('Invalid X-Gateway-Signature')
  }
  const received = Buffer.from(signature.slice(7), 'hex')
  const expected = createHmac('sha256', sharedSecret).update(body).digest()
  if (!timingSafeEqual(received, expected)) throw new Error('Unauthenticated gateway observation')
  let parsed: unknown
  try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body)) }
  catch { throw new Error('Invalid webhook JSON') }
  const event = eventSchema.safeParse(parsed)
  if (!event.success) throw new Error('Invalid signed webhook payload')
  const details = event.data
  const calculated = exactAmountPaise(details.amount)
  if (!Number.isSafeInteger(calculated) || calculated !== details.amountPaise) {
    throw new Error('Mismatched gateway amount representations')
  }
  if (details.event === 'SUCCESS' && details.method === 'UPI' && !details.utr) {
    throw new Error('Missing UTR on SUCCESS observation')
  }
  return {
    decision: 'REVIEW_REQUIRED',
    event: details.event,
    orderId: details.orderId,
    amountPaise: details.amountPaise,
    currency: 'INR',
    method: details.method,
    utr: details.utr?.toUpperCase() ?? null,
    paymentId: details.paymentId.toLowerCase(),
    rawSha256: createHash('sha256').update(body).digest('hex'),
  }
}
