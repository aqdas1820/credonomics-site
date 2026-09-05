'use client'
import Link from 'next/link'; import { Pause, Play, RotateCcw, Trash2 } from 'lucide-react'; import { useEffect, useState, useCallback } from 'react'; import type { MarketQuote } from '../../src/domain/equity/types'; import type { AlertStatus, PriceAlert } from '../../src/domain/watchlist/types'; import { formatINR, formatPercent } from '../../src/lib/financial-format'; import styles from '../watchlist/watchlist.module.css';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/browser'
import AuthModal from '../components/AuthModal'

const labels = { price_above: 'Price above', price_below: 'Price below', percent_rise: 'Percentage rise', percent_fall: 'Percentage fall', '52_week_high': '52-week high', '52_week_low': '52-week low', volume_spike: 'Volume spike' };

export default function AlertsClient() {
  const [alerts, setAlerts] = useState<PriceAlert[] | null>(null);
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [tab, setTab] = useState<AlertStatus>('active');
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

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          const mapped = res.data.map((a: { id: string; instrument_key: string; symbol: string; exchange: string; company_name: string; alert_type: string; threshold: number; status: string; created_at: string; triggered_at: string }) => ({
            id: a.id, ownerId: 'cloud', instrumentKey: a.instrument_key,
            symbol: a.symbol, exchange: a.exchange, companyName: a.company_name,
            type: a.alert_type, threshold: a.threshold, status: a.status,
            createdAt: a.created_at, triggeredAt: a.triggered_at
          }));
          setAlerts(mapped);
        } else if (res.error) {
          setError(res.error.message);
        }
      })
      .catch(() => setError('Failed to load alerts.'));
  }, []);

  const mutateAlerts = async (action: () => Promise<Response>, optimisticUpdate: (prev: PriceAlert[]) => PriceAlert[]) => {
    if (!alerts) return;
    const prev = [...alerts];
    setAlerts(optimisticUpdate(prev));
    try {
      const r = await action();
      if (!r.ok) throw new Error();
    } catch {
      setAlerts(prev);
      setToast('Action failed. Rolled back.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const evaluate = useCallback(async () => {
    if (!alerts?.length) return;
    setError('');
    try {
      const active = alerts.filter(a => a.status === 'active');
      if (!active.length) return;
      const r = await fetch('/api/alerts/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alerts: active }) });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error?.message);
      const map = Object.fromEntries((x.data?.quotes ?? []).map((q: MarketQuote) => [q.instrumentKey, q]));
      setQuotes(map);
      const hit = new Set<string>(x.data?.triggeredIds ?? []);
      if (hit.size) {
        setAlerts(prev => prev ? prev.map(a => hit.has(a.id) ? { ...a, status: 'triggered', triggeredAt: new Date().toISOString() } : a) : null);
      }
    } catch (err) { setError((err as Error).message) }
  }, [alerts]);

  useEffect(() => { if (alerts) void evaluate() }, [alerts, evaluate]);

  const update = (id: string, patch: Partial<PriceAlert>) => {
    if (!user) return setIsAuthOpen(true);
    void mutateAlerts(
      () => fetch(`/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
      (prev) => prev.map(a => a.id === id ? { ...a, ...patch } : a)
    );
  };

  const deleteAlert = (id: string) => {
    if (!user) return setIsAuthOpen(true);
    void mutateAlerts(
      () => fetch(`/api/alerts/${id}`, { method: 'DELETE' }),
      (prev) => prev.filter(x => x.id !== id)
    );
  };

  const rows = alerts?.filter(a => a.status === tab) ?? [];

  return <main className={styles.page}>
    <header className={styles.hero}><div><span>Personal notification rules</span><h1>Alerts</h1><p>Conditions are evaluated in one server-batched quote request and trigger only once.</p></div><Link className={styles.button} href="/watchlist">Watchlist</Link></header>
    
    <div className={styles.tabs}>
      {(['active', 'triggered', 'paused'] as AlertStatus[]).map(x => <button key={x} className={`${styles.button} ${tab === x ? '' : styles.secondary}`} onClick={() => setTab(x)}>{x[0]!.toUpperCase() + x.slice(1)}</button>)}
      <button className={`${styles.button} ${styles.secondary}`} onClick={evaluate}>Evaluate now</button>
    </div>
    
    {toast && <div className={styles.toast} style={{ background: '#ff4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>{toast}</div>}
    {error ? <div className={styles.empty} role="alert">{error}</div> : null}
    
    <div className={styles.rows}>
      {rows.length ? rows.map(a => {
        const q = quotes[a.instrumentKey];
        const target = a.threshold === null ? 'Automatic' : a.type.includes('percent') ? formatPercent(a.threshold) : formatINR(a.threshold);
        return <article className={`${styles.row} ${styles.alertRow}`} key={a.id}>
          <div><Link href={`/stocks/${a.exchange.toLowerCase()}/${a.symbol}`}><strong>{a.symbol}</strong><small>{a.companyName}</small></Link></div>
          <div><span className={styles.badge}>{labels[a.type as keyof typeof labels] || 'Alert'}</span><small>Target {target}</small></div>
          <div><small>Current</small><strong>{q ? formatINR(q.price, 'N/A') : 'N/A'}</strong></div>
          <div><small>Created</small><strong>{new Date(a.createdAt).toLocaleDateString('en-IN')}</strong>{a.triggeredAt ? <small>Triggered {new Date(a.triggeredAt).toLocaleString('en-IN')}</small> : null}</div>
          <div className={styles.actions}>
            {a.status === 'triggered' ? <button className={styles.iconButton} aria-label="Re-arm alert" onClick={() => update(a.id, { status: 'active', triggeredAt: null })}><RotateCcw size={16} /></button> : <button className={styles.iconButton} aria-label={a.status === 'paused' ? 'Enable alert' : 'Pause alert'} onClick={() => update(a.id, { status: a.status === 'paused' ? 'active' : 'paused' })}>{a.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}</button>}
            <button className={`${styles.iconButton} ${styles.danger}`} aria-label="Delete alert" onClick={() => deleteAlert(a.id)}><Trash2 size={16} /></button>
          </div>
        </article>
      }) : <div className={styles.empty}><h2>No {tab} alerts.</h2><p>Create an alert from any stock page.</p></div>}
    </div>
    
    <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
  </main>
}
