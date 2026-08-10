'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Gauge,
  Plus,
  RotateCcw,
  Trophy,
  X,
} from 'lucide-react'
import {
  categories,
  rankCards,
  type CustomCardModel,
  type SpendProfile,
} from '../../data/card-engine'
import styles from './analyzer.module.css'

const fmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const pct = (value: number) => `${value.toFixed(2)}%`
const score = (value: number) => Math.round(value)

const newCard = (index: number): CustomCardModel => ({
  id: `card-${Date.now()}-${index}`,
  name: `Card ${index}`,
  annualFeeRupees: 0,
  annualFeeTaxRatePercent: 18,
  waiverSpendRupees: 0,
  baseRatePercent: 1,
  categoryRates: {
    online: 1,
    groceries: 1,
    dining: 1,
    travel: 1,
    fuel: 1,
    utilities: 1,
    other: 1,
  },
  monthlyCaps: {},
})

const starterCards: CustomCardModel[] = [
  {
    ...newCard(1),
    id: 'custom-a',
    name: 'Card A',
    annualFeeRupees: 999,
    waiverSpendRupees: 200000,
    baseRatePercent: 1,
    categoryRates: { online: 5, groceries: 1, dining: 1, travel: 1, fuel: 0, utilities: 1, other: 1 },
    monthlyCaps: { online: 1000 },
  },
  {
    ...newCard(2),
    id: 'custom-b',
    name: 'Card B',
    annualFeeRupees: 0,
    waiverSpendRupees: 0,
    baseRatePercent: 1.5,
    categoryRates: { online: 1.5, groceries: 1.5, dining: 1.5, travel: 1.5, fuel: 0, utilities: 1.5, other: 1.5 },
    monthlyCaps: {},
  },
]

const starterSpend: SpendProfile = {
  online: 20000,
  groceries: 10000,
  dining: 5000,
  travel: 5000,
  fuel: 8000,
  utilities: 5000,
  other: 7000,
}

