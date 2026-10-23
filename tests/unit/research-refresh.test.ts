import { describe, expect, it } from 'vitest'
import { analyseCard, defaultProfile } from '../../app/data/real-card-ranking'
import { verifiedRealCards, realCardsForCategory } from '../../app/data/verified-real-cards'
import { calendarComparisonMonth, comparableSnapshots } from '../../src/mf/comparison'
import { mutualFundSnapshotSchema } from '../../src/schemas/mutual-fund'
import snapshot from '../../public/data/mf-intelligence/v2/by-month/2026-09.json'
import sources from '../../public/data/mf-intelligence/v2/official-sources-2026-09.json'

const card = (id: string) => verifiedRealCards.find(row => row.id === id)!

describe('official card term corrections', () => {
  it('keeps earning ceilings separate from redemption limits', () => {
    const result = analyseCard(card('millennia-hdfc'), 'shopping', { ...defaultProfile, monthlySpend: 50000 })
    expect(result.grossValue).toBe(12000)
    expect(analyseCard(card('axis-ace'), 'utilities', { ...defaultProfile, monthlySpend: 50000 }).grossValue).toBe(6000)
  })
  it('requires same-cycle base cashback for Airtel utility eligibility', () => {
    expect(analyseCard(card('airtel-axis'), 'utilities', { ...defaultProfile, monthlyBaseSpend: 0 }).grossValue).toBe(0)
    expect(analyseCard(card('airtel-axis'), 'utilities', { ...defaultProfile, monthlyBaseSpend: 10000 }).grossValue).toBe(1200)
  })
  it('applies partner caps without capping eligible other-spend cashback', () => {
    const result = analyseCard(card('flipkart-sbi'), 'co-branded', { ...defaultProfile, monthlySpend: 50000, annualRetailSpend: 600000 })
    expect(result.grossValue).toBe(17800)
    const airtel = analyseCard(card('airtel-axis'), 'co-branded', { ...defaultProfile, monthlySpend: 10000, partnerSpendShare: 70 })
    expect(airtel.grossValue).toBe(1080) // ₹60 telecom cap + ₹30 base cashback, each month
  })
  it('models revised caps and points in rupees rather than placeholder percentages', () => {
    expect(analyseCard(card('hsbc-live-plus'), 'grocery', { ...defaultProfile, monthlySpend: 50000 }).grossValue).toBe(14400)
    expect(analyseCard(card('first-power-plus'), 'upi', defaultProfile).grossValue).toBe(600)
    expect(analyseCard(card('first-power-plus'), 'fuel', { ...defaultProfile, monthlySpend: 50000 }).grossValue).toBe(7200)
    expect(analyseCard(card('tata-neu-infinity-sbi'), 'upi', { ...defaultProfile, monthlySpend: 50000 }).grossValue).toBe(6000)
    expect(analyseCard(card('sbi-miles'), 'travel', { ...defaultProfile, loungeVisits: 0, annualForeignSpend: 0 }).grossValue).toBe(600)
  })
  it('carries verified fuel limits into co-brand views and preserves standard BPCL post-cap base earning', () => {
    const profile = { ...defaultProfile, monthlySpend: 50000, annualRetailSpend: 600000 };
    expect(analyseCard(card('bpcl-sbi-octane'), 'co-branded', profile).grossValue).toBe(7950);
    expect(analyseCard(card('bpcl-sbi'), 'co-branded', profile).grossValue).toBe(4350);
    expect(analyseCard(card('indianoil-axis'), 'co-branded', profile).grossValue).toBe(2400);
    expect(analyseCard(card('bpcl-sbi'), 'grocery', { ...profile, monthlySpend: 150000 }).grossValue).toBe(16500);
  })
  it('holds incomplete rupee valuations out of normalized rankings', () => {
    expect(realCardsForCategory('travel').some(row => row.id.startsWith('indigo-axis'))).toBe(false)
    expect(realCardsForCategory('fuel').some(row => row.id === 'first-power')).toBe(false)
  })
})

describe('official mutual-fund snapshot and comparable periods', () => {
  it('validates all 634 positions and reconciles each scheme to the published equity subtotal', () => {
    expect(mutualFundSnapshotSchema.safeParse(snapshot).success).toBe(true)
    expect(snapshot.holdings).toHaveLength(634)
    expect(snapshot.schemes).toHaveLength(6)
    for (const source of sources.sources) {
      const positions = snapshot.holdings.filter(row => row.scheme === source.scheme)
      expect(new Set(positions.map(row => row.isin)).size).toBe(positions.length)
      expect(Math.abs(positions.reduce((sum, row) => sum + row.weight, 0) - source.sourceEquityPercent)).toBeLessThanOrEqual(0.1 + source.unquantifiedPositions.length * 0.01)
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/)
    }
  })
  it('compares calendar periods instead of skipping missing files', () => {
    expect(calendarComparisonMonth('2026-09', '1M')).toBe('2026-08')
    expect(calendarComparisonMonth('2026-09', '3M')).toBe('2026-06')
    expect(calendarComparisonMonth('2026-01', '1M')).toBe('2025-12')
    expect(comparableSnapshots(snapshot.holdings, [], 'All Core Schemes')).toBe(false)
    expect(comparableSnapshots([{ scheme: 'A', isin: null }], [{ scheme: 'A', isin: 'INE040A01034' }], 'All Core Schemes')).toBe(false)
    expect(comparableSnapshots([{ scheme: 'A', isin: 'INE040A01034' }], [{ scheme: 'B', isin: 'INE040A01034' }], 'All Core Schemes')).toBe(false)
  })
})
