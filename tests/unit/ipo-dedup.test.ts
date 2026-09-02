import { describe, expect, it, vi } from 'vitest'
import { deduplicatePublicIpos } from '../../app/data/ipo-dedup'
import type { PublicIpoRecord } from '../../app/data/ipo-types'

function record(overrides: Partial<PublicIpoRecord> & Pick<PublicIpoRecord, 'companyName' | 'symbol'>): PublicIpoRecord {
  return {
    slug: 'rays-of-belief-ltd-for-profit-social-enterprise-fpse-153100a',
    marketSegment: 'mainboard',
    status: 'open',
    issue: { openDate: '2026-09-01', closeDate: '2026-09-03', priceBandLow: 227, priceBandHigh: 239 },
    financials: [],
    sources: [{ label: 'NSE record', url: 'https://nse.example/MOMSBELIEF', checkedAt: '2026-09-02', sourceType: 'NSE' }],
    lastUpdated: '2026-09-02T03:22:48.233Z',
    providerUpdatedAt: '2026-09-02T03:22:48.233Z',
    normalizedAt: '2026-09-02T03:22:48.233Z',
    provider: 'nse',
    researchState: 'exchange-live',
    ...overrides,
  }
}

describe('canonical IPO deduplication', () => {
  it('merges MOMSBELIEF despite conflicting display names', () => {
    const staticRecord = record({ companyName: 'Rays of Belief Limited- For Profit Social Enterprise (FPSE)', symbol: 'MOMSBELIEF', subscription: { total: 0.77 }, estimatedIssueValueCr: 74.99 })
    const liveRecord = record({ exchangeId: 'upstox-123', isin: 'INE000000001', slug: 'live:upstox-123', companyName: 'Rays of Belief', symbol: 'MOMSBELIEF', issue: { openDate: '2026-09-01', closeDate: '2026-09-03', issueSizeCr: 125, priceBandLow: 227, priceBandHigh: 239 } })
    const result = deduplicatePublicIpos([liveRecord, staticRecord], false)
    expect(result).toHaveLength(1)
    expect(result[0]?.slug).toBe(staticRecord.slug)
    expect(result[0]?.subscription?.total).toBe(0.77)
    expect(result[0]?.issue.issueSizeCr).toBe(125)
  })

  it('does not deduplicate solely by display name and logs real conflicts server-side', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const first = record({ companyName: 'Example Limited', symbol: 'EXAMPLE', issue: { openDate: '2026-09-01', closeDate: '2026-09-03', issueSizeCr: 10 } })
    const otherIssue = record({ companyName: 'Example Limited', symbol: 'OTHER', issue: { openDate: '2026-10-01', closeDate: '2026-10-03', issueSizeCr: 20 } })
    expect(deduplicatePublicIpos([first, otherIssue])).toHaveLength(2)
    const conflict = record({ companyName: 'Example IPO', symbol: 'EXAMPLE', issue: { openDate: '2026-09-01', closeDate: '2026-09-03', issueSizeCr: 20 } })
    expect(deduplicatePublicIpos([first, conflict])).toHaveLength(1)
    expect(warning).toHaveBeenCalled()
    warning.mockRestore()
  })
})
