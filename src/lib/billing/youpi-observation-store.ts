import 'server-only'
import { createSupabaseAdminClient } from '../supabase/admin'
import { verifyYoupiObservation, type YoupiGatewayObservation } from './youpi-webhook'
import { billingDatabaseScopeReady } from '../../../app/billing/db-scope'

/**
 * Trusted server-only gateway delivery adapter; not an HTTP endpoint.
 * The source adapter caller must establish the origin of the raw signed body.
 *
 * IMPORTANT: no customer checkout and no public webhook are enabled here.
 * Neither SUCCESS nor any other gateway event settles invoices.
 */
export async function recordSignedYoupiObservation(
  rawBody: Buffer,
  signature: string | null,
): Promise<{ recorded: boolean; decision: 'REVIEW_REQUIRED'; duplicate: boolean }> {
  if (process.env.BILLING_API_ENABLED !== 'true' ||
      process.env.BILLING_YOUPI_OBSERVATION_ENABLED !== 'true' || !billingDatabaseScopeReady()) {
    throw new Error('YouPI observation integration disabled')
  }

  // HMAC first, then parse. A merchant webhook secret must be configured
  // exclusively on the server and tied to the reviewed YouPI merchant.
  const observation: YoupiGatewayObservation = verifyYoupiObservation(
    rawBody, signature, process.env.BILLING_YOUPI_WEBHOOK_SECRET,
  )
  const service = createSupabaseAdminClient()
  if (!service) throw new Error('Private billing database unavailable')
  const { data, error } = await service.rpc('billing_record_youpi_observation', {
    p_payment_id: observation.paymentId,
    p_order_id: observation.orderId,
    p_event: observation.event,
    p_amount_paise: observation.amountPaise,
    p_utr: observation.utr,
    p_raw_sha256: observation.rawSha256,
  })
  if (!error && data?.decision === 'SECURITY_REVIEW_CONFLICT') {
    throw new Error('YOUPI_SECURITY_REVIEW_CONFLICT')
  }
  if (error || !data || data.decision !== 'REVIEW_REQUIRED' ||
      typeof data.recorded !== 'boolean' || typeof data.duplicate !== 'boolean') {
    throw new Error('YouPI gateway observation was not durably recorded')
  }
  if (data.recorded === data.duplicate) throw new Error('Invalid YouPI observation acknowledgement')
  return { recorded: data.recorded, duplicate: data.duplicate, decision: 'REVIEW_REQUIRED' }
}
