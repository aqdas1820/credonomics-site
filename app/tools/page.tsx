import { ArrowUpRight, FileSearch, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { PUBLIC_REVIEW_DATE, publicTools } from '../data/tool-registry'
import { quickCalculators } from '../data/quick-calculators'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Financial Tools',
  description: 'CredoNomics tools for credit-card decisions, cashback and fuel economics, plus mutual-fund portfolio intelligence in India.',
}

export default function ToolsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Tools</span></div>
        <span className={styles.pageKicker}>Live calculators</span>
        <h1>Tools built around the <span>real decision.</span></h1>
        <p className={styles.pageHeroLead}>
          Inputs stay visible so you can understand why a result changes instead of relying on a black-box score.
        </p>
        <div className={styles.researchReviewStamp}>Analysis framework reviewed {PUBLIC_REVIEW_DATE}</div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.toolGrid}>
          {publicTools.map((tool, index) => {
            const Icon = tool.icon
            return (
              <a className={styles.toolCard} href={tool.href} key={tool.slug}>
                <div className={styles.cardTop}>
                  <span className={styles.iconTile}><Icon size={22}/></span>
                  <span className={styles.statusPill}><i className={styles.liveDot}/> Live</span>
                </div>
                <span className={styles.cardLabel}>0{index + 1} / {tool.category}</span>
                <h3>{tool.title}</h3><p>{tool.description}</p>
                <div className={styles.cardFooter}><span>{tool.output}</span><ArrowUpRight size={16}/></div>
              </a>
            )
          })}

          <a className={styles.toolCard} href="/tools/mf-portfolio-tracker">
            <div className={styles.cardTop}>
              <span className={styles.iconTile}><FileSearch size={22}/></span>
              <span className={styles.statusPill}><i className={styles.liveDot}/> Live</span>
            </div>
            <span className={styles.cardLabel}>04 / Mutual Fund Intelligence</span>
            <h3>MF Portfolio Tracker</h3>
            <p>Track HDFC mutual fund portfolio holdings across 2025 and 2026, compare schemes and months, and study stock and sector changes.</p>
            <div className={styles.cardFooter}><span>Portfolio intelligence</span><ArrowUpRight size={16}/></div>
          </a>
          <a className={`${styles.toolCard} ${styles.researchCard}`} href="/methodology">
            <div className={styles.cardTop}><span className={styles.iconTile}><FileSearch size={22}/></span><span className={styles.statusPill}>Method</span></div>
            <span className={styles.cardLabel}>05 / Verification</span>
            <h3>How calculations are built</h3>
            <p>Review CredoNomicsâ€™ source hierarchy, normalization rules and approach to assumptions.</p>
            <div className={styles.cardFooter}><span>Read methodology</span><ArrowUpRight size={16}/></div>
          </a>
        </div>


        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div><span className={styles.overline}>Flagship analysis</span><h2>Credit Card Intelligence Analyzer</h2></div>
            <p>Compare up to four card structures against one category-wise spend profile and rank them by modeled annual net value.</p>
          </div>
          <div className={styles.articleCardGrid}>
            <a className={styles.articleCard} href="/cards/analyzer">
              <span>Credit-card intelligence</span><h3>Spend-profile Card Analyzer</h3>
              <p>Model reward rates, monthly caps, annual fee, GST and fee waiver. See net annual value, cap leakage and a transparent Fit Score.</p>
              <div><small>Interactive intelligence engine</small><ArrowUpRight size={16}/></div>
            </a>
            <a className={styles.articleCard} href="/cards">
              <span>Research infrastructure</span><h3>Verified Card Registry</h3>
              <p>View the source-backed database standard and card records as current official terms are verified.</p>
              <div><small>Source-backed records only</small><ArrowUpRight size={16}/></div>
            </a>
          </div>
        </section>

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}><div><span className={styles.overline}>Focused calculators</span><h2>Model one product rule at a time.</h2></div><p>These compact tools are designed for high-impact questions that often get lost inside a full card comparison.</p></div>
          <div className={styles.articleCardGrid}>
            {quickCalculators.map((item) => <a className={styles.articleCard} href={`/tools/${item.slug}`} key={item.slug}><span>{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><div><small>Interactive calculator</small><ArrowUpRight size={16}/></div></a>)}
          </div>
        </section>
        <div className={styles.notice}>
          <ShieldCheck size={22}/>
          <div><h2>Calculator results are informational.</h2><p>Always verify current issuer or bank terms, eligibility, merchant classification, fees and applicable taxes before relying on a result.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}

