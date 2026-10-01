import { describe, expect, it } from 'vitest'
import { derive52WeekStats, includeSessionExtremes } from '../../src/domain/market/range'

const candle = (high: number, low: number) => ({ date: '2026-01-01', open: low, high, low, close: high, volume: 1 })

describe('52-week daily candle statistics', () => {
  it('includes a new session low before daily history catches up', () => {
    expect(includeSessionExtremes({ high: 1611.8, low: 1210.5 }, { high: 1219.7, low: 1197, price: 1197.6 })).toEqual({ high: 1611.8, low: 1197 })
  })
  it('includes a new price high while retaining unavailable history', () => {
    expect(includeSessionExtremes({ high: 100, low: null }, { high: null, low: null, price: 110 })).toEqual({ high: 110, low: null })
    expect(includeSessionExtremes({ high: null, low: null }, { high: 120, low: 90, price: 110 })).toEqual({ high: null, low: null })
  })
  it('does not replace established ranges with missing or invalid quote values', () => {
    expect(includeSessionExtremes({ high: 120, low: 90 }, { high: Infinity, low: 0, price: NaN })).toEqual({ high: 120, low: 90 })
  })
  it('uses real daily highs and lows when history is sufficient', () => {
    const candles = Array.from({ length: 200 }, (_, index) => candle(100 + index, 90 - index / 10))
    expect(derive52WeekStats(candles)).toEqual({ high: 299, low: 70.1 })
  })
  it('keeps values unavailable when history is insufficient', () => {
    expect(derive52WeekStats([candle(110, 90)])).toEqual({ high: null, low: null })
  })
})
