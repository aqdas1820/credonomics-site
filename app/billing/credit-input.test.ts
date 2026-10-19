import { describe, expect, it } from 'vitest'
import { prepareBookedCredit } from './credit-input'
const good = {
  utr: '405901769153', amountPaise: 150000,
  bookedAt: '2026-10-17T12:00:00+05:30',
  evidenceReference: 'Booked Slice bank statement row 17',
  confirmedBookedInSlice: true,
}
describe('manual Slice evidence', () => {
  it('accepts confirmed booked bank credit', () => expect(prepareBookedCredit(good).amountPaise).toBe(150000))
  it('rejects gateway SUCCESS without bank confirmation', () => expect(() => prepareBookedCredit({ ...good, confirmedBookedInSlice: false })).toThrow())
  it('rejects extra uncontrolled fields', () => expect(() => prepareBookedCredit({ ...good, source: 'YOUPI_SUCCESS' })).toThrow())
  it('rejects fractional currency paise', () => expect(() => prepareBookedCredit({ ...good, amountPaise: 10.5 })).toThrow())
  it('rejects missing statement evidence', () => expect(() => prepareBookedCredit({ ...good, evidenceReference: '' })).toThrow())
  it('rejects future bank booking', () => expect(() => prepareBookedCredit({ ...good, bookedAt: '2099-10-17T12:00:00+05:30' })).toThrow())
})