export default function CardAnalyzer() {
  const [spend, setSpend] = useState<SpendProfile>(starterSpend)
  const [cards, setCards] = useState<CustomCardModel[]>(starterCards)
  const [expanded, setExpanded] = useState<string | null>('custom-a')

  const results = useMemo(() => rankCards(cards, spend), [cards, spend])
  const totalMonthly = Object.values(spend).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0)

  const setSpendValue = (key: keyof SpendProfile, value: number) => {
    setSpend((current) => ({ ...current, [key]: Math.max(0, value || 0) }))
  }

  const patchCard = (id: string, patch: Partial<CustomCardModel>) => {
    setCards((current) => current.map((card) => (card.id === id ? { ...card, ...patch } : card)))
  }

  const patchRate = (id: string, category: keyof SpendProfile, value: number) => {
    setCards((current) =>
      current.map((card) =>
        card.id === id
          ? { ...card, categoryRates: { ...card.categoryRates, [category]: Math.max(0, value || 0) } }
          : card,
      ),
    )
  }

  const patchCap = (id: string, category: keyof SpendProfile, value: number) => {
    setCards((current) =>
      current.map((card) =>
        card.id === id
          ? { ...card, monthlyCaps: { ...card.monthlyCaps, [category]: Math.max(0, value || 0) } }
          : card,
      ),
    )
  }

  const addCard = () => {
    if (cards.length >= 4) return
    setCards((current) => [...current, newCard(current.length + 1)])
  }

  const removeCard = (id: string) => {
    if (cards.length <= 1) return
    setCards((current) => current.filter((card) => card.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const reset = () => {
    setSpend(starterSpend)
    setCards(starterCards)
    setExpanded('custom-a')
  }

  return (
    <div className={styles.workspace}>
      <section className={styles.spendPanel}>
        <div className={styles.panelHead}>
          <div>
            <span>01 / Spend profile</span>
            <h2>Tell the engine where your money goes.</h2>
          </div>
          <div className={styles.totalBadge}>
            <small>Monthly spend</small>
            <b>{fmt.format(totalMonthly)}</b>
          </div>
        </div>

        <div className={styles.spendGrid}>
          {categories.map(({ key, label }) => (
            <label key={key}>
              <span>{label}</span>
              <div><i>₹</i><input type="number" min="0" value={spend[key]} onChange={(event) => setSpendValue(key, Number(event.target.value))} /></div>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.cardsPanel}>
        <div className={styles.panelHead}>
          <div>
            <span>02 / Card models</span>
            <h2>Enter the rules you want to compare.</h2>
          </div>
          <button type="button" className={styles.addButton} onClick={addCard} disabled={cards.length >= 4}>
            <Plus size={15} /> Add card
          </button>
        </div>

        <div className={styles.modelList}>
          {cards.map((card, index) => {
            const isOpen = expanded === card.id
            return (
              <article className={styles.modelCard} key={card.id}>
                <div className={styles.modelTop}>
                  <div className={styles.nameField}>
                    <small>Card {index + 1}</small>
                    <input value={card.name} onChange={(event) => patchCard(card.id, { name: event.target.value })} />
                  </div>
                  <div className={styles.modelActions}>
                    {cards.length > 1 && <button type="button" onClick={() => removeCard(card.id)} aria-label={`Remove ${card.name}`}><X size={15} /></button>}
                    <button type="button" onClick={() => setExpanded(isOpen ? null : card.id)} aria-label={`Toggle ${card.name} inputs`}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                <div className={styles.coreInputs}>
                  <label><span>Annual fee ₹</span><input type="number" min="0" value={card.annualFeeRupees} onChange={(e) => patchCard(card.id, { annualFeeRupees: Number(e.target.value) })} /></label>
                  <label><span>Fee GST %</span><input type="number" min="0" value={card.annualFeeTaxRatePercent} onChange={(e) => patchCard(card.id, { annualFeeTaxRatePercent: Number(e.target.value) })} /></label>
                  <label><span>Fee waiver spend ₹/yr</span><input type="number" min="0" value={card.waiverSpendRupees} onChange={(e) => patchCard(card.id, { waiverSpendRupees: Number(e.target.value) })} /></label>
                  <label><span>Base reward %</span><input type="number" min="0" step="0.1" value={card.baseRatePercent} onChange={(e) => patchCard(card.id, { baseRatePercent: Number(e.target.value) })} /></label>
                </div>

                {isOpen && (
                  <div className={styles.rulesTable}>
                    <div className={styles.ruleHead}><span>Category</span><span>Reward %</span><span>Monthly cap ₹</span></div>
                    {categories.map(({ key, label }) => (
                      <div className={styles.ruleRow} key={key}>
                        <b>{label}</b>
                        <input type="number" min="0" step="0.1" value={card.categoryRates[key] ?? card.baseRatePercent} onChange={(e) => patchRate(card.id, key, Number(e.target.value))} />
                        <input type="number" min="0" placeholder="No cap" value={card.monthlyCaps[key] || ''} onChange={(e) => patchCap(card.id, key, Number(e.target.value))} />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.resultsPanel}>
        <div className={styles.panelHead}>
          <div>
            <span>03 / CredoNomics ranking</span>
            <h2>Rank by annual net value, then inspect why.</h2>
          </div>
          <button type="button" className={styles.resetButton} onClick={reset}><RotateCcw size={14} /> Reset example</button>
        </div>

        {totalMonthly <= 0 ? (
          <div className={styles.emptyState}>Enter some monthly spending to generate a ranking.</div>
        ) : (
          <div className={styles.rankList}>
            {results.map((result, index) => (
              <article className={`${styles.rankCard} ${index === 0 ? styles.winner : ''}`} key={result.id}>
                <div className={styles.rankTop}>
                  <div className={styles.rankNo}>{index === 0 ? <Trophy size={18} /> : `#${index + 1}`}</div>
                  <div><small>{index === 0 ? 'Highest modeled net value' : 'Modeled result'}</small><h3>{result.name}</h3></div>
                  <div className={styles.netValue}><small>Net annual value</small><b>{fmt.format(result.netAnnualValue)}</b></div>
                </div>

                <div className={styles.metricGrid}>
                  <div><span>Gross rewards</span><b>{fmt.format(result.grossReward)}</b></div>
                  <div><span>Annual fee cost</span><b>{result.feeWaived ? 'Waived' : fmt.format(result.feePaid)}</b></div>
                  <div><span>Cap leakage</span><b>{fmt.format(result.capLoss)}</b></div>
                  <div><span>Effective return</span><b>{pct(result.effectiveReturn)}</b></div>
                </div>

                <div className={styles.scoreStrip}>
                  <div className={styles.scoreDial}><Gauge size={19} /><span><small>CredoNomics Fit Score</small><b>{score(result.score.total)}<i>/100</i></b></span></div>
                  <div className={styles.scoreParts}>
                    <span>Reward <b>{score(result.score.rewardPotential)}/40</b></span>
                    <span>Fee <b>{score(result.score.feeEfficiency)}/20</b></span>
                    <span>Caps <b>{score(result.score.capEfficiency)}/15</b></span>
                    <span>Base rate <b>{score(result.score.baseRateResilience)}/15</b></span>
                    <span>Spend fit <b>{score(result.score.spendFit)}/10</b></span>
                  </div>
                </div>

                <div className={styles.why}>
                  <CircleHelp size={16} />
                  <p>
                    {result.capLoss > 0
                      ? `${result.name} loses ${fmt.format(result.capLoss)} of modeled rewards to the caps you entered. `
                      : `${result.name} does not hit any reward cap in this model. `}
                    {result.feeWaived
                      ? 'Your annual spend clears the fee-waiver threshold. '
                      : result.feePaid > 0
                        ? `The modeled annual fee cost reduces value by ${fmt.format(result.feePaid)}. `
                        : 'There is no annual fee cost in the model. '}
                    Effective return is {pct(result.effectiveReturn)} on total annual spend.
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={styles.disclaimer}>
          <BarChart3 size={17} />
          <p>
            This ranking uses only the values you enter. It does not verify a card’s current issuer terms,
            eligibility, merchant coding, redemption value, milestone benefits or exclusions. The Fit Score is
            a transparent comparison heuristic — not a credit score, recommendation or guarantee.
          </p>
        </div>
      </section>
    </div>
  )
}
