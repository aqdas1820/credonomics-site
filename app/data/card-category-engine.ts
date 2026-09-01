import { cardCategoryMap, type CardCategorySlug } from './card-categories'

export type CategoryScenario = Record<string, number>

export type CategoryCardModel = {
  id: string
  name: string
  values: Record<string, number>
}

export type ResultMetric = {
  label: string
  value: number
  format: 'currency' | 'percent' | 'number'
}

export type ScorePart = {
  label: string
  points: number
  max: number
}

export type CategoryAnalysis = {
  id: string
  name: string
  netValue: number
  netLabel: string
  effectiveRate: number
  grossBenefit: number
  totalCost: number
  leakage: number
  metrics: ResultMetric[]
  score: number
  scoreParts: ScorePart[]
  explanation: string[]
}

const safe = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0)
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const feeCost = (values: Record<string, number>, annualSpend: number) => {
  const annualFee = safe(values.annualFee)
  const tax = safe(values.feeTax)
  const waiverSpend = safe(values.waiverSpend)
  const waived = waiverSpend > 0 && annualSpend >= waiverSpend
  return {
    waived,
    cost: waived ? 0 : annualFee * (1 + tax / 100),
  }
}

const cappedAnnualReward = (annualSpend: number, rate: number, monthlyCap: number) => {
  const theoretical = annualSpend * safe(rate) / 100
  const cap = safe(monthlyCap)
  const actual = cap > 0 ? Math.min(theoretical, cap * 12) : theoretical
  return { theoretical, actual, leakage: Math.max(0, theoretical - actual) }
}

const standardScore = ({
  grossRate,
  fee,
  grossBenefit,
  theoreticalBenefit,
  netRate,
  fit = 1,
  beginnerBias = false,
}: {
  grossRate: number
  fee: number
  grossBenefit: number
  theoreticalBenefit: number
  netRate: number
  fit?: number
  beginnerBias?: boolean
}) => {
  const rewardMax = beginnerBias ? 30 : 40
  const feeMax = beginnerBias ? 30 : 20
  const capMax = 15
  const resilienceMax = beginnerBias ? 15 : 15
  const fitMax = beginnerBias ? 10 : 10

  const reward = clamp((grossRate / 5) * rewardMax, 0, rewardMax)
  const feeEfficiency = grossBenefit <= 0
    ? (fee === 0 ? feeMax : 0)
    : clamp(feeMax * (1 - fee / Math.max(grossBenefit, 1)), 0, feeMax)
  const capEfficiency = theoreticalBenefit <= 0
    ? capMax
    : clamp(capMax * (grossBenefit / theoreticalBenefit), 0, capMax)
  const resilience = clamp((Math.max(netRate, 0) / 3) * resilienceMax, 0, resilienceMax)
  const spendFit = clamp(fit * fitMax, 0, fitMax)

  const parts: ScorePart[] = [
    { label: 'Reward', points: reward, max: rewardMax },
    { label: 'Fee', points: feeEfficiency, max: feeMax },
    { label: 'Caps', points: capEfficiency, max: capMax },
    { label: 'Net value', points: resilience, max: resilienceMax },
    { label: 'Spend fit', points: spendFit, max: fitMax },
  ]

  return { parts, total: clamp(parts.reduce((sum, part) => sum + part.points, 0), 0, 100) }
}

const standardCategory = (
  slug: CardCategorySlug,
  card: CategoryCardModel,
  scenario: CategoryScenario,
): CategoryAnalysis => {
  const config = cardCategoryMap[slug]
  const monthlySpend = safe(scenario.monthlySpend)
  const annualSpend = monthlySpend * 12
  const reward = cappedAnnualReward(annualSpend, card.values.rewardRate, card.values.monthlyCap)
  const fee = feeCost(card.values, annualSpend)
  const net = reward.actual - fee.cost
  const grossRate = annualSpend > 0 ? reward.actual / annualSpend * 100 : 0
  const netRate = annualSpend > 0 ? net / annualSpend * 100 : 0

  const scored = standardScore({
    grossRate,
    fee: fee.cost,
    grossBenefit: reward.actual,
    theoreticalBenefit: reward.theoretical,
    netRate,
    beginnerBias: slug === 'beginner',
  })

  return {
    id: card.id,
    name: card.name,
    netValue: net,
    netLabel: config.netLabel,
    effectiveRate: netRate,
    grossBenefit: reward.actual,
    totalCost: fee.cost,
    leakage: reward.leakage,
    metrics: [
      { label: 'Gross reward', value: reward.actual, format: 'currency' },
      { label: 'Annual fee cost', value: fee.cost, format: 'currency' },
      { label: 'Cap leakage', value: reward.leakage, format: 'currency' },
      { label: 'Effective return', value: netRate, format: 'percent' },
    ],
    score: scored.total,
    scoreParts: scored.parts,
    explanation: [
      reward.leakage > 0
        ? `The modeled monthly cap removes value from the theoretical reward amount.`
        : `The modeled reward cap does not reduce value at this spending level.`,
      fee.waived
        ? `The modeled annual spending clears the fee-waiver threshold.`
        : fee.cost > 0
          ? `Annual fee and fee tax reduce the modeled value.`
          : `No annual ownership fee is included in this model.`,
    ],
  }
}

