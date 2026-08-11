import { FileSearch, Scale, ShieldCheck, Target } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Disclosures',
  description: 'Regulatory status, calculator limitations and financial-information disclosures for CredoNomics.',
}

export default function DisclosuresPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Disclosures</span></div>
        <span className={styles.pageKicker}><ShieldCheck size={14}/> Trust & transparency</span>
        <h1>Clear tools need equally clear <span>boundaries.</span></h1>
        <p className={styles.pageHeroLead}>These disclosures explain what CredoNomics is, what its tools do and what users should verify independently.</p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><ShieldCheck size={20}/></span><h2>Regulatory status</h2><p>CredoNomics is not SEBI-registered and is not NISM-certified. The website does not provide personalized investment advice or hold itself out as a registered investment adviser.</p></article>
          <article className={styles.policyCard}><span><FileSearch size={20}/></span><h2>General information</h2><p>Research, comparisons and calculators are general educational and informational content. They are not a recommendation to buy, sell, hold or subscribe to a security or financial product.</p></article>
          <article className={styles.policyCard}><span><Scale size={20}/></span><h2>Model limitations</h2><p>Outputs depend on inputs and assumptions. Merchant classification, exclusions, taxes, caps, issuer interpretation, eligibility and timing can materially change actual results.</p></article>
          <article className={styles.policyCard}><span><Target size={20}/></span><h2>No guarantee</h2><p>CredoNomics does not guarantee approvals, rewards, savings, returns, eligibility or any other financial outcome. Product providers make their own decisions under their current terms.</p></article>
          <article className={styles.policyCard}><span><Scale size={20}/></span><h2>IPO / public-offer content</h2><p>IPO Intelligence is designed as general statistical and educational information. CredoNomics does not publish Subscribe/Avoid calls, price targets, personalized IPO advice or assurances about allotment, listing gains or future returns.</p></article>
        </div>

        <div className={styles.notice}>
          <ShieldCheck size={22}/>
          <div><h2>Verify the current official document before acting.</h2><p>If CredoNomics content conflicts with an issuer, bank, AMC, regulator or other authoritative source, the current authoritative source should take priority. Seek appropriately qualified professional advice where your situation requires personalized advice.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
