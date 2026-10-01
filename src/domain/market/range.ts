import type { HistoricalPrice } from '../equity/types'

export function includeSessionExtremes(range: { high: number | null; low: number | null }, session: { high: number | null; low: number | null; price: number | null }) {
  const valid = (value: number | null): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
  const highs = [session.high, session.price].filter(valid)
  const lows = [session.low, session.price].filter(valid)
  // A current quote can extend an established range, but cannot establish a year's history.
  return {
    high: valid(range.high) ? Math.max(range.high, ...highs) : null,
    low: valid(range.low) ? Math.min(range.low, ...lows) : null,
  }
}

export function derive52WeekStats(candles: HistoricalPrice[], minimumSessions = 200) {
  const valid = candles.filter((candle): candle is HistoricalPrice & { high: number; low: number } =>
    typeof candle.high === 'number' && Number.isFinite(candle.high) && typeof candle.low === 'number' && Number.isFinite(candle.low),
  )
  if (valid.length < minimumSessions) return { high: null, low: null }
  return { high: Math.max(...valid.map((candle) => candle.high)), low: Math.min(...valid.map((candle) => candle.low)) }
}
