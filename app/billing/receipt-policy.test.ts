import { describe, expect, it } from 'vitest'
import { canRenderPaidReceipt, isValidStoredPaidReceipt } from './receipt-policy'
describe('PAID receipt status protection', () => {
  it('rejects unpaid invoice', () => expect(canRenderPaidReceipt({status:'UNPAID',totalPaise:10000,paidPaise:0})).toBe(false))
  it('rejects partial credits', () => expect(canRenderPaidReceipt({status:'PARTIAL',totalPaise:10000,paidPaise:5000})).toBe(false))
  it('rejects bogus status with no booked credits', () => expect(canRenderPaidReceipt({status:'PAID',totalPaise:10000,paidPaise:0})).toBe(false))
  it('accepts fully bank-verified paid invoice', () => expect(canRenderPaidReceipt({status:'PAID',totalPaise:10000,paidPaise:10000})).toBe(true))
  it('rejects overpayments and fractional paise', () => {
    expect(canRenderPaidReceipt({status:'PAID',totalPaise:10000,paidPaise:10001})).toBe(false)
    expect(canRenderPaidReceipt({status:'PAID',totalPaise:10000,paidPaise:9999.99})).toBe(false)
  })
})

const receipt = {
  invoiceId: '12345678-1234-4234-8234-123456789012',
  invoiceNumber: 'CN-2026-00000001',
  receiptNumber: 'CN-R-2026-00000001',
  version: 1,
  status: 'PAID',
  totalPaise: 150000,
  paidPaise: 150000,
  verifiedCredits: [{
    utr: '405901769153', amountPaise: 150000,
    bookedAt: '2026-10-18T11:00:00+05:30',
  }],
}
describe('immutable receipt snapshot consistency', () => {
  it('accepts one correctly booked and fully verified credit', () => {
    expect(isValidStoredPaidReceipt(receipt)).toBe(true)
  })
  it('rejects duplicate bank UTR inside snapshot', () => {
    expect(isValidStoredPaidReceipt({
      ...receipt, verifiedCredits: [receipt.verifiedCredits[0], receipt.verifiedCredits[0]],
    })).toBe(false)
  })
  it('rejects inaccurate snapshot credit total', () => {
    expect(isValidStoredPaidReceipt({
      ...receipt, verifiedCredits: [{ ...receipt.verifiedCredits[0], amountPaise: 100000 }],
    })).toBe(false)
  })
  it('rejects mismatched receipt identity', () => {
    expect(isValidStoredPaidReceipt({ ...receipt, receiptNumber: 'CN-R-2026-00000002' })).toBe(false)
  })
  it('rejects malformed receipt invoice UUID', () => {
    expect(isValidStoredPaidReceipt({ ...receipt, invoiceId: '12345678-' + '-'.repeat(27) })).toBe(false)
  })
  it('rejects stale or partial invoice status', () => {
    expect(isValidStoredPaidReceipt({ ...receipt, status: 'PARTIAL' })).toBe(false)
  })
  it('rejects empty credits even when status claims PAID', () => {
    expect(isValidStoredPaidReceipt({ ...receipt, verifiedCredits: [] })).toBe(false)
  })
})
