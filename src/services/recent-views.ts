import type { IndianEquityIdentity } from '../domain/equity/types'

const KEY = 'credonomics_recent_views'
const MAX = 5

export function getRecentViews(): IndianEquityIdentity[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function addRecentView(stock: IndianEquityIdentity) {
  if (typeof window === 'undefined') return
  try {
    const current = getRecentViews()
    const existing = current.findIndex(s => s.instrumentKey === stock.instrumentKey)
    if (existing >= 0) {
      current.splice(existing, 1)
    }
    current.unshift({
        instrumentKey: stock.instrumentKey,
        symbol: stock.symbol,
        exchange: stock.exchange,
        companyName: stock.companyName,
        sector: stock.sector
    })
    if (current.length > MAX) {
      current.pop()
    }
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // Ignore storage errors
  }
}
