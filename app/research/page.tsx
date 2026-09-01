import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Database,
  FileSearch,
  Landmark,
  ShieldCheck,
} from 'lucide-react'
import ResearchProvenance from '../components/ResearchProvenance'
import SiteFrame from '../components/SiteFrame'
import { RESEARCH_REVIEW_DATE, researchArticles } from '../data/research-articles'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Research Desk',
  description:
    'CredoNomics research across equities and valuation, IPOs, mutual funds, banking and cards, supported by transparent methodology and source context.',
}

const researchDomains = [
  {
    href: '/methodology',
    label: 'Equities & valuation',
    title: 'Equity Research Frameworks',
    description:
      'Study valuation, business quality, capital efficiency, catalysts and downside risk through reusable research frameworks.',
    detail: 'Framework-led; no personalized buy/sell calls',
    icon: BarChart3,
  },
  {
    href: '/ipo',
    label: 'Primary markets',
    title: 'IPO Intelligence',
    description:
      'Review issue structure, exchange records, subscription context, company information and valuation inputs.',
    detail: 'Exchange-linked market records',
    icon: Landmark,
  },
  {
    href: '/tools/mf-portfolio-tracker',
    label: 'Portfolio research',
    title: 'Mutual Fund Intelligence',
    description:
      'Inspect scheme holdings, stock concentration, sector exposure and portfolio-change intelligence.',
    detail: 'Portfolio-disclosure workflow',
    icon: Database,
  },
  {
    href: '/cards',
    label: 'Banking & cards',
    title: 'Financial Product Economics',
    description:
      'Translate fees, reward caps, exclusions, surcharge rules and product terms into transparent real-world economics.',
    detail: 'Issuer terms and calculation rules',
    icon: CreditCard,
  },
  {
    href: '/methodology',
    label: 'Research process',
    title: 'Methodology & Limitations',
    description:
      'See source hierarchy, normalization rules, assumptions, correction handling and the boundaries of each research workflow.',
    detail: 'How CredoNomics builds research',
    icon: FileSearch,
  },
]

export default function ResearchPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}>
          <a href="/">Home</a>
          <span>/</span>
          <span>Research</span>
        </div>

        <span className={styles.pageKicker}>
          <FileSearch size={14} /> CredoNomics Research Desk
        </span>

        <h1>
          Research the context before you trust the <span>headline.</span>
        </h1>

        <p className={styles.pageHeroLead}>
          CredoNomics brings equities and valuation, IPO intelligence,
          mutual-fund portfolio research, banking-product economics and
          transparent methodology into one research architecture.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <ResearchProvenance
          updated={`Framework reviewed ${RESEARCH_REVIEW_DATE}`}
          source="Official filings, exchange records, fund disclosures and issuer terms"
          period="Shown per dataset or research object"
          limitations="General research; source freshness and coverage vary"
        />

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.overline}>Research architecture</span>
              <h2>Five desks. One source-aware research process.</h2>
            </div>
            <p>
              Each desk uses different primary records, but the same principle:
              show the inputs, date context, methodology and limitations before
              drawing a conclusion.
            </p>
          </div>

          <div className={styles.researchDomainGrid}>
            {researchDomains.map((domain) => {
              const Icon = domain.icon

              return (
                <a
                  className={styles.researchDomainCard}
                  href={domain.href}
                  key={domain.title}
                >
                  <div className={styles.domainHead}>
                    <span className={styles.iconTile}>
                      <Icon size={21} />
                    </span>
                    <span className={styles.domainTag}>{domain.label}</span>
                  </div>

                  <h3>{domain.title}</h3>
                  <p>{domain.description}</p>

                  <div className={styles.domainFooter}>
                    <small>{domain.detail}</small>
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
              <span className={styles.overline}>Evergreen product research</span>
              <h2>Reusable frameworks behind financial-product economics.</h2>
            </div>
            <p>
              These articles explain the maths and decision rules behind a
              product instead of assuming today’s terms will remain unchanged.
            </p>
          </div>

          <div className={styles.articleCardGrid}>
            {researchArticles.map((article) => (
              <a
                className={styles.articleCard}
                href={`/research/articles/${article.slug}`}
                key={article.slug}
              >
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <div>
                  <small>
                    Reviewed {article.reviewed} · {article.readTime}
                  </small>
                  <ArrowUpRight size={16} />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.overline}>Research infrastructure</span>
              <h2>Trust also depends on how data is stored and corrected.</h2>
            </div>
            <p>
              Source hierarchy, verification rules, review dates and visible
              corrections are part of the research product—not an afterthought.
            </p>
          </div>

          <div className={styles.articleCardGrid}>
            <a
              className={styles.articleCard}
              href="/research/credit-card-data-standard"
            >
              <span>Data standard</span>
              <h3>Credit Card Data Standard</h3>
              <p>
                See the fields and verification rules behind the structured
                Indian card database.
              </p>
              <div>
                <small>Research infrastructure</small>
                <ArrowUpRight size={16} />
              </div>
            </a>

            <a className={styles.articleCard} href="/corrections">
              <span>Transparency</span>
              <h3>Corrections & Updates</h3>
              <p>
                Report an outdated fee, cap, exclusion, effective date or
                research input with an official source.
              </p>
              <div>
                <small>Source-backed corrections</small>
                <ArrowUpRight size={16} />
              </div>
            </a>
          </div>
        </section>

        <div className={styles.notice}>
          <ShieldCheck size={22} />
          <div>
            <h2>Research should age visibly.</h2>
            <p>
              Market records, portfolio disclosures and financial-product terms
              change. Re-check the date, primary source and limitations before
              applying an older research view to a current decision.
            </p>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
