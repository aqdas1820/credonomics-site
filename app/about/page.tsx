import { BadgeIndianRupee, FileSearch, ShieldCheck, Target } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'About',
  description: 'About CredoNomics Investment Solutions and its financial research and decision-tool mission.',
}

export default function AboutPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>About</span></div>
        <span className={styles.pageKicker}><Target size={14}/> About CredoNomics</span>
        <h1>Make financial product decisions <span>easier to inspect.</span></h1>
        <p className={styles.pageHeroLead}>
          CredoNomics Investment Solutions is building an India-focused financial research and decision-tool platform
          around transparent product economics rather than marketing headlines.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><Target size={20}/></span><h2>Mission</h2><p>Turn complicated fees, reward structures, caps and product rules into clearer comparisons that users can inspect.</p></article>
          <article className={styles.policyCard}><span><FileSearch size={20}/></span><h2>Research standard</h2><p>Prefer current official documents, make assumptions visible and separate product rules from anecdotal experience.</p></article>
          <article className={styles.policyCard}><span><BadgeIndianRupee size={20}/></span><h2>India-first</h2><p>Design tools around Indian rupee outcomes, issuer rules, GST, surcharge mechanics and local product structures.</p></article>
          <article className={styles.policyCard}><span><ShieldCheck size={20}/></span><h2>Clear boundaries</h2><p>CredoNomics provides general information and calculators, not personalized investment advice or guaranteed outcomes.</p></article>
        </div>

        <div className={styles.notice}>
          <ShieldCheck size={22}/>
          <div><h2>CredoNomics is not SEBI-registered and is not NISM-certified.</h2><p>The company name “CredoNomics Investment Solutions” does not mean the website provides regulated investment-advisory or research-analyst services. Public content is general educational and informational material.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
