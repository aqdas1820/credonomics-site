import type { MarketQuote } from '../equity/types'
import type { PriceAlert } from './types'

export function alertMatches(alert: PriceAlert, quote: MarketQuote) {
  if (alert.status !== 'active') return false
  if (alert.type === 'price_above') return alert.threshold !== null && quote.price !== null && quote.price >= alert.threshold
  if (alert.type === 'price_below') return alert.threshold !== null && quote.price !== null && quote.price <= alert.threshold
  if (alert.type === 'percent_rise') return alert.threshold !== null && quote.changePercent !== null && quote.changePercent >= alert.threshold
  if (alert.type === 'percent_fall') return alert.threshold !== null && quote.changePercent !== null && quote.changePercent <= -Math.abs(alert.threshold)
  if (alert.type === '52_week_high') return quote.price !== null && quote.fiftyTwoWeekHigh !== null && quote.price >= quote.fiftyTwoWeekHigh
  if (alert.type === '52_week_low') return quote.price !== null && quote.fiftyTwoWeekLow !== null && quote.price <= quote.fiftyTwoWeekLow
  return false
}
