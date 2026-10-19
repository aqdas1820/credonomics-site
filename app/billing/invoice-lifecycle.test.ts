import { describe, expect, it } from 'vitest'
import { createInvoiceRecord, recordVerifiedBankCredit, observeGatewayEvent } from './invoice-lifecycle'
const id = '12345678-1234-4234-8234-123456789012'
const draft = {
  number: '1511', date: '2026-10-18', customer: 'Example Customer',
  items: [{ description: 'Example service', quantity: '1', rate: '1500.00' }],
}
const bankCredit = {
  utr: '405901769153', amountPaise: 150000, bank: 'Slice' as const,
  independentlyVerified: true, verifiedBy: 'authorized-operator',
  bookedAt: '2026-10-18T10:00:00+05:30',
}
describe('invoice lifecycle', () => {
  it('creates admin invoice as UNPAID', () => {
    const result = createInvoiceRecord(id, 'ADMIN', draft)
    expect(result.invoice).toMatchObject({ origin: 'ADMIN', status: 'UNPAID', totalPaise: 150000 })
    expect(result.issuePaidReceipt).toBe(false)
  })
  it('creates automatic invoice as UNPAID', () => expect(createInvoiceRecord(id, 'SYSTEM', draft).invoice.status).toBe('UNPAID'))
  it('rejects malformed invoice identifier before issuing records', () => {
    expect(() => createInvoiceRecord('12345678-' + '-'.repeat(27), 'ADMIN', draft)).toThrow('UUID')
  })
  it('rejects invalid invoices', () => expect(() => createInvoiceRecord(id, 'ADMIN', { ...draft, customer: '' })).toThrow())
  it('ignores gateway SUCCESS for paid status', () => {
    const invoice = createInvoiceRecord(id, 'ADMIN', draft).invoice
    expect(observeGatewayEvent(invoice)).toMatchObject({ invoice: { status: 'UNPAID' }, issuePaidReceipt: false })
  })
  it('only allows paid receipt after independently verified Slice credit', () => {
    const invoice = createInvoiceRecord(id, 'ADMIN', draft).invoice
    const result = recordVerifiedBankCredit(invoice, bankCredit)
    expect(result.invoice.status).toBe('PAID')
    expect(result.issuePaidReceipt).toBe(true)
    expect(result.events.map(e => e.type)).toContain('INVOICE_FULLY_PAID')
  })
  it('rejects unverifiable credits', () => {
    const invoice = createInvoiceRecord(id, 'ADMIN', draft).invoice
    expect(() => recordVerifiedBankCredit(invoice, { ...bankCredit, independentlyVerified: false })).toThrow()
  })
  it('does not allow credit replay on paid invoices', () => {
    const invoice = recordVerifiedBankCredit(createInvoiceRecord(id, 'ADMIN', draft).invoice, bankCredit).invoice
    expect(() => recordVerifiedBankCredit(invoice, bankCredit)).toThrow()
  })
})
