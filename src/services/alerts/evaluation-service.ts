import 'server-only'
import { assertSupabaseWritesAllowed } from '../../lib/supabase/mutation-safety'
import { corporateEvents, cooldownElapsed, indiaDate, ipoMilestone, priceEventKey, priceTypes } from '../../domain/watchlist/events'
import { alertMatches } from '../../domain/watchlist/alerts'
import type { PriceAlert } from '../../domain/watchlist/types'
import type { MarketQuote } from '../../domain/equity/types'
import { createSupabaseAdminClient } from '../../lib/supabase/admin'
import { getMarketDataProvider } from '../market-data/market-data-service'
import { getIndianMarketSession } from '../../domain/market/session'

// The new DB Row structure from V2 migration
type Row = {
  id: string
  user_id: string
  entity_type: 'STOCK' | 'IPO' | 'MUTUAL_FUND'
  instrument_key: string
  symbol: string
  exchange: 'NSE' | 'BSE'
  company_name: string
  alert_type: string
  threshold: number | null
  status: 'active' | 'paused' | 'triggered' | 'expired' | 'disabled'
  created_at: string
  triggered_at: string | null
  trigger_count: number
  cooldown_until: string | null
  dedupe_key: string | null
  metadata: Record<string, unknown>
}

function getCooldownInterval(alertType: string): string | null {
  return priceTypes.has(alertType) ? '1 day' : null
}

function getNotificationMessage(alert: Row, quote?: MarketQuote): string {
  if (['price_above', 'price_below'].includes(alert.alert_type)) {
    return `${alert.symbol} has crossed your price threshold of ₹${alert.threshold}. Current price is ₹${quote?.price}.`
  }
  if (['percent_rise', 'percent_fall'].includes(alert.alert_type)) {
    return `${alert.symbol} has moved by ${alert.threshold}%.`
  }
  if (alert.alert_type.startsWith('event_')) {
    return `New event detected for ${alert.company_name}: ${alert.alert_type.replace('event_', '').replace('_', ' ')}`
  }
  if (alert.alert_type.startsWith('ipo_')) {
    return `IPO Reminder: ${alert.company_name} is now ${alert.alert_type.replace('ipo_', '')}.`
  }
  return `${alert.symbol} alert triggered: ${alert.alert_type.replace('_', ' ')}`
}

