import { describe, expect, it } from 'vitest'
import { canRenderPaidReceipt } from './receipt-policy'
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
