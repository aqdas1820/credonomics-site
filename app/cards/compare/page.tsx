import { GitCompareArrows } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import RealCardRanking from '../components/RealCardRanking'
import UniversalCompare from './UniversalCompare'
import { cardCategories, cardCategoryMap, isCardCategorySlug, type CardCategorySlug } from '../../data/card-categories'
import { realCardsForCategory } from '../../data/verified-real-cards'
import styles from '../../core-v4.module.css'
import local from './compare.module.css'

export const metadata = {
  title: 'Compare Real Credit Cards Side by Side',
  description: 'Select a category and up to three normalized Indian credit cards, then compare them using the same live CredoNomics ranking model.',
  alternates: { canonical: '/cards/compare' },
}

function arrayValue(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const categoryParam = typeof searchParams?.category === 'string' ? searchParams.category : 'cashback'
  const category: CardCategorySlug = isCardCategorySlug(categoryParam) ? categoryParam : 'cashback'
  const candidates = realCardsForCategory(category)
  const requested = arrayValue(searchParams?.cards).flatMap((value) => value.split(',')).filter(Boolean)
  const selected = (requested.length ? requested : candidates.slice(0, 3).map((card) => card.id)).slice(0, 3)
  const config = cardCategoryMap[category]

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>Compare</span></div>
        <span className={styles.pageKicker}><GitCompareArrows size={14}/> Head-to-head comparison</span>
        <h1>Compare real cards with a <span>shareable URL.</span></h1>
        <p className={styles.pageHeroLead}>
          Choose a category and up to three normalized cards. The same saved spending profile and
          annual-value model used by the category rankings powers the comparison.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <form className={local.realSelector} method="get">
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={category}>
              {cardCategories.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}
            </select>
          </div>

          <div className={local.cardChecks}>
            <span>Select up to three cards currently normalized for {config.shortTitle}</span>
            {candidates.length > 0 ? candidates.map((card) => (
              <label key={card.id}>
                <input type="checkbox" name="cards" value={card.id} defaultChecked={selected.includes(card.id)}/>
                <span><b>{card.name}</b><small>{card.issuer}</small></span>
              </label>
            )) : <p>No normalized real cards are available for this category yet.</p>}
          </div>

          <button type="submit">Compare selected cards</button>
          <small>Tip: the resulting URL contains the selected cards and can be copied or shared.</small>
        </form>

        {selected.length > 0 && <RealCardRanking categorySlug={category} cardIds={selected}/>}

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div><span className={styles.overline}>Custom terms sandbox</span><h2>Comparing a card not in the verified database?</h2></div>
            <p>Use the generic model below. Its values are user-entered and are kept separate from the verified real-card ranking above.</p>
          </div>
          <UniversalCompare/>
        </section>
      </section>
    </SiteFrame>
  )
}
