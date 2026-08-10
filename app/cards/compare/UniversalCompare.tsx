'use client'

import { useState } from 'react'
import { cardCategories, type CardCategorySlug } from '../../data/card-categories'
import CategoryComparator from '../components/CategoryComparator'
import styles from './compare.module.css'

export default function UniversalCompare() {
  const [category, setCategory] = useState<CardCategorySlug>('cashback')

  return (
    <div>
      <div className={styles.selector}>
        <label htmlFor="category">Comparison category</label>
        <select id="category" value={category} onChange={(event) => setCategory(event.target.value as CardCategorySlug)}>
          {cardCategories.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}
        </select>
        <p>{cardCategories.find((item) => item.slug === category)?.description}</p>
      </div>
      <CategoryComparator categorySlug={category}/>
    </div>
  )
}
