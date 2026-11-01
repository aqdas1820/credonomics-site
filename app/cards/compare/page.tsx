import { GitCompareArrows } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import RealCardRanking from '../components/RealCardRanking'
import UniversalCompare from './UniversalCompare'
import RealCardSelector from './RealCardSelector'
import { cardCategories, cardCategoryMap, isCardCategorySlug, type CardCategorySlug } from '../../data/card-categories'
import { sanitizeRequestedCompareIds } from '../../data/card-directory-compare'
import { realCardsForCategory } from '../../data/verified-real-cards'
import styles from '../../core-v4.module.css'

export const metadata = {
  title: 'Compare Real Credit Cards Side by Side',
  description: 'Select a category and up to three normalized Indian credit cards, then compare them using the same live CredoNomics ranking model.',
  alternates: { canonical: '/cards/compare' },
}

function arrayValue(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export default async function Page({ searchParams: searchParamsPromise }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await searchParamsPromise
  const categoryParam = typeof searchParams?.category === 'string' ? searchParams.category : 'cashback'
  const category: CardCategorySlug = isCardCategorySlug(categoryParam) ? categoryParam : 'cashback'
  const candidates = realCardsForCategory(category)
  const requested = arrayValue(searchParams?.cards).flatMap(value => value.split(',')).filter(Boolean)
  const validRequested = sanitizeRequestedCompareIds(requested, candidates.map(card => card.id))
  const selected = validRequested.length ? validRequested : candidates.slice(0, 3).map(card => card.id)
  const config = cardCategoryMap[category]

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>Compare</span></div>
        <span className={styles.pageKicker}><GitCompareArrows size={14}/> Head-to-head comparison</span>
        <h1>Compare real cards with a <span>shareable URL.</span></h1>
        <p className={styles.pageHeroLead}>Choose a category and up to three normalized cards. The same saved spending profile and annual-value model used by the category rankings powers the comparison.</p>
      </section>
      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <RealCardSelector key={`${category}:${selected.join(',')}`} category={category} categoryTitle={config.shortTitle} categories={cardCategories.map(item => ({ slug: item.slug, title: item.title }))} candidates={candidates.map(card => ({ id: card.id, name: card.name, issuer: card.issuer }))} initialSelected={selected}/>
        {selected.length > 0 && <RealCardRanking categorySlug={category} cardIds={selected}/>} 
        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}><div><span className={styles.overline}>Custom terms sandbox</span><h2>Comparing a card not in the verified database?</h2></div><p>Use the generic model below. Its values are user-entered and are kept separate from the verified real-card ranking above.</p></div>
          <UniversalCompare/>
        </section>
      </section>
    </SiteFrame>
  )
}
