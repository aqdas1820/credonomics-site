import { GitCompareArrows } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import styles from '../../core-v4.module.css'
import UniversalCompare from './UniversalCompare'

export const metadata = {
  title: 'Compare Credit Cards by Category',
  description: 'Compare custom credit-card structures across cashback, fuel, travel, UPI, forex, lounge and other categories.',
  alternates: { canonical: '/cards/compare' },
}

export default function Page() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>Compare</span></div>
        <span className={styles.pageKicker}><GitCompareArrows size={14}/> Universal comparison engine</span>
        <h1>Switch the category. Keep the comparison <span>transparent.</span></h1>
        <p className={styles.pageHeroLead}>
          One engine supports category-specific math for cashback, fuel, travel, shopping,
          groceries, dining, utilities, UPI, forex, lounge, premium and more.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <UniversalCompare/>
      </section>
    </SiteFrame>
  )
}
