'use client'

import { useState } from 'react'
import CardArtwork from '../components/CardArtwork'
import type { CardCategorySlug } from '../../data/card-categories'
import styles from './compare.module.css'

type CategoryOption = { slug: CardCategorySlug; title: string }
type Candidate = { id: string; name: string; issuer: string }

type Props = {
  category: CardCategorySlug
  categoryTitle: string
  categories: CategoryOption[]
  candidates: Candidate[]
  initialSelected: string[]
}

export default function RealCardSelector({ category, categoryTitle, categories, candidates, initialSelected }: Props) {
  const [selectedIds, setSelectedIds] = useState(initialSelected.slice(0, 3))
  const atLimit = selectedIds.length >= 3

  function toggle(id: string) {
    setSelectedIds(current => {
      if (current.includes(id)) return current.filter(value => value !== id)
      if (current.length >= 3) return current
      return [...current, id]
    })
  }

  return (
    <form className={styles.realSelector} method="get">
      <div>
        <label htmlFor="category">Category</label>
        <select id="category" name="category" defaultValue={category} onChange={event => event.currentTarget.form?.requestSubmit()}>
          {categories.map(item => <option value={item.slug} key={item.slug}>{item.title}</option>)}
        </select>
      </div>
      <div className={styles.cardChecks}>
        <span>Select up to three cards currently normalized for {categoryTitle}</span>
        {candidates.length > 0 ? candidates.map(card => {
          const checked = selectedIds.includes(card.id)
          const disabled = !checked && atLimit
          return <label key={card.id} data-selected={checked ? 'true' : 'false'} data-disabled={disabled ? 'true' : 'false'}>
            <input type="checkbox" name="cards" value={card.id} checked={checked} disabled={disabled} onChange={() => toggle(card.id)}/>
            <CardArtwork cardId={card.id} name={card.name} issuer={card.issuer} size="mini"/>
            <span><b>{card.name}</b><small>{card.issuer}</small></span>
          </label>
        }) : <p>No normalized real cards are available for this category yet.</p>}
      </div>
      <div className={styles.selectorFooter}>
        <button type="submit" disabled={selectedIds.length === 0}>Compare selected cards</button>
        <span role="status" aria-live="polite">{selectedIds.length} of 3 selected</span>
      </div>
      <small>Changing category reloads the compatible card list. The resulting URL contains only valid cards for that category and can be copied or shared.</small>
    </form>
  )
}
