import type { HistoricalPrice } from '../equity/types'

export function derive52WeekStats(candles: HistoricalPrice[], minimumSessions = 200) {
  const valid = candles.filter((candle): candle is HistoricalPrice & { high: number; low: number } =>
    typeof candle.high === 'number' && Number.isFinite(candle.high) && typeof candle.low === 'number' && Number.isFinite(candle.low),
  )
  if (valid.length < minimumSessions) return { high: null, low: null }
  return { high: Math.max(...valid.map((candle) => candle.high)), low: Math.min(...valid.map((candle) => candle.low)) }
}
