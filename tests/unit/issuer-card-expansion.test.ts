import { describe, expect, it } from 'vitest'
import { additionalVerifiedCards } from '../../app/data/verified-card-expansion'
import { verifiedRealCards, realCardsForCategory } from '../../app/data/verified-real-cards'
import { issuerForName } from '../../app/data/issuer-registry'
import { cardCategoryMap, type CardCategorySlug } from '../../app/data/card-categories'

describe('Nov 2026 issuer-backed card catalogue expansion', () => {
  it('adds at least 30 unique source-backed products to existing catalogue', () => {
    expect(additionalVerifiedCards.length).toBeGreaterThanOrEqual(30)
    expect(verifiedRealCards.length).toBe(24 + additionalVerifiedCards.length)
    const ids = verifiedRealCards.map(card => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('requires a registered issuer, valid date, official HTTPS source, realistic fee and category', () => {
    const issuerHost = /(^|\.)(sbicard\.com|hdfc\.bank\.in|axis\.bank\.in|idfcfirst\.bank\.in|au\.bank\.in|icicibank\.com|indusind\.com)$/
    for (const card of additionalVerifiedCards) {
      expect(issuerForName(card.issuer), card.name).toBeDefined()
      expect(card.catalogueOnly).toBe(true)
      expect(card.verifiedAt).toBe('2026-11-02')
      expect(card.annualFeeRupees).toBeGreaterThanOrEqual(0)
      expect(card.annualFeeRupees).toBeLessThanOrEqual(15000)
      expect(card.feeTaxPercent).toBe(18)
      expect(new URL(card.sourceUrl).protocol).toBe('https:')
      expect(new URL(card.sourceUrl).hostname).toMatch(issuerHost)
      expect(card.sourceLabel).toContain('Official')
      expect(Object.keys(card.terms).length).toBeGreaterThan(0)
      for (const [slug, terms] of Object.entries(card.terms)) {
        expect(cardCategoryMap[slug as CardCategorySlug], card.name + ' ' + slug).toBeDefined()
        expect(terms?.rankingEligible).toBe(false)
        expect(terms?.note.length).toBeGreaterThan(45)
      }
    }
  })

  it('never silently includes unnormalized card benefits in automated rankings', () => {
    for (const card of additionalVerifiedCards) {
      for (const slug of Object.keys(card.terms) as CardCategorySlug[]) {
        expect(realCardsForCategory(slug).some(candidate => candidate.id === card.id)).toBe(false)
      }
    }
  })

  it('makes no false promise of cashback or known annual fee waivers without issuer evidence', () => {
    const knownZeroFee = ['first-millennia', 'first-classic', 'first-select', 'first-wealth', 'first-wow', 'scapia-axis', 'ixigo-au']
    for (const id of knownZeroFee) expect(additionalVerifiedCards.find(c => c.id === id)?.annualFeeRupees).toBe(0)
    for (const card of additionalVerifiedCards) {
      expect(JSON.stringify(card.terms)).not.toContain('rankingEligible":true')
      expect(card.terms).toBeDefined()
    }
  })
})
