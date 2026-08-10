import { ArrowRight, BarChart3, Database, FileCheck2, Gauge, GitCompareArrows, Layers3, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { cardCategories } from '../data/card-categories'
import { autoCardCatalogMeta } from '../data/auto-card-utils'
import { verifiedRealCards, realCardsForCategory } from '../data/verified-real-cards'
import { verifiedCards } from '../data/card-database'
import styles from '../core-v4.module.css'
import local from './cards.module.css'

export const metadata = {
  title: 'Credit Card Intelligence',
  description:
    'Compare credit cards by category using category-specific economics for cashback, fuel, travel, shopping, UPI, forex, lounge and more.',
  alternates: { canonical: '/cards' },
}

export default function CardsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Cards</span></div>
        <span className={styles.pageKicker}><Layers3 size={14}/> Credit Card Category Intelligence</span>
        <h1>Choose the category. Compare the <span>real economics.</span></h1>
        <p className={styles.pageHeroLead}>
          Cashback, fuel, travel, shopping and forex cards should not be ranked with the same formula.
          CredoNomics V8 gives each category its own transparent comparison model.
        </p>
        <div className={local.heroActions}>
          <a className={styles.primaryButton} href="/cards/compare">Compare any category <ArrowRight size={16}/></a>
          <a className={styles.secondaryButton} href="/cards/analyzer">Advanced spend-profile analyzer</a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><Database size={19}/><small>Normalized real cards</small><strong>{verifiedRealCards.length}</strong><p>Official-source card records currently ready for live annual-value ranking.</p></article>
          <article><BarChart3 size={19}/><small>Discovery catalogue</small><strong>{autoCardCatalogMeta.recordCount}</strong><p>Automatically detected candidates used to expand and monitor the verified database.</p></article>
          <article><Gauge size={19}/><small>Transparent ranking</small><strong>100</strong><p>Category Fit Score with visible component-level points.</p></article>
        </div>

        <section className={local.categorySection}>
          <div className={local.registryHead}>
            <div><span>Compare by category</span><h2>What type of card are you looking for?</h2></div>
            <a href="/cards/compare"><GitCompareArrows size={14}/> Universal comparison</a>
          </div>

          <div className={local.categoryGrid}>
            {cardCategories.map((category, index) => (
              <a href={`/cards/${category.slug}`} key={category.slug}>
                <span>0{index + 1}</span>
                <h3>{category.shortTitle}</h3>
                <p>{category.description}</p>
                <small>{realCardsForCategory(category.slug).length} real cards ready to rank</small>
                <b>View Top 15 + compare →</b>
              </a>
            ))}
          </div>
        </section>

        <section className={local.featureGrid}>
          <article><span>01</span><h2>Category-specific formulas</h2><p>Fuel includes surcharge-waiver value, travel includes forex/lounges, co-branded cards separate partner and non-partner spend.</p><a href="/cards/compare">Compare categories →</a></article>
          <article><span>02</span><h2>Advanced spend-profile ranking</h2><p>For mixed monthly spending, the V7 analyzer still ranks custom card structures across multiple everyday categories.</p><a href="/cards/analyzer">Open advanced analyzer →</a></article>
          <article><span>03</span><h2>Source-backed database</h2><p>One verified product record can eventually power every relevant category view without duplicating card terms.</p><a href="/research/credit-card-data-standard">See data standard →</a></article>
        </section>

        <section className={local.registry}>
          <div className={local.registryHead}>
            <div><span>Verified product registry</span><h2>Only source-checked cards appear here.</h2></div>
            <a href="/corrections">Corrections policy →</a>
          </div>

          {verifiedCards.length === 0 ? (
            <div className={local.emptyRegistry}>
              <FileCheck2 size={25}/>
              <h3>Verified rankings first. Discovery automation second.</h3>
              <p>
                Real Indian card records now power the live rankings. The automated crawler remains a background discovery/update checker for cards that still need normalization.
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
            CredoNomics is not SEBI-registered and is not NISM-certified. These category models are
            general educational research tools, not personalized financial advice or a guarantee of card eligibility.
          </p>
        </div>
      </section>
    </SiteFrame>
  )
}
