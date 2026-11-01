import { describe, expect, it } from 'vitest'
import { secondWaveCards } from '../../app/data/verified-card-expansion-wave2'
import { additionalVerifiedCards } from '../../app/data/verified-card-expansion'
import { verifiedRealCards, realCardsForCategory } from '../../app/data/verified-real-cards'
import { cardCategoryMap, type CardCategorySlug } from '../../app/data/card-categories'
import { issuerForName } from '../../app/data/issuer-registry'

const allowedIssuerHosts = /(^|\.)(kotak\.bank\.in|icici\.bank\.in|campaigns\.icicibank\.com|rbl\.bank\.in|yes\.bank\.in|federal\.bank\.in|americanexpress\.com|sc\.bank\.in)$/

describe('second-wave issuer-verified Indian credit card catalogue', () => {
  it('adds 44 unique cards to the previous 58 without losing financial models', () => {
    expect(additionalVerifiedCards.length).toBe(34)
    expect(secondWaveCards.length).toBe(44)
    expect(verifiedRealCards.length).toBe(102)
    expect(new Set(verifiedRealCards.map(card => card.id)).size).toBe(102)
    expect(secondWaveCards.filter(card => card.catalogueOnly).length).toBe(44)
  })

  it('requires issuer support, 2026 research date, fee disclosure and an HTTPS bank-domain reference', () => {
    for (const card of secondWaveCards) {
      expect(issuerForName(card.issuer), card.name).toBeDefined()
      expect(card.catalogueOnly).toBe(true)
      expect(card.verifiedAt).toBe('2026-11-02')
      expect(card.sourceLabel).toMatch(/^Official /)
      expect(card.feeTaxPercent).toBe(18)
      expect(card.feeNote?.length, card.name).toBeGreaterThan(45)
      expect(card.annualFeeRupees).toBeGreaterThanOrEqual(0)
      expect(card.annualFeeRupees).toBeLessThanOrEqual(30000)
      const url = new URL(card.sourceUrl)
      expect(url.protocol).toBe('https:')
      expect(url.hostname, card.name).toMatch(allowedIssuerHosts)
      expect(Object.keys(card.terms).length).toBeGreaterThan(0)
    }
  })

  it('blocks unverified reward models from automated score and comparison leaderboards', () => {
    for (const card of secondWaveCards) {
      for (const [category, terms] of Object.entries(card.terms)) {
        expect(cardCategoryMap[category as CardCategorySlug], category).toBeDefined()
        expect(terms?.rankingEligible, card.name + ' ' + category).toBe(false)
        expect(terms?.note.length).toBeGreaterThan(45)
        expect(realCardsForCategory(category as CardCategorySlug).some(item => item.id === card.id)).toBe(false)
      }
    }
  })

  it('preserves special first-year and conditional LTF differences in public fee notes', () => {
    const find = (id: string) => secondWaveCards.find(card => card.id === id)
    expect(find('yes-marquee')?.annualFeeRupees).toBe(4999)
    expect(find('yes-marquee')?.feeNote).toContain('9,999')
    expect(find('amex-membership-rewards')?.annualFeeRupees).toBe(4500)
    expect(find('amex-membership-rewards')?.feeNote).toContain('1,000')
    expect(find('sc-rewards')?.annualFeeRupees).toBe(1000)
    expect(find('sc-rewards')?.feeNote).toContain('first year')
    expect(find('kotak-league-platinum')?.annualFeeRupees).toBe(499)
    expect(find('kotak-league-platinum')?.feeNote).toContain('targeted')
    for (const card of secondWaveCards.filter(card => card.issuer === 'Federal Bank')) {
      expect(card.feeNote).toContain('limited-period')
    }
  })

  it('does not confuse Amex application pause with an active offer', () => {
    const amex = secondWaveCards.filter(card => card.issuer === 'American Express India')
    expect(amex.length).toBe(4)
    for (const card of amex) {
      const description = Object.values(card.terms).map(t => t?.note).join(' ')
      expect(description.toLowerCase()).toContain('pause')
    }
  })
})
