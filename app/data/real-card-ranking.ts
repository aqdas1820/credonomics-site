import type { CardCategorySlug } from './card-categories'
import type { RealCardTerms, VerifiedRealCard } from './verified-real-cards'

export type Profile = {
  monthlySpend: number
  monthlyBaseSpend: number
  annualRetailSpend: number
  annualForeignSpend: number
  loungeVisits: number
  loungeValue: number
  partnerSpendShare: number
  preferredFuelNetwork: string
}

export type RankedCard = {
  card: VerifiedRealCard
  terms: RealCardTerms
  grossValue: number
  feeCost: number
  netValue: number
  effectiveReturn: number
  benefitCapLoss: number
  secondaryValue: number
  annualSpendBasis: number
}

export const defaultProfile: Profile = {
  monthlySpend: 10000,
  monthlyBaseSpend: 0,
  annualRetailSpend: 240000,
  annualForeignSpend: 100000,
  loungeVisits: 6,
  loungeValue: 700,
  partnerSpendShare: 70,
  preferredFuelNetwork: 'Any',
}

function tieredMonthlyValue(spend: number, terms: RealCardTerms) {
  if (!terms.monthlyTiers?.length) {
    return spend * (terms.ratePercent ?? 0) / 100
  }

  let remaining = spend
  let previous = 0
  let value = 0

  for (const tier of terms.monthlyTiers) {
    const ceiling = tier.upto
    if (ceiling === undefined) {
      value += remaining * tier.ratePercent / 100
      remaining = 0
      break
    }

    const width = Math.max(0, ceiling - previous)
    const slice = Math.min(remaining, width)
    value += slice * tier.ratePercent / 100
    remaining -= slice
    previous = ceiling
    if (remaining <= 0) break
  }

  return value
}

function recurringAnnual(spendMonthly: number, terms: RealCardTerms, baseSpend = 0) {
  const theoreticalMonthly = tieredMonthlyValue(spendMonthly, terms)
  const monthlyAfterCap =
    terms.monthlyCapRupees !== undefined
      ? Math.min(theoreticalMonthly, terms.monthlyCapRupees)
      : theoreticalMonthly

  const conditionalMonthly = terms.baseCashbackCapMultiplier !== undefined
    ? Math.min(monthlyAfterCap, Math.max(0, baseSpend) * 0.01 * terms.baseCashbackCapMultiplier)
    : monthlyAfterCap
  const annualBeforeAnnualCap = conditionalMonthly * 12
  const actual =
    terms.annualCapRupees !== undefined
      ? Math.min(annualBeforeAnnualCap, terms.annualCapRupees)
      : annualBeforeAnnualCap

  return {
    actual,
    theoretical: theoreticalMonthly * 12,
  }
}

function annualFeeCost(card: VerifiedRealCard, profile: Profile) {
  const waived =
    card.feeWaiverAnnualSpendRupees !== undefined &&
    profile.annualRetailSpend >= card.feeWaiverAnnualSpendRupees

  if (waived || card.annualFeeRupees === 0) return 0
  return card.annualFeeRupees * (1 + card.feeTaxPercent / 100)
}

export function analyseCard(card: VerifiedRealCard, category: CardCategorySlug, profile: Profile): RankedCard {
  const terms = card.terms[category]!
  let grossValue = 0
  let theoreticalValue = 0
  let secondaryValue = 0
  let annualSpendBasis = profile.monthlySpend * 12

  if (category === 'fuel') {
    const primary = recurringAnnual(profile.monthlySpend, terms)
    grossValue += primary.actual
    theoreticalValue += primary.theoretical

    const secondaryTheoretical = profile.monthlySpend * (terms.secondaryRatePercent ?? 0) / 100
    const secondaryMonthly =
      terms.secondaryMonthlyCapRupees !== undefined
        ? Math.min(secondaryTheoretical, terms.secondaryMonthlyCapRupees)
        : secondaryTheoretical

    secondaryValue = secondaryMonthly * 12
    grossValue += secondaryValue
    theoreticalValue += secondaryTheoretical * 12
  } else if (category === 'travel') {
    const travel = recurringAnnual(profile.monthlySpend, terms)
    const lounge = Math.min(profile.loungeVisits, terms.loungeVisits ?? 0) * profile.loungeValue
    const forexCost = profile.annualForeignSpend * (terms.forexMarkupPercent ?? 0) / 100

    grossValue = travel.actual + lounge + (terms.fixedAnnualValueRupees ?? 0) - forexCost
    theoreticalValue = travel.theoretical + lounge + (terms.fixedAnnualValueRupees ?? 0)
    annualSpendBasis = profile.monthlySpend * 12 + profile.annualForeignSpend
  } else if (category === 'forex') {
    const reward = profile.annualForeignSpend * (terms.ratePercent ?? 0) / 100
    const forexCost = profile.annualForeignSpend * (terms.forexMarkupPercent ?? 0) / 100
    grossValue = reward - forexCost
    theoreticalValue = reward
    annualSpendBasis = profile.annualForeignSpend
  } else if (category === 'lounge') {
    const visits = Math.min(profile.loungeVisits, terms.loungeVisits ?? 0)
    grossValue = visits * profile.loungeValue
    theoreticalValue = profile.loungeVisits * profile.loungeValue
    annualSpendBasis = profile.annualRetailSpend
  } else if (category === 'co-branded') {
    const annualSpend = profile.monthlySpend * 12
    const partnerShare = Math.min(100, Math.max(0, profile.partnerSpendShare)) / 100
    const partnerSpend = annualSpend * partnerShare
    const otherSpend = annualSpend - partnerSpend
    const partnerReward = partnerSpend * (terms.ratePercent ?? 0) / 100
    const otherReward = otherSpend * (terms.baseRatePercent ?? 0) / 100
    const cappedPartner = recurringAnnual(partnerSpend / 12, terms, otherSpend / 12).actual
    grossValue = cappedPartner + otherReward + (terms.fixedAnnualValueRupees ?? 0)
    theoreticalValue = partnerReward + otherReward + (terms.fixedAnnualValueRupees ?? 0)
    annualSpendBasis = annualSpend
  } else if (category === 'premium') {
    const recurring = recurringAnnual(profile.monthlySpend, terms, profile.monthlyBaseSpend)
    const lounge = Math.min(profile.loungeVisits, terms.loungeVisits ?? 0) * profile.loungeValue
    const forexCost = profile.annualForeignSpend * (terms.forexMarkupPercent ?? 0) / 100
    grossValue = recurring.actual + lounge + (terms.fixedAnnualValueRupees ?? 0) - forexCost
    theoreticalValue = recurring.theoretical + lounge + (terms.fixedAnnualValueRupees ?? 0)
    annualSpendBasis = profile.monthlySpend * 12 + profile.annualForeignSpend
  } else {
    const recurring = recurringAnnual(profile.monthlySpend, terms, profile.monthlyBaseSpend)
    grossValue = recurring.actual + (terms.fixedAnnualValueRupees ?? 0)
    theoreticalValue = recurring.theoretical + (terms.fixedAnnualValueRupees ?? 0)
  }

  const feeCost = annualFeeCost(card, profile)
  const netValue = grossValue - feeCost
  const effectiveReturn = annualSpendBasis > 0 ? (netValue / annualSpendBasis) * 100 : 0

  return {
    card,
    terms,
    grossValue,
    feeCost,
    netValue,
    effectiveReturn,
    benefitCapLoss: Math.max(0, theoreticalValue - grossValue),
    secondaryValue,
    annualSpendBasis,
  }
}