export async function evaluateCloudAlertsV2(userId?: string, now = new Date()) {
  assertSupabaseWritesAllowed()
  const session = getIndianMarketSession()
  const triggeredIds: string[] = []
  const quotes: MarketQuote[] = []
  
  // Evaluate only active rules whose cooldown has elapsed. Provider freshness gates price triggers.
  const db = createSupabaseAdminClient()
  if (!db) throw new Error('Cloud alert service is not configured.')
  
  let query = db.from('alerts')
    .select('*')
    .eq('status', 'active')
    .or(`cooldown_until.is.null,cooldown_until.lte.${now.toISOString()}`)
    .order('last_evaluated_at', { ascending: true, nullsFirst: true })
    .limit(userId ? 100 : 500)
    
  if (userId) query = query.eq('user_id', userId)
  
  const { data, error } = await query
  if (error) throw error
  const rows = ((data ?? []) as Row[]).filter(row => row.status === 'active' && (!userId || row.user_id === userId) && cooldownElapsed(row.cooldown_until, now))
  
  if (!rows.length) {
    return { checked: 0, triggered: 0, session, quotes, triggeredIds }
  }

  // 1. Group by entity_type
  const stockRows = rows.filter(r => r.entity_type === 'STOCK')
  const ipoRows = rows.filter(r => r.entity_type === 'IPO')
  // ... future mutual funds

  // 2. Fetch Stock Quotes
  const keys = [...new Set(stockRows.map(row => row.instrument_key))]
  for (let i = 0; i < keys.length; i += 50) {
    const result = await getMarketDataProvider().getQuotes(keys.slice(i, i + 50))
    if (!Array.isArray(result.data)) continue
    quotes.push(...result.data.filter(q => q && typeof q === 'object' && typeof q.instrumentKey === 'string'))
  }
  const byKey = new Map(quotes.map(q => [q.instrumentKey, q]))

  // 3. Evaluate Stock Alerts
  for (const row of stockRows) {
    const quote = byKey.get(row.instrument_key)
    
    // Evaluate Price Alerts
    if (['price_above', 'price_below', 'percent_rise', 'percent_fall', '52_week_high', '52_week_low'].includes(row.alert_type)) {
      if (!quote || quote.price === null) continue // Skip unavailable quotes to prevent false triggers
      
      const priceAlert: PriceAlert = { id: row.id, ownerId: row.user_id, instrumentKey: row.instrument_key, symbol: row.symbol, exchange: row.exchange, companyName: row.company_name, type: row.alert_type as PriceAlert['type'], threshold: row.threshold, status: 'active', createdAt: row.created_at, triggeredAt: row.triggered_at }
      if (!alertMatches(priceAlert, quote)) continue
      
      const dedupeKey = priceEventKey(row.id, now) // Dedupe daily per price alert
      const msg = getNotificationMessage(row, quote)
      const { data: claimed, error } = await db.rpc('trigger_alert_v2', { 
        alert_id: row.id,
        event_dedupe_key: dedupeKey,
        notification_title: `${row.symbol} Alert Triggered`,
        notification_msg: msg,
        cooldown_interval: getCooldownInterval(row.alert_type)
      })
      if (error) throw error
      if (claimed === true) triggeredIds.push(row.id)
    }
    
    // Evaluate Event Alerts (Corporate Actions)
    if (row.alert_type.startsWith('event_')) {
      const actionsResult = await getMarketDataProvider().getCorporateActions(row.instrument_key)
      const targetType = row.alert_type.replace('event_', '')
      const matchingAction = corporateEvents(row.instrument_key, actionsResult.data)
        .find(action => action.type === targetType && action.exDate >= indiaDate(now))
      if (!matchingAction) continue
      const dedupeKey = matchingAction.key

      const msg = `${row.symbol} announced a ${targetType} (Ex-Date: ${matchingAction.exDate})`
      
      const { data: claimed, error } = await db.rpc('trigger_alert_v2', { 
        alert_id: row.id,
        event_dedupe_key: dedupeKey,
        notification_title: `${row.symbol} Event: ${targetType.toUpperCase()}`,
        notification_msg: msg,
        cooldown_interval: null // null means don't set back to active, wait for manual reset or leave as triggered
      })
      if (error) throw error
      if (claimed === true) triggeredIds.push(row.id)
    }
  }

  // 5. Evaluate IPO Alerts
  if (ipoRows.length > 0) {
    const { data: activeIpos, error: ipoError } = await db.from('ipos').select('*').in('slug', ipoRows.map(r => r.instrument_key))
    if (ipoError) throw ipoError
    if (activeIpos) {
      for (const row of ipoRows) {
        const ipo = activeIpos.find(i => i.slug === row.instrument_key)
        if (!ipo) continue
        
        const milestone = ipoMilestone(row.instrument_key, row.alert_type, ipo, now)
        if (milestone) {
          const dedupeKey = milestone.key
          const msg = `IPO for ${row.company_name}: ${row.alert_type.replace('ipo_', '')} on ${milestone.date}.`
          const { data: claimed, error } = await db.rpc('trigger_alert_v2', { 
            alert_id: row.id,
            event_dedupe_key: dedupeKey,
            notification_title: `IPO Reminder: ${row.company_name}`,
            notification_msg: msg,
            cooldown_interval: null
          })
          if (error) throw error
          if (claimed === true) triggeredIds.push(row.id)
        }
      }
    }
  }

  // 6. Update last_evaluated_at
  if (rows.length) {
    let updated = db.from('alerts').update({ last_evaluated_at: now.toISOString() }).in('id', rows.map(row => row.id)).eq('status', 'active')
    if (userId) updated = updated.eq('user_id', userId)
    const { error } = await updated
    if (error) throw error
  }

  return { checked: rows.length, uniqueInstruments: keys.length, triggered: triggeredIds.length, session, quotes, triggeredIds }
}