export function defaultScenario(slug: CardCategorySlug): CategoryScenario {
  return Object.fromEntries(
    cardCategoryMap[slug].scenarioFields.map((field) => [field.key, field.defaultValue]),
  )
}

export function defaultCategoryCard(slug: CardCategorySlug, index: number): CategoryCardModel {
  return {
    id: `category-${slug}-${Date.now()}-${index}`,
    name: `Card ${String.fromCharCode(64 + index)}`,
    values: Object.fromEntries(
      cardCategoryMap[slug].cardFields.map((field) => [field.key, field.defaultValue]),
    ),
  }
}

export function analyseCategoryCard(
  slug: CardCategorySlug,
  card: CategoryCardModel,
  scenario: CategoryScenario,
): CategoryAnalysis {
  const config = cardCategoryMap[slug]

  if (['cashback','shopping','grocery','dining','utilities','upi','business','beginner','low-fee'].includes(slug)) {
    return standardCategory(slug, card, scenario)
  }

  if (slug === 'lifetime-free') {
    const annualSpend = safe(scenario.monthlySpend) * 12
    const reward = cappedAnnualReward(annualSpend, card.values.rewardRate, card.values.monthlyCap)
    const netRate = annualSpend > 0 ? reward.actual / annualSpend * 100 : 0
    const scored = standardScore({
      grossRate: netRate,
      fee: 0,
      grossBenefit: reward.actual,
      theoreticalBenefit: reward.theoretical,
      netRate,
    })
    scored.parts[1] = { label: 'No-fee', points: 20, max: 20 }
    scored.total = clamp(scored.parts.reduce((sum, part) => sum + part.points, 0), 0, 100)

    return {
      id: card.id,
      name: card.name,
      netValue: reward.actual,
      netLabel: config.netLabel,
      effectiveRate: netRate,
      grossBenefit: reward.actual,
      totalCost: 0,
      leakage: reward.leakage,
      metrics: [
        { label: 'Annual reward', value: reward.actual, format: 'currency' },
        { label: 'Annual fee', value: 0, format: 'currency' },
        { label: 'Cap leakage', value: reward.leakage, format: 'currency' },
        { label: 'Effective return', value: netRate, format: 'percent' },
      ],
      score: scored.total,
      scoreParts: scored.parts,
      explanation: [
        'The model assumes no annual ownership fee.',
        reward.leakage > 0 ? 'The reward cap reduces annual value.' : 'No modeled reward value is lost to the cap.',
      ],
    }
  }

  if (slug === 'fuel') {
    const annualSpend = safe(scenario.monthlyFuelSpend) * 12
    const rewards = cappedAnnualReward(annualSpend, card.values.rewardRate, card.values.rewardCap)
    const theoreticalWaiver = annualSpend * safe(card.values.waiverRate) / 100
    const waiverCap = safe(card.values.waiverCap)
    const waiver = waiverCap > 0 ? Math.min(theoreticalWaiver, waiverCap * 12) : theoreticalWaiver
    const waiverLeakage = Math.max(0, theoreticalWaiver - waiver)
    const gross = rewards.actual + waiver
    const theoretical = rewards.theoretical + theoreticalWaiver
    const fee = feeCost(card.values, annualSpend)
    const net = gross - fee.cost
    const grossRate = annualSpend > 0 ? gross / annualSpend * 100 : 0
    const netRate = annualSpend > 0 ? net / annualSpend * 100 : 0
    const scored = standardScore({
      grossRate,
      fee: fee.cost,
      grossBenefit: gross,
      theoreticalBenefit: theoretical,
      netRate,
    })

    return {
      id: card.id,
      name: card.name,
      netValue: net,
      netLabel: config.netLabel,
      effectiveRate: netRate,
      grossBenefit: gross,
      totalCost: fee.cost,
      leakage: rewards.leakage + waiverLeakage,
      metrics: [
        { label: 'Fuel rewards', value: rewards.actual, format: 'currency' },
        { label: 'Surcharge waiver', value: waiver, format: 'currency' },
        { label: 'Annual fee cost', value: fee.cost, format: 'currency' },
        { label: 'Effective return', value: netRate, format: 'percent' },
      ],
      score: scored.total,
      scoreParts: scored.parts,
      explanation: [
        'Fuel rewards and surcharge waiver are calculated independently.',
        rewards.leakage + waiverLeakage > 0 ? 'One or more modeled monthly caps reduce annual benefit.' : 'No modeled fuel benefit is lost to the entered caps.',
      ],
    }
  }

  if (slug === 'travel') {
    const annualTravelSpend = safe(scenario.monthlyTravelSpend) * 12
    const annualForeignSpend = safe(scenario.annualForeignSpend)
    const totalSpend = annualTravelSpend + annualForeignSpend
    const travelRewards = annualTravelSpend * safe(card.values.travelRewardRate) / 100
    const foreignRewards = annualForeignSpend * safe(card.values.foreignRewardRate) / 100
    const forexCost = annualForeignSpend * safe(card.values.forexMarkup) / 100
    const loungeVisits = Math.min(safe(scenario.loungeVisits), safe(card.values.freeLoungeVisits))
    const loungeBenefit = loungeVisits * safe(scenario.loungeValue)
    const fee = feeCost(card.values, totalSpend)
    const gross = travelRewards + foreignRewards + loungeBenefit
    const cost = forexCost + fee.cost
    const net = gross - cost
    const netRate = totalSpend > 0 ? net / totalSpend * 100 : 0

    const rewardPart = clamp(((travelRewards + foreignRewards) / Math.max(totalSpend, 1) * 100 / 5) * 30, 0, 30)
    const forexPart = clamp((1 - safe(card.values.forexMarkup) / 4) * 25, 0, 25)
    const loungePart = safe(scenario.loungeVisits) > 0
      ? clamp((loungeVisits / safe(scenario.loungeVisits)) * 20, 0, 20)
      : 20
    const feePart = gross > 0 ? clamp(15 * (1 - fee.cost / Math.max(gross, 1)), 0, 15) : (fee.cost === 0 ? 15 : 0)
    const netPart = clamp((Math.max(netRate, 0) / 3) * 10, 0, 10)
    const parts = [
      { label: 'Rewards', points: rewardPart, max: 30 },
      { label: 'Forex', points: forexPart, max: 25 },
      { label: 'Lounge', points: loungePart, max: 20 },
      { label: 'Fee', points: feePart, max: 15 },
      { label: 'Net value', points: netPart, max: 10 },
    ]

    return {
      id: card.id,
      name: card.name,
      netValue: net,
      netLabel: config.netLabel,
      effectiveRate: netRate,
      grossBenefit: gross,
      totalCost: cost,
      leakage: 0,
      metrics: [
        { label: 'Travel + forex rewards', value: travelRewards + foreignRewards, format: 'currency' },
        { label: 'Usable lounge value', value: loungeBenefit, format: 'currency' },
        { label: 'Forex + fee cost', value: cost, format: 'currency' },
        { label: 'Effective net return', value: netRate, format: 'percent' },
      ],
      score: clamp(parts.reduce((sum, part) => sum + part.points, 0), 0, 100),
      scoreParts: parts,
      explanation: [
        `The model values ${loungeVisits} complimentary lounge visit${loungeVisits === 1 ? '' : 's'} based on your expected usage.`,
        forexCost > 0 ? 'Forex markup is treated as a direct annual cost.' : 'No forex markup cost is included in the model.',
      ],
    }
  }

  if (slug === 'forex') {
    const spend = safe(scenario.annualForeignSpend)
    const rewards = spend * safe(card.values.foreignRewardRate) / 100
    const forexCost = spend * safe(card.values.forexMarkup) / 100
    const fee = feeCost(card.values, spend)
    const totalCost = forexCost + fee.cost
    const net = rewards - totalCost
    const effectiveCost = spend > 0 ? (totalCost - rewards) / spend * 100 : 0

    const markupPart = clamp((1 - safe(card.values.forexMarkup) / 4) * 35, 0, 35)
    const rewardPart = clamp((safe(card.values.foreignRewardRate) / 4) * 25, 0, 25)
    const feePart = rewards > 0 ? clamp(20 * (1 - fee.cost / Math.max(rewards, 1)), 0, 20) : (fee.cost === 0 ? 20 : 0)
    const costPart = clamp((1 - Math.max(effectiveCost, 0) / 4) * 20, 0, 20)
    const parts = [
      { label: 'Forex cost', points: markupPart, max: 35 },
      { label: 'Rewards', points: rewardPart, max: 25 },
      { label: 'Fee', points: feePart, max: 20 },
      { label: 'Net cost', points: costPart, max: 20 },
    ]

    return {
      id: card.id,
      name: card.name,
      netValue: net,
      netLabel: config.netLabel,
      effectiveRate: -effectiveCost,
      grossBenefit: rewards,
      totalCost,
      leakage: 0,
      metrics: [
        { label: 'Foreign-spend rewards', value: rewards, format: 'currency' },
        { label: 'Forex markup cost', value: forexCost, format: 'currency' },
        { label: 'Annual fee cost', value: fee.cost, format: 'currency' },
        { label: 'Effective forex cost', value: effectiveCost, format: 'percent' },
      ],
      score: clamp(parts.reduce((sum, part) => sum + part.points, 0), 0, 100),
      scoreParts: parts,
      explanation: [
        'Foreign-spend rewards offset forex markup only to the extent entered in the model.',
        effectiveCost <= 0 ? 'Modeled rewards fully offset the entered forex and annual fee cost.' : 'A positive effective forex cost remains after rewards.',
      ],
    }
  }

  if (slug === 'lounge') {
    const desiredVisits = safe(scenario.loungeVisits)
    const usableVisits = Math.min(desiredVisits, safe(card.values.freeLoungeVisits))
    const gross = usableVisits * safe(scenario.loungeValue)
    const fee = feeCost(card.values, safe(scenario.annualCardSpend))
    const net = gross - fee.cost
    const coverage = desiredVisits > 0 ? usableVisits / desiredVisits : 1
    const visitPart = clamp(coverage * 50, 0, 50)
    const feePart = gross > 0 ? clamp(25 * (1 - fee.cost / Math.max(gross, 1)), 0, 25) : (fee.cost === 0 ? 25 : 0)
    const netPart = gross > 0 ? clamp((Math.max(net, 0) / gross) * 25, 0, 25) : 0
    const parts = [
      { label: 'Visit coverage', points: visitPart, max: 50 },
      { label: 'Fee', points: feePart, max: 25 },
      { label: 'Usable value', points: netPart, max: 25 },
    ]

    return {
      id: card.id,
      name: card.name,
      netValue: net,
      netLabel: config.netLabel,
      effectiveRate: 0,
      grossBenefit: gross,
      totalCost: fee.cost,
      leakage: 0,
      metrics: [
        { label: 'Usable visits', value: usableVisits, format: 'number' },
        { label: 'Gross lounge value', value: gross, format: 'currency' },
        { label: 'Annual fee cost', value: fee.cost, format: 'currency' },
        { label: 'Visit coverage', value: coverage * 100, format: 'percent' },
      ],
      score: clamp(parts.reduce((sum, part) => sum + part.points, 0), 0, 100),
      scoreParts: parts,
      explanation: [
        `The model values only ${usableVisits} of ${desiredVisits} expected annual visit${desiredVisits === 1 ? '' : 's'}.`,
        'Retail lounge pricing is not assumed; the value per visit comes from your own input.',
      ],
    }
  }

  if (slug === 'premium') {
    const annualSpend = safe(scenario.monthlySpend) * 12
    const reward = annualSpend * safe(card.values.rewardRate) / 100
    const milestone = safe(card.values.milestoneValue)
    const lifestyle = safe(card.values.lifestyleValue)
    const fee = feeCost(card.values, annualSpend)
    const gross = reward + milestone + lifestyle
    const net = gross - fee.cost
    const netRate = annualSpend > 0 ? net / annualSpend * 100 : 0
    const rewardPart = clamp((safe(card.values.rewardRate) / 5) * 30, 0, 30)
    const extrasPart = gross > 0 ? clamp(((milestone + lifestyle) / gross) * 25, 0, 25) : 0
    const feePart = gross > 0 ? clamp(20 * (1 - fee.cost / Math.max(gross, 1)), 0, 20) : (fee.cost === 0 ? 20 : 0)
    const netPart = clamp((Math.max(netRate, 0) / 4) * 25, 0, 25)
    const parts = [
      { label: 'Rewards', points: rewardPart, max: 30 },
      { label: 'Usable extras', points: extrasPart, max: 25 },
      { label: 'Fee', points: feePart, max: 20 },
      { label: 'Net value', points: netPart, max: 25 },
    ]

    return {
      id: card.id,
      name: card.name,
      netValue: net,
      netLabel: config.netLabel,
      effectiveRate: netRate,
      grossBenefit: gross,
      totalCost: fee.cost,
      leakage: 0,
      metrics: [
        { label: 'Recurring rewards', value: reward, format: 'currency' },
        { label: 'Usable extra benefits', value: milestone + lifestyle, format: 'currency' },
        { label: 'Annual fee cost', value: fee.cost, format: 'currency' },
        { label: 'Effective return', value: netRate, format: 'percent' },
      ],
      score: clamp(parts.reduce((sum, part) => sum + part.points, 0), 0, 100),
      scoreParts: parts,
      explanation: [
        'Milestone and lifestyle benefits are included only at the rupee values you entered.',
        fee.waived ? 'The modeled annual spend clears the fee-waiver threshold.' : 'Annual ownership cost remains in the model.',
      ],
    }
  }

  if (slug === 'co-branded') {
    const partnerAnnual = safe(scenario.monthlyPartnerSpend) * 12
    const otherAnnual = safe(scenario.monthlyOtherSpend) * 12
    const totalSpend = partnerAnnual + otherAnnual
    const partner = cappedAnnualReward(partnerAnnual, card.values.partnerRate, card.values.monthlyCap)
    const baseReward = otherAnnual * safe(card.values.baseRate) / 100
    const gross = partner.actual + baseReward
    const theoretical = partner.theoretical + baseReward
    const fee = feeCost(card.values, totalSpend)
    const net = gross - fee.cost
    const netRate = totalSpend > 0 ? net / totalSpend * 100 : 0
    const partnerShare = totalSpend > 0 ? partnerAnnual / totalSpend : 0
    const partnerPart = clamp((safe(card.values.partnerRate) / 8) * 40, 0, 40)
    const basePart = clamp((safe(card.values.baseRate) / 2) * 15, 0, 15)
    const capPart = theoretical > 0 ? clamp((gross / theoretical) * 15, 0, 15) : 15
    const feePart = gross > 0 ? clamp(15 * (1 - fee.cost / Math.max(gross, 1)), 0, 15) : (fee.cost === 0 ? 15 : 0)
    const fitPart = clamp(partnerShare * 15, 0, 15)
    const parts = [
      { label: 'Partner rewards', points: partnerPart, max: 40 },
      { label: 'Base rate', points: basePart, max: 15 },
      { label: 'Caps', points: capPart, max: 15 },
      { label: 'Fee', points: feePart, max: 15 },
      { label: 'Partner fit', points: fitPart, max: 15 },
    ]

    return {
      id: card.id,
      name: card.name,
      netValue: net,
      netLabel: config.netLabel,
      effectiveRate: netRate,
      grossBenefit: gross,
      totalCost: fee.cost,
      leakage: partner.leakage,
      metrics: [
        { label: 'Partner rewards', value: partner.actual, format: 'currency' },
        { label: 'Other-spend rewards', value: baseReward, format: 'currency' },
        { label: 'Annual fee cost', value: fee.cost, format: 'currency' },
        { label: 'Effective return', value: netRate, format: 'percent' },
      ],
      score: clamp(parts.reduce((sum, part) => sum + part.points, 0), 0, 100),
      scoreParts: parts,
      explanation: [
        `${Math.round(partnerShare * 100)}% of modeled annual spend is with the partner.`,
        partner.leakage > 0 ? 'The modeled partner reward cap reduces accelerated reward value.' : 'The partner reward cap does not reduce value at this spending level.',
      ],
    }
  }

  return standardCategory(slug, card, scenario)
}

export function rankCategoryCards(
  slug: CardCategorySlug,
  cards: CategoryCardModel[],
  scenario: CategoryScenario,
) {
  return cards
    .map((card) => analyseCategoryCard(slug, card, scenario))
    .sort((a, b) => b.netValue - a.netValue)
}
