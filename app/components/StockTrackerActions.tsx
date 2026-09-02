'use client'
import { useEffect, useState } from 'react'
import { Bell, Check, Plus } from 'lucide-react'
import type { TrackedInstrument, AlertType, WatchlistState } from '../../src/domain/watchlist/types'
import { addItem, createAlert, createList, loadWatchlistState, saveWatchlistState, WATCHLIST_EVENT } from '../../src/services/watchlist/local-repository'
import styles from '../watchlist/watchlist.module.css'

export default function StockTrackerActions({ stock }: { stock: TrackedInstrument }) {
  const [state, setState] = useState<WatchlistState | null>(null); const [showLists,setShowLists]=useState(false); const [showAlert,setShowAlert]=useState(false); const [type,setType]=useState<AlertType>('price_above'); const [target,setTarget]=useState('')
  useEffect(()=>{const sync=()=>setState(loadWatchlistState());sync();window.addEventListener(WATCHLIST_EVENT,sync);return()=>window.removeEventListener(WATCHLIST_EVENT,sync)},[])
  if(!state)return null
  const inAny=state.watchlists.some(list=>list.items.some(item=>item.instrumentKey===stock.instrumentKey)); const persist=(next:WatchlistState)=>{saveWatchlistState(next);setState(next)}
  const needsTarget=!type.startsWith('52_week')
  return <section className={styles.panel} aria-label="Stock tracking actions"><div className={styles.form}>
    <button className={`${styles.button} ${inAny?styles.secondary:''}`} onClick={()=>setShowLists(!showLists)}>{inAny?<><Check size={16}/> In Watchlist</>:<><Plus size={16}/> Add to Watchlist</>}</button>
    <button className={`${styles.button} ${styles.secondary}`} onClick={()=>setShowAlert(!showAlert)}><Bell size={16}/> Set Alert</button></div>
    <small className={styles.muted}>Alerts on this device are stored locally. Percentage moves use the current session previous close.</small>
    {showLists?<div className={styles.form}>{state.watchlists.map(list=><button key={list.id} className={`${styles.button} ${styles.secondary}`} onClick={()=>persist(addItem(state,list.id,stock))}>{list.name}</button>)}<button className={`${styles.button} ${styles.secondary}`} onClick={()=>{const name=prompt('Watchlist name');if(name)persist(createList(state,name))}}>+ New</button></div>:null}
    {showAlert?<div className={styles.form}><select aria-label="Alert type" value={type} onChange={e=>setType(e.target.value as AlertType)}><option value="price_above">Price above</option><option value="price_below">Price below</option><option value="percent_rise">Percentage rise</option><option value="percent_fall">Percentage fall</option><option value="52_week_high">52-week high</option><option value="52_week_low">52-week low</option><option disabled value="volume_spike">Volume spike (reference unavailable)</option></select>{needsTarget?<input aria-label="Alert target" type="number" min="0" step="0.01" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target"/>:null}<button className={styles.button} onClick={()=>{const threshold=needsTarget?Number(target):null;if(needsTarget&&(threshold===null||!Number.isFinite(threshold)||threshold<=0))return;persist(createAlert(state,{...stock,type,threshold}));setShowAlert(false)}}>Create Alert</button></div>:null}
  </section>
}
