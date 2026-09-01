import { describe, expect, it } from 'vitest'
import { formatIpoDate, formatSubscription } from '../../app/ipo/lib/format'

describe('IPO presentation formatting', () => {
  it('formats subscription multiples consistently', () => {
    expect(formatSubscription(undefined)).toBe('—')
    expect(formatSubscription(0.1549224095946519)).toBe('0.15×')
    expect(formatSubscription(3.899283928)).toBe('3.90×')
    expect(formatSubscription(57.6323887587)).toBe('57.63×')
    expect(formatSubscription('65.47×')).toBe('65.47×')
  })

  it('formats IPO dates for readers', () => {
    expect(formatIpoDate('2026-08-31')).toBe('31 Aug 2026')
    expect(formatIpoDate('2026-09-02')).toBe('2 Sep 2026')
  })
})
