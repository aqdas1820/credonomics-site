'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, GitCompareArrows, RotateCcw, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'
import type { CardCategorySlug } from '../../data/card-categories'
import type { VerifiedRealCard } from '../../data/verified-real-cards'
import { getCardArtwork } from '../../data/card-artwork'
import { buildDirectoryCompareLink } from '../../data/card-directory-compare'
import CardArtwork from '../components/CardArtwork'
import styles from './card-directory.module.css'

type DirectoryCard = VerifiedRealCard & {
  categories: Array<{ slug: CardCategorySlug; label: string }>
}

const quickFilters: Array<{ slug: CardCategorySlug | 'All'; label: string }> = [
  { slug: 'All', label: 'All cards' },
  { slug: 'cashback', label: 'Cashback' },
  { slug: 'shopping', label: 'Shopping' },
  { slug: 'fuel', label: 'Fuel' },
  { slug: 'travel', label: 'Travel' },
  { slug: 'upi', label: 'UPI' },
  { slug: 'lifetime-free', label: 'Lifetime free' },
]

export default function CardDirectory({ cards, issuers }: { cards: DirectoryCard[]; issuers: string[] }) {
  const [query, setQuery] = useState('')
  const [issuer, setIssuer] = useState('All')
  const [category, setCategory] = useState<CardCategorySlug | 'All'>('All')
  const [feeLimit, setFeeLimit] = useState('All')
  const [sort, setSort] = useState('name')
  const [imagesOnly, setImagesOnly] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionError, setSelectionError] = useState('')

  const categories = useMemo(() => {
    const values = new Map<CardCategorySlug, string>()
    cards.forEach(card => card.categories.forEach(item => values.set(item.slug, item.label)))
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [cards])

  const artworkCount = useMemo(() => cards.filter(card => Boolean(getCardArtwork(card.id))).length, [cards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter(card => {
      const searchable = [card.name, card.issuer, ...card.categories.map(item => item.label)].join(' ').toLowerCase()
      return (!q || searchable.includes(q))
        && (issuer === 'All' || card.issuer === issuer)
        && (category === 'All' || card.categories.some(item => item.slug === category))
        && (feeLimit === 'All' || card.annualFeeRupees <= Number(feeLimit))
        && (!imagesOnly || Boolean(getCardArtwork(card.id)))
    }).sort((a, b) =>
      sort === 'fee' ? a.annualFeeRupees - b.annualFeeRupees || a.name.localeCompare(b.name)
        : sort === 'verified' ? b.verifiedAt.localeCompare(a.verifiedAt) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name)
    )
  }, [cards, query, issuer, category, feeLimit, sort, imagesOnly])

  const selectedCards = cards.filter(card => selectedIds.includes(card.id))
  const compareLink = buildDirectoryCompareLink(selectedCards, category)
  const hasFilters = query !== '' || issuer !== 'All' || category !== 'All' || feeLimit !== 'All' || sort !== 'name' || imagesOnly

  function reset() {
    setQuery(''); setIssuer('All'); setCategory('All'); setFeeLimit('All'); setSort('name'); setImagesOnly(false)
  }

  function toggleCard(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(value => value !== id))
      setSelectionError('')
      return
    }
    if (selectedIds.length >= 3) {
      setSelectionError('Select a maximum of three cards. Remove one to add another.')
      return
    }
    setSelectedIds([...selectedIds, id])
    setSelectionError('')
  }

  return (
    <section className={[styles.directory, selectedIds.length ? styles.hasCompareTray : ''].filter(Boolean).join(' ')} aria-label="Verified credit card catalogue">
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>CREDONOMICS · THE CARD LIBRARY</span>
          <h2>Every card deserves a closer look.</h2>
          <p>Compare actual card costs and issuer-verified benefit terms. Explore freely; rankings remain based on your spending, not promotions.</p>
        </div>
        <a className={styles.compareLink} href="/cards/compare"><GitCompareArrows size={17} aria-hidden="true"/> Card comparison <ArrowUpRight size={15} aria-hidden="true"/></a>
      </header>

      <div className={styles.filterBox}>
        <label className={styles.search}>
          <Search size={20} aria-hidden="true"/>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search cards, banks, or benefits" aria-label="Search card directory"/>
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}
        </label>
        <nav className={styles.quickFilters} aria-label="Quick card categories">
          {quickFilters.map(item => (
            <button key={item.slug} type="button" aria-pressed={category === item.slug} className={category === item.slug ? styles.activePill : ''} onClick={() => setCategory(item.slug)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.filterRow}>
          <label>Issuer
            <select value={issuer} onChange={event => setIssuer(event.target.value)}>
              <option value="All">All issuers</option>
              {issuers.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>Category
            <select value={category} onChange={event => setCategory(event.target.value as CardCategorySlug | 'All')}>
              <option value="All">All categories</option>
              {categories.map(([slug, label]) => <option value={slug} key={slug}>{label}</option>)}
            </select>
          </label>
          <label>Annual fee
            <select value={feeLimit} onChange={event => setFeeLimit(event.target.value)}>
              <option value="All">Any fee</option><option value="0">₹0 / free</option>
              <option value="500">Up to ₹500</option><option value="1000">Up to ₹1,000</option><option value="1500">Up to ₹1,500</option>
            </select>
          </label>
          <label>Sort by
            <select value={sort} onChange={event => setSort(event.target.value)}>
              <option value="name">Card name A–Z</option><option value="fee">Lowest fee</option><option value="verified">Research date</option>
            </select>
          </label>
        </div>
        <div className={styles.filterFooter}>
          {artworkCount > 0 ? (
            <label className={styles.imageToggle}>
              <input type="checkbox" checked={imagesOnly} onChange={event => setImagesOnly(event.target.checked)}/>
              Show only cards with source-and-rights-cleared artwork
            </label>
          ) : (
            <span className={styles.artworkNote}>Product art appears only after exact-source and reuse-rights clearance.</span>
          )}
          {hasFilters && <button type="button" className={styles.reset} onClick={reset}><RotateCcw size={14}/> Reset filters</button>}
        </div>
      </div>

      <div className={styles.resultBar} role="status" aria-live="polite">
        <span><SlidersHorizontal size={16} aria-hidden="true"/><b>{filtered.length}</b> of {cards.length} cards</span>
        <span className={styles.resultHint}>Select 2–3 cards to compare · Card fees before GST</span>
      </div>

      <div className={styles.grid}>
        {filtered.map(card => {
          const selected = selectedIds.includes(card.id)
          const primary = category === 'All' ? card.categories[0] : card.categories.find(item => item.slug === category)
          const note = primary ? card.terms[primary.slug]?.note : undefined
          const hasPublishedArtwork = Boolean(getCardArtwork(card.id))
          return (
            <article key={card.id} className={styles.card} data-selected={selected ? 'true' : 'false'}>
              <div className={styles.mediaArea}>
                <a href={'/cards/' + card.id} className={styles.imageLink} aria-label={'Explore ' + card.name}>
                  <CardArtwork cardId={card.id} name={card.name} issuer={card.issuer}/>
                </a>
                <span className={styles.visualStatus}>{hasPublishedArtwork ? 'SOURCE-CLEARED PRODUCT ART' : 'ARTWORK UNAVAILABLE'}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardOverline}><span>{card.issuer}</span><span className={styles.recordDate}>Research · {card.verifiedAt}</span></div>
                <h3><a href={'/cards/' + card.id}>{card.name}</a></h3>
                <div className={styles.tags}>
                  {card.categories.slice(0, 3).map(item => <span key={item.slug}>{item.label}</span>)}
                </div>
                {note && <p className={styles.benefit}>{note}</p>}
                {card.holderNotice && <p className={styles.notice}>{card.holderNotice.label} — confirm current issuer conditions.</p>}

                <div className={styles.costRow}>
                  <div><span>ANNUAL FEE</span><strong>{card.annualFeeRupees === 0 ? '₹0' : '₹' + card.annualFeeRupees.toLocaleString('en-IN')}</strong><small>{card.annualFeeRupees === 0 ? 'Lifetime free' : '+ applicable GST'}</small></div>
                  <div><span>FEE WAIVER</span><strong>{card.feeWaiverAnnualSpendRupees ? '₹' + card.feeWaiverAnnualSpendRupees.toLocaleString('en-IN') : '—'}</strong><small>{card.feeWaiverAnnualSpendRupees ? 'Annual spend threshold' : 'Not normalized'}</small></div>
                </div>
                <div className={styles.actions}>
                  <button type="button" aria-pressed={selected} className={selected ? styles.picked : styles.pick} onClick={() => toggleCard(card.id)}>
                    <Check size={15} aria-hidden="true"/>{selected ? 'Selected' : 'Add to compare'}
                  </button>
                  <a href={'/cards/' + card.id} className={styles.view}>Card research <ArrowRight size={16} aria-hidden="true"/></a>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {!filtered.length && <div className={styles.empty}>
        <h3>No matching cards</h3><p>Try a different bank, fee range or category.</p><button type="button" onClick={reset}>Clear filters</button>
      </div>}

      <p className={styles.disclaimer}><ShieldCheck size={17}/> Product imagery is shown only after exact-source and reuse-rights clearance. Otherwise CredoNomics uses a clearly labelled neutral illustration. Benefit estimates, fees and card availability should be rechecked against the linked issuer terms. <a href="/methodology">Research methodology</a>.</p>

      {selectedIds.length > 0 && (
        <aside className={styles.compareTray} aria-label="Selected cards to compare" aria-live="polite">
          <div className={styles.trayHeader}>
            <div><strong>{selectedIds.length} of 3 selected</strong><span>Compare source-linked card terms</span></div>
            <button type="button" onClick={() => { setSelectedIds([]); setSelectionError('') }} aria-label="Clear compared cards"><X size={18}/></button>
          </div>
          <div className={styles.trayCards}>{selectedCards.map(card =>
            <button key={card.id} type="button" onClick={() => toggleCard(card.id)} title={'Remove ' + card.name}>
              <span>{card.name}</span><X size={13} aria-hidden="true"/>
            </button>
          )}</div>
          {selectionError && <p role="alert" className={styles.trayMessage}>{selectionError}</p>}
          {selectedIds.length > 1 && !compareLink && <p className={styles.trayMessage}>These cards have no shared normalized comparison category. Choose cards in the same category.</p>}
          {compareLink ? <a className={styles.trayCta} href={compareLink}>Compare selected cards <ArrowRight size={17}/></a> : <span className={styles.trayDisabled}>{selectedIds.length === 1 ? 'Select one more card' : 'No shared category'}</span>}
        </aside>
      )}
    </section>
  )
}
