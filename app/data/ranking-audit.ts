import baseline from '../../public/data/research-updates/2026-10-ranking-baseline.json'
import { verifiedRealCards } from './verified-real-cards'
import { analyseCard, type Profile } from './real-card-ranking'
import { cardCategoryMap, type CardCategorySlug } from './card-categories'

export function getRankingAudit() {
  return baseline.scenarios.map(scenario => {
    const category = scenario.category as CardCategorySlug
    const current = verifiedRealCards.filter(card => card.terms[category] && card.terms[category]?.rankingEligible !== false)
      .map(card => analyseCard(card, category, scenario.profile as Profile))
      .sort((a, b) => b.netValue - a.netValue)
    const rows = scenario.ranking.map(before => {
      const index = current.findIndex(row => row.card.id === before.id)
      return { id: before.id, name: before.name, beforeRank: before.rank, afterRank: index < 0 ? null : index + 1,
        beforeValue: Math.round(before.netValue), afterValue: index < 0 ? null : Math.round(current[index].netValue) }
    })
    current.forEach((row, index) => {
      if (!rows.some(item => item.id === row.card.id)) rows.push({ id: row.card.id, name: row.card.name,
        beforeRank: 0, afterRank: index + 1, beforeValue: 0, afterValue: Math.round(row.netValue) })
    })
    return { category, label: cardCategoryMap[category].shortTitle, monthlySpend: scenario.monthlySpend,
      annualRetailSpend: scenario.profile.annualRetailSpend, monthlyBaseSpend: scenario.profile.monthlyBaseSpend,
      rows: rows.filter(row => row.beforeRank !== row.afterRank || row.beforeValue !== row.afterValue)
        .sort((a, b) => (a.afterRank ?? 99) - (b.afterRank ?? 99)) }
  })
}
