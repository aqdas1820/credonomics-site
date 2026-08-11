import { Calculator } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import styles from '../../core-v4.module.css'
import IpoAnalyzer from './IpoAnalyzer'

export const metadata = {
  title: 'IPO Data Score Analyzer',
  description:
    'Calculate a transparent quantitative IPO data score using normalized financial, valuation and issue-structure inputs.',
  alternates: { canonical: '/ipo/analyzer' },
}

export default function IpoAnalyzerPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Analyzer</span></div>
        <span className={styles.pageKicker}><Calculator size={14}/> IPO quantitative sandbox</span>
        <h1>Turn offer-document numbers into a <span>transparent data score.</span></h1>
        <p className={styles.pageHeroLead}>
          Enter normalized financials, valuation multiples and issue structure. CredoNomics applies
          the same fixed statistical framework used for source-backed IPO records.
        </p>
      </section>
      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <IpoAnalyzer/>
      </section>
    </SiteFrame>
  )
}
