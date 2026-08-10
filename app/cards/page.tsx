import { ArrowRight, BarChart3, Database, FileCheck2, Gauge, Layers3, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { cardDatabaseStatus, verifiedCards } from '../data/card-database'
import styles from '../core-v4.module.css'
import local from './cards.module.css'

export const metadata = {
  title: 'Credit Card Intelligence',
  description:
    'CredoNomics credit-card research infrastructure: spend-fit analysis, transparent scoring and source-backed card records.',
  alternates: { canonical: '/cards' },
}

export default function CardsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Cards</span></div>
        <span className={styles.pageKicker}><Layers3 size={14}/> Credit Card Intelligence</span>
        <h1>Compare the economics, not just the <span>marketing rate.</span></h1>
        <p className={styles.pageHeroLead}>
          CredoNomics is building a structured Indian credit-card research layer where every published
          product record must carry current official sources and a last-verified date.
        </p>
        <div className={local.heroActions}>
          <a className={styles.primaryButton} href="/cards/analyzer">Open intelligence analyzer <ArrowRight size={16}/></a>
          <a className={styles.secondaryButton} href="/research/credit-card-data-standard">View data standard</a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><Database size={19}/><small>Public verified records</small><strong>{cardDatabaseStatus.publicVerifiedRecords}</strong><p>No card is published until source checks are complete.</p></article>
          <article><BarChart3 size={19}/><small>Analysis engine</small><strong>Live</strong><p>Model up to four custom card structures against one spend profile.</p></article>
          <article><Gauge size={19}/><small>Fit Score</small><strong>5 parts</strong><p>Reward potential, fees, caps, base-rate resilience and spend fit.</p></article>
        </div>

        <section className={local.featureGrid}>
          <article><span>01</span><h2>Spend-profile ranking</h2><p>Use category-wise monthly spending rather than a generic “best card” label.</p><a href="/cards/analyzer">Open analyzer →</a></article>
          <article><span>02</span><h2>Transparent scoring</h2><p>Every score component is visible and documented. There is no unexplained editorial rating.</p><a href="/research/card-scoring">How scoring works →</a></article>
          <article><span>03</span><h2>Source-backed database</h2><p>Verified cards will carry issuer sources, checked dates, fee rules, caps and exclusions.</p><a href="/research/credit-card-data-standard">See the schema →</a></article>
        </section>

        <section className={local.registry}>
          <div className={local.registryHead}>
            <div><span>Verified registry</span><h2>Only researched records appear here.</h2></div>
            <a href="/corrections">Corrections policy →</a>
          </div>

          {verifiedCards.length === 0 ? (
            <div className={local.emptyRegistry}>
              <FileCheck2 size={25}/>
              <h3>Verification queue, not a fake catalogue.</h3>
              <p>
                The V7 engine is live, but the production card registry intentionally starts empty.
                Current product terms will be added only after official issuer sources are checked.
              </p>
            </div>
          ) : (
            <div className={local.cardRegistry}>
              {verifiedCards.map((card) => (
                <a href={`/cards/${card.slug}`} key={card.slug}>
                  <small>{card.issuer}</small><h3>{card.productName}</h3>
                  <span>Verified {card.lastVerified}</span>
                </a>
              ))}
            </div>
          )}
        </section>

        <div className={local.trustNote}>
          <ShieldCheck size={20}/>
          <p>
            CredoNomics is not SEBI-registered and is not NISM-certified. Card analysis is general
            educational research, not personalized financial advice or a guarantee of card eligibility.
          </p>
        </div>
      </section>
    </SiteFrame>
  )
}
