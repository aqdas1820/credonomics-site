'use client'
import DataFreshness from '../components/DataFreshness'
import Link from 'next/link'
import { Bell, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import type { IndianEquityIdentity, MarketQuote } from '../../src/domain/equity/types'
import { formatINR, formatPercent } from '../../src/lib/financial-format'
import { marketSessionLabel, type IndianMarketSession } from '../../src/domain/market/session'
import { useWorkspace } from '../../src/services/watchlist/use-workspace'
import { addItem as addLocalItem, removeItem, createList } from '../../src/services/watchlist/local-repository'
import { fetchJson } from '../../src/lib/client-json'
import styles from './watchlist.module.css'

export default function WatchlistClient() {
  const { state, scope, setScope, error, setError, busy, mutate, reload } = useWorkspace()
  const watchlists = state?.watchlists
  const [listId, setListId] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<IndianEquityIdentity[]>([])
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({})
  const [session, setSession] = useState<IndianMarketSession>('CLOSED')
  const [loading, setLoading] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const quoteRequest = useRef(0)
  const list = watchlists?.find(x => x.id === listId) ?? watchlists?.[0]
  const keys = list?.items.map(x => x.instrumentKey).join(',') ?? ''
  const refresh = () => { reload(); setRefreshCount(x => x + 1) }
  useEffect(() => {
    const controller = new AbortController()
    setResults([])
    if (query.trim().length < 2) return
    const timer = setTimeout(() => {
      fetchJson<{ results: IndianEquityIdentity[] }>(`/api/stocks/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(x => { if (!controller.signal.aborted) setResults(x.results ?? []) })
        .catch(() => { if (!controller.signal.aborted) setError('Stock search is unavailable. Please try again.') })
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, setError])
  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++quoteRequest.current
    setQuotes({})
    if (!keys) { setLoading(false); return }
    setLoading(true)
    fetchJson<{ data: MarketQuote[]; marketSession: IndianMarketSession }>('/api/watchlist/quotes', {
      method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instrumentKeys: keys.split(',') })
    }).then(x => { if (requestId === quoteRequest.current && !controller.signal.aborted) { setQuotes(Object.fromEntries((x.data ?? []).map(q => [q.instrumentKey, q]))); setSession(x.marketSession) } })
      .catch(() => { if (!controller.signal.aborted) setError('Quotes are temporarily unavailable. Please retry.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [keys, refreshCount, setError])
  const createNewList = async () => {
    const name = prompt('New watchlist name')?.trim().slice(0, 40)
    if (!name) return
    await mutate(s => createList(s, name), '/api/watchlists', { method: 'POST', body: JSON.stringify({ name }) })
  }
  const renameList = async () => {
    if (!list) return
    const name = prompt('Rename watchlist', list.name)?.trim().slice(0, 40)
    if (!name) return
    await mutate(s => ({ ...s, watchlists: s.watchlists.map(x => x.id === list.id ? { ...x, name } : x) }), `/api/watchlists/${list.id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
  }
  const deleteList = async () => {
    if (!list) return
    await mutate(s => ({ ...s, watchlists: s.watchlists.filter(x => x.id !== list.id) }), `/api/watchlists/${list.id}`, { method: 'DELETE' })
  }
  const addItem = async (stock: IndianEquityIdentity) => {
    if (!list) return
    if (list.items.length >= 50) { setError('A watchlist supports up to 50 stocks. Create another list to track more.'); return }
    if (await mutate(s => addLocalItem(s, list.id, stock), `/api/watchlists/${list.id}/items`, { method: 'POST', body: JSON.stringify(stock) })) { setQuery(''); setResults([]) }
  }
  const removeItemOpt = async (key: string) => {
    if (!list) return
    await mutate(s => removeItem(s, list.id, key), `/api/watchlists/${list.id}/items?instrumentKey=${encodeURIComponent(key)}`, { method: 'DELETE' })
  }
  return <main className={styles.page}>
    <header className={styles.hero}><div><span>Personal market workspace</span><h1>Watchlist</h1><p>Latest verified quotes through CredoNomics market infrastructure.</p></div><Link className={styles.button} href="/alerts"><Bell size={16}/> Alerts</Link></header>
    
    <div className={styles.toolbar}><label>Workspace <select aria-label="Workspace" value={scope} disabled={busy} onChange={e => setScope(e.target.value as 'device' | 'cloud')}><option value="device">This device</option><option value="cloud">Cloud account</option></select></label>{scope === 'cloud' && <Link href="/account">Account / sign in</Link>}</div>
    {!state && !error && <p role="status">Loading watchlists...</p>}
    <fieldset disabled={busy || !state} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
    <div className={styles.toolbar}>
      <select aria-label="Watchlist" value={list?.id ?? ''} onChange={e => setListId(e.target.value)}>{watchlists?.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <button className={`${styles.button} ${styles.secondary}`} onClick={createNewList}>+ New Watchlist</button>
      <button className={`${styles.button} ${styles.secondary}`} onClick={renameList}>Rename</button>
      {watchlists && watchlists.length > 1 ? <button className={`${styles.button} ${styles.danger}`} onClick={deleteList}>Delete</button> : null}
    </div>
    
    <div className={styles.toolbar}>
      <input aria-label="Search stocks" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search stocks by company, symbol, ISIN or BSE code" />
      <button className={`${styles.button} ${styles.secondary}`} onClick={refresh}><RefreshCw size={16}/> Retry</button>
    </div>
    
    {results.length ? <div className={styles.searchResults}>{results.map(stock => <button key={stock.instrumentKey} onClick={() => addItem(stock)}><span><strong>{stock.symbol}</strong><small>{stock.companyName}</small></span><span>{stock.exchange}</span></button>)}</div> : null}
    
    <div className={styles.market}><i className={styles.dot}/>{marketSessionLabel(session)}</div>
    {error ? <div className={styles.empty} role="alert">{error}</div> : null}
    
    {loading ? <div className={styles.rows}><div className={styles.skeleton}/><div className={styles.skeleton}/></div> : list?.items.length ? <div className={styles.rows}>{list.items.map(item => {
      const q = quotes[item.instrumentKey];
      return <article className={styles.row} key={item.instrumentKey}>
        <div><Link href={`/stocks/${item.exchange.toLowerCase()}/${item.symbol}`}><strong>{item.symbol}</strong><small>{item.companyName} · {item.exchange}</small></Link></div>
        <div><small>LTP</small><strong>{formatINR(q?.price, 'N/A')}</strong>{q ? <DataFreshness metadata={q} /> : null}</div>
        <div className={(q?.change ?? 0) >= 0 ? styles.positive : styles.negative}><small>Change</small><strong>{q?.change === null || !q ? 'N/A' : `${formatINR(q.change)} · ${formatPercent(q.changePercent)}`}</strong></div>
        <div><small>Day range</small><strong>{q?.low === null || q?.high === null || !q ? 'N/A' : `${formatINR(q.low)} – ${formatINR(q.high)}`}</strong></div>
        <div><small>52-week range</small><strong>{q?.fiftyTwoWeekLow === null || q?.fiftyTwoWeekHigh === null || !q ? 'N/A' : `${formatINR(q.fiftyTwoWeekLow)} – ${formatINR(q.fiftyTwoWeekHigh)}`}</strong></div>
        <div className={styles.actions}>
          <Link className={styles.iconButton} href={`/stocks/${item.exchange.toLowerCase()}/${encodeURIComponent(item.symbol)}#tracking`} aria-label={`Set ${item.symbol} alert`}><Bell size={16}/></Link>
          <button className={`${styles.iconButton} ${styles.danger}`} aria-label={`Remove ${item.symbol}`} onClick={() => removeItemOpt(item.instrumentKey)}><Trash2 size={16}/></button>
        </div>
      </article>
    })}</div> : <div className={styles.empty}><h2>No stocks in this watchlist yet.</h2><p>Search for a stock to start tracking.</p></div>}
    
    </fieldset>
  </main>
}
