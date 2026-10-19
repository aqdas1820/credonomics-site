import { createHash } from 'node:crypto'
import { isBillingUuid } from '../../../app/billing/uuid-policy'

export type Ledger = { rpc: (name: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> }
export const tokenDigest = (token: string) => createHash('sha256').update(token).digest('hex')
export class LinkRateLimitError extends Error {}

/** Missing/old database functions fail closed. No in-memory lock fallback. */
export async function reserveLink(db: Ledger, invoiceId: string, merchantId: string, actor: string) {
  const { data, error } = await db.rpc('billing_youpi_link_reserve', {
    p_invoice: invoiceId, p_merchant: merchantId, p_actor: actor,
  })
  const value = data as { decision?: string; issuedAt?: number; paymentId?: string }
  if (!error && value?.decision === 'RATE_LIMITED') throw new LinkRateLimitError('Payment link rate limited')
  if (error || !value || !['CREATE', 'REUSE'].includes(String(value.decision)) ||
    !Number.isSafeInteger(value.issuedAt) || (value.issuedAt as number) <= 0 ||
    (value.decision === 'REUSE' && !isBillingUuid(value.paymentId))) throw Error('Link reservation unavailable')
  return value as { decision: 'CREATE' | 'REUSE'; issuedAt: number; paymentId?: string }
}

export async function completeLink(db: Ledger, invoiceId: string, merchantId: string, paymentId: string, token: string) {
  const { data, error } = await db.rpc('billing_youpi_link_complete', {
    p_invoice: invoiceId, p_merchant: merchantId, p_payment: paymentId, p_digest: tokenDigest(token),
  })
  if (error || data !== true) throw Error('Link persistence unavailable')
}

/** Repeat views are bounded; revocation/expiry/changed invoices always deny access. */
export async function authorizeLinkView(db: Ledger, token: string): Promise<boolean> {
  try {
    const { data, error } = await db.rpc('billing_youpi_link_access', { p_digest: tokenDigest(token) })
    return !error && data === true
  } catch { return false }
}
