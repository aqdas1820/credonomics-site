import type { Metadata } from 'next'
import {
  ArrowUpRight,
  BarChart3,
  Database,
  FileSearch,
  Layers3,
  ShieldCheck,
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from './mutual-funds.module.css'

export const metadata: Metadata = {
  title: 'Mutual Fund Intelligence',
  description:
    'Explore CredoNomics mutual-fund portfolio intelligence, scheme holdings, monthly portfolio changes, methodology and source-aware research workflows.',
  alternates: {
    canonical: '/mutual-funds',
  },
  openGraph: {
    title: 'CredoNomics Mutual Fund Intelligence',
    description:
      'Portfolio disclosures, scheme-level research and transparent mutual-fund intelligence for Indian investors.',
    url: '/mutual-funds',
  },
}

const capabilities = [
  {
    icon: Database,
    title: 'Portfolio snapshots',
    copy:
      'Inspect scheme holdings and portfolio snapshots built around disclosed AMC portfolio data.',
  },
  {
    icon: Layers3,
    title: 'Month-to-month changes',
    copy:
      'Surface additions, exits and meaningful portfolio-weight changes without hiding the underlying comparison.',
  },
  {
    icon: BarChart3,
    title: 'Scheme intelligence',
    copy:
      'Move from AMC and scheme selection into holdings, portfolio concentration and research context.',
  },
  {
    icon: FileSearch,
    title: 'Source-aware workflow',
    copy:
      'Use disclosed portfolio records as the research layer instead of treating a single score as the answer.',
  },
]

export default function MutualFundsPage() {
  const collectionData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CredoNomics Mutual Fund Intelligence',
    url: 'https://www.credonomics.in/mutual-funds',
    description:
      'Mutual-fund portfolio intelligence, holdings research and source-aware scheme analysis.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'CredoNomics',
      url: 'https://www.credonomics.in',
    },
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.credonomics.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mutual Fund Intelligence',
        item: 'https://www.credonomics.in/mutual-funds',
      },
    ],
  }

  return (
    <SiteFrame>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <Database size={15} />
              Mutual Fund Intelligence
            </span>

            <h1>
              Understand the portfolio behind the <span>fund.</span>
            </h1>

            <p>
              CredoNomics connects AMC portfolio disclosures, scheme holdings
              and month-to-month portfolio changes into a transparent research
              workflow. The tracker remains the working application; this page
              is the research and discovery layer around it.
            </p>

            <div className={styles.heroActions}>
              <a
                className={styles.primary}
                href="/tools/mf-portfolio-tracker"
              >
                Open Portfolio Intelligence
                <ArrowUpRight size={15} />
              </a>

              <a className={styles.secondary} href="/methodology">
                Review methodology
              </a>
            </div>
          </div>

          <aside className={styles.standardCard}>
            <ShieldCheck size={22} />

            <div>
              <span className={styles.standardLabel}>Research standard</span>
              <strong>Portfolio data with the source context visible.</strong>
              <p>
                Holdings and portfolio changes can become stale after the
                applicable disclosure period. Verify the latest AMC disclosure
                before making a current investment decision.
              </p>
            </div>
          </aside>
        </section>

        <section className={styles.capabilitySection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>What you can research</span>
              <h2>A cleaner route into mutual-fund portfolio analysis.</h2>
            </div>

            <p>
              The objective is not to label a fund as good or bad. It is to
              expose the holdings, changes and research context that deserve
              further investigation.
            </p>
          </div>

          <div className={styles.capabilityGrid}>
            {capabilities.map(({ icon: Icon, title, copy }, index) => (
              <article className={styles.capabilityCard} key={title}>
                <div className={styles.cardTop}>
                  <Icon size={18} />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>

                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.workflowSection}>
          <div className={styles.workflowCopy}>
            <span className={styles.sectionLabel}>Research workflow</span>
            <h2>Start broad. Open the data when the question becomes specific.</h2>
            <p>
              Use this section to understand what CredoNomics measures, then
              move into the tracker for scheme-level holdings and portfolio
              comparisons.
            </p>
          </div>

          <div className={styles.workflowSteps}>
            <div>
              <span>01</span>
              <strong>Select AMC and scheme</strong>
              <p>Identify the portfolio you actually want to investigate.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Inspect holdings</strong>
              <p>Review disclosed positions, concentration and portfolio mix.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Compare periods</strong>
              <p>Surface additions, exits and changes in portfolio weights.</p>
            </div>

            <div>
              <span>04</span>
              <strong>Verify the current record</strong>
              <p>Check the latest AMC disclosure before relying on the result.</p>
            </div>
          </div>
        </section>

        <section className={styles.entryPanel}>
          <div>
            <span className={styles.sectionLabel}>Portfolio application</span>
            <h2>Open the Mutual Fund Portfolio Intelligence workspace.</h2>
            <p>
              The application contains the detailed scheme and holdings
              workflow. This landing page remains lightweight and
              server-rendered for navigation, context and discoverability.
            </p>
          </div>

          <a href="/tools/mf-portfolio-tracker">
            Launch MF Intelligence <ArrowUpRight size={15} />
          </a>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionData),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbs),
          }}
        />
      </main>
    </SiteFrame>
  )
}