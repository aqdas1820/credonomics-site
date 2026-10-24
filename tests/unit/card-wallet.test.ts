import { describe, expect, it } from 'vitest'
import { parseWallet } from '../../app/data/card-wallet'
import { realCardsForCategory, verifiedRealCards } from '../../app/data/verified-real-cards'

const ids = verifiedRealCards.map(card => card.id)
describe('device wallet persistence', () => {
  it('recovers safely from absent, corrupt and invalid saved data', () => {
    for (const raw of [null, '', '{', 'null', '{}', '42', '"cashback-sbi"']) expect(parseWallet(raw, ids)).toEqual([])
  })
  it('keeps only unique current public product IDs', () => {
    expect(parseWallet(JSON.stringify(['cashback-sbi', 'unknown-card', null, 123, 'cashback-sbi', 'amazon-pay-icici', { id: 'axis-ace' }]), ids)).toEqual(['cashback-sbi', 'amazon-pay-icici'])
  })
  it('does not reintroduce held-back terms through the wallet category filter', () => {
    for (const category of ['travel', 'fuel', 'cashback'] as const) {
      const walletCards = verifiedRealCards.filter(card => card.terms[category] && card.terms[category]?.rankingEligible !== false)
      expect(walletCards.map(card => card.id)).toEqual(realCardsForCategory(category).map(card => card.id))
    }
  })
})
