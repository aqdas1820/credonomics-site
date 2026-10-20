import { NextRequest, NextResponse } from 'next/server'
import { billingDatabaseScopeReady } from '../../../billing/db-scope'
import { isBillingUuid } from '../../../billing/uuid-policy'
import { verifyYoupiObservation } from '../../../../src/lib/billing/youpi-webhook'
import { recordSignedYoupiObservation, YoupiObservationConflict } from '../../../../src/lib/billing/youpi-observation-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
const reply = (status: number, body: unknown) => NextResponse.json(body, { status, headers })

/** Signed server delivery only. Never calls bank-credit or receipt RPCs. */
export async function POST(request: NextRequest) {
  if (process.env.BILLING_API_ENABLED !== 'true' ||
      process.env.BILLING_YOUPI_OBSERVATION_ENABLED !== 'true' ||
      process.env.BILLING_YOUPI_WEBHOOK_ENABLED !== 'true' ||
      process.env.BILLING_YOUPI_UTR_LEDGER_APPROVED !== 'true' ||
      process.env.YOUPI_LINK_LEDGER_APPROVED !== 'true' || !billingDatabaseScopeReady() ||
      !process.env.BILLING_YOUPI_WEBHOOK_SECRET || process.env.BILLING_YOUPI_WEBHOOK_SECRET.length < 32) {
    return reply(503, { error: 'Webhook unavailable' })
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '') ||
      !['', 'identity'].includes(request.headers.get('content-encoding') || '')) {
    return reply(415, { error: 'JSON required' })
  }
  const signature = request.headers.get('x-gateway-signature')
  if (!signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return reply(401, { error: 'Invalid delivery' })
  const length = request.headers.get('content-length')
  if (length !== null && !/^(0|[1-9][0-9]*)$/.test(length)) return reply(400, { error: 'Invalid delivery' })
  if (length !== null && Number(length) > 65536) return reply(413, { error: 'Delivery too large' })
  if (!request.body) return reply(400, { error: 'Invalid delivery' })

  // Preserve exact raw bytes for HMAC, including BOM/UTF-8. Bound chunked input
  // independently of Content-Length and stop slow streams after five seconds.
  const reader = request.body.getReader()
  let timer: ReturnType<typeof setTimeout> | undefined
  let raw: Buffer
  try {
    const expired = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Error('timeout')), 5000) })
    const chunks: Uint8Array[] = []
    let count = 0
    while (true) {
      const { done, value } = await Promise.race([reader.read(), expired])
      if (done) break
      if (value.byteLength > 65536 - count) {
        void reader.cancel().catch(() => undefined)
        return reply(413, { error: 'Delivery too large' })
      }
      count += value.byteLength
      chunks.push(value)
    }
    raw = Buffer.concat(chunks, count)
  } catch {
    void reader.cancel().catch(() => undefined)
    return reply(400, { error: 'Invalid delivery' })
  } finally {
    clearTimeout(timer)
    reader.releaseLock()
  }

  try {
    const observation = verifyYoupiObservation(raw, signature, process.env.BILLING_YOUPI_WEBHOOK_SECRET)
    // Public delivery must bind to a saved invoice/session, never the legacy
    // invoice-number-only adapter. No customer or delivery-header claims trusted.
    if (!observation.orderId.startsWith('CN-') || !isBillingUuid(observation.orderId.slice(3))) {
      return reply(400, { error: 'Invalid delivery' })
    }
  } catch { return reply(401, { error: 'Invalid delivery' }) }
  try {
    const result = await recordSignedYoupiObservation(raw, signature)
    // Acknowledge only after durable insert, or an identical durable retry.
    return reply(200, { ...result, settlement: 'NOT_VERIFIED' })
  } catch (error) {
    if (error instanceof YoupiObservationConflict) return reply(409, { error: 'Delivery conflict; review required' })
    return reply(503, { error: 'Delivery not recorded; retry later' })
  }
}
