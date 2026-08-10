import { ArrowRight, BarChart3, Database, Gauge, GitCompareArrows, Layers3, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { cardCategories, type CardCategorySlug } from '../data/card-categories'
import { autoCardCatalogMeta } from '../data/auto-card-utils'
import { issuerRegistry } from '../data/issuer-registry'
import { verifiedRealCards, realCardsForCategory } from '../data/verified-real-cards'
import styles from '../core-v4.module.css'
import local from './cards.module.css'

export const metadata = {
  title: 'Compare Indian Credit Cards',
  description:
    'Compare real Indian credit cards by cashback, fuel, travel, shopping, UPI, utilities, dining, forex and other categories using transparent annual-value calculations.',
  alternates: { canonical: '/cards' },
}

const primarySlugs: CardCategorySlug[] = [
  'cashback',
  'fuel',
  'travel',
  'shopping',
  'upi',
  'utilities',
  'dining',
  'forex',
]

export default function CardsPage() {
  const primary = primarySlugs.map((slug) => cardCategories.find((category) => category.slug === slug)!).filter(Boolean)
  const secondary = cardCategories.filter((category) => !primarySlugs.includes(category.slug))

  const renderCategory = (category: (typeof cardCategories)[number], index: number) => (
    <a href={`/cards/${category.slug}`} key={category.slug}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <h3>{category.shortTitle}</h3>
      <p>{category.description}</p>
      <small>{realCardsForCategory(category.slug).length} real cards ready to rank</small>
      <b>Compare {category.shortTitle} →</b>
    </a>
  )

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Compare Cards</span></div>
        <span className={styles.pageKicker}><Layers3 size={14}/> Indian Credit Card Intelligence</span>
        <h1>Find the right card for your <span>actual spending.</span></h1>
        <p className={styles.pageHeroLead}>
          Rank real Indian credit cards using current normalized issuer terms, annual fees,
          reward caps and category-specific economics — not one generic “best card” label.
        </p>
        <div className={local.heroActions}>
          <a className={styles.primaryButton} href="/cards/cashback">Start comparing <ArrowRight size={16}/></a>
          <a className={styles.secondaryButton} href="/cards/all">Browse all verified cards</a>
          <a className={styles.secondaryButton} href="/cards/coverage">Coverage</a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><Database size={19}/><small>Normalized real cards</small><strong>{verifiedRealCards.length}</strong><p>Official-source records currently powering live rankings.</p></article>
          <article><BarChart3 size={19}/><small>Issuer research universe</small><strong>{issuerRegistry.length}</strong><p>Issuer targets tracked by the coverage and verification workflow.</p></article>
          <article><Gauge size={19}/><small>Category engines</small><strong>{cardCategories.length}</strong><p>Different formulas for different card use-cases.</p></article>
        </div>

        <section className={local.categorySection}>
          <div className={local.registryHead}>
            <div><span>Popular comparisons</span><h2>What type of card are you looking for?</h2></div>
            <a href="/cards/compare"><GitCompareArrows size={14}/> Head-to-head comparison</a>
          </div>

          <div className={local.categoryGrid}>
            {primary.map((category, index) => renderCategory(category, index))}
          </div>

          <details className={local.moreCategories}>
            <summary>More comparisons <span>8 additional categories</span></summary>
            <div className={local.categoryGrid}>
              {secondary.map((category, index) => renderCategory(category, primary.length + index))}
            </div>
          </details>
        </section>

        <section className={local.featureGrid}>
          <article><span>01</span><h2>Real-card ranking first</h2><p>Category pages open with real Indian card names and a user profile, matching the Fuel Card Comparator approach.</p><a href="/cards/cashback">Try cashback ranking →</a></article>
          <article><span>02</span><h2>Saved spending profile</h2><p>Your profile is saved locally and reused as you move across categories. Share creates a reusable profile URL.</p><a href="/cards/fuel">Try a live ranking →</a></article>
          <article><span>03</span><h2>Visible coverage</h2><p>See exactly which issuers and cards have been normalized instead of implying complete market coverage.</p><a href="/cards/coverage">Open coverage dashboard →</a></article>
        </section>

        <div className={local.discoveryNote}>
          <ShieldCheck size={20}/>
          <div>
            <b>Verified database → rankings. Automated discovery → review queue.</b>
            <p>
              The background catalogue currently contains {autoCardCatalogMeta.recordCount} detected record(s),
              but automated extraction does not directly overwrite the financial terms used by rankings.
            </p>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
