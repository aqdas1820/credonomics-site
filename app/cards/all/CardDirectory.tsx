'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, ChevronDown, CircleCheck, CreditCard, ExternalLink, GitCompareArrows, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'
import type { CardCategorySlug } from '../../data/card-categories'
import type { VerifiedRealCard, RealCardTerms } from '../../data/verified-real-cards'
import { buildDirectoryCompareLink } from '../../data/card-directory-compare'
import CardArtwork from '../components/CardArtwork'
import styles from './card-directory.module.css'

type DirectoryCard = VerifiedRealCard & {
  categories: Array<{ slug: CardCategorySlug; label: string }>
}
const money = (value: number) => '₹' + value.toLocaleString('en-IN')
const quickCategories: Array<{ slug: CardCategorySlug | 'All'; label: string }> = [
  { slug: 'All', label: 'All cards' }, { slug: 'cashback', label: 'Cashback' },
  { slug: 'travel', label: 'Travel' }, { slug: 'lifetime-free', label: 'Lifetime free' },
  { slug: 'fuel', label: 'Fuel' }, { slug: 'shopping', label: 'Shopping' },
  { slug: 'upi', label: 'UPI' },
]
function rateLabel(terms: RealCardTerms | undefined) {
  if (!terms) return 'Not listed'
  if (terms.monthlyTiers?.length) {
    const values = terms.monthlyTiers.map(tier => tier.ratePercent)
    return 'Up to ' + Math.max(...values).toLocaleString('en-IN') + '%'
  }
  return typeof terms.ratePercent === 'number' && terms.ratePercent > 0
    ? terms.ratePercent.toLocaleString('en-IN') + '%'
    : 'See terms'
}

