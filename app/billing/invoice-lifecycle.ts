import { calculateInvoice, type InvoiceDraft } from './invoice-math'
import { reconcileVerifiedCredits, type BankCredit, type InvoiceSettlementStatus } from './settlement-policy'

/**
 * Shared domain model for admin-created and system-generated invoices.
 * No side effects: API must authenticate, persist transactionally, and audit.
 */
export type InvoiceOrigin = 'ADMIN' | 'SYSTEM'
export type InvoiceRecord = {
  id: string
  origin: InvoiceOrigin
  draft: InvoiceDraft
  totalPaise: number
  status: InvoiceSettlementStatus
  revision: number
  credits: BankCredit[]
}
export type InvoiceEvent =
  | { type: 'INVOICE_CREATED'; origin: InvoiceOrigin; invoiceId: string }
  | { type: 'BANK_CREDIT_VERIFIED'; invoiceId: string; utr: string; amountPaise: number }
  | { type: 'INVOICE_PARTIALLY_PAID'; invoiceId: string; outstandingPaise: number }
  | { type: 'INVOICE_FULLY_PAID'; invoiceId: string }
export type InvoiceTransition = { invoice: InvoiceRecord; events: InvoiceEvent[]; issuePaidReceipt: boolean }

export function createInvoiceRecord(id: string, origin: InvoiceOrigin, draft: InvoiceDraft): InvoiceTransition {
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error('Server-generated invoice UUID required')
  if (origin !== 'ADMIN' && origin !== 'SYSTEM') throw new Error('Invalid invoice origin')
  const result = calculateInvoice(draft)
  if (!result.valid) throw new Error(result.errors.join('; '))
  const invoice: InvoiceRecord = {
    id, origin, draft: structuredClone(draft), totalPaise: result.totalPaise,
    status: 'UNPAID', revision: 1, credits: [],
  }
  return { invoice, events: [{ type: 'INVOICE_CREATED', origin, invoiceId: id }], issuePaidReceipt: false }
}

/** Caller must first verify a booked Slice credit using an authorized human operator. */
export function recordVerifiedBankCredit(invoice: InvoiceRecord, credit: BankCredit): InvoiceTransition {
  if (invoice.status === 'PAID') throw new Error('Already paid: manual exception workflow required')
  const credits = [...invoice.credits, credit]
  const settlement = reconcileVerifiedCredits(invoice.totalPaise, credits)
  const updated: InvoiceRecord = {
    ...invoice, credits, status: settlement.status, revision: invoice.revision + 1,
  }
  const events: InvoiceEvent[] = [
    { type: 'BANK_CREDIT_VERIFIED', invoiceId: invoice.id, utr: credit.utr, amountPaise: credit.amountPaise },
  ]
  if (settlement.status === 'PAID') events.push({ type: 'INVOICE_FULLY_PAID', invoiceId: invoice.id })
  else if (settlement.status === 'PARTIAL') events.push({ type: 'INVOICE_PARTIALLY_PAID', invoiceId: invoice.id, outstandingPaise: settlement.outstandingPaise })
  return { invoice: updated, events, issuePaidReceipt: settlement.canIssuePaidReceipt }
}

/** Gateway observations never create a bank-credit transition. */
export function observeGatewayEvent(invoice: InvoiceRecord): InvoiceTransition {
  return { invoice, events: [], issuePaidReceipt: false }
}
