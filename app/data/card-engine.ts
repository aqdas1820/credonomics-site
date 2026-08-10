import type { CardCategory } from './card-database'

export type SpendProfile = Record<CardCategory, number>

export type CustomCardModel = {
  id: string
  name: string
  annualFeeRupees: number
  annualFeeTaxRatePercent: number
  waiverSpendRupees: number
  baseRatePercent: number
  categoryRates: Partial<Record<CardCategory, number>>
  monthlyCaps: Partial<Record<CardCategory, number>>
}

export type CategoryBreakdown = {
  category: CardCategory
  annualSpend: number
  appliedRatePercent: number
  theoreticalReward: number
  actualReward: number
  capLoss: number
}

export type ScoreBreakdown = {
  rewardPotential: number
  feeEfficiency: number
  capEfficiency: number
  baseRateResilience: number
  spendFit: number
  total: number
}

export type CardAnalysis = {
  id: string
  name: string
  annualSpend: number
  grossReward: number
  theoreticalReward: number
  capLoss: number
  feePaid: number
  feeWaived: boolean
  netAnnualValue: number
  grossRewardRate: number
  effectiveReturn: number
  boostedSpendShare: number
  categoryBreakdown: CategoryBreakdown[]
  score: ScoreBreakdown
}

export const categories: Array<{ key: CardCategory; label: string }> = [
  { key: 'online', label: 'Online shopping' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'dining', label: 'Dining' },
  { key: 'travel', label: 'Travel' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'other', label: 'Other spend' },
]

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

const money = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0)

export function analyseCard(card: CustomCardModel, monthlySpend: SpendProfile): CardAnalysis {
  const annualSpend = Object.values(monthlySpend).reduce((sum, value) => sum + money(value) * 12, 0)

  const categoryBreakdown = categories.map(({ key }) => {
    const spend = money(monthlySpend[key]) * 12
    const explicitRate = card.categoryRates[key]
    const rate = Math.max(0, explicitRate ?? card.baseRatePercent)
    const theoreticalReward = spend * (rate / 100)
    const monthlyCap = money(card.monthlyCaps[key] ?? 0)
    const annualCap = monthlyCap > 0 ? monthlyCap * 12 : Number.POSITIVE_INFINITY
    const actualReward = Math.min(theoreticalReward, annualCap)

    return {
      category: key,
      annualSpend: spend,
      appliedRatePercent: rate,
      theoreticalReward,
      actualReward,
      capLoss: Math.max(0, theoreticalReward - actualReward),
    }
  })

  const grossReward = categoryBreakdown.reduce((sum, row) => sum + row.actualReward, 0)
  const theoreticalReward = categoryBreakdown.reduce((sum, row) => sum + row.theoreticalReward, 0)
  const capLoss = Math.max(0, theoreticalReward - grossReward)

  const waiverThreshold = money(card.waiverSpendRupees)
  const feeWaived = waiverThreshold > 0 && annualSpend >= waiverThreshold
  const feeWithTax = money(card.annualFeeRupees) * (1 + money(card.annualFeeTaxRatePercent) / 100)
  const feePaid = feeWaived ? 0 : feeWithTax
  const netAnnualValue = grossReward - feePaid

  const grossRewardRate = annualSpend > 0 ? (grossReward / annualSpend) * 100 : 0
  const effectiveReturn = annualSpend > 0 ? (netAnnualValue / annualSpend) * 100 : 0

  const boostedSpend = categoryBreakdown
    .filter((row) => row.appliedRatePercent > card.baseRatePercent)
    .reduce((sum, row) => sum + row.annualSpend, 0)
  const boostedSpendShare = annualSpend > 0 ? boostedSpend / annualSpend : 0

  // CredoNomics Fit Score: a disclosed decision heuristic, not a credit score.
  // Benchmarks intentionally stay simple and inspectable.
  const rewardPotential = clamp((grossRewardRate / 5) * 40, 0, 40)
  const feeEfficiency =
    grossReward <= 0 ? 0 : clamp(20 * (1 - feePaid / Math.max(grossReward, 1)), 0, 20)
  const capEfficiency =
    theoreticalReward <= 0 ? 15 : clamp(15 * (grossReward / theoreticalReward), 0, 15)
  const baseRateResilience = clamp((money(card.baseRatePercent) / 1.5) * 15, 0, 15)
  const spendFit = clamp(boostedSpendShare * 10, 0, 10)
  const total = rewardPotential + feeEfficiency + capEfficiency + baseRateResilience + spendFit

  return {
    id: card.id,
    name: card.name || 'Unnamed card',
    annualSpend,
    grossReward,
    theoreticalReward,
    capLoss,
    feePaid,
    feeWaived,
    netAnnualValue,
    grossRewardRate,
    effectiveReturn,
    boostedSpendShare,
    categoryBreakdown,
    score: {
      rewardPotential,
      feeEfficiency,
      capEfficiency,
      baseRateResilience,
      spendFit,
      total: clamp(total, 0, 100),
    },
  }
}

export function rankCards(cards: CustomCardModel[], monthlySpend: SpendProfile) {
  return cards
    .map((card) => analyseCard(card, monthlySpend))
    .sort((a, b) => b.netAnnualValue - a.netAnnualValue)
}

export const emptySpendProfile: SpendProfile = {
  online: 0,
  groceries: 0,
  dining: 0,
  travel: 0,
  fuel: 0,
  utilities: 0,
  other: 0,
}
