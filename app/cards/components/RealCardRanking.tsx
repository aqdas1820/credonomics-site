'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, Filter, Info, RotateCcw, ShieldCheck, Trophy } from 'lucide-react'
import { cardCategoryMap, type CardCategorySlug } from '../../data/card-categories'
import { REAL_CARD_DATA_DATE, realCardsForCategory, type RealCardTerms, type VerifiedRealCard } from '../../data/verified-real-cards'
import styles from './real-card-ranking.module.css'

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

type Profile = {
  monthlySpend: number
  annualRetailSpend: number
  annualForeignSpend: number
  loungeVisits: number
  loungeValue: number
  partnerSpendShare: number
  preferredFuelNetwork: string
}

type RankedCard = {
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

const defaultProfile: Profile = {
  monthlySpend: 10000,
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

function recurringAnnual(spendMonthly: number, terms: RealCardTerms) {
  const theoreticalMonthly = tieredMonthlyValue(spendMonthly, terms)
  const monthlyAfterCap =
    terms.monthlyCapRupees !== undefined
      ? Math.min(theoreticalMonthly, terms.monthlyCapRupees)
      : theoreticalMonthly

  const annualBeforeAnnualCap = monthlyAfterCap * 12
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

function analyseCard(card: VerifiedRealCard, category: CardCategorySlug, profile: Profile): RankedCard {
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
    grossValue = partnerReward + otherReward + (terms.fixedAnnualValueRupees ?? 0)
    theoreticalValue = grossValue
    annualSpendBasis = annualSpend
  } else if (category === 'premium') {
    const recurring = recurringAnnual(profile.monthlySpend, terms)
    const lounge = Math.min(profile.loungeVisits, terms.loungeVisits ?? 0) * profile.loungeValue
    const forexCost = profile.annualForeignSpend * (terms.forexMarkupPercent ?? 0) / 100
    grossValue = recurring.actual + lounge + (terms.fixedAnnualValueRupees ?? 0) - forexCost
    theoreticalValue = recurring.theoretical + lounge + (terms.fixedAnnualValueRupees ?? 0)
    annualSpendBasis = profile.monthlySpend * 12 + profile.annualForeignSpend
  } else {
    const recurring = recurringAnnual(profile.monthlySpend, terms)
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

function categorySpendLabel(category: CardCategorySlug) {
  const labels: Partial<Record<CardCategorySlug, string>> = {
    cashback: 'Monthly eligible cashback spend',
    fuel: 'Monthly fuel spend',
    travel: 'Monthly travel spend',
    shopping: 'Monthly shopping spend',
    grocery: 'Monthly grocery spend',
    dining: 'Monthly dining spend',
    utilities: 'Monthly utility spend',
    upi: 'Monthly eligible UPI merchant spend',
    forex: 'Monthly eligible spend',
    lounge: 'Monthly card spend',
    premium: 'Monthly eligible card spend',
    business: 'Monthly eligible business spend',
    'lifetime-free': 'Monthly eligible spend',
    beginner: 'Monthly eligible spend',
    'low-fee': 'Monthly eligible spend',
    'co-branded': 'Monthly partner + other spend',
  }
  return labels[category] ?? 'Monthly eligible spend'
}

export default function RealCardRanking({ categorySlug }: { categorySlug: CardCategorySlug }) {
  const category = cardCategoryMap[categorySlug]
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [showAllNetworks, setShowAllNetworks] = useState(true)

  const allCards = useMemo(() => realCardsForCategory(categorySlug), [categorySlug])

  const results = useMemo(() => {
    let candidates = allCards

    if (
      categorySlug === 'fuel' &&
      !showAllNetworks &&
      profile.preferredFuelNetwork !== 'Any'
    ) {
      candidates = candidates.filter((card) => {
        const network = card.terms.fuel?.network
        return network === 'Any' || network === profile.preferredFuelNetwork
      })
    }

    return candidates
      .map((card) => analyseCard(card, categorySlug, profile))
      .sort((a, b) => b.netValue - a.netValue)
      .slice(0, 15)
  }, [allCards, categorySlug, profile, showAllNetworks])

  const networks = useMemo(() => {
    if (categorySlug !== 'fuel') return []
    const values = new Set<string>()
    for (const card of allCards) {
      const network = card.terms.fuel?.network
      if (network && network !== 'Any') values.add(network)
    }
    return [...values].sort()
  }, [allCards, categorySlug])

  const update = (key: keyof Profile, value: number | string) => {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div>
          <span>LIVE VERIFIED RANKING</span>
          <h2>{results.length} real Indian cards compared</h2>
          <p>
            Current normalized product terms are sourced from official issuer pages and converted into
            the same annual-value model. Change the profile and the ranking recalculates instantly.
          </p>
        </div>
        <div className={styles.verifiedStamp}>
          <ShieldCheck size={17}/>
          <span><small>Database checked</small><b>{REAL_CARD_DATA_DATE}</b></span>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.profile}>
          <div className={styles.profileTop}>
            <div><span>Your profile</span><h3>Tell us how you spend</h3></div>
            <button type="button" onClick={() => setProfile(defaultProfile)}><RotateCcw size={14}/> Reset</button>
          </div>

          <label>
            <span>{categorySpendLabel(categorySlug)}</span>
            <div className={styles.moneyInput}><i>₹</i><input type="number" min="0" value={profile.monthlySpend} onChange={(e) => update('monthlySpend', Math.max(0, Number(e.target.value) || 0))}/></div>
          </label>

          <label>
            <span>Annual retail spend on the card</span>
            <div className={styles.moneyInput}><i>₹</i><input type="number" min="0" value={profile.annualRetailSpend} onChange={(e) => update('annualRetailSpend', Math.max(0, Number(e.target.value) || 0))}/></div>
            <small>Used to test annual-fee waiver thresholds.</small>
          </label>

          {(categorySlug === 'travel' || categorySlug === 'forex' || categorySlug === 'premium') && (
            <label>
              <span>Annual foreign-currency spend</span>
              <div className={styles.moneyInput}><i>₹</i><input type="number" min="0" value={profile.annualForeignSpend} onChange={(e) => update('annualForeignSpend', Math.max(0, Number(e.target.value) || 0))}/></div>
            </label>
          )}

          {(categorySlug === 'travel' || categorySlug === 'lounge' || categorySlug === 'premium') && (
            <>
              <label>
                <span>Lounge visits you expect / year</span>
                <div className={styles.plainInput}><input type="number" min="0" value={profile.loungeVisits} onChange={(e) => update('loungeVisits', Math.max(0, Number(e.target.value) || 0))}/></div>
              </label>
              <label>
                <span>Your value per lounge visit</span>
                <div className={styles.moneyInput}><i>₹</i><input type="number" min="0" value={profile.loungeValue} onChange={(e) => update('loungeValue', Math.max(0, Number(e.target.value) || 0))}/></div>
              </label>
            </>
          )}

          {categorySlug === 'co-branded' && (
            <label>
              <span>Spend with partner ecosystem</span>
              <div className={styles.percentInput}><input type="number" min="0" max="100" value={profile.partnerSpendShare} onChange={(e) => update('partnerSpendShare', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}/><i>%</i></div>
            </label>
          )}

          {categorySlug === 'fuel' && (
            <>
              <label>
                <span>Preferred fuel network</span>
                <select value={profile.preferredFuelNetwork} onChange={(e) => update('preferredFuelNetwork', e.target.value)}>
                  <option value="Any">Any</option>
                  {networks.map((network) => <option key={network} value={network}>{network}</option>)}
                </select>
              </label>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={showAllNetworks} onChange={(e) => setShowAllNetworks(e.target.checked)}/>
                <span>Show cards from other fuel networks</span>
              </label>
            </>
          )}

          <div className={styles.profileNote}>
            <Info size={15}/>
            <p>Results are estimates from current normalized issuer terms. Merchant coding, caps, exclusions, redemption choice and product updates can change actual value.</p>
          </div>
        </aside>

        <div className={styles.ranking}>
          <div className={styles.rankHeader}>
            <div><span>Live ranking</span><h3>{results.length} {category.shortTitle.toLowerCase()} cards compared</h3></div>
            <div><small>Sorted by</small><b>Estimated annual net value</b></div>
          </div>

          {results.length === 0 ? (
            <div className={styles.empty}>
              <Filter size={20}/>
              <p>No normalized real-card record is available for this category/filter yet. The custom calculator below remains available while the verified database expands.</p>
            </div>
          ) : (
            <div className={styles.rankList}>
              {results.map((result, index) => (
                <article className={`${styles.rankCard} ${index === 0 ? styles.winner : ''}`} key={result.card.id}>
                  <div className={styles.cardHead}>
                    <div className={styles.rankNo}>{index === 0 ? <Trophy size={16}/> : `#${index + 1}`}</div>
                    <div className={styles.identity}>
                      {result.terms.network && <span className={styles.network}>{result.terms.network}</span>}
                      <h4>{result.card.name}</h4>
                      <small>{result.card.issuer}</small>
                    </div>
                    <div className={styles.netValue}><b>{money.format(result.netValue)}</b><small>NET / YEAR</small></div>
                  </div>

                  <div className={styles.metrics}>
                    <div><span>Effective return</span><b>{result.effectiveReturn.toFixed(2)}%</b></div>
                    <div><span>Gross modeled value</span><b>{money.format(result.grossValue)}</b></div>
                    <div><span>Annual fee cost</span><b>{result.feeCost === 0 ? '₹0 / waived' : money.format(result.feeCost)}</b></div>
                    <div><span>{categorySlug === 'fuel' ? 'Fuel network' : 'Benefit cap loss'}</span><b>{categorySlug === 'fuel' ? (result.terms.network || 'Any') : money.format(result.benefitCapLoss)}</b></div>
                  </div>

                  <div className={styles.chips}>
                    {result.terms.ratePercent !== undefined && <span>Primary {result.terms.ratePercent}%</span>}
                    {result.terms.secondaryRatePercent !== undefined && result.terms.secondaryRatePercent > 0 && <span>Secondary {result.terms.secondaryRatePercent}%</span>}
                    {result.terms.monthlyCapRupees !== undefined && <span>Cap {money.format(result.terms.monthlyCapRupees)}/mo</span>}
                    {result.card.feeWaiverAnnualSpendRupees !== undefined && <span>Fee waiver at {money.format(result.card.feeWaiverAnnualSpendRupees)}/yr</span>}
                  </div>

                  <p className={styles.note}>{result.terms.note}</p>

                  <div className={styles.source}>
                    <span>Verified {result.card.verifiedAt}</span>
                    <a href={result.card.sourceUrl} target="_blank" rel="noreferrer">
                      Official issuer source <ExternalLink size={12}/>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.disclaimer}>
        <ShieldCheck size={17}/>
        <p>
          <b>Ranking scope:</b> this is a ranking of the real cards currently normalized in the CredoNomics verified dataset,
          not a claim that every credit card issued in India has already been captured. Cards are added only when enough
          current official-source data is available to model their economics.
        </p>
      </div>
    </section>
  )
}
