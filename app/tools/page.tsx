import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Database,
  Landmark,
  ShieldCheck,
} from 'lucide-react'
import ResearchProvenance from '../components/ResearchProvenance'
import SiteFrame from '../components/SiteFrame'
import { PUBLIC_REVIEW_DATE, publicTools } from '../data/tool-registry'
import { quickCalculators } from '../data/quick-calculators'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Financial Research & Decision Tools',
  description:
    'CredoNomics tools for mutual-fund portfolio intelligence, IPO analysis, credit-card economics and practical financial calculations.',
}

const investmentTools = [
  {
    href: '/tools/mf-portfolio-tracker',
    label: 'Portfolio intelligence',
    title: 'Mutual Fund Portfolio Intelligence',
    description:
      'Explore scheme holdings, concentration, stock exposure and portfolio-change intelligence.',
    output: 'Open MF intelligence',
    icon: Database,
  },
  {
    href: '/ipo/analyzer',
    label: 'Primary markets',
    title: 'IPO Analyzer',
    description:
      'Study issue economics, financial quality and valuation context through a structured framework.',
    output: 'Open IPO analyzer',
    icon: Landmark,
  },
  {
    href: '/research',
    label: 'Research desk',
    title: 'Research & Frameworks',
    description:
      'Browse source-linked research, methodology, data standards and reusable decision frameworks.',
    output: 'Open research desk',
    icon: BarChart3,
  },
]

export default function ToolsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}>
          <a href="/">Home</a>
          <span>/</span>
          <span>Tools</span>
        </div>

        <span className={styles.pageKicker}>Research & decision tools</span>

        <h1>
          Tools built around the <span>real decision.</span>
        </h1>

        <p className={styles.pageHeroLead}>
          CredoNomics combines market-intelligence workflows with transparent
          consumer-finance calculators. Inputs stay visible so you can understand
          why a result changes instead of relying on a black-box score.
        </p>

        <div className={styles.researchReviewStamp}>
          Analysis framework reviewed {PUBLIC_REVIEW_DATE}
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <ResearchProvenance
          updated={`Tool framework reviewed ${PUBLIC_REVIEW_DATE}`}
          source="Official filings, fund disclosures, exchange records and issuer terms"
          period="Varies by tool; inputs and dates are shown where applicable"
          limitations="Modeled outputs depend on user inputs and current source terms"
        />
        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.overline}>Investment intelligence</span>
              <h2>Research platforms</h2>
            </div>
            <p>
              Start with the market, portfolio or research workflow that matches
              the question you are trying to answer.
            </p>
          </div>

          <div className={styles.toolGrid}>
            {investmentTools.map((tool, index) => {
              const Icon = tool.icon

              return (
                <a className={styles.toolCard} href={tool.href} key={tool.href}>
                  <div className={styles.cardTop}>
                    <span className={styles.iconTile}>
                      <Icon size={22} />
                    </span>
                    <span className={styles.statusPill}>
                      <i className={styles.liveDot} /> Live
                    </span>
                  </div>

                  <span className={styles.cardLabel}>
                    0{index + 1} / {tool.label}
                  </span>

                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>

                  <div className={styles.cardFooter}>
                    <span>{tool.output}</span>
                    <ArrowUpRight size={16} />
                  </div>
                </a>
              )
            })}

            <a
              className={`${styles.toolCard} ${styles.researchCard}`}
              href="/cards/analyzer"
            >
              <div className={styles.cardTop}>
                <span className={styles.iconTile}>
                  <CreditCard size={22} />
                </span>
                <span className={styles.statusPill}>
                  <i className={styles.liveDot} /> Live
                </span>
              </div>

              <span className={styles.cardLabel}>04 / Product economics</span>
              <h3>Card Intelligence</h3>
              <p>
                Compare card structures, reward economics, fees, caps and
                spend-profile fit through transparent calculations.
              </p>

              <div className={styles.cardFooter}>
                <span>Open card analyzer</span>
                <ArrowUpRight size={16} />
              </div>
            </a>
          </div>
        </section>

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.overline}>Everyday financial tools</span>
              <h2>Transparent calculators</h2>
            </div>
            <p>
              Review reward economics, fees and real-world value using visible
              assumptions and simple inputs.
            </p>
          </div>

          <div className={styles.toolGrid}>
            {publicTools.map((tool, index) => {
              const Icon = tool.icon

              return (
                <a className={styles.toolCard} href={tool.href} key={tool.slug}>
                  <div className={styles.cardTop}>
                    <span className={styles.iconTile}>
                      <Icon size={22} />
                    </span>
                    <span className={styles.statusPill}>
                      <i className={styles.liveDot} /> Live
                    </span>
                  </div>

                  <span className={styles.cardLabel}>
                    0{index + 1} / {tool.category}
                  </span>

                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>

                  <div className={styles.cardFooter}>
                    <span>{tool.output}</span>
                    <ArrowUpRight size={16} />
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.overline}>Flagship card analysis</span>
              <h2>Credit Card Intelligence Analyzer</h2>
            </div>
            <p>
              Compare card structures against category-wise spend and inspect
              annual net value, caps, fees and reward leakage.
            </p>
          </div>

          <div className={styles.articleCardGrid}>
            <a className={styles.articleCard} href="/cards/analyzer">
              <span>Credit-card intelligence</span>
              <h3>Spend-profile Card Analyzer</h3>
              <p>
                Model reward rates, monthly caps, annual fee, GST and fee waiver
                with transparent outputs.
              </p>
              <div>
                <small>Interactive intelligence engine</small>
                <ArrowUpRight size={16} />
              </div>
            </a>

            <a className={styles.articleCard} href="/cards">
              <span>Research infrastructure</span>
              <h3>Verified Card Registry</h3>
              <p>
                View source-backed card records and official issuer terms as they
                are verified.
              </p>
              <div>
                <small>Source-backed records</small>
                <ArrowUpRight size={16} />
              </div>
            </a>
          </div>
        </section>

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.overline}>Focused calculators</span>
              <h2>Model one product rule at a time.</h2>
            </div>
            <p>
              Compact tools for high-impact questions that can get lost inside a
              full comparison.
            </p>
          </div>

          <div className={styles.articleCardGrid}>
            {quickCalculators.map((item) => (
              <a
                className={styles.articleCard}
                href={`/tools/${item.slug}`}
                key={item.slug}
              >
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div>
                  <small>Interactive calculator</small>
                  <ArrowUpRight size={16} />
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className={styles.notice}>
          <ShieldCheck size={22} />
          <div>
            <h2>Tool outputs are informational.</h2>
            <p>
              Verify current official terms, eligibility, fees, merchant
              classification, taxes and market information before relying on any
              result.
            </p>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
