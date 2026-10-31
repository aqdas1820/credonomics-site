'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { getCardArtwork } from '../../data/card-artwork'
import styles from './card-artwork.module.css'

type Props = {
  cardId: string
  name: string
  issuer: string
  size?: 'hero' | 'standard' | 'small' | 'mini'
  priority?: boolean
  className?: string
}

/** Product artwork and the illustrative fallback are mutually exclusive. */
export default function CardArtwork({ cardId, name, issuer, size = 'standard', priority = false, className = '' }: Props) {
  const source = getCardArtwork(cardId)
  const [failed, setFailed] = useState(false)
  const hasPhoto = Boolean(source && !failed)

  return <span className={[styles.shell, styles[size], className].filter(Boolean).join(' ')}
    role="img" data-artwork-state={hasPhoto ? 'product' : 'illustration'}
    aria-label={hasPhoto ? name + ' product artwork' : name + ', illustrative placeholder (not an official card photo)'}>
    {hasPhoto && source ? (
      <img src={source.url} className={styles.productImage} alt="" decoding="async"
        loading={priority ? 'eager' : 'lazy'} referrerPolicy="no-referrer"
        onError={() => setFailed(true)}/>
    ) : (
      <span className={styles.fallback} aria-hidden="true">
        <span className={styles.mark}><CreditCard size={27} strokeWidth={1.45}/></span>
        <span className={styles.fallbackText}><span className={styles.issuer}>{issuer}</span>
          <span className={styles.cardName}>{name}</span></span>
        <span className={styles.preview}>ARTWORK UNAVAILABLE</span>
      </span>
    )}
  </span>
}
