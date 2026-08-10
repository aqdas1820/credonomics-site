import { notFound } from 'next/navigation'
import { ArrowRight, Building2, CalendarCheck, ExternalLink, Layers3, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import CategoryComparator from '../components/CategoryComparator'
import RealCardRanking from '../components/RealCardRanking'
import {
  categoriesForCard,
  categoryLabel,
  getRealCard,
  historyForCard,
  issuerSlugForCard,
  primaryCategoryForCard,
  relatedCards,
} from '../../data/card-intelligence'
import { cardCategories, cardCategoryMap, isCardCategorySlug } from '../../data/card-categories'
import { verifiedRealCards } from '../../data/verified-real-cards'
import styles from '../../core-v4.module.css'
import local from '../cards.module.css'

export function generateStaticParams() {
  return [
    ...cardCategories.map((category) => ({ slug: category.slug })),
    ...verifiedRealCards.map((card) => ({ slug: card.id })),
  ]
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  if (isCardCategorySlug(params.slug)) {
    const category = cardCategoryMap[params.slug]
    return {
      title: category.seoTitle,
      description: category.seoDescription,
      alternates: { canonical: `/cards/${category.slug}` },
    }
  }

  const card = getRealCard(params.slug)
  if (!card) return {}

  return {
    title: `${card.name} — Fees, Rewards & Verified Terms`,
    description: `CredoNomics source-backed research record for ${card.name} from ${card.issuer}, including annual fee, fee waiver, category benefits and official issuer source.`,
    alternates: { canonical: `/cards/${card.id}` },
    openGraph: {
      title: `${card.name} | CredoNomics`,
      description: `Verified card research for ${card.name} from ${card.issuer}.`,
      url: `https://www.credonomics.in/cards/${card.id}`,
      type: 'article',
    },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  if (isCardCategorySlug(params.slug)) {
    const category = cardCategoryMap[params.slug]
    const cards = verifiedRealCards.filter((card) => Boolean(card.terms[category.slug]))

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${category.title} — CredoNomics`,
      itemListElement: cards.slice(0, 15).map((card, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.credonomics.in/cards/${card.id}`,
        name: card.name,
      })),
    }

    return (
      <SiteFrame>
        <section className={`${styles.wrap} ${styles.pageHero}`}>
          <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>{category.shortTitle}</span></div>
          <span className={styles.pageKicker}><Layers3 size={14}/> {category.eyebrow}</span>
          <h1>{category.title}</h1>
          <p className={styles.pageHeroLead}>{category.description}</p>
          <div className={local.heroActions}>
            <a className={styles.secondaryButton} href="/cards/compare">Compare selected real cards</a>
            <a className={styles.secondaryButton} href="/cards/coverage">Coverage dashboard</a>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.pageBody}`}>
          <RealCardRanking categorySlug={category.slug}/>

          <section className={styles.researchArticleSection}>
            <div className={styles.sectionHead}>
              <div><span className={styles.overline}>Custom terms sandbox</span><h2>Want to compare a card that is not normalized yet?</h2></div>
              <p>Enter the latest issuer terms manually. The verified real-card ranking above remains separate from user-entered assumptions.</p>
            </div>
            <CategoryComparator categorySlug={category.slug}/>
          </section>

          <section className={styles.researchArticleSection}>
            <div className={styles.sectionHead}>
              <div><span className={styles.overline}>How this category is modeled</span><h2>Category-specific math, not one universal score.</h2></div>
              <p>Each category uses its own benefit/cost structure and keeps the inputs visible.</p>
            </div>
            <div className={local.methodGridV8}>
              {category.methodology.map((item, index) => (
                <article key={item}><span>0{index + 1}</span><p>{item}</p></article>
              ))}
            </div>
          </section>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        </section>
      </SiteFrame>
    )
  }

  const card = getRealCard(params.slug)
  if (!card) notFound()

  const categories = categoriesForCard(card)
  const primary = primaryCategoryForCard(card)
  const issuerSlug = issuerSlugForCard(card)
  const related = relatedCards(card)
  const history = historyForCard(card)
  const compareIds = [card.id, ...related.slice(0, 2).map((item) => item.id)]
  const compareHref = primary
    ? `/cards/compare?category=${primary}&${compareIds.map((id) => `cards=${encodeURIComponent(id)}`).join('&')}`
    : '/cards/compare'

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.credonomics.in/' },
      { '@type': 'ListItem', position: 2, name: 'Cards', item: 'https://www.credonomics.in/cards' },
      { '@type': 'ListItem', position: 3, name: card.name, item: `https://www.credonomics.in/cards/${card.id}` },
    ],
  }

  const financialProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreditCard',
    name: card.name,
    url: `https://www.credonomics.in/cards/${card.id}`,
    provider: { '@type': 'Organization', name: card.issuer },
    description: `CredoNomics normalized research record for ${card.name}.`,
  }

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>{card.name}</span></div>
        <span className={styles.pageKicker}>{card.issuer}</span>
        <h1>{card.name}</h1>
        <p className={styles.pageHeroLead}>
          Source-backed card research showing the terms currently used by CredoNomics category rankings.
        </p>
        <div className={local.cardDetailActions}>
          {issuerSlug && <a className={styles.secondaryButton} href={`/cards/issuer/${issuerSlug}`}><Building2 size={14}/> {card.issuer} coverage</a>}
          <a className={styles.primaryButton} href={compareHref}>Compare this card <ArrowRight size={15}/></a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.cardDetailStats}>
          <article><small>Annual fee</small><strong>₹{card.annualFeeRupees.toLocaleString('en-IN')}</strong><p>Before applicable fee tax.</p></article>
          <article><small>Fee waiver</small><strong>{card.feeWaiverAnnualSpendRupees ? `₹${card.feeWaiverAnnualSpendRupees.toLocaleString('en-IN')}` : 'Not normalized'}</strong><p>Annual spend threshold where available.</p></article>
          <article><small>Last verified</small><strong>{card.verifiedAt}</strong><p>Terms should be rechecked after issuer updates.</p></article>
        </div>

        <section className={local.cardDetailSection}>
          <div className={local.registryHead}><div><span>Category coverage</span><h2>Where this card enters CredoNomics rankings.</h2></div></div>
          <div className={local.cardCategoryLinks}>
            {categories.map((category) => (
              <a href={`/cards/${category}`} key={category}>
                <span>{categoryLabel(category)}</span>
                <small>{card.terms[category]?.note}</small>
                <b>Open ranking <ArrowRight size={12}/></b>
              </a>
            ))}
          </div>
        </section>

        <section className={local.cardDetailSection}>
          <div className={local.registryHead}><div><span>Verification history</span><h2>Visible record history.</h2></div></div>
          <div className={local.historyList}>
            {history.map((entry) => (
              <article key={`${entry.date}-${entry.title}`}>
                <span>{entry.date}</span>
                <div><b>{entry.title}</b><p>{entry.description}</p></div>
              </article>
            ))}
            <article className={local.historyEmpty}>
              <span>Next</span>
              <div><b>No later verified term change recorded yet.</b><p>When CredoNomics confirms a material issuer change, the old and new terms can be recorded here.</p></div>
            </article>
          </div>
        </section>

        <section className={local.cardDetailSection}>
          <div className={local.registryHead}><div><span>Primary source</span><h2>Official issuer documentation used.</h2></div></div>
          <a className={local.sourceCard} href={card.sourceUrl} target="_blank" rel="noreferrer">
            <div><small>Checked {card.verifiedAt}</small><h3>{card.sourceLabel}</h3></div>
            <span>Open official source <ExternalLink size={13}/></span>
          </a>
        </section>

        {related.length > 0 && (
          <section className={local.cardDetailSection}>
            <div className={local.registryHead}><div><span>Related cards</span><h2>Useful alternatives and comparisons.</h2></div></div>
            <div className={local.relatedGrid}>
              {related.map((candidate) => (
                <a href={`/cards/${candidate.id}`} key={candidate.id}>
                  <small>{candidate.issuer}</small><h3>{candidate.name}</h3>
                  <span>{categoriesForCard(candidate).slice(0, 3).map(categoryLabel).join(' · ')}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className={local.trustNote}><ShieldCheck size={20}/><p>CredoNomics is not SEBI-registered and is not NISM-certified. This page is general educational research, not personalized advice or a guarantee of card eligibility.</p></div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }} />
      </section>
    </SiteFrame>
  )
}
