'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { CardCategorySlug } from '../../data/card-categories'
import type { VerifiedRealCard } from '../../data/verified-real-cards'
import styles from './card-directory.module.css'

type DirectoryCard = VerifiedRealCard & {
  categories: Array<{ slug: CardCategorySlug; label: string }>
}

export default function CardDirectory({
  cards,
  issuers,
}: {
  cards: DirectoryCard[]
  issuers: string[]
}) {
  const [query, setQuery] = useState('')
  const [issuer, setIssuer] = useState('All')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => {
    const values = new Map<string, string>()
    cards.forEach((card) => card.categories.forEach((item) => values.set(item.slug, item.label)))
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [cards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter((card) => {
      const queryOk =
        !q ||
        card.name.toLowerCase().includes(q) ||
        card.issuer.toLowerCase().includes(q) ||
        card.categories.some((item) => item.label.toLowerCase().includes(q))
      const issuerOk = issuer === 'All' || card.issuer === issuer
      const categoryOk = category === 'All' || card.categories.some((item) => item.slug === category)
      return queryOk && issuerOk && categoryOk
    })
  }, [cards, query, issuer, category])

  return (
    <div className={styles.directory}>
      <div className={styles.controls}>
        <label className={styles.search}>
          <Search size={16}/>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search card or issuer…"
            aria-label="Search credit cards"
          />
        </label>
        <select value={issuer} onChange={(event) => setIssuer(event.target.value)} aria-label="Filter by issuer">
          <option>All</option>
          {issuers.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
          <option value="All">All categories</option>
          {categories.map(([slug, label]) => <option value={slug} key={slug}>{label}</option>)}
        </select>
      </div>

      <div className={styles.summary}>
        <b>{filtered.length}</b> of {cards.length} normalized cards shown
      </div>

      <div className={styles.grid}>
        {filtered.map((card) => (
          <a href={`/cards/${card.id}`} className={styles.card} key={card.id}>
            <small>{card.issuer}</small>
            <h2>{card.name}</h2>
            <div className={styles.categories}>
              {card.categories.slice(0, 5).map((item) => <span key={item.slug}>{item.label}</span>)}
            </div>
            <div className={styles.meta}>
              <span>Annual fee <b>₹{card.annualFeeRupees.toLocaleString('en-IN')}</b></span>
              <span>Verified <b>{card.verifiedAt}</b></span>
            </div>
            <strong>View full research →</strong>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>No normalized card matches the selected filters.</div>
      )}
    </div>
  )
}
