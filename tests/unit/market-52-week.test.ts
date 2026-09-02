import { describe, expect, it } from 'vitest'
import { derive52WeekStats } from '../../src/domain/market/range'

const candle = (high: number, low: number) => ({ date: '2026-01-01', open: low, high, low, close: high, volume: 1 })

describe('52-week daily candle statistics', () => {
  it('uses real daily highs and lows when history is sufficient', () => {
    const candles = Array.from({ length: 200 }, (_, index) => candle(100 + index, 90 - index / 10))
    expect(derive52WeekStats(candles)).toEqual({ high: 299, low: 70.1 })
  })
  it('keeps values unavailable when history is insufficient', () => {
    expect(derive52WeekStats([candle(110, 90)])).toEqual({ high: null, low: null })
  })
})
