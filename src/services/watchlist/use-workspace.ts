'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { WatchlistState, Watchlist, PriceAlert } from '../../domain/watchlist/types'
import { loadWatchlistState, saveWatchlistState, WATCHLIST_EVENT } from './local-repository'
import { fetchJson } from '../../lib/client-json'
import { createSupabaseBrowserClient } from '../../lib/supabase/browser'

type ListRow = { id: string; name: string; position: number; created_at: string; watchlist_items: Array<{ instrument_key: string; symbol: string; exchange: 'NSE' | 'BSE'; company_name: string; created_at: string }> }
type AlertRow = { id: string; instrument_key: string; symbol: string; exchange: 'NSE' | 'BSE'; company_name: string; alert_type: PriceAlert['type']; threshold: number | null; status: PriceAlert['status']; created_at: string; triggered_at: string | null }

export function useWorkspace() {
  const [scope, setScope] = useState<'device' | 'cloud'>('device')
  const [state, setState] = useState<WatchlistState | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  const lock = useRef(false)
  const generation = useRef(0)
  const reload = useCallback(() => setRevision(x => x + 1), [])
  useEffect(() => {
    const client = createSupabaseBrowserClient()
    const subscription = client?.auth.onAuthStateChange(() => { if (scope === 'cloud') { setState(null); reload() } }).data.subscription
    return () => subscription?.unsubscribe()
  }, [scope, reload])
  useEffect(() => {
    const controller = new AbortController()
    generation.current++
    setError(''); setState(null)
    if (scope === 'device') {
      const sync = () => { try { setState(loadWatchlistState()) } catch { setError('Device storage is unavailable. Enable browser storage to save your workspace.') } }
      sync()
      window.addEventListener(WATCHLIST_EVENT, sync)
      window.addEventListener('storage', sync)
      return () => { window.removeEventListener(WATCHLIST_EVENT, sync); window.removeEventListener('storage', sync) }
    }
    Promise.all([
      fetchJson<{ data: ListRow[] }>('/api/watchlists', { signal: controller.signal }),
      fetchJson<{ data: AlertRow[] }>('/api/alerts', { signal: controller.signal })
    ]).then(([lists, alerts]) => {
      if (controller.signal.aborted) return
      const watchlists: Watchlist[] = lists.data.map(w => ({ id: w.id, name: w.name, ownerId: 'cloud', order: w.position, createdAt: w.created_at, items: (w.watchlist_items ?? []).map(i => ({ instrumentKey: i.instrument_key, symbol: i.symbol, exchange: i.exchange, companyName: i.company_name, addedAt: i.created_at })) }))
      setState({ version: 1, ownerId: 'cloud', watchlists, alerts: alerts.data.map(a => ({ id: a.id, ownerId: 'cloud', instrumentKey: a.instrument_key, symbol: a.symbol, exchange: a.exchange, companyName: a.company_name, type: a.alert_type, threshold: a.threshold, status: a.status, createdAt: a.created_at, triggeredAt: a.triggered_at })), notifications: [] })
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load workspace.') })
    return () => controller.abort()
  }, [scope, revision])

  const mutate = async (local: (current: WatchlistState) => WatchlistState, url: string, options: RequestInit) => {
    if (lock.current || !state) return false
    lock.current = true; setBusy(true); setError('')
    const currentGeneration = generation.current
    try {
      if (scope === 'device') {
        // Read current storage so other tabs and mounted widgets retain their changes.
        const next = local(loadWatchlistState())
        saveWatchlistState(next)
        setState(next)
      } else {
        await fetchJson(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
        if (currentGeneration === generation.current) reload()
      }
      return true
    } catch (error) {
      if (currentGeneration === generation.current) setError(error instanceof Error ? error.message : 'Unable to save changes. Please try again.')
      return false
    } finally { lock.current = false; setBusy(false) }
  }
  return { state, scope, setScope, error, setError, busy, mutate, reload }
}
