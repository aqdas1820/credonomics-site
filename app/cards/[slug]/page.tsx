import { notFound } from 'next/navigation'
import { CalendarCheck, ExternalLink, Layers3, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import CategoryComparator from '../components/CategoryComparator'
import RealCardRanking from '../components/RealCardRanking'
import { cardCategories, cardCategoryMap, isCardCategorySlug } from '../../data/card-categories'
import { verifiedCards } from '../../data/card-database'
import styles from '../../core-v4.module.css'
import local from '../cards.module.css'

export function generateStaticParams() {
  return [
    ...cardCategories.map((category) => ({ slug: category.slug })),
    ...verifiedCards.map((card) => ({ slug: card.slug })),
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

  const card = verifiedCards.find((item) => item.slug === params.slug)
  if (!card) return {}

  return {
    title: `${card.productName} — ${card.issuer}`,
    description: `Source-backed CredoNomics research record for ${card.productName}.`,
    alternates: { canonical: `/cards/${card.slug}` },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  if (isCardCategorySlug(params.slug)) {
    const category = cardCategoryMap[params.slug]

    return (
      <SiteFrame>
        <section className={`${styles.wrap} ${styles.pageHero}`}>
          <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>{category.shortTitle}</span></div>
          <span className={styles.pageKicker}><Layers3 size={14}/> {category.eyebrow}</span>
          <h1>{category.title}</h1>
          <p className={styles.pageHeroLead}>{category.description}</p>
          <div className={local.heroActions}>
            <a className={styles.secondaryButton} href="/cards/compare">Switch comparison category</a>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.pageBody}`}>
          <RealCardRanking categorySlug={category.slug}/>
          <section className={styles.researchArticleSection}>
            <div className={styles.sectionHead}>
              <div><span className={styles.overline}>Custom terms sandbox</span><h2>Want to compare a card that is not normalized yet?</h2></div>
              <p>Use the calculator below to enter the card terms manually. The verified real-card ranking above remains the primary comparison.</p>
            </div>
            <CategoryComparator categorySlug={category.slug}/>
          </section>

          <section className={styles.researchArticleSection}>
            <div className={styles.sectionHead}>
              <div><span className={styles.overline}>How this category is modeled</span><h2>Category-specific math, not one universal score.</h2></div>
              <p>Each category has its own benefit and cost structure. The result remains driven by the values entered by the user.</p>
            </div>
            <div className={local.methodGridV8}>
              {category.methodology.map((item, index) => (
                <article key={item}><span>0{index + 1}</span><p>{item}</p></article>
              ))}
            </div>
          </section>
        </section>
      </SiteFrame>
    )
  }

  const card = verifiedCards.find((item) => item.slug === params.slug)
  if (!card) notFound()

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>{card.productName}</span></div>
        <span className={styles.pageKicker}>{card.issuer}</span>
        <h1>{card.productName}</h1>
        <p className={styles.pageHeroLead}>A structured CredoNomics research record with official-source references and transparent assumptions.</p>
        <div className={styles.researchReviewStamp}><CalendarCheck size={14}/> Product terms verified {card.lastVerified}</div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><small>Annual fee</small><strong>₹{card.annualFeeRupees.toLocaleString('en-IN')}</strong><p>Before applicable tax.</p></article>
          <article><small>Base reward rate</small><strong>{card.baseRewardRatePercent}%</strong><p>Subject to documented exclusions and redemption mechanics.</p></article>
          <article><small>Verification</small><strong>{card.officialSources.length}</strong><p>Official source record(s) attached.</p></article>
        </div>

        <section className={local.registry}>
          <div className={local.registryHead}><div><span>Official sources</span><h2>Documents used for this record.</h2></div></div>
          <div className={local.cardRegistry}>
            {card.officialSources.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <small>Checked {source.checkedAt}</small><h3>{source.label}</h3><span>Open source <ExternalLink size={12}/></span>
              </a>
            ))}
          </div>
        </section>

        <div className={local.trustNote}><ShieldCheck size={20}/><p>Always confirm the issuer’s current terms before applying. Product records can become stale after a bank revises fees, rewards, caps or eligibility.</p></div>
      </section>
    </SiteFrame>
  )
}
