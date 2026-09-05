'use client'
import Link from 'next/link'; import { Bell, RefreshCw, Trash2 } from 'lucide-react'; import { useEffect, useState, useCallback } from 'react'; import type { IndianEquityIdentity, MarketQuote } from '../../src/domain/equity/types'; import type { Watchlist } from '../../src/domain/watchlist/types'; import { formatINR, formatPercent } from '../../src/lib/financial-format'; import { marketSessionLabel } from '../../src/domain/market/session'; import styles from './watchlist.module.css'
import { createSupabaseBrowserClient } from '../../src/lib/supabase/browser'
import AuthModal from '../components/AuthModal'

export default function WatchlistClient() {
  const [watchlists, setWatchlists] = useState<Watchlist[] | null>(null);
  const [listId, setListId] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IndianEquityIdentity[]>([]);
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [session, setSession] = useState<'PRE_OPEN'|'OPEN'|'CLOSED'|'HOLIDAY'>('CLOSED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  type ApiWatchlist = { id: string; name: string; position: number; created_at: string; watchlist_items: Array<{ instrument_key: string; symbol: string; exchange: 'NSE' | 'BSE'; company_name: string; created_at: string }> };

  useEffect(() => {
    fetch('/api/watchlists')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          const mapped = res.data.map((w: ApiWatchlist) => ({
            id: w.id,
            ownerId: 'cloud',
            name: w.name,
            order: w.position,
            createdAt: w.created_at,
            items: (w.watchlist_items ?? []).map((i: ApiWatchlist['watchlist_items'][0]) => ({
              instrumentKey: i.instrument_key,
              symbol: i.symbol,
              exchange: i.exchange,
              companyName: i.company_name,
              addedAt: i.created_at
            }))
          }));
          setWatchlists(mapped);
          if (mapped.length > 0) setListId(mapped[0].id);
        } else if (res.error) {
          setError(res.error.message);
        }
      })
      .catch(() => setError('Failed to load watchlists.'));
  }, []);

  const list = watchlists?.find(x => x.id === listId) ?? watchlists?.[0];

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const timer = setTimeout(() => fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`).then(r => r.json()).then(x => setResults(x.results ?? [])), 250);
    return () => clearTimeout(timer)
  }, [query]);

  const refresh = useCallback(async () => {
    if (!list?.items.length) return;
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/watchlist/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instrumentKeys: list.items.map(x => x.instrumentKey) }) });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error?.message);
      setQuotes(Object.fromEntries((x.data ?? []).map((q: MarketQuote) => [q.instrumentKey, q])));
      setSession(x.marketSession)
    } catch (err) { setError((err as Error).message || 'Quotes unavailable.') } finally { setLoading(false) }
  }, [list?.items]);
  
  useEffect(() => { void refresh() }, [list?.id, list?.items.length, refresh]);

  const mutateWatchlist = async (action: () => Promise<Response>, optimisticUpdate: (prev: Watchlist[]) => Watchlist[]) => {
    if (!watchlists) return;
    const prev = [...watchlists];
    setWatchlists(optimisticUpdate(prev));
    try {
      const r = await action();
      if (!r.ok) throw new Error();
    } catch {
      setWatchlists(prev);
      setToast('Action failed. Rolled back.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const createNewList = () => {
    if (!user) return setIsAuthOpen(true);
    const name = prompt('New watchlist name');
    if (!name || !watchlists) return;
    const tempId = `temp-${Date.now()}`;
    const newList: Watchlist = { id: tempId, name, ownerId: 'cloud', order: watchlists.length, createdAt: new Date().toISOString(), items: [] };
    
    mutateWatchlist(
      () => fetch('/api/watchlists', { method: 'POST', body: JSON.stringify({ name }) }),
      (prev) => {
        const next = [...prev, newList];
        setListId(tempId);
        return next;
      }
    ).then(() => {
      // Refresh to get real IDs
      fetch('/api/watchlists').then(r => r.json()).then(res => {
        if (res.data) {
          const mapped = res.data.map((w: ApiWatchlist) => ({ id: w.id, ownerId: 'cloud', name: w.name, order: w.position, createdAt: w.created_at, items: (w.watchlist_items ?? []).map((i: ApiWatchlist['watchlist_items'][0]) => ({ instrumentKey: i.instrument_key, symbol: i.symbol, exchange: i.exchange, companyName: i.company_name, addedAt: i.created_at })) }));
          setWatchlists(mapped);
          const created = mapped.find((x: Watchlist) => x.name === name);
          if (created) setListId(created.id);
        }
      });
    });
  };

  const renameList = () => {
    if (!user) return setIsAuthOpen(true);
    if (!watchlists || !list) return;
    const name = prompt('Rename watchlist', list.name);
    if (!name) return;
    mutateWatchlist(
      () => fetch(`/api/watchlists/${list.id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
      (prev) => prev.map(x => x.id === list.id ? { ...x, name: name.trim().slice(0, 40) } : x)
    );
  };

  const deleteList = () => {
    if (!user) return setIsAuthOpen(true);
    if (!watchlists || !list) return;
    mutateWatchlist(
      () => fetch(`/api/watchlists/${list.id}`, { method: 'DELETE' }),
      (prev) => {
        const next = prev.filter(x => x.id !== list.id);
        if (next.length > 0) setListId(next[0].id);
        return next;
      }
    );
  };

  const addItem = (stock: IndianEquityIdentity) => {
    if (!user) return setIsAuthOpen(true);
    if (!watchlists || !list) return;
    const exists = list.items.some(x => x.instrumentKey === stock.instrumentKey);
    if (exists) return;
    const newItem = { instrumentKey: stock.instrumentKey, symbol: stock.symbol, exchange: stock.exchange, companyName: stock.companyName, addedAt: new Date().toISOString() };
    mutateWatchlist(
      () => fetch(`/api/watchlists/${list.id}/items`, { method: 'POST', body: JSON.stringify({ instrumentKey: stock.instrumentKey, symbol: stock.symbol, exchange: stock.exchange, companyName: stock.companyName }) }),
      (prev) => prev.map(x => x.id === list.id ? { ...x, items: [...x.items, newItem] } : x)
    );
    setQuery('');
    setResults([]);
  };

  const removeItemOpt = (instrumentKey: string) => {
    if (!user) return setIsAuthOpen(true);
    if (!watchlists || !list) return;
    mutateWatchlist(
      () => fetch(`/api/watchlists/${list.id}/items?instrument_key=${encodeURIComponent(instrumentKey)}`, { method: 'DELETE' }),
      (prev) => prev.map(x => x.id === list.id ? { ...x, items: x.items.filter(i => i.instrumentKey !== instrumentKey) } : x)
    );
  };

  return <main className={styles.page}>
    <header className={styles.hero}><div><span>Personal market workspace</span><h1>Watchlist</h1><p>Latest verified quotes through CredoNomics market infrastructure.</p></div><Link className={styles.button} href="/alerts"><Bell size={16}/> Alerts</Link></header>
    
    <div className={styles.toolbar}>
      <select aria-label="Watchlist" value={list?.id ?? ''} onChange={e => setListId(e.target.value)}>{watchlists?.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <button className={`${styles.button} ${styles.secondary}`} onClick={createNewList}>+ New Watchlist</button>
      <button className={`${styles.button} ${styles.secondary}`} onClick={renameList}>Rename</button>
      {watchlists && watchlists.length > 1 ? <button className={`${styles.button} ${styles.danger}`} onClick={deleteList}>Delete</button> : null}
    </div>
    
    <div className={styles.toolbar}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search stocks by company, symbol, ISIN or BSE code" />
      <button className={`${styles.button} ${styles.secondary}`} onClick={refresh}><RefreshCw size={16}/> Retry</button>
    </div>
    
    {results.length ? <div className={styles.searchResults}>{results.map(stock => <button key={stock.instrumentKey} onClick={() => addItem(stock)}><span><strong>{stock.symbol}</strong><small>{stock.companyName}</small></span><span>{stock.exchange}</span></button>)}</div> : null}
    
    <div className={styles.market}><i className={styles.dot}/>{marketSessionLabel(session)}</div>
    {toast && <div className={styles.toast} style={{ background: '#ff4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>{toast}</div>}
    {error ? <div className={styles.empty} role="alert">{error}</div> : null}
    
    {loading ? <div className={styles.rows}><div className={styles.skeleton}/><div className={styles.skeleton}/></div> : list?.items.length ? <div className={styles.rows}>{list.items.map(item => {
      const q = quotes[item.instrumentKey];
      return <article className={styles.row} key={item.instrumentKey}>
        <div><Link href={`/stocks/${item.exchange.toLowerCase()}/${item.symbol}`}><strong>{item.symbol}</strong><small>{item.companyName} · {item.exchange}</small></Link></div>
        <div><small>LTP</small><strong>{formatINR(q?.price, 'N/A')}</strong></div>
        <div className={(q?.change ?? 0) >= 0 ? styles.positive : styles.negative}><small>Change</small><strong>{q?.change === null || !q ? 'N/A' : `${formatINR(q.change)} · ${formatPercent(q.changePercent)}`}</strong></div>
        <div><small>Day range</small><strong>{q?.low === null || q?.high === null || !q ? 'N/A' : `${formatINR(q.low)} – ${formatINR(q.high)}`}</strong></div>
        <div><small>52-week range</small><strong>{q?.fiftyTwoWeekLow === null || q?.fiftyTwoWeekHigh === null || !q ? 'N/A' : `${formatINR(q.fiftyTwoWeekLow)} – ${formatINR(q.fiftyTwoWeekHigh)}`}</strong></div>
        <div className={styles.actions}>
          <Link className={styles.iconButton} href={`/alerts?instrument=${encodeURIComponent(item.instrumentKey)}`} aria-label={`Set ${item.symbol} alert`}><Bell size={16}/></Link>
          <button className={`${styles.iconButton} ${styles.danger}`} aria-label={`Remove ${item.symbol}`} onClick={() => removeItemOpt(item.instrumentKey)}><Trash2 size={16}/></button>
        </div>
      </article>
    })}</div> : <div className={styles.empty}><h2>No stocks in this watchlist yet.</h2><p>Search for a stock to start tracking.</p></div>}
    
    <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
  </main>
}
