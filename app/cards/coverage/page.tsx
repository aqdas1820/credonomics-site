import { Activity, ArrowRight, Building2, Database, RefreshCw, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { cardCategories } from '../../data/card-categories'
import { cardReviewQueueMeta } from '../../data/card-review-queue.generated'
import { issuerGroups, issuerRegistry, issuerMatchesName } from '../../data/issuer-registry'
import { verifiedRealCards } from '../../data/verified-real-cards'
import styles from '../../core-v4.module.css'
import local from '../cards.module.css'

export const metadata = {
  title: 'Credit Card Coverage',
  description:
    'See CredoNomics credit-card issuer coverage, normalized real-card records, category coverage and verification-queue status.',
  alternates: { canonical: '/cards/coverage' },
}

export default function CoveragePage() {
  const issuersWithCards = issuerRegistry.filter((issuer) =>
    verifiedRealCards.some((card) => issuerMatchesName(issuer, card.issuer)),
  )

  const categoriesWithCards = cardCategories.filter((category) =>
    verifiedRealCards.some((card) => Boolean(card.terms[category.slug])),
  )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CredoNomics Credit Card Coverage',
    url: 'https://www.credonomics.in/cards/coverage',
    description: 'Coverage dashboard for source-backed Indian credit-card research records.',
  }

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>Coverage</span></div>
        <span className={styles.pageKicker}><Database size={14}/> Public coverage dashboard</span>
        <h1>See what CredoNomics has <span>actually verified.</span></h1>
        <p className={styles.pageHeroLead}>
          Coverage numbers are generated from the live normalized dataset. An issuer appearing in the
          research universe does not mean every one of its cards has been verified yet.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.coverageStats}>
          <article><Database size={19}/><small>Normalized card records</small><strong>{verifiedRealCards.length}</strong><p>Real card records currently available to category rankings.</p></article>
          <article><Building2 size={19}/><small>Issuers with ≥1 record</small><strong>{issuersWithCards.length}</strong><p>Issuers currently represented by normalized card data.</p></article>
          <article><Activity size={19}/><small>Categories with real cards</small><strong>{categoriesWithCards.length}/{cardCategories.length}</strong><p>Category engines that currently have at least one normalized real card.</p></article>
          <article><RefreshCw size={19}/><small>Research review queue</small><strong>{cardReviewQueueMeta.itemCount}</strong><p>Automated discovery/change signals awaiting source review.</p></article>
        </div>

        <div className={local.coverageNotice}>
          <ShieldCheck size={20}/>
          <p>
            <b>Coverage universe: {issuerRegistry.length} issuers.</b> This is a research target list, not a
            statement that every listed institution currently offers every type of credit card. Public rankings
            use only normalized records with official-source links.
          </p>
        </div>

        {issuerGroups.map((group) => (
          <section className={local.issuerGroup} key={group}>
            <div className={local.registryHead}>
              <div><span>{group}</span><h2>Issuer research coverage</h2></div>
            </div>
            <div className={local.issuerGrid}>
              {issuerRegistry.filter((issuer) => issuer.group === group).map((issuer) => {
                const count = verifiedRealCards.filter((card) => issuerMatchesName(issuer, card.issuer)).length
                return (
                  <a href={`/cards/issuer/${issuer.slug}`} key={issuer.slug}>
                    <div>
                      <h3>{issuer.name}</h3>
                      <span>{issuer.discoveryAutomation ? 'Automated discovery supported' : 'Manual research queue'}</span>
                    </div>
                    <strong>{count}</strong>
                    <small>{count === 1 ? 'normalized card' : 'normalized cards'} <ArrowRight size={12}/></small>
                  </a>
                )
              })}
            </div>
          </section>
        ))}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </SiteFrame>
  )
}
