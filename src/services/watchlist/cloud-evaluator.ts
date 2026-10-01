import 'server-only'
import { assertSupabaseWritesAllowed } from '../../lib/supabase/mutation-safety'
import { alertMatches } from '../../domain/watchlist/alerts'
import type { PriceAlert } from '../../domain/watchlist/types'
import type { MarketQuote } from '../../domain/equity/types'
import { createSupabaseAdminClient } from '../../lib/supabase/admin'
import { getMarketDataProvider } from '../market-data/market-data-service'
import { getIndianMarketSession } from '../../domain/market/session'
type Row = { id: string; user_id: string; instrument_key: string; symbol: string; exchange: 'NSE' | 'BSE'; company_name: string; alert_type: PriceAlert['type']; threshold: number | null; status: PriceAlert['status']; created_at: string; triggered_at: string | null }
export async function evaluateCloudAlerts(userId?: string) {
  assertSupabaseWritesAllowed()
  const session = getIndianMarketSession()
  const triggeredIds: string[] = []
  const quotes: MarketQuote[] = []
  if (!userId && session !== 'OPEN') return { checked: 0, triggered: 0, session, quotes, triggeredIds }
  const db = createSupabaseAdminClient()
  if (!db) throw new Error('Cloud alert service is not configured.')
  let query = db.from('alerts').select('*').eq('status', 'active').order('last_evaluated_at', { ascending: true, nullsFirst: true }).limit(userId ? 100 : 500)
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) throw error
  const rows = (data ?? []) as Row[]
  const keys = [...new Set(rows.map(row => row.instrument_key))]
  for (let i = 0; i < keys.length; i += 50) {
    const result = await getMarketDataProvider().getQuotes(keys.slice(i, i + 50))
    if (!result.data) throw new Error('Market data unavailable.')
    quotes.push(...result.data)
  }
  const byKey = new Map(quotes.map(q => [q.instrumentKey, q]))
  for (const row of rows) {
    const quote = byKey.get(row.instrument_key)
    const alert: PriceAlert = { id: row.id, ownerId: row.user_id, instrumentKey: row.instrument_key, symbol: row.symbol, exchange: row.exchange, companyName: row.company_name, type: row.alert_type, threshold: row.threshold, status: row.status, createdAt: row.created_at, triggeredAt: row.triggered_at }
    if (!quote || !alertMatches(alert, quote)) continue
    // The RPC claims and notifies in one transaction, preventing duplicate/lost notifications.
    const { data: claimed, error } = await db.rpc('trigger_price_alert', { alert_id: row.id })
    if (error) throw error
    if (claimed) triggeredIds.push(row.id)
  }
  if (rows.length) {
    const { error } = await db.from('alerts').update({ last_evaluated_at: new Date().toISOString() }).in('id', rows.map(row => row.id)).eq('status', 'active')
    if (error) throw error
  }
  return { checked: rows.length, uniqueInstruments: keys.length, triggered: triggeredIds.length, session, quotes, triggeredIds }
}
