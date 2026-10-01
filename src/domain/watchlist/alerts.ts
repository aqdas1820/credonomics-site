import type { MarketQuote } from '../equity/types'
import type { PriceAlert } from './types'

export function alertMatches(alert: PriceAlert, quote: MarketQuote) {
  if (!quote || typeof quote !== 'object') return false
  if (alert.status !== 'active') return false
  if (quote.instrumentKey !== alert.instrumentKey || !['live', 'recent', 'delayed'].includes(quote.availability) || quote.isStale === true) return false
  if (typeof quote.price !== 'number' || !Number.isFinite(quote.price) || quote.price <= 0) return false
  if (['price_above', 'price_below', 'percent_rise', 'percent_fall'].includes(alert.type) && (typeof alert.threshold !== 'number' || !Number.isFinite(alert.threshold) || alert.threshold <= 0)) return false
  if (alert.type.startsWith('percent_') && (typeof quote.changePercent !== 'number' || !Number.isFinite(quote.changePercent))) return false
  if (alert.type === '52_week_high' && (typeof quote.fiftyTwoWeekHigh !== 'number' || !Number.isFinite(quote.fiftyTwoWeekHigh) || quote.fiftyTwoWeekHigh <= 0)) return false
  if (alert.type === '52_week_low' && (typeof quote.fiftyTwoWeekLow !== 'number' || !Number.isFinite(quote.fiftyTwoWeekLow) || quote.fiftyTwoWeekLow <= 0)) return false
  if (alert.type === 'price_above') return alert.threshold !== null && quote.price !== null && quote.price >= alert.threshold
  if (alert.type === 'price_below') return alert.threshold !== null && quote.price !== null && quote.price <= alert.threshold
  if (alert.type === 'percent_rise') return alert.threshold !== null && quote.changePercent !== null && quote.changePercent >= alert.threshold
  if (alert.type === 'percent_fall') return alert.threshold !== null && quote.changePercent !== null && quote.changePercent <= -Math.abs(alert.threshold)
  if (alert.type === '52_week_high') return quote.price !== null && quote.fiftyTwoWeekHigh !== null && quote.price >= quote.fiftyTwoWeekHigh
  if (alert.type === '52_week_low') return quote.price !== null && quote.fiftyTwoWeekLow !== null && quote.price <= quote.fiftyTwoWeekLow
  return false
}
