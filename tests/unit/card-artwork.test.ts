import { describe, expect, it } from 'vitest'
import { verifiedRealCards } from '../../app/data/verified-real-cards'
import { cardArtworkSources, getCardArtwork } from '../../app/data/card-artwork'

describe('credit card product artwork', () => {
  const cardIds = verifiedRealCards.map(c => c.id)

  it('curates images exclusively by existing normalized card id', () => {
    expect(new Set(cardIds).size).toBe(cardIds.length)
    for (const id of Object.keys(cardArtworkSources)) expect(cardIds).toContain(id)
    expect(getCardArtwork('unknown-card')).toBeUndefined()
  })

  it('uses https asset and source links with explicit credits', () => {
    for (const [id, art] of Object.entries(cardArtworkSources)) {
      expect(cardIds).toContain(id)
      expect(art?.credit.length).toBeGreaterThan(5)
      expect(new URL(art!.url).protocol).toBe('https:')
      expect(new URL(art!.creditUrl).protocol).toBe('https:')
    }
  })

  it('keeps similarly named products distinct', () => {
    const cards = ['flipkart-sbi','flipkart-axis','tata-neu-infinity-hdfc','indianoil-axis']
    cards.forEach(id => expect(getCardArtwork(id)).toBeDefined())
    expect(getCardArtwork('indianoil-hdfc')).toBeUndefined()
  })

  it('does not claim an official photo when a variant has no matching asset', () => {
    for (const id of ['amazon-pay-icici','freecharge-plus-axis','bpcl-sbi','first-power','sbi-miles','indianoil-hdfc', 'axis-cashback', 'airtel-axis', 'hsbc-live-plus', 'tata-neu-infinity-sbi', 'tata-neu-plus-sbi', 'indigo-axis', 'indigo-axis-premium']) {
      expect(cardIds).toContain(id)
      expect(getCardArtwork(id)).toBeUndefined()
    }
  })
})
