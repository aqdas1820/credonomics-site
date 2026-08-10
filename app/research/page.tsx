import { CheckCircle2, CreditCard, FileSearch, Fuel, Landmark, Search, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Research Desk',
  description: 'CredoNomics research frameworks for credit-card rewards, cashback, fuel-card economics and banking product terms.',
}

export default function ResearchPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Research</span></div>
        <span className={styles.pageKicker}><FileSearch size={14}/> CredoNomics Research Desk</span>
        <h1>Research the rules before you trust the <span>headline.</span></h1>
        <p className={styles.pageHeroLead}>
          CredoNomics focuses on the product rules that materially change real-world value:
          fees, exclusions, caps, transaction ranges, eligibility and timing.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.researchGrid}>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><CreditCard size={21}/></span>
            <h3>Credit-card reward economics</h3>
            <p>A framework for turning advertised rewards into an effective annual value.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Identify eligible and excluded categories</li>
              <li><CheckCircle2 size={14}/> Apply monthly or annual reward caps</li>
              <li><CheckCircle2 size={14}/> Include annual fee and GST</li>
              <li><CheckCircle2 size={14}/> Separate fee waiver from rewards</li>
            </ul>
            <div className={styles.formulaBox}>net value = eligible rewards − annual fee − applicable taxes</div>
          </article>

          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Fuel size={21}/></span>
            <h3>Fuel-card reward economics</h3>
            <p>Avoid double-counting surcharge waiver, reward points and app-specific benefits.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Check eligible fuel outlets</li>
              <li><CheckCircle2 size={14}/> Check transaction range and waiver ceiling</li>
              <li><CheckCircle2 size={14}/> Convert points to realistic rupee value</li>
              <li><CheckCircle2 size={14}/> Treat promotional benefits separately</li>
            </ul>
            <div className={styles.formulaBox}>fuel value = rewards + valid waiver − fees − benefit leakage</div>
          </article>

          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Landmark size={21}/></span>
            <h3>Banking product terms</h3>
            <p>Operational conditions can decide whether a product is useful in practice.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Schedule of charges</li>
              <li><CheckCircle2 size={14}/> Eligibility and account conditions</li>
              <li><CheckCircle2 size={14}/> Transaction restrictions</li>
              <li><CheckCircle2 size={14}/> Effective dates and revised terms</li>
            </ul>
          </article>
        </div>

        <section className={`${styles.section} ${styles.twoCol}`}>
          <div className={styles.sideTitle}>
            <span className={styles.overline}>Evidence hierarchy</span>
            <h2>Not every source deserves the same weight.</h2>
            <p>Community reports can expose edge cases, but they should not override current official documentation.</p>
          </div>
          <div className={styles.rankList}>
            <div className={styles.rankRow}><span>A</span><div><h3>Primary documentation</h3><p>Issuer, bank or official product pages, MITC/fee schedules, terms, notices and current official documents.</p></div></div>
            <div className={styles.rankRow}><span>B</span><div><h3>Official support material</h3><p>FAQs, help-centre articles and product-specific operational guidance from the provider.</p></div></div>
            <div className={styles.rankRow}><span>C</span><div><h3>Independent reporting</h3><p>Useful for context and changes, but product mechanics should be checked against primary sources.</p></div></div>
            <div className={styles.rankRow}><span>D</span><div><h3>Community experience</h3><p>Helpful for identifying real-world edge cases; anecdotal experience is not the official product rule.</p></div></div>
          </div>
        </section>

        <div className={styles.notice}>
          <ShieldCheck size={22}/>
          <div><h2>Research should age visibly.</h2><p>Financial-product terms change. Re-check the effective date and official source before applying an older calculation or comparison to a current decision.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
