import { describe, expect, it } from 'vitest'
import { isValidInvoiceSourceEventId } from './source-event-policy'
describe('automatic invoice source event', () => {
  it('accepts stable system event IDs', () => expect(isValidInvoiceSourceEventId('order:evt-00042')).toBe(true))
  it('rejects empty/short events', () => expect(isValidInvoiceSourceEventId('abc')).toBe(false))
  it('rejects whitespace and PII-like input', () => expect(isValidInvoiceSourceEventId('customer@email.example')).toBe(false))
  it('rejects nonstrings', () => expect(isValidInvoiceSourceEventId(null)).toBe(false))
})
