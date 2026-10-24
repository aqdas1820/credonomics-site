'use client'

import { useEffect, useState } from 'react'
import { cardCategories, type CardCategorySlug } from '../../data/card-categories'
import { CARD_WALLET_KEY, parseWallet } from '../../data/card-wallet'
import type { VerifiedRealCard } from '../../data/verified-real-cards'
import RealCardRankingClient from '../components/RealCardRankingClient'
import styles from '../components/card-discovery.module.css'

export default function WalletClient({ cards }: { cards: VerifiedRealCard[] }) {
  const [ids, setIds] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CardCategorySlug>('cashback')
  useEffect(() => {
    const read = () => {
      try { setIds(parseWallet(localStorage.getItem(CARD_WALLET_KEY), cards.map(card => card.id))) }
      catch { setStorageError(true) }
      setLoaded(true)
    }
    read()
    const sync = (event: StorageEvent) => { if (event.key === CARD_WALLET_KEY || event.key === null) read() }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [cards])

  function save(next: string[]) {
    setIds(next)
    try { localStorage.setItem(CARD_WALLET_KEY, JSON.stringify(next)); setStorageError(false) }
    catch { setStorageError(true) }
  }
  const selected = cards.filter(card => ids.includes(card.id))
  const eligible = selected.filter(card => card.terms[category] && card.terms[category]?.rankingEligible !== false)
  const excluded = selected.filter(card => !eligible.includes(card))
  const q = query.trim().toLowerCase()
  const matches = cards.filter(card => `${card.name} ${card.issuer}`.toLowerCase().includes(q))

  return <>
    <section className={styles.panel} aria-labelledby="wallet-title">
      <div className={styles.heading}><div><span>01 / BUILD YOUR WALLET</span><h2 id="wallet-title">Which cards do you hold?</h2></div><a href="/cards">Explore all card tools →</a></div>
      <p>Only cards in our normalized dataset can be added. Missing a card? <a href="/cards/coverage">Check coverage</a>.</p>
      <label className={styles.field}>Search card or bank<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try HDFC, SBI or cashback"/></label>
      <div className={styles.choices} aria-busy={!loaded}>
        {matches.map(card => <label key={card.id} className={styles.choice}>
          <input type="checkbox" checked={ids.includes(card.id)} disabled={!loaded} onChange={() => save(ids.includes(card.id) ? ids.filter(id => id !== card.id) : [...ids, card.id])}/>
          <span><b>{card.name}</b><small>{card.issuer} · ₹{card.annualFeeRupees.toLocaleString('en-IN')}/year before tax or waiver</small></span>
        </label>)}
      </div>
      {matches.length === 0 && <p>No matching cards. Try a bank name or clear your search.</p>}
      <div className={styles.heading}><p role="status">{loaded ? `${ids.length} card${ids.length === 1 ? '' : 's'} in your wallet` : 'Loading your saved wallet…'}</p><button type="button" disabled={!loaded || !ids.length} onClick={() => save([])}>Clear wallet</button></div>
      {storageError && <p role="status">Browser storage is unavailable. You can use this wallet now, but changes may not survive a refresh.</p>}
    </section>
    <section className={styles.panel}>
      <span>02 / COMPARE YOUR CARDS</span><h2>Choose the spending you want to compare</h2>
      <label className={styles.field}>Spending category<select value={category} onChange={event => setCategory(event.target.value as CardCategorySlug)}>{cardCategories.map(item => <option key={item.slug} value={item.slug}>{item.shortTitle}</option>)}</select></label>
      <p>Each result models one card receiving the selected spending. Annual fees include GST unless the entered annual spend qualifies for a waiver. These are separate scenarios: values must not be added across cards or categories.</p>
      {excluded.length > 0 && <p role="status">Not modeled in this category: {excluded.map(card => card.name).join(', ')}. This means insufficient normalized terms, not zero benefits.</p>}
      {!ids.length && <p>Add your cards above to begin. <a href="/cards/cashback">Or rank the full dataset →</a></p>}
      {ids.length > 0 && !eligible.length && <p>No wallet cards have eligible normalized terms for this category. Try another category or <a href={`/cards/${category}`}>browse its covered cards</a>.</p>}
    </section>
    {eligible.length > 0 && <RealCardRankingClient categorySlug={category} cards={eligible}/>}
  </>
}
