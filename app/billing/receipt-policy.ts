import { isBillingUuid } from './uuid-policy'

/** PAID receipt visibility is strictly derived from independently booked bank credits. */
export function canRenderPaidReceipt(invoice: { status: string; totalPaise: number; paidPaise: number }): boolean {
  return !!invoice && typeof invoice === 'object' && invoice.status === 'PAID' &&
    Number.isSafeInteger(invoice.totalPaise) && invoice.totalPaise > 0 &&
    Number.isSafeInteger(invoice.paidPaise) && invoice.paidPaise === invoice.totalPaise
}

/**
 * Defensively validate an append-only receipt snapshot before display.
 * The database RPC remains the issuance authority; this checks internal
 * consistency and rejects malformed, duplicated or mismatched credits.
 */
export type StoredPaidReceipt = {
  invoiceId: string
  invoiceNumber: string
  receiptNumber: string
  version: number
  status: string
  totalPaise: number
  paidPaise: number
  verifiedCredits: Array<{ utr: string; amountPaise: number; bookedAt: string }>
}

export function isValidStoredPaidReceipt(receipt: StoredPaidReceipt): boolean {
  if (!receipt || typeof receipt !== 'object' || !canRenderPaidReceipt(receipt) || receipt.version !== 1 ||
      !isBillingUuid(receipt.invoiceId) ||
      !/^CN-\d{4}-\d{8}$/.test(receipt.invoiceNumber) ||
      receipt.receiptNumber !== 'CN-R-' + receipt.invoiceNumber.slice(3) ||
      !Array.isArray(receipt.verifiedCredits) || receipt.verifiedCredits.length < 1) return false
  const seen = new Set<string>()
  let sum = 0
  for (const credit of receipt.verifiedCredits) {
    if (!credit || typeof credit.utr !== 'string' ||
        !/^[A-Z0-9-]{8,80}$/.test(credit.utr.toUpperCase()) ||
        !Number.isSafeInteger(credit.amountPaise) || credit.amountPaise <= 0 ||
        typeof credit.bookedAt !== 'string' || !Number.isFinite(Date.parse(credit.bookedAt))) return false
    const utr = credit.utr.toUpperCase()
    if (seen.has(utr)) return false
    seen.add(utr)
    sum += credit.amountPaise
    if (!Number.isSafeInteger(sum) || sum > receipt.totalPaise) return false
  }
  return sum === receipt.paidPaise
}