export default function CardDirectory({ cards, issuers }: { cards: DirectoryCard[]; issuers: string[] }) {
  const [issuerMenu, setIssuerMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [issuer, setIssuer] = useState('All')
  const [category, setCategory] = useState<CardCategorySlug | 'All'>('All')
  const [maxFee, setMaxFee] = useState('All')
  const [sort, setSort] = useState('name')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [compareError, setCompareError] = useState('')

  const filtered = useMemo(() => cards.filter(card => {
    const searchable = [card.name, card.issuer, ...card.categories.map(c => c.label)].join(' ').toLowerCase()
    return (!query.trim() || searchable.includes(query.trim().toLowerCase()))
      && (issuer === 'All' || card.issuer === issuer)
      && (category === 'All' || card.categories.some(c => c.slug === category))
      && (maxFee === 'All' || card.annualFeeRupees <= Number(maxFee))
  }).sort((a,b) => sort === 'fee' ? a.annualFeeRupees - b.annualFeeRupees || a.name.localeCompare(b.name)
    : sort === 'verified' ? b.verifiedAt.localeCompare(a.verifiedAt) || a.name.localeCompare(b.name)
    : a.name.localeCompare(b.name)), [cards, query, issuer, category, maxFee, sort])

  const selectedCards = cards.filter(card => selectedIds.includes(card.id))
  const compareLink = buildDirectoryCompareLink(selectedCards, category)
  const activeFilters = issuer !== 'All' || category !== 'All' || maxFee !== 'All' || query !== '' || sort !== 'name'

  function selectIssuer(value: string) {
    setIssuer(value)
    setIssuerMenu(false)
  }
  function reset() { setIssuer('All'); setCategory('All'); setQuery(''); setMaxFee('All'); setSort('name') }
  function toggle(id: string) {
    if (selectedIds.includes(id)) { setSelectedIds(selectedIds.filter(x => x !== id)); setCompareError(''); return }
    if (selectedIds.length >= 3) { setCompareError('Select a maximum of three cards.'); return }
    setSelectedIds([...selectedIds, id]); setCompareError('')
  }

  return <section className={styles.directory} aria-label="Credit card reviews">
    <nav className={styles.subnav} aria-label="Browse card catalogue">
      <a href="/cards">Best Cards</a>
      <div className={styles.menuRoot}>
        <button type="button" aria-expanded={issuerMenu} aria-controls="card-issuer-menu" onClick={() => setIssuerMenu(!issuerMenu)}>
          Card Issuers <ChevronDown size={15} aria-hidden="true"/>
        </button>
        {issuerMenu && <div className={styles.megaMenu} id="card-issuer-menu">
          <div className={styles.megaHeading}><strong>BROWSE CARDS BY ISSUER</strong><button type="button" onClick={() => setIssuerMenu(false)} aria-label="Close issuer menu"><X size={16}/></button></div>
          <div className={styles.issuerGrid}>
            <button type="button" className={issuer === 'All' ? styles.activeIssuer : ''} onClick={() => selectIssuer('All')}>
              <span className={styles.issuerInitial}>★</span>All banks
            </button>
            {issuers.map((value, index) => <button type="button" key={value} onClick={() => selectIssuer(value)} className={issuer === value ? styles.activeIssuer : ''}>
              <span className={styles.issuerInitial} data-tone={index % 5}>{value.slice(0,1)}</span>{value}
            </button>)}
          </div>
        </div>}
      </div>
      <a href="/cards/compare">Compare Cards</a>
      <a href="/cards/wallet">My Card Wallet</a>
    </nav>

    <div className={styles.directoryHead}>
      <div><span className={styles.kicker}>CARD REVIEWS & COMPARISONS</span><h2>{issuer === 'All' ? 'Explore verified credit cards' : issuer + ' credit cards'}</h2><p>Transparent research with card fees, modeled rewards, and verified issuer references.</p></div>
      <span className={styles.recordCount}>{filtered.length} cards</span>
    </div>

    <div className={styles.filterShell}>
      <label className={styles.search}><Search size={18} aria-hidden="true"/><input aria-label="Search card or bank" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a card or bank..."/></label>
      <div className={styles.quickFilters} aria-label="Filter by benefit">{quickCategories.map(item =>
        <button key={item.slug} type="button" aria-pressed={category === item.slug} className={category === item.slug ? styles.activePill : ''} onClick={() => setCategory(item.slug)}>{item.label}</button>
      )}</div>
      <div className={styles.filterRow}>
        <label>Annual fee<select value={maxFee} onChange={e => setMaxFee(e.target.value)}><option value="All">Any annual fee</option><option value="0">₹0 — free</option><option value="500">Up to ₹500</option><option value="1000">Up to ₹1,000</option><option value="1500">Up to ₹1,500</option></select></label>
        <label>Sort by<select value={sort} onChange={e => setSort(e.target.value)}><option value="name">Card name</option><option value="fee">Lowest annual fee</option><option value="verified">Research checked</option></select></label>
        <span className={styles.filterCount}><SlidersHorizontal size={15}/>{filtered.length} of {cards.length} cards</span>
        {activeFilters && <button type="button" className={styles.clearFilters} onClick={reset}>Clear filters</button>}
      </div>
    </div>

    <div className={styles.reviewList}>
      {filtered.map(card => {
        const chosenCategory = category === 'All' ? card.categories[0] : card.categories.find(item => item.slug === category)
        const terms = chosenCategory ? card.terms[chosenCategory.slug] : undefined
        const extra = Object.entries(card.terms).filter(([slug, value]) => slug !== chosenCategory?.slug && value?.note).slice(0, 4)
        const selected = selectedIds.includes(card.id)
        return <article className={styles.reviewCard} key={card.id}>
          <div className={styles.reviewTop}>
            <div className={styles.thumb}><CardArtwork cardId={card.id} name={card.name} issuer={card.issuer}/></div>
            <div className={styles.reviewIntro}>
              <div className={styles.titleRow}><h3><a href={'/cards/' + card.id}>{card.name}</a></h3></div>
              <div className={styles.byline}><span className={styles.bankName}>{card.issuer}</span><span className={styles.dot}>·</span><span><ShieldCheck size={13}/> Issuer source linked</span><span className={styles.checked}>Terms checked {card.verifiedAt}</span></div>
              <div className={styles.tags}>{card.categories.slice(0,3).map(item => <span key={item.slug}>{item.label}</span>)}</div>
              <p className={styles.description}>{terms?.note || 'See the card research for its source-linked reward rules, fees and relevant spending categories.'}</p>
            </div>
          </div>

          <div className={styles.metrics}>
            <div><small>Annual fee</small><strong>{card.annualFeeRupees === 0 ? 'Lifetime free' : money(card.annualFeeRupees) + ' + GST'}</strong></div>
            <div><small>Fee waiver spend</small><strong>{card.feeWaiverAnnualSpendRupees ? money(card.feeWaiverAnnualSpendRupees) : 'Not normalized'}</strong><span>{card.feeWaiverAnnualSpendRupees ? 'Annual spend threshold' : 'Confirm issuer terms'}</span></div>
            <div><small>{chosenCategory ? chosenCategory.label + ' (modeled)' : 'Rewards'}</small><strong className={styles.reward}>{rateLabel(terms)}</strong><span>Eligibility, caps and exclusions apply</span></div>
          </div>

          {(typeof terms?.loungeVisits === 'number' && terms.loungeVisits > 0 || typeof terms?.monthlyCapRupees === 'number') && <div className={styles.detailRows}>
            {typeof terms?.loungeVisits === 'number' && terms.loungeVisits > 0 && <div><span>Lounge entitlement in model</span><strong>{terms.loungeVisits} visits <small>· Check access rules</small></strong></div>}
            {typeof terms?.monthlyCapRupees === 'number' && <div><span>Modeled monthly reward cap</span><strong>{money(terms.monthlyCapRupees)}</strong></div>}
          </div>}
          <div className={styles.highlight}><CircleCheck size={17} aria-hidden="true"/><p><b>Key benefit:</b> {terms?.note || 'Source-linked benefit terms are available in the full CredoNomics review.'}</p></div>

          {extra.length > 0 && <div className={styles.highlights}>{extra.slice(0, 2).map(([slug,value]) => <div key={slug}><Check size={15} aria-hidden="true"/><span><b>{card.categories.find(item => item.slug === slug)?.label || slug}:</b> {value?.note}</span></div>)}</div>}
          <details className={styles.expander}><summary>More benefits and conditions <ChevronDown size={16}/></summary>
            <ul>{extra.map(([slug, value]) => <li key={slug}><b>{card.categories.find(item => item.slug === slug)?.label || slug}: </b>{value?.note}</li>)}</ul>
            {card.holderNotice && <p><b>Existing-holder notice:</b> {card.holderNotice.detail}</p>}
            <p>All figures come from existing CredoNomics normalized terms; verify the issuer's latest Most Important Terms and Conditions before relying on them.</p>
          </details>
          <div className={styles.actions}>
            <a className={styles.readReview} href={'/cards/' + card.id}>Read full research</a>
            <a className={styles.issuerCta} href={card.sourceUrl} target="_blank" rel="noopener noreferrer">Official issuer terms <ExternalLink size={15} aria-hidden="true"/></a>
            <button className={selected ? styles.addedCompare : styles.addCompare} type="button" aria-pressed={selected} onClick={() => toggle(card.id)}><GitCompareArrows size={14}/>{selected ? 'Selected' : 'Compare'}</button>
          </div>
        </article>
      })}
      {!filtered.length && <div className={styles.empty}><h3>No matching cards found</h3><p>Try another issuer or clear the filters.</p><button type="button" onClick={reset}>Clear filters</button></div>}
    </div>

    <p className={styles.disclaimer}><ShieldCheck size={17} aria-hidden="true"/> Card images are labelled as product artwork or illustrative previews. This is information, not application advice. Rewards are modeled from stored terms, and issuers may change products or eligibility rules. <a href="/methodology">Research methodology</a></p>

    {selectedCards.length > 0 && <aside className={styles.compareTray} aria-label="Selected cards to compare">
      <div className={styles.trayTop}><strong>{selectedCards.length} of 3 selected</strong><button type="button" aria-label="Clear selection" onClick={() => {setSelectedIds([]);setCompareError('')}}><X size={17}/></button></div>
      <div className={styles.selectedItems}>{selectedCards.map(card => <button type="button" key={card.id} onClick={() => toggle(card.id)} title={'Remove ' + card.name}>{card.name}<X size={12}/></button>)}</div>
      {compareError && <p role="alert">{compareError}</p>}
      {compareLink ? <a href={compareLink}>Compare selected cards <ArrowRight size={16}/></a> : <span className={styles.compareDisabled}>{selectedCards.length === 1 ? 'Select another card' : 'Choose cards with a shared category'}</span>}
    </aside>}
  </section>
}
