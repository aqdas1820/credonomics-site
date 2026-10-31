'use client'

import { useState } from 'react'
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
 * Artwork and illustrative fallback must NEVER be painted together.
 * A photo may contain transparent pixels, so the old overlapping card
 * illustration caused duplicated names, faux chips and visual noise.
 */
export default function CardArtwork({
  cardId, name, issuer, size = 'standard', priority = false, className = '',
}: Props) {
  const source = getCardArtwork(cardId)
  const [failed, setFailed] = useState(false)
  const photo = Boolean(source && !failed)

  return (
    <span
      className={[styles.shell, styles[size], className].filter(Boolean).join(' ')}
      role="img"
      data-artwork-state={photo ? 'product' : 'illustration'}
      aria-label={photo ? name + ' card artwork' : name + ' — illustrative preview, not an issuer photograph'}
    >
      {photo && source ? (
        <img
          className={styles.productImage}
          src={source.url}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.fallback} aria-hidden="true">
          <span className={styles.lightArc}/>
          <span className={styles.issuer}>{issuer}</span>
          <span className={styles.cardName}>{name}</span>
          <span className={styles.preview}>ILLUSTRATIVE PREVIEW</span>
        </span>
      )}
    </span>
  )
}
