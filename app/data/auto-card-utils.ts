import { autoCardCatalog, autoCardCatalogMeta, type AutoCardCatalogRecord } from './auto-card-catalog.generated'
import type { CardCategorySlug } from './card-categories'

export { autoCardCatalogMeta }

export function getAutoTopCards(category: CardCategorySlug, limit = 15): AutoCardCatalogRecord[] {
  return autoCardCatalog
    .filter((card) => (card.categoryScores?.[category] ?? 0) > 0)
    .sort((a, b) => {
      const scoreDiff = (b.categoryScores?.[category] ?? 0) - (a.categoryScores?.[category] ?? 0)
      if (scoreDiff !== 0) return scoreDiff
      const confidenceWeight = { high: 3, medium: 2, low: 1 }
      const confidenceDiff = confidenceWeight[b.confidence] - confidenceWeight[a.confidence]
      if (confidenceDiff !== 0) return confidenceDiff
      return a.name.localeCompare(b.name)
    })
    .slice(0, limit)
}

export function categoryRecordCount(category: CardCategorySlug) {
  return autoCardCatalog.filter((card) => (card.categoryScores?.[category] ?? 0) > 0).length
}
