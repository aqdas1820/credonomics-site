import { ArrowUpRight, Calculator, CreditCard, FileSearch, Fuel, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Financial Tools',
  description: 'CredoNomics calculators for credit-card selection, cashback economics and fuel-card savings in India.',
}

const tools = [
  [CreditCard, 'Credit Card Finder', 'Compare card fit around your spending pattern, annual fee and reward structure.', '/tools/credit-card-finder', 'Spend-fit comparison'],
  [Calculator, 'Cashback Calculator', 'Estimate net cashback after caps, excluded spending, annual fee and GST.', '/tools/cashback-calculator', 'Effective cashback rate'],
  [Fuel, 'Fuel Card Optimizer', 'Estimate fuel rewards, surcharge-waiver value and the practical annual benefit.', '/tools/fuel-card-optimizer', 'Net annual fuel value'],
]

export default function ToolsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Tools</span></div>
        <span className={styles.pageKicker}><Calculator size={14}/> Live calculators</span>
        <h1>Tools built around the <span>real decision.</span></h1>
        <p className={styles.pageHeroLead}>
          These tools focus on finished public workflows. Inputs stay visible so you can understand
          why a result changes instead of relying on a black-box score.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.toolGrid}>
          {tools.map(([Icon, title, text, href, output]: any, index) => (
            <a className={styles.toolCard} href={href} key={title}>
              <div className={styles.cardTop}>
                <span className={styles.iconTile}><Icon size={22}/></span>
                <span className={styles.statusPill}><i className={styles.liveDot}/> Live</span>
              </div>
              <span className={styles.cardLabel}>0{index+1} / Public tool</span>
              <h3>{title}</h3><p>{text}</p>
              <div className={styles.cardFooter}><span>{output}</span><ArrowUpRight size={16}/></div>
            </a>
          ))}
          <a className={`${styles.toolCard} ${styles.researchCard}`} href="/methodology">
            <div className={styles.cardTop}><span className={styles.iconTile}><FileSearch size={22}/></span><span className={styles.statusPill}>Method</span></div>
            <span className={styles.cardLabel}>04 / Verification</span>
            <h3>How calculations are built</h3>
            <p>Review CredoNomics’ source hierarchy, normalization rules and approach to assumptions.</p>
            <div className={styles.cardFooter}><span>Read methodology</span><ArrowUpRight size={16}/></div>
          </a>
        </div>

        <div className={styles.notice}>
          <ShieldCheck size={22}/>
          <div><h2>Calculator results are informational.</h2><p>Always verify current issuer or bank terms, eligibility, merchant classification, fees and applicable taxes before relying on a result.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
