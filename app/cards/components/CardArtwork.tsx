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

/**
 * Show exact-card curated artwork. When the remote file is blocked or fails,
 * keep a clearly labelled illustration rather than a wrong product image.
 */
export default function CardArtwork({
  cardId, name, issuer, size = 'standard', priority = false, className = '',
}: Props) {
  const [failed, setFailed] = useState(false)
  const source = getCardArtwork(cardId)
  const showPhoto = Boolean(source && !failed)

  return (
    <span className={[styles.shell, styles[size], className].filter(Boolean).join(' ')}
      role="img" aria-label={showPhoto ? name + ' product artwork' : name + ', illustrative card placeholder'}>
      <span className={styles.card} aria-hidden="true">
        <span className={styles.issuer}>{issuer}</span>
        <span className={styles.chip}/>
        <span className={styles.cardName}>{name}</span>
        <span className={styles.demo}><CreditCard size={11}/> Card image not yet verified</span>
      </span>
      {showPhoto && source && (
        <img
          className={styles.productImage}
          src={source.url}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}
