'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, CircleHelp, Plus, RotateCcw, Trophy, X } from 'lucide-react'
import { cardCategoryMap, type CardCategorySlug, type FieldDefinition } from '../../data/card-categories'
import {
  defaultCategoryCard,
  defaultScenario,
  rankCategoryCards,
  type CategoryCardModel,
} from '../../data/card-category-engine'
import styles from './category-comparator.module.css'

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function formatMetric(value: number, type: 'currency' | 'percent' | 'number') {
  if (type === 'currency') return money.format(value)
  if (type === 'percent') return `${value.toFixed(2)}%`
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)
}

function InputField({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className={styles.field}>
      <span>{field.label}</span>
      <div className={styles.inputWrap}>
        {field.prefix && <i>{field.prefix}</i>}
        <input
          type="number"
          min="0"
          step={field.step ?? 1}
          value={value}
          onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        />
        {field.suffix && <em>{field.suffix}</em>}
      </div>
      {field.hint && <small>{field.hint}</small>}
    </label>
  )
}

export default function CategoryComparator({ categorySlug }: { categorySlug: CardCategorySlug }) {
  const category = cardCategoryMap[categorySlug]
  const [scenario, setScenario] = useState(() => defaultScenario(categorySlug))
  const [cards, setCards] = useState<CategoryCardModel[]>(() => [
    defaultCategoryCard(categorySlug, 1),
    defaultCategoryCard(categorySlug, 2),
  ])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const first = defaultCategoryCard(categorySlug, 1)
    const second = defaultCategoryCard(categorySlug, 2)

    // Make the generic example structures different enough to demonstrate ranking.
    second.values = Object.fromEntries(
      Object.entries(second.values).map(([key, value]) => {
        if (key.toLowerCase().includes('rate')) return [key, Math.max(0, value * 0.75)]
        if (key === 'annualFee') return [key, 0]
        if (key.toLowerCase().includes('cap')) return [key, value === 0 ? 0 : value * 1.5]
        return [key, value]
      }),
    )

    setScenario(defaultScenario(categorySlug))
    setCards([first, second])
    setExpanded(first.id)
  }, [categorySlug])

  const results = useMemo(
    () => rankCategoryCards(categorySlug, cards, scenario),
    [categorySlug, cards, scenario],
  )

  const patchCardValue = (id: string, key: string, value: number) => {
    setCards((current) =>
      current.map((card) =>
        card.id === id ? { ...card, values: { ...card.values, [key]: value } } : card,
      ),
    )
  }

  const addCard = () => {
    if (cards.length >= 4) return
    setCards((current) => [...current, defaultCategoryCard(categorySlug, current.length + 1)])
  }

  const reset = () => {
    const first = defaultCategoryCard(categorySlug, 1)
    const second = defaultCategoryCard(categorySlug, 2)
    second.values = Object.fromEntries(
      Object.entries(second.values).map(([key, value]) => {
        if (key.toLowerCase().includes('rate')) return [key, Math.max(0, value * 0.75)]
        if (key === 'annualFee') return [key, 0]
        if (key.toLowerCase().includes('cap')) return [key, value === 0 ? 0 : value * 1.5]
        return [key, value]
      }),
    )
    setScenario(defaultScenario(categorySlug))
    setCards([first, second])
    setExpanded(first.id)
  }

  return (
    <div className={styles.workspace}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>01 / Your scenario</span>
            <h2>{category.question}</h2>
          </div>
          <button type="button" onClick={reset}><RotateCcw size={14}/> Reset example</button>
        </div>

        <div className={styles.scenarioGrid}>
          {category.scenarioFields.map((field) => (
            <InputField
              key={field.key}
              field={field}
              value={scenario[field.key] ?? 0}
              onChange={(value) => setScenario((current) => ({ ...current, [field.key]: value }))}
            />
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>02 / Card structures</span>
            <h2>Enter current terms for up to four cards.</h2>
          </div>
          <button type="button" onClick={addCard} disabled={cards.length >= 4}><Plus size={14}/> Add card</button>
        </div>

        <div className={styles.cardModels}>
          {cards.map((card, index) => {
            const open = expanded === card.id
            return (
              <article className={styles.model} key={card.id}>
                <div className={styles.modelTop}>
                  <div>
                    <small>Card {index + 1}</small>
                    <input
                      className={styles.cardName}
                      value={card.name}
                      onChange={(event) => setCards((current) => current.map((item) => item.id === card.id ? { ...item, name: event.target.value } : item))}
                    />
                  </div>
                  <div className={styles.modelActions}>
                    {cards.length > 1 && (
                      <button type="button" aria-label={`Remove ${card.name}`} onClick={() => setCards((current) => current.filter((item) => item.id !== card.id))}>
                        <X size={14}/>
                      </button>
                    )}
                    <button type="button" aria-label={`Toggle ${card.name}`} onClick={() => setExpanded(open ? null : card.id)}>
                      {open ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                    </button>
                  </div>
                </div>

                {open && (
                  <div className={styles.cardFieldGrid}>
                    {category.cardFields.map((field) => (
                      <InputField
                        key={field.key}
                        field={field}
                        value={card.values[field.key] ?? 0}
                        onChange={(value) => patchCardValue(card.id, field.key, value)}
                      />
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>03 / Ranked result</span>
            <h2>Highest modeled net value first.</h2>
          </div>
        </div>

        <div className={styles.results}>
          {results.map((result, index) => (
            <article className={`${styles.resultCard} ${index === 0 ? styles.winner : ''}`} key={result.id}>
              <div className={styles.resultTop}>
                <div className={styles.rank}>{index === 0 ? <Trophy size={17}/> : `#${index + 1}`}</div>
                <div><small>{index === 0 ? 'Highest modeled value' : 'Modeled result'}</small><h3>{result.name}</h3></div>
                <div className={styles.net}><small>{result.netLabel}</small><b>{money.format(result.netValue)}</b></div>
              </div>

              <div className={styles.metrics}>
                {result.metrics.map((metric) => (
                  <div key={metric.label}><span>{metric.label}</span><b>{formatMetric(metric.value, metric.format)}</b></div>
                ))}
              </div>

              <div className={styles.scoreBand}>
                <div className={styles.scoreTotal}><small>CredoNomics Category Fit</small><b>{Math.round(result.score)}<i>/100</i></b></div>
                <div className={styles.scoreParts}>
                  {result.scoreParts.map((part) => (
                    <span key={part.label}>{part.label} <b>{Math.round(part.points)}/{part.max}</b></span>
                  ))}
                </div>
              </div>

              <div className={styles.explanation}>
                <CircleHelp size={15}/>
                <div>
                  {result.explanation.map((line) => <p key={line}>{line}</p>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.disclaimer}>
        These calculations use only the values entered on this page. They do not verify current issuer terms,
        merchant coding, eligibility, redemption mechanics or promotional offers. Check the latest official
        issuer documentation before acting on a result.
      </div>
    </div>
  )
}
