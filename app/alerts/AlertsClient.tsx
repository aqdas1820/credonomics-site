'use client'
import DataFreshness from '../components/DataFreshness'
import Link from 'next/link'
import { Pause, Play, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MarketQuote } from '../../src/domain/equity/types'
import type { AlertStatus, PriceAlert } from '../../src/domain/watchlist/types'
import { formatINR, formatPercent } from '../../src/lib/financial-format'
import { useWorkspace } from '../../src/services/watchlist/use-workspace'
import { loadWatchlistState, saveWatchlistState, notificationFor } from '../../src/services/watchlist/local-repository'
import { fetchJson } from '../../src/lib/client-json'
import styles from '../watchlist/watchlist.module.css'
const labels = { price_above: 'Price above', price_below: 'Price below', percent_rise: 'Percentage rise', percent_fall: 'Percentage fall', '52_week_high': '52-week high', '52_week_low': '52-week low', volume_spike: 'Volume spike', event_dividend: 'Dividend', event_earnings: 'Earnings', event_bonus: 'Bonus', event_split: 'Split', event_rights: 'Rights', event_buyback: 'Buyback' }
export default function AlertsClient() {
  const { state, scope, setScope, error, setError, busy, mutate, reload } = useWorkspace()
  const alerts = state?.alerts
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({})
  const [tab, setTab] = useState<AlertStatus>('active')
  const [evaluating, setEvaluating] = useState(false)
  const evaluationLock = useRef(false)
  const initialEvaluation = useRef('')
  const evaluate = async () => {
    if (evaluationLock.current || !alerts) return
    const active = alerts.filter(a => a.status === 'active')
    if (!active.length) return
    evaluationLock.current = true; setEvaluating(true); setError(''); setQuotes({})
    try {
      const result = await fetchJson<{ data: { quotes: MarketQuote[]; triggeredIds: string[] } }>(`/api/alerts/evaluate${scope === 'cloud' ? '?scope=cloud' : ''}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alerts: active })
      })
      setQuotes(Object.fromEntries((result.data.quotes ?? []).map(q => [q.instrumentKey, q])))
      const hits = new Set(result.data.triggeredIds)
      if (scope === 'device' && hits.size) {
        const current = loadWatchlistState()
        const triggered = current.alerts.filter(a => hits.has(a.id) && a.status === 'active')
        const now = new Date().toISOString()
        saveWatchlistState({ ...current, alerts: current.alerts.map(a => hits.has(a.id) && a.status === 'active' ? { ...a, status: 'triggered', triggeredAt: now } : a), notifications: [...triggered.map(a => notificationFor(a, `${a.symbol} reached its alert condition.`)), ...current.notifications] })
      } else if (scope === 'cloud' && hits.size) reload()
    } catch (error) { setError(error instanceof Error ? error.message : 'Alert evaluation unavailable.') }
    finally { evaluationLock.current = false; setEvaluating(false) }
  }
  // Evaluate once per loaded workspace; explicit re-evaluation is available below.
  useEffect(() => {
    if (state && initialEvaluation.current !== scope) {
      initialEvaluation.current = scope
      void evaluate()
    }
  })
  const update = async (id: string, patch: Partial<PriceAlert>) => {
    await mutate(s => ({ ...s, alerts: s.alerts.map(a => a.id === id ? { ...a, ...patch } : a) }), `/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify(patch.triggeredAt === null ? { rearm: true } : { status: patch.status }) })
  }
  const deleteAlert = async (id: string) => {
    await mutate(s => ({ ...s, alerts: s.alerts.filter(a => a.id !== id) }), `/api/alerts/${id}`, { method: 'DELETE' })
  }
  const rows = alerts?.filter(a => a.status === tab) ?? []
  return <main className={styles.page}>
    <header className={styles.hero}><div><span>Personal notification rules</span><h1>Alerts</h1><p>Conditions are evaluated securely in the background and trigger only once when the target is reached.</p></div><Link className={styles.button} href="/watchlist">Watchlist</Link></header>
    
    <div className={styles.toolbar}><label>Workspace <select aria-label="Workspace" value={scope} disabled={busy || evaluating} onChange={e => setScope(e.target.value as 'device' | 'cloud')}><option value="device">This device</option><option value="cloud">Cloud account</option></select></label>{scope === 'cloud' && <Link href="/account">Account / sign in</Link>}<button onClick={reload}>Reload</button></div>
    {!state && !error && <p role="status">Loading alerts...</p>}
    <fieldset disabled={busy || evaluating || !state} style={{border:0,padding:0,margin:0,minWidth:0}}>
    <div className={styles.tabs}>
      {(['active', 'triggered', 'paused'] as AlertStatus[]).map(x => <button key={x} className={`${styles.button} ${tab === x ? '' : styles.secondary}`} onClick={() => setTab(x)}>{x[0]!.toUpperCase() + x.slice(1)}</button>)}
      <button className={`${styles.button} ${styles.secondary}`} onClick={evaluate}>Evaluate now</button>
    </div>
    
    {error ? <div className={styles.empty} role="alert">{error}</div> : null}
    
    <div className={styles.rows}>
      {rows.length ? rows.map(a => {
        const q = quotes[a.instrumentKey];
        const target = a.type.startsWith('event_') ? 'Event detected' : a.threshold === null ? 'Automatic' : a.type.includes('percent') ? formatPercent(a.threshold) : formatINR(a.threshold);
        return <article className={`${styles.row} ${styles.alertRow}`} key={a.id}>
          <div><Link href={`/stocks/${a.exchange.toLowerCase()}/${a.symbol}`}><strong>{a.symbol}</strong><small>{a.companyName}</small></Link></div>
          <div><span className={styles.badge}>{labels[a.type as keyof typeof labels] || 'Alert'}</span><small>Target {target}</small></div>
          <div><small>Current</small><strong>{q ? formatINR(q.price, 'N/A') : 'N/A'}</strong>{q ? <DataFreshness metadata={q} /> : null}</div>
          <div><small>Created</small><strong>{new Date(a.createdAt).toLocaleDateString('en-IN')}</strong>{a.triggeredAt ? <small>Triggered {new Date(a.triggeredAt).toLocaleString('en-IN')}</small> : null}</div>
          <div className={styles.actions}>
            {a.status === 'triggered' ? <button className={styles.iconButton} aria-label="Re-arm alert" onClick={() => update(a.id, { status: 'active', triggeredAt: null })}><RotateCcw size={16} /></button> : <button className={styles.iconButton} aria-label={a.status === 'paused' ? 'Enable alert' : 'Pause alert'} onClick={() => update(a.id, { status: a.status === 'paused' ? 'active' : 'paused' })}>{a.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}</button>}
            <button className={`${styles.iconButton} ${styles.danger}`} aria-label="Delete alert" onClick={() => deleteAlert(a.id)}><Trash2 size={16} /></button>
          </div>
        </article>
      }) : <div className={styles.empty}><h2>No {tab} alerts.</h2><p>Create an alert from any stock page.</p><Link href="/markets" className={styles.button}>Explore Markets</Link></div>}
    </div>
    
    </fieldset>
  </main>
}
