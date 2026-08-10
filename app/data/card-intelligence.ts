import type { CardCategorySlug } from './card-categories'
import { cardCategoryMap } from './card-categories'
import { issuerForName } from './issuer-registry'
import { verifiedRealCards, type VerifiedRealCard } from './verified-real-cards'

export type CardHistoryEntry = {
  date: string
  type: 'verified' | 'term-change' | 'source-change'
  title: string
  description: string
}

export function getRealCard(id: string) {
  return verifiedRealCards.find((card) => card.id === id)
}

export function categoriesForCard(card: VerifiedRealCard): CardCategorySlug[] {
  return Object.keys(card.terms).filter((key) => Boolean(card.terms[key as CardCategorySlug])) as CardCategorySlug[]
}

export function primaryCategoryForCard(card: VerifiedRealCard): CardCategorySlug | undefined {
  const priority: CardCategorySlug[] = [
    'cashback',
    'fuel',
    'travel',
    'shopping',
    'grocery',
    'dining',
    'utilities',
    'upi',
    'forex',
    'lounge',
    'premium',
    'business',
    'lifetime-free',
    'beginner',
    'low-fee',
    'co-branded',
  ]
  const categories = new Set(categoriesForCard(card))
  return priority.find((category) => categories.has(category))
}

export function issuerSlugForCard(card: VerifiedRealCard) {
  return issuerForName(card.issuer)?.slug
}

export function cardsForIssuerName(name: string) {
  const lower = name.toLowerCase()
  return verifiedRealCards.filter((card) => card.issuer.toLowerCase() === lower)
}

export function relatedCards(card: VerifiedRealCard, limit = 6) {
  const cardCategories = new Set(categoriesForCard(card))

  return verifiedRealCards
    .filter((candidate) => candidate.id !== card.id)
    .map((candidate) => {
      const overlap = categoriesForCard(candidate).filter((category) => cardCategories.has(category)).length
      const sameIssuer = candidate.issuer === card.issuer ? 2 : 0
      return { candidate, score: overlap * 3 + sameIssuer }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map((item) => item.candidate)
}

export function historyForCard(card: VerifiedRealCard): CardHistoryEntry[] {
  return [
    {
      date: card.verifiedAt,
      type: 'verified',
      title: 'CredoNomics verification record',
      description:
        'The normalized terms used by the live category rankings were checked against the linked official issuer source.',
    },
  ]
}

export function categoryLabel(category: CardCategorySlug) {
  return cardCategoryMap[category]?.shortTitle ?? category
}
