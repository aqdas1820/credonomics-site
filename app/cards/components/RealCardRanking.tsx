import type { CardCategorySlug } from '../../data/card-categories'
import { realCardsForCategory } from '../../data/verified-real-cards'
import RealCardRankingClient from './RealCardRankingClient'

export default function RealCardRanking({
  categorySlug,
  cardIds,
}: {
  categorySlug: CardCategorySlug
  cardIds?: string[]
}) {
  let cards = realCardsForCategory(categorySlug)

  if (cardIds?.length) {
    const allowed = new Set(cardIds)
    cards = cards.filter((card) => allowed.has(card.id))
  }

  return <RealCardRankingClient categorySlug={categorySlug} cards={cards} />
}
