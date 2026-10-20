import { describe, expect, it } from 'vitest'
import { gatewayObservation, reconcileVerifiedCredits, type BankCredit } from './settlement-policy'

const credit: BankCredit = {
  utr: '405901769153',
  amountPaise: 150000,
  bank: 'Slice',
  independentlyVerified: true,
  verifiedBy: 'authorized-operator',
  bookedAt: '2026-10-17T10:00:00+05:30',
}
describe('CredoNomics settlement hierarchy', () => {
  it('starts unpaid without bank proof', () => expect(reconcileVerifiedCredits(150000, [])).toMatchObject({ status: 'UNPAID', canIssuePaidReceipt: false }))
  it('issues PAID eligibility only on verified full credit', () => expect(reconcileVerifiedCredits(150000, [credit])).toMatchObject({ status: 'PAID', canIssuePaidReceipt: true, outstandingPaise: 0 }))
  it('keeps partial credits PARTIAL', () => expect(reconcileVerifiedCredits(200000, [credit])).toMatchObject({ status: 'PARTIAL', outstandingPaise: 50000, canIssuePaidReceipt: false }))
  it('rejects unverified bank claims', () => expect(() => reconcileVerifiedCredits(150000, [{ ...credit, independentlyVerified: false }])).toThrow())
  it('rejects duplicate UTRs', () => expect(() => reconcileVerifiedCredits(300000, [credit, credit])).toThrow())
  it('rejects overpayment', () => expect(() => reconcileVerifiedCredits(100000, [credit])).toThrow())
  it('rejects invalid amounts', () => expect(() => reconcileVerifiedCredits(150000, [{ ...credit, amountPaise: 0 }])).toThrow())
  it('gateway success is review only', () => expect(gatewayObservation()).toBe('REVIEW_REQUIRED'))
  it('two distinct verified credits settle full amount', () => expect(reconcileVerifiedCredits(300000, [credit, { ...credit, utr: '405901769154' }]).status).toBe('PAID'))
})
