'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, GitCompareArrows, RotateCcw, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import type { CardCategorySlug } from '../../data/card-categories'
import type { VerifiedRealCard } from '../../data/verified-real-cards'
import CardArtwork from '../components/CardArtwork'
import styles from './card-directory.module.css'

type DirectoryCard = VerifiedRealCard & {
  categories: Array<{ slug: CardCategorySlug; label: string }>
}

export default function CardDirectory({ cards, issuers }: { cards: DirectoryCard[]; issuers: string[] }) {
  const [query, setQuery] = useState('')
  const [issuer, setIssuer] = useState('All')
  const [category, setCategory] = useState('All')
  const [feeLimit, setFeeLimit] = useState('All')
  const [sort, setSort] = useState('name')

  const categories = useMemo(() => {
    const values = new Map<string, string>()
    cards.forEach(card => card.categories.forEach(item => values.set(item.slug, item.label)))
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [cards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter(card => {
      const searchable = [card.name, card.issuer, ...card.categories.map(item => item.label)].join(' ').toLowerCase()
      return (!q || searchable.includes(q))
        && (issuer === 'All' || card.issuer === issuer)
        && (category === 'All' || card.categories.some(item => item.slug === category))
        && (feeLimit === 'All' || card.annualFeeRupees <= Number(feeLimit))
    }).sort((a, b) =>
      sort === 'fee'
        ? a.annualFeeRupees - b.annualFeeRupees || a.name.localeCompare(b.name)
        : sort === 'verified'
          ? b.verifiedAt.localeCompare(a.verifiedAt) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name)
    )
  }, [cards, query, issuer, category, feeLimit, sort])

  const reset = () => { setQuery(''); setIssuer('All'); setCategory('All'); setFeeLimit('All'); setSort('name') }
  const activeFilters = query !== '' || issuer !== 'All' || category !== 'All' || feeLimit !== 'All' || sort !== 'name'

  return (
    <section className={styles.directory} aria-label="Verified credit card catalogue">
      <div className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>CREDONOMICS / VERIFIED CARD LIBRARY</span>
          <h2>Find a card worth comparing.</h2>
          <p>Clean product visuals, source-backed terms and fee details.</p>
        </div>
        <a className={styles.compareLink} href="/cards/compare"><GitCompareArrows size={17} aria-hidden="true"/> Compare cards</a>
      </div>

      <div className={styles.controls}>
        <label className={styles.search}>
          <Search size={19} aria-hidden="true"/>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by card, bank or benefit"
            aria-label="Search credit cards"
            type="search"
          />
        </label>
        <div className={styles.filterGroup}>
          <label><span>Bank / issuer</span>
            <select value={issuer} onChange={event => setIssuer(event.target.value)}>
              <option value="All">All banks</option>
              {issuers.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label><span>Benefit</span>
            <select value={category} onChange={event => setCategory(event.target.value)}>
              <option value="All">All categories</option>
              {categories.map(([slug, label]) => <option value={slug} key={slug}>{label}</option>)}
            </select>
          </label>
          <label><span>Annual fee</span>
            <select value={feeLimit} onChange={event => setFeeLimit(event.target.value)}>
              <option value="All">Any fee</option>
              <option value="0">Lifetime free</option>
              <option value="500">Up to ₹500</option>
              <option value="1000">Up to ₹1,000</option>
              <option value="1500">Up to ₹1,500</option>
            </select>
          </label>
          <label><span>Sort by</span>
            <select value={sort} onChange={event => setSort(event.target.value)}>
              <option value="name">Card name A–Z</option>
              <option value="fee">Lowest annual fee</option>
              <option value="verified">Recently verified</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.summary} role="status">
        <div className={styles.count}><SlidersHorizontal size={16} aria-hidden="true"/><b>{filtered.length}</b> of {cards.length} cards <span>· Fees before GST or waiver</span></div>
        {activeFilters && <button className={styles.reset} type="button" onClick={reset}><RotateCcw size={14}/> Reset filters</button>}
      </div>

      <div className={styles.grid}>
        {filtered.map(card => (
          <a href={'/cards/' + card.id} className={styles.card} key={card.id}>
            <div className={styles.visual}>
              <CardArtwork cardId={card.id} name={card.name} issuer={card.issuer}/>
            </div>
            <div className={styles.content}>
              <span className={styles.issuer}>{card.issuer}</span>
              <h3>{card.name}</h3>
              <div className={styles.categories}>
                {card.categories.slice(0, 3).map(item => <span key={item.slug}>{item.label}</span>)}
              </div>
              {card.holderNotice && <p className={styles.notice}>{card.holderNotice.label} · Check current terms</p>}
              <div className={styles.metrics}>
                <span><small>Annual fee</small><b>{card.annualFeeRupees === 0 ? 'Lifetime free' : '₹' + card.annualFeeRupees.toLocaleString('en-IN')}</b></span>
                <span><small>Terms checked</small><b>{card.verifiedAt}</b></span>
              </div>
              <span className={styles.cta}>Explore card <ArrowUpRight size={16} aria-hidden="true"/></span>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && <div className={styles.empty}>
        <h3>No cards match those filters</h3>
        <p>Try a different bank, category or fee range.</p>
        <button type="button" onClick={reset}>Clear filters</button>
      </div>}
      <p className={styles.policy}><ShieldCheck size={15}/> Illustrative previews are labelled when an exact product image is unavailable. Card visuals are for identification; issuer documents govern actual terms. <a href="/methodology">Our research method</a>.</p>
    </section>
  )
}
