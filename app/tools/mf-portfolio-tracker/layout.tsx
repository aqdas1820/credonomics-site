import type { Metadata } from 'next'
import ResearchProvenance from '../../components/ResearchProvenance'
import SiteFrame from '../../components/SiteFrame'
import styles from '../../core-v4.module.css'

export const metadata: Metadata = {
  title: 'Mutual Fund Portfolio Intelligence',
  description:
    'Explore mutual-fund scheme holdings, stock concentration, sector exposure and portfolio-change intelligence with source and date context on CredoNomics.',
  alternates: {
    canonical: '/tools/mf-portfolio-tracker',
  },
}

export default function MutualFundPortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SiteFrame>
      <section
        className={`${styles.wrap} ${styles.mfServerIntro}`}
        aria-label="Mutual Fund Intelligence context"
      >
        <span className={styles.overline}>Mutual Fund Intelligence</span>
        <strong className={styles.mfServerTitle}>
          Portfolio holdings research with visible source, date and coverage context.
        </strong>
        <p className={styles.mfServerLead}>
          Use the interactive tracker to inspect scheme portfolios, stock
          concentration, sector exposure and portfolio changes. Dataset coverage
          can vary by scheme and reporting period, so interpret results together
          with the provenance shown below.
        </p>

        <ResearchProvenance
          updated="Page framework reviewed 17 Aug 2026"
          source="Scheme portfolio disclosures and normalized CredoNomics datasets"
          period="Dataset period is shown inside the interactive tracker"
          limitations="Coverage, identifiers and holdings can be incomplete for some records"
        />
      </section>

      {children}
    </SiteFrame>
  )
}