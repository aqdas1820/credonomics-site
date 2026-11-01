import type { CardCategorySlug } from './card-categories'

export type DirectoryCompareCard = {
  id: string
  categories: Array<{ slug: CardCategorySlug }>
}

/**
 * Shared category is required because /cards/compare evaluates cards only
 * within its selected normalized category. Never promise a cross-category
 * comparison that the ranking engine cannot actually perform.
 */
export function buildDirectoryCompareLink(
  cards: DirectoryCompareCard[],
  preferredCategory: CardCategorySlug | 'All' = 'All',
): string | null {
  if (cards.length < 2 || cards.length > 3 || new Set(cards.map(card => card.id)).size !== cards.length) return null
  const first = cards[0].categories.map(category => category.slug)
  const shared = first.filter(slug => cards.every(card => card.categories.some(item => item.slug === slug)))
  if (!shared.length) return null
  const category = preferredCategory !== 'All' && shared.includes(preferredCategory) ? preferredCategory : shared[0]
  const params = new URLSearchParams({ category, cards: cards.map(card => card.id).join(',') })
  return '/cards/compare?' + params.toString()
}

/**
 * Accept only distinct IDs that are actually eligible for the selected category.
 * This protects shareable /cards/compare URLs from stale, malformed or cross-category IDs.
 */
export function sanitizeRequestedCompareIds(
  requestedIds: string[],
  candidateIds: string[],
  maxCards = 3,
): string[] {
  const allowed = new Set(candidateIds)
  const seen = new Set<string>()
  const valid: string[] = []

  for (const id of requestedIds) {
    if (!allowed.has(id) || seen.has(id)) continue
    seen.add(id)
    valid.push(id)
    if (valid.length >= maxCards) break
  }

  return valid
}
