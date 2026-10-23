'use client'

import Link from 'next/link'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { useId, useState } from 'react'
import type { SearchEntry } from '../data/search-index.generated'
import styles from './homepage-discovery.module.css'

type Entry = Pick<SearchEntry, 'id' | 'title' | 'description' | 'href' | 'category' | 'source' | 'updated'>
const categories = ['All', 'Reports', 'Research', 'IPO', 'Mutual Funds', 'Cards', 'Tools']

export default function DiscoveryExplorer({ entries }: { entries: Entry[] }) {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const id = useId()
  const needle = query.trim().toLowerCase()
  const matches = entries.filter(entry => (category === 'All' || entry.category === category) && (!needle || `${entry.title} ${entry.description} ${entry.category}`.toLowerCase().includes(needle)))
  const visible = category === 'All' && !needle
    ? categories.slice(1).flatMap(name => matches.filter(entry => entry.category === name).slice(0, 1))
    : matches.slice(0, 6)
  return <div className={styles.explorer}>
    <div className={styles.filters} role="group" aria-label="Filter intelligence by category">
      {categories.map(name => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}
    </div>
    <div className={styles.searchField}>
      <Search size={17} aria-hidden="true" />
      <label className={styles.srOnly} htmlFor={id}>Search intelligence discovery</label>
      <input id={id} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try valuation, IPO or calculator…" aria-describedby={`${id}-status`} />
      {query && <button type="button" aria-label="Clear discovery search" onClick={() => { setQuery(''); document.getElementById(id)?.focus() }}><X size={16} /></button>}
    </div>
    <p className={styles.resultStatus} id={`${id}-status`} role="status">{matches.length === 0 ? 'No matches. Try another term or category.' : `Showing ${visible.length} of ${matches.length} matching pages`}</p>
    {visible.length > 0 && <div className={styles.grid}>
      {visible.map(entry => <Link href={entry.href} className={styles.card} key={entry.id}>
        <span>{entry.category}<ArrowUpRight size={15} aria-hidden="true" /></span>
        <strong>{entry.title}</strong>
        <p>{entry.description}</p>
        <small>{entry.source}{entry.updated ? ` · ${entry.updated}` : ''}</small>
      </Link>)}
    </div>}
    {matches.length === 0 && <div className={styles.empty}><Search size={24} aria-hidden="true" /><strong>Start with a wider search.</strong><p>Clear your filters to explore reports, tools and research.</p><button type="button" onClick={() => { setQuery(''); setCategory('All') }}>Reset filters</button></div>}
    {matches.length > visible.length && (needle || category !== 'All') && <Link className={styles.more} href={`/search?q=${encodeURIComponent(query || category)}`}>Continue in full search <ArrowUpRight size={14} /></Link>}
  </div>
}
