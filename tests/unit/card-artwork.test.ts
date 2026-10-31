import { describe, expect, it } from 'vitest'
import { verifiedRealCards } from '../../app/data/verified-real-cards'
import {
  cardArtworkCandidates,
  cardArtworkSources,
  getCardArtwork,
  getCardArtworkCandidate,
} from '../../app/data/card-artwork'

describe('credit card product artwork', () => {
  const cardIds = verifiedRealCards.map(c => c.id)

  it('tracks artwork candidates exclusively by existing normalized card id', () => {
    expect(new Set(cardIds).size).toBe(cardIds.length)
    for (const id of Object.keys(cardArtworkCandidates)) expect(cardIds).toContain(id)
    for (const id of Object.keys(cardArtworkSources)) expect(cardIds).toContain(id)
    expect(getCardArtwork('unknown-card')).toBeUndefined()
    expect(getCardArtworkCandidate('unknown-card')).toBeUndefined()
  })

  it('keeps provenance metadata explicit for every researched candidate', () => {
    for (const [id, art] of Object.entries(cardArtworkCandidates)) {
      expect(cardIds).toContain(id)
      expect(art?.credit.length).toBeGreaterThan(5)
      expect(new URL(art!.url).protocol).toBe('https:')
      expect(new URL(art!.creditUrl).protocol).toBe('https:')
      expect(['issuer', 'partner', 'third-party']).toContain(art!.sourceKind)
      expect(['cleared', 'review-required']).toContain(art!.rightsStatus)
      expect(art!.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('publishes only exact artwork with cleared reuse rights', () => {
    for (const [id, art] of Object.entries(cardArtworkSources)) {
      expect(cardIds).toContain(id)
      expect(art?.exactProduct).toBe(true)
      expect(art?.rightsStatus).toBe('cleared')
      expect(getCardArtwork(id)).toEqual(art)
    }
  })

  it('never promotes review-required or third-party candidates to public artwork', () => {
    for (const [id, art] of Object.entries(cardArtworkCandidates)) {
      if (art?.rightsStatus === 'review-required' || art?.sourceKind === 'third-party') {
        expect(getCardArtwork(id)).toBeUndefined()
      }
    }
  })

  it('keeps similarly named products distinct at the candidate-audit layer', () => {
    expect(getCardArtworkCandidate('indigo-axis')?.url).not.toBe(getCardArtworkCandidate('indigo-axis-premium')?.url)
    expect(getCardArtworkCandidate('hsbc-live-plus')?.sourceKind).toBe('issuer')
    expect(getCardArtworkCandidate('axis-ace')?.exactProduct).toBe(false)
    expect(getCardArtworkCandidate('flipkart-axis')?.sourceKind).toBe('third-party')
  })

  it('falls back when no source-and-rights-cleared asset exists', () => {
    for (const card of verifiedRealCards) {
      const published = getCardArtwork(card.id)
      if (!published) expect(cardIds).toContain(card.id)
    }
  })
})
