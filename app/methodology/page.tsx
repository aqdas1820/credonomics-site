import { BadgeIndianRupee, FileSearch, RefreshCcw, Search, ShieldCheck, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Methodology',
  description: 'How CredoNomics sources, normalizes, calculates and stress-tests financial-product research.',
}

const steps: Array<[LucideIcon, string, string, string]> = [
  [FileSearch, '01', 'Define and source', 'Define the question first. Collect the current official product terms that directly govern the answer.'],
  [Search, '02', 'Normalize the rules', 'Convert inconsistent wording into comparable fields: rates, caps, eligible spend, exclusions, fees, taxes and timing.'],
  [BadgeIndianRupee, '03', 'Calculate in rupees', 'Use the same period and the same assumptions across alternatives so the comparison is economically consistent.'],
  [Target, '04', 'Stress-test assumptions', 'Change the spend mix, cap usage, annual fee or eligibility assumptions to see whether the conclusion is robust.'],
  [RefreshCcw, '05', 'Check freshness', 'Record the source date where practical and revisit comparisons when issuers revise product terms.'],
]

export default function MethodologyPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Methodology</span></div>
        <span className={styles.pageKicker}><Target size={14}/> Research process</span>
        <h1>A calculation should be <span>reproducible.</span></h1>
        <p className={styles.pageHeroLead}>
          CredoNomics aims to make the route from source document to conclusion understandable,
          including the assumptions that could change the result.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${styles.twoCol}`}>
        <div className={styles.sideTitle}>
          <span className={styles.overline}>Five-step process</span>
          <h2>From a product question to a defensible comparison.</h2>
          <p>There is no universal “best” product. A useful comparison starts by defining what value means for the user’s scenario.</p>
        </div>
        <div className={styles.stack}>
          {steps.map(([Icon, no, title, text]) => (
            <article className={styles.infoCard} key={no}>
              <div className={styles.infoCardTop}><span className={styles.iconTile}><Icon size={20}/></span><span className={styles.overline}>{no}</span></div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
          <div className={styles.notice}>
            <ShieldCheck size={22}/>
            <div><h2>Methodology does not create certainty.</h2><p>Merchant coding, issuer interpretation, eligibility, operational exceptions and future term changes can still make actual outcomes differ from a model.</p></div>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
