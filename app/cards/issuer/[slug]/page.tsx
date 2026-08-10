import { notFound } from 'next/navigation'
import { ArrowRight, Building2, Database, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../../components/SiteFrame'
import { categoriesForCard } from '../../../data/card-intelligence'
import { cardCategoryMap } from '../../../data/card-categories'
import { issuerBySlug, issuerMatchesName, issuerRegistry } from '../../../data/issuer-registry'
import { verifiedRealCards } from '../../../data/verified-real-cards'
import styles from '../../../core-v4.module.css'
import local from '../../cards.module.css'

export function generateStaticParams() {
  return issuerRegistry.map((issuer) => ({ slug: issuer.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const issuer = issuerBySlug(params.slug)
  if (!issuer) return {}
  return {
    title: `${issuer.name} Credit Card Coverage`,
    description: `CredoNomics normalized credit-card records and category coverage for ${issuer.name}.`,
    alternates: { canonical: `/cards/issuer/${issuer.slug}` },
  }
}

export default function IssuerPage({ params }: { params: { slug: string } }) {
  const issuer = issuerBySlug(params.slug)
  if (!issuer) notFound()

  const cards = verifiedRealCards.filter((card) => issuerMatchesName(issuer, card.issuer))
  const categories = [...new Set(cards.flatMap((card) => categoriesForCard(card)))]

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><a href="/cards/coverage">Coverage</a><span>/</span><span>{issuer.name}</span></div>
        <span className={styles.pageKicker}><Building2 size={14}/> Issuer coverage</span>
        <h1>{issuer.name}</h1>
        <p className={styles.pageHeroLead}>
          {cards.length > 0
            ? `${cards.length} normalized card record${cards.length === 1 ? '' : 's'} currently power CredoNomics comparisons for this issuer.`
            : 'This issuer is in the CredoNomics research universe, but no card has been normalized into the public rankings yet.'}
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><Database size={19}/><small>Normalized cards</small><strong>{cards.length}</strong><p>Source-backed records currently usable in rankings.</p></article>
          <article><Building2 size={19}/><small>Covered categories</small><strong>{categories.length}</strong><p>Distinct comparison categories represented by current records.</p></article>
          <article><ShieldCheck size={19}/><small>Research mode</small><strong>{issuer.discoveryAutomation ? 'Auto + manual' : 'Manual'}</strong><p>How new/changed products enter the review workflow.</p></article>
        </div>

        {cards.length > 0 ? (
          <section className={local.issuerCardsSection}>
            <div className={local.registryHead}><div><span>Normalized products</span><h2>Cards currently in the verified ranking dataset.</h2></div></div>
            <div className={local.issuerCardList}>
              {cards.map((card) => (
                <a href={`/cards/${card.id}`} key={card.id}>
                  <small>{card.issuer}</small>
                  <h3>{card.name}</h3>
                  <div>
                    {categoriesForCard(card).slice(0, 4).map((category) => (
                      <span key={category}>{cardCategoryMap[category].shortTitle}</span>
                    ))}
                  </div>
                  <b>View full research <ArrowRight size={13}/></b>
                </a>
              ))}
            </div>
          </section>
        ) : (
          <div className={local.emptyRegistry}>
            <Database size={25}/>
            <h3>No public normalized card record yet.</h3>
            <p>
              CredoNomics will add products here only after sufficient current official-source terms have
              been normalized for the ranking engine.
            </p>
          </div>
        )}

        <div className={local.trustNote}><ShieldCheck size={20}/><p>Coverage status is generated from the current CredoNomics dataset and should not be interpreted as the issuer’s complete product catalogue.</p></div>
      </section>
    </SiteFrame>
  )
}
