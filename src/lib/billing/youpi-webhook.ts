import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const eventSchema = z.object({
  event: z.literal('SUCCESS'),
  orderId: z.string().min(1).max(128),
  amountPaise: z.number().int().positive().max(10_000_000_000),
  utr: z.string().regex(/^[A-Za-z0-9-]{8,80}$/),
  paymentId: z.string().uuid(),
}).passthrough()

export type YoupiGatewayObservation = {
  decision: 'REVIEW_REQUIRED'
  orderId: string
  amountPaise: number
  utr: string
  paymentId: string
  deliveryId: string
}

/**
 * YouPI V2 webhook contract. Verify raw HMAC BEFORE JSON parsing.
 * A signed gateway SUCCESS is still NOT bank-booked-credit evidence.
 * Caller must enforce durable replay protection via a unique delivery ID.
 * This adapter does not expose any public endpoint or initiate checkout.
 */
export function verifyYoupiObservation(
  body: Buffer, signature: string | null, timestamp: string | null,
  deliveryId: string | null, sharedSecret: string | undefined,
  nowMs: number = Date.now(),
): YoupiGatewayObservation {
  if (!sharedSecret || sharedSecret.length < 32) throw new Error('Webhook secret unavailable')
  if (!Buffer.isBuffer(body) || body.length === 0 || body.length > 65536) throw new Error('Invalid webhook length')
  if (!signature || !/^sha256=[0-9a-f]{64}$/i.test(signature)) throw new Error('Invalid signature header')
  if (!timestamp || !/^\d{13}$/.test(timestamp)) throw new Error('Invalid timestamp')
  const issued = Number(timestamp)
  if (!Number.isSafeInteger(issued) || Math.abs(nowMs - issued) > 300000) throw new Error('Expired webhook')
  if (!deliveryId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deliveryId)) {
    throw new Error('Invalid webhook delivery ID')
  }
  const received = Buffer.from(signature.slice(7).toLowerCase(), 'hex')
  const expected = createHmac('sha256', sharedSecret).update(body).digest()
  if (!timingSafeEqual(received, expected)) throw new Error('Unauthenticated gateway observation')
  let parsed: unknown
  try { parsed = JSON.parse(body.toString('utf8')) }
  catch { throw new Error('Invalid webhook JSON') }
  const event = eventSchema.safeParse(parsed)
  if (!event.success) throw new Error('Invalid signed webhook payload')
  return {
    decision: 'REVIEW_REQUIRED',
    orderId: event.data.orderId, amountPaise: event.data.amountPaise,
    utr: event.data.utr.toUpperCase(), paymentId: event.data.paymentId,
    deliveryId,
  }
}
