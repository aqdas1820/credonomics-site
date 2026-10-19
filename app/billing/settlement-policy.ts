/**
 * CredoNomics invoice settlement policy.
 * Pure functions only: callers MUST independently authenticate operators,
 * verify booked Slice credits, persist atomically and append an audit event.
 * Gateway callbacks, screenshots and customer UTR submissions are NOT bank proof.
 */
export type InvoiceSettlementStatus = 'UNPAID' | 'PARTIAL' | 'PAID'
export type BankCredit = {
  utr: string
  amountPaise: number
  bank: 'Slice'
  independentlyVerified: boolean
  verifiedBy: string
  bookedAt: string
}
export type SettlementResult = {
  status: InvoiceSettlementStatus
  paidPaise: number
  outstandingPaise: number
  canIssuePaidReceipt: boolean
}
const isPositivePaise = (n: number) => Number.isSafeInteger(n) && n > 0

export function reconcileVerifiedCredits(invoiceTotalPaise: number, credits: BankCredit[]): SettlementResult {
  if (!isPositivePaise(invoiceTotalPaise)) throw new Error('Invalid invoice total')
  const seen = new Set<string>()
  let paidPaise = 0
  for (const credit of credits) {
    if (credit.bank !== 'Slice' || credit.independentlyVerified !== true ||
        !credit.verifiedBy.trim() || !/^\d{4}-\d{2}-\d{2}T/.test(credit.bookedAt) ||
        !Number.isFinite(Date.parse(credit.bookedAt)) || !isPositivePaise(credit.amountPaise)) {
      throw new Error('Unverified or invalid booked bank credit')
    }
    const utr = credit.utr.trim().toUpperCase()
    if (!/^[A-Z0-9-]{8,80}$/.test(utr) || seen.has(utr)) throw new Error('Invalid or duplicate UTR')
    seen.add(utr)
    paidPaise += credit.amountPaise
    if (!Number.isSafeInteger(paidPaise) || paidPaise > invoiceTotalPaise) throw new Error('Bank credits exceed invoice total')
  }
  const outstandingPaise = invoiceTotalPaise - paidPaise
  const status: InvoiceSettlementStatus = outstandingPaise === 0 ? 'PAID' : paidPaise > 0 ? 'PARTIAL' : 'UNPAID'
  return { status, paidPaise, outstandingPaise, canIssuePaidReceipt: status === 'PAID' }
}

/** Gateway observations can only initiate review; they never mutate settlement. */
export function gatewayObservation(): 'REVIEW_REQUIRED' {
  return 'REVIEW_REQUIRED'
}
