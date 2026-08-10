import { Activity, Database, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import CardAnalyzer from './CardAnalyzer'
import styles from '../../core-v4.module.css'
import local from './analyzer.module.css'

export const metadata = {
  title: 'Credit Card Intelligence Analyzer',
  description:
    'Model Indian credit-card reward economics using your spending pattern, annual fees, reward rates and caps.',
  alternates: { canonical: '/cards/analyzer' },
}

export default function Page() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>Analyzer</span></div>
        <span className={styles.pageKicker}><Activity size={14}/> Credit Card Intelligence</span>
        <h1>Rank card economics around <span>your spending.</span></h1>
        <p className={styles.pageHeroLead}>
          Enter the rules of up to four cards and CredoNomics will calculate gross rewards,
          cap leakage, fee impact, effective return and a transparent Fit Score.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <CardAnalyzer />

        <div className={local.safetyGrid}>
          <div><Database size={19}/><b>Database-ready</b><p>The same engine is designed to accept source-backed card records as they are verified.</p></div>
          <div><ShieldCheck size={19}/><b>No invented product terms</b><p>The example starts with generic Card A/Card B values. Replace them with current official terms before using a result.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
