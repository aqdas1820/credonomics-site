'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Bell, Check, Plus } from 'lucide-react'
import type { TrackedInstrument, AlertType } from '../../src/domain/watchlist/types'
import { addItem, createAlert, createList } from '../../src/services/watchlist/local-repository'
import { useWorkspace } from '../../src/services/watchlist/use-workspace'
import styles from '../watchlist/watchlist.module.css'
export default function StockTrackerActions({ stock }: { stock: TrackedInstrument }) {
  const { state, scope, setScope, error, setError, busy, mutate, reload } = useWorkspace()
  const [showLists, setShowLists] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [type, setType] = useState<AlertType>('price_above')
  const [target, setTarget] = useState('')
  const needsTarget = !type.startsWith('52_week') && !type.startsWith('event_')
  const inAny = state?.watchlists.some(list => list.items.some(item => item.instrumentKey === stock.instrumentKey))
  const saveAlert = async () => {
    if (type.startsWith('event_') && scope !== 'cloud') { setError('Choose Cloud account and sign in to save event alerts.'); return }
    const threshold = needsTarget ? Number(target) : null
    if (needsTarget && (threshold === null || !Number.isFinite(threshold) || threshold <= 0)) { setError('Enter a positive alert target.'); return }
    if (await mutate(s => createAlert(s, { ...stock, type, threshold }), '/api/alerts', { method: 'POST', body: JSON.stringify({ ...stock, type, threshold }) })) setShowAlert(false)
  }
  return <section id="tracking" className={styles.panel} aria-label="Stock tracking actions">
    <div className={styles.form}><label>Workspace <select aria-label="Workspace" disabled={busy} value={scope} onChange={e => setScope(e.target.value as 'device' | 'cloud')}><option value="device">This device</option><option value="cloud">Cloud account</option></select></label>{scope === 'cloud' && <Link href="/account">Account / sign in</Link>}</div>
    <p className={styles.muted}>{scope === 'device' ? 'Saved on this device. Device alerts are evaluated when you open Alerts.' : 'Saved to your signed-in account.'} Percentage moves use the session previous close.</p>
    {error && <p role="alert">{error} <button onClick={reload}>Retry</button></p>}
    <fieldset disabled={busy || !state} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <div className={styles.form}>
        <button className={styles.button} aria-expanded={showLists} onClick={() => setShowLists(!showLists)}>{inAny ? <><Check size={16}/> In Watchlist</> : <><Plus size={16}/> Add to Watchlist</>}</button>
        <button className={styles.button} aria-expanded={showAlert} onClick={() => setShowAlert(!showAlert)}><Bell size={16}/> Set Alert</button>
      </div>
      {showLists && <div className={styles.form}>{state?.watchlists.map(list => <button key={list.id} className={styles.button} onClick={() => { if (list.items.length >= 50) { setError('This watchlist has reached its 50-stock limit.'); return } void mutate(s => addItem(s, list.id, stock), `/api/watchlists/${list.id}/items`, { method: 'POST', body: JSON.stringify(stock) }) }}>{list.name}</button>)}<button className={styles.button} onClick={() => { const name = prompt('Watchlist name')?.trim().slice(0, 40); if (name) void mutate(s => createList(s, name), '/api/watchlists', { method: 'POST', body: JSON.stringify({ name }) }) }}>+ New</button></div>}
      {showAlert && <div className={styles.form}><select aria-label="Alert type" value={type} onChange={e => setType(e.target.value as AlertType)}><option value="price_above">Price above</option><option value="price_below">Price below</option><option value="percent_rise">Percentage rise</option><option value="percent_fall">Percentage fall</option><option value="52_week_high">52-week high</option><option value="52_week_low">52-week low</option><optgroup label="Events"><option value="event_dividend">Dividend</option><option value="event_earnings">Earnings</option><option value="event_bonus">Bonus</option><option value="event_split">Split</option><option value="event_rights">Rights</option><option value="event_buyback">Buyback</option></optgroup></select>{(needsTarget && !type.startsWith('event_')) && <input aria-label="Alert target" type="number" min="0.01" step="0.01" value={target} onChange={e => setTarget(e.target.value)} placeholder="Target"/>}<button className={styles.button} onClick={saveAlert}>Create Alert</button></div>}
    </fieldset>
  </section>
}
