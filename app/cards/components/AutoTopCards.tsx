import { AlertTriangle, CalendarClock, ExternalLink, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { cardCategoryMap, type CardCategorySlug } from '../../data/card-categories'
import { autoCardCatalogMeta, getAutoTopCards } from '../../data/auto-card-utils'
import styles from './auto-top-cards.module.css'

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const fmtMoney = (value?: number) => value === undefined ? 'Not detected' : money.format(value)
const fmtPct = (value?: number) => value === undefined ? 'Not detected' : `${value.toFixed(2)}%`

function relevantRate(category: CardCategorySlug, card: ReturnType<typeof getAutoTopCards>[number]) {
  const map: Partial<Record<CardCategorySlug, [string, number | undefined]>> = {
    cashback: ['Detected cashback', card.maxCashbackRate],
    fuel: ['Detected fuel value', card.fuelRate],
    travel: ['Detected travel reward', card.travelRate],
    shopping: ['Detected shopping rate', card.shoppingRate ?? card.maxCashbackRate],
    grocery: ['Detected grocery rate', card.groceryRate],
    dining: ['Detected dining rate', card.diningRate],
    utilities: ['Detected utility rate', card.utilityRate],
    upi: ['Detected UPI rate', card.upiRate],
    forex: ['Detected forex markup', card.forexMarkup],
    lounge: ['Detected lounge visits', card.loungeVisits],
    premium: ['Detected reward rate', card.maxRewardRate ?? card.maxCashbackRate],
    business: ['Detected reward rate', card.maxRewardRate ?? card.maxCashbackRate],
    'lifetime-free': ['Detected reward rate', card.maxRewardRate ?? card.maxCashbackRate],
    beginner: ['Detected reward rate', card.maxRewardRate ?? card.maxCashbackRate],
    'low-fee': ['Detected reward rate', card.maxRewardRate ?? card.maxCashbackRate],
    'co-branded': ['Detected accelerated rate', card.maxCashbackRate ?? card.maxRewardRate],
  }
  const entry = map[category]
  if (!entry) return null
  return { label: entry[0], value: entry[1] }
}

function confidenceText(confidence: 'high' | 'medium' | 'low') {
  if (confidence === 'high') return 'Higher extraction confidence'
  if (confidence === 'medium') return 'Medium extraction confidence'
  return 'Low extraction confidence'
}

export default function AutoTopCards({ categorySlug }: { categorySlug: CardCategorySlug }) {
  const category = cardCategoryMap[categorySlug]
  const cards = getAutoTopCards(categorySlug, 15)
  const generatedAt = autoCardCatalogMeta.generatedAt
    ? new Date(autoCardCatalogMeta.generatedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  return (
    <section className={styles.section} aria-label={`Top ${category.shortTitle} cards research ranking`}>
      <div className={styles.head}>
        <div>
          <span className={styles.kicker}><Sparkles size={14}/> Auto Research Rank</span>
          <h2>Top {Math.min(cards.length || 15, 15)} {category.shortTitle} cards from official-source research</h2>
          <p>
            CredoNomics scans supported issuer catalogue/product pages, extracts category signals and
            ranks the strongest matches for this category. The source link stays visible on every row.
          </p>
        </div>
        <div className={styles.refresh}>
          <RefreshCw size={16}/>
          <span><small>Catalogue refresh</small><b>{generatedAt || 'Pending first refresh'}</b></span>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className={styles.empty}>
          <CalendarClock size={22}/>
          <div>
            <b>Automatic catalogue refresh is ready but no records are stored yet.</b>
            <p>Run the V9 installer once with internet access or trigger the “Refresh Credit Card Catalogue” GitHub Action.</p>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {cards.map((card, index) => {
            const rate = relevantRate(categorySlug, card)
            const rankScore = Math.round(card.categoryScores?.[categorySlug] ?? 0)

            return (
              <article className={`${styles.card} ${index < 3 ? styles.topThree : ''}`} key={card.id}>
                <div className={styles.rank}>
                  <small>Rank</small>
                  <b>#{index + 1}</b>
                </div>

                <div className={styles.identity}>
                  <small>{card.issuer}</small>
                  <h3>{card.name}</h3>
                  <div className={styles.badges}>
                    <span data-confidence={card.confidence}>{confidenceText(card.confidence)}</span>
                    <span>Research score {rankScore}</span>
                  </div>
                </div>

                <div className={styles.quickMetrics}>
                  <div><span>Annual fee</span><b>{fmtMoney(card.annualFee ?? card.renewalFee)}</b></div>
                  <div>
                    <span>{rate?.label || 'Detected rate'}</span>
                    <b>
                      {categorySlug === 'lounge' && rate?.value !== undefined
                        ? `${rate.value >= 99 ? 'Unlimited' : `${rate.value}/yr`}`
                        : fmtPct(rate?.value)}
                    </b>
                  </div>
                  <div><span>Fee waiver</span><b>{fmtMoney(card.feeWaiverSpend)}</b></div>
                </div>

                <details className={styles.details}>
                  <summary>View detected details</summary>
                  <div className={styles.detailBody}>
                    <div className={styles.detailMetrics}>
                      <span><small>Joining fee</small><b>{fmtMoney(card.joiningFee)}</b></span>
                      <span><small>Renewal fee</small><b>{fmtMoney(card.renewalFee)}</b></span>
                      <span><small>Cashback</small><b>{fmtPct(card.maxCashbackRate)}</b></span>
                      <span><small>Fuel</small><b>{fmtPct(card.fuelRate)}</b></span>
                      <span><small>Fuel waiver</small><b>{fmtPct(card.surchargeWaiverRate)}</b></span>
                      <span><small>Forex markup</small><b>{fmtPct(card.forexMarkup)}</b></span>
                      <span><small>UPI</small><b>{fmtPct(card.upiRate)}</b></span>
                      <span><small>Lounge</small><b>{card.loungeUnlimited ? 'Unlimited detected' : card.loungeVisits ? `${card.loungeVisits}/yr detected` : 'Not detected'}</b></span>
                    </div>

                    {card.detectedBenefits.length > 0 && (
                      <div className={styles.benefits}>
                        <b>Detected benefit text</b>
                        <ul>
                          {card.detectedBenefits.slice(0, 4).map((benefit) => <li key={benefit}>{benefit}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className={styles.sourceRow}>
                      <div>
                        <ShieldCheck size={15}/>
                        <span>
                          <small>Official issuer source</small>
                          <b>{card.sourceUrl === card.catalogueUrl ? 'Catalogue page' : 'Product page'}</b>
                        </span>
                      </div>
                      <a href={card.sourceUrl} target="_blank" rel="noreferrer">
                        Open source <ExternalLink size={13}/>
                      </a>
                    </div>
                  </div>
                </details>
              </article>
            )
          })}
        </div>
      )}

      <div className={styles.warning}>
        <AlertTriangle size={17}/>
        <p>
          <b>Automated extraction is a research aid, not a guarantee.</b> Issuer pages can change layout,
          wording, caps, exclusions or effective dates. “Top 15” here means the highest automated
          category-relevance score among successfully fetched official-source records — verify the
          linked issuer page before applying or making a financial decision.
        </p>
      </div>
    </section>
  )
}
