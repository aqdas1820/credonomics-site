import 'server-only'
import { createSupabaseAdminClient } from '../supabase/admin'
import { prepareInvoiceCreation } from '../../../app/billing/invoice-input'
import { isValidInvoiceSourceEventId } from '../../../app/billing/source-event-policy'

/**
 * Callable only from a trusted server-side business event handler.
 * There is intentionally NO public route for unattended SYSTEM invoices.
 * A unique source-event key prevents duplicate invoice issuance on replay.
 */
export async function issueAutomaticInvoiceFromTrustedEvent(sourceEventId: string, invoiceInput: unknown) {
  if (process.env.BILLING_API_ENABLED !== 'true' || process.env.BILLING_SYSTEM_ENABLED !== 'true') {
    throw new Error('System invoicing disabled')
  }
  if (!isValidInvoiceSourceEventId(sourceEventId)) throw new Error('Invalid trusted business event ID')
  const actor = process.env.BILLING_SYSTEM_ACTOR_ID
  if (!actor || !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(actor)) {
    throw new Error('System billing actor not configured')
  }
  const db = createSupabaseAdminClient()
  if (!db) throw new Error('Private invoice database unavailable')
  const prepared = prepareInvoiceCreation(invoiceInput)
  const { data, error } = await db.rpc('billing_create_invoice', {
    p_customer_name: prepared.customerName,
    p_customer_address: prepared.customerAddress,
    p_issued_on: prepared.issuedOn,
    p_customer_phone_e164: prepared.customerPhone,
    p_lines: prepared.lines,
    p_operator_id: actor,
    p_origin: 'SYSTEM',
    p_source_event_key: sourceEventId,
  })
  if (error || !data) throw new Error('System invoice rejected or source event already processed')
  return data
}
