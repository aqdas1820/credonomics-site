import { describe, expect, it } from 'vitest'
import { calculateInvoice, type InvoiceDraft } from './invoice-math'

const base: InvoiceDraft = { number: '1511', date: '2026-10-18', customer: 'Sample Customer', items: [{ description: 'Service', quantity: '2', rate: '123.45' }] }

describe('invoice draft arithmetic', () => {
  it('calculates exact integer paise', () => expect(calculateInvoice(base)).toMatchObject({ valid: true, totalPaise: 24690, linePaise: [24690] }))
  it('rejects negative rates', () => expect(calculateInvoice({ ...base, items: [{ ...base.items[0], rate: '-1' }] }).valid).toBe(false))
  it('rejects excessive precision', () => expect(calculateInvoice({ ...base, items: [{ ...base.items[0], rate: '0.001' }] }).valid).toBe(false))
  it('rejects zero quantity', () => expect(calculateInvoice({ ...base, items: [{ ...base.items[0], quantity: '0' }] }).valid).toBe(false))
  it('rejects unsafe totals', () => expect(calculateInvoice({ ...base, items: [{ ...base.items[0], quantity: '99999999', rate: '99999999' }] }).valid).toBe(false))
  it('rejects empty customer', () => expect(calculateInvoice({ ...base, customer: ' ' }).valid).toBe(false))
  it('rejects empty items', () => expect(calculateInvoice({ ...base, items: [] }).valid).toBe(false))
  it('sums lines exactly', () => expect(calculateInvoice({ ...base, items: [{ description: 'A', quantity: '1', rate: '0.10' }, { description: 'B', quantity: '1', rate: '0.20' }] }).totalPaise).toBe(30))
})
