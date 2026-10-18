import { describe, expect, it } from 'vitest'
import { prepareInvoiceCreation } from './invoice-input'
const input = { date: '2026-10-18', customer: 'Sample Customer', items: [
  { description: 'Service', quantity: '2', rate: '100.10' },
] }
describe('server-side invoice creation inputs', () => {
  it('calculates integer paise', () => expect(prepareInvoiceCreation(input)).toMatchObject({
    totalPaise: 20020, lines: [{ quantity: 2, rate_paise: 10010, line_total_paise: 20020 }],
  }))
  it('does not accept client-selected invoice number', () => expect(() => prepareInvoiceCreation({ ...input, number: '999' })).toThrow())
  it('does not accept client-selected paid status', () => expect(() => prepareInvoiceCreation({ ...input, status: 'PAID' })).toThrow())
  it('rejects fractional quantities', () => expect(() => prepareInvoiceCreation({ ...input, items: [{ description: 'Service', quantity: '1.2', rate: '1' }] })).toThrow())
  it('rejects unrealistic rates', () => expect(() => prepareInvoiceCreation({ ...input, items: [{ description: 'Service', quantity: '1', rate: '1e5' }] })).toThrow())
  it('rejects invalid dates', () => expect(() => prepareInvoiceCreation({ ...input, date: '2026-02-30' })).toThrow())
  it('rejects unverified phone formats', () => expect(() => prepareInvoiceCreation({ ...input, customerPhone: '9876543210' })).toThrow())
})
