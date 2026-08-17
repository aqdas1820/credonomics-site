import type { Metadata } from 'next'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Database,
  Download,
  Eye,
  FileText,
  ShieldAlert,
} from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { monthlyIndianEquityAug2026 as report } from '../../data/reports'
import styles from '../reports.module.css'

export const metadata: Metadata = {
  title: `${report.title} - ${report.edition}`,
  description: report.description,
  alternates: {
    canonical: `/reports/${report.slug}`,
  },
  openGraph: {
    title: `${report.title} - ${report.edition}`,
    description: report.description,
    type: 'article',
    url: `/reports/${report.slug}`,
  },
}

export default function August2026EquityReportPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    headline: `${report.title} - ${report.edition}`,
    datePublished: report.issueDateIso,
    publisher: {
      '@type': 'Organization',
      name: 'CredoNomics Investment Solutions',
    },
    about: 'Indian listed equities',
    description: report.description,
  }

  return (
    <SiteFrame>
      <section className={styles.detailPage}>
        <a className={styles.backLink} href="/reports">
          <ArrowLeft size={15} />
          Research Reports
        </a>

        <div className={styles.detailHero}>
          <div className={styles.detailCopy}>
            <span className={styles.eyebrow}>
              <FileText size={15} />
              Monthly Research Publication
            </span>

            <h1>
              {report.title}
              <span>{report.edition}</span>
            </h1>

            <p>{report.description}</p>

            <div className={styles.detailActions}>
              <a
                className={styles.primaryAction}
                href={report.pdfPath}
                target="_blank"
                rel="noreferrer"
              >
                <Eye size={16} />
                Open PDF
              </a>

              <a
                className={styles.secondaryAction}
                href={report.pdfPath}
                download
              >
                <Download size={16} />
                Download PDF
              </a>
            </div>
          </div>

          <div className={styles.reportCoverLarge}>
            <div className={styles.coverBrand}>
              <img src="/credonomics-mark.png" alt="" />
              <span>
                <strong>CredoNomics</strong>
                <small>Investment Solutions</small>
              </span>
            </div>

            <span className={styles.coverType}>Monthly Research Publication</span>
            <h2>Monthly Indian Equity Opportunity Report</h2>
            <p>August 2026</p>

            <div className={styles.coverRule} />

            <dl>
              <div>
                <dt>Reference</dt>
                <dd>{report.reference}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>NSE / BSE</dd>
              </div>
              <div>
                <dt>Pages</dt>
                <dd>{report.pages}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className={styles.provenanceGrid}>
          <div>
            <CalendarDays size={17} />
            <span>
              <small>Published</small>
              <strong>{report.issueDate}</strong>
            </span>
          </div>

          <div>
            <Database size={17} />
            <span>
              <small>Data cut-off</small>
              <strong>{report.dataCutoff}</strong>
            </span>
          </div>

          <div>
            <FileText size={17} />
            <span>
              <small>Prepared by</small>
              <strong>{report.preparedBy}</strong>
            </span>
          </div>

          <div>
            <ShieldAlert size={17} />
            <span>
              <small>Distribution</small>
              <strong>{report.distribution}</strong>
            </span>
          </div>
        </div>

        <div className={styles.reportBodyGrid}>
          <div>
            <section className={styles.contentSection}>
              <span className={styles.sectionLabel}>Inside the report</span>
              <h2>A monthly research queue, not a model portfolio.</h2>
              <p>
                The publication prioritises opportunities where operating
                evidence, valuation context, catalyst clarity and risk controls
                reinforce one another. Scores are research-prioritisation
                toolsâ€”not expected-return forecasts or target prices.
              </p>

              <div className={styles.highlightList}>
                {report.highlights.map((highlight) => (
                  <div key={highlight}>
                    <i />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.contentSection}>
              <span className={styles.sectionLabel}>Research construction</span>
              <h2>Evidence, catalysts and invalidation are separated.</h2>
              <p>
                The report weights valuation, earnings quality, catalyst
                clarity, balance sheet, ownership/flow, timing and risk
                adjustment. Evidence grades are shown separately so source
                quality is not hidden inside a single score.
              </p>

              <div className={styles.methodGrid}>
                <div><strong>20%</strong><span>Valuation</span></div>
                <div><strong>20%</strong><span>Earnings quality</span></div>
                <div><strong>20%</strong><span>Catalyst clarity</span></div>
                <div><strong>15%</strong><span>Balance sheet</span></div>
                <div><strong>10%</strong><span>Ownership / flow</span></div>
                <div><strong>10%</strong><span>Timing</span></div>
                <div><strong>5%</strong><span>Risk adjustment</span></div>
              </div>
            </section>

            <section className={styles.pdfSection}>
              <div className={styles.pdfSectionHead}>
                <div>
                  <span className={styles.sectionLabel}>Full publication</span>
                  <h2>Read the original 26-page report.</h2>
                </div>

                <a href={report.pdfPath} target="_blank" rel="noreferrer">
                  Open separately <ArrowUpRight size={15} />
                </a>
              </div>

              <iframe
                className={styles.pdfFrame}
                src={`${report.pdfPath}#view=FitH`}
                title={`${report.title} ${report.edition}`}
              />
            </section>
          </div>

          <aside className={styles.disclosurePanel}>
            <span className={styles.sectionLabel}>Publication information</span>
            <h2>Read before using the report.</h2>

            <div className={styles.disclosureItem}>
              <strong>Regulatory status</strong>
              <p>
                This publication states that CredoNomics Investment Solutions
                is not acting as a SEBI-registered Research Analyst or
                Investment Adviser for the reader. It is distributed as a
                public educational market note.
              </p>
            </div>

            <div className={styles.disclosureItem}>
              <strong>Publisher-supplied conflict disclosure</strong>
              <p>{report.publicationDisclosure}</p>
            </div>

            <div className={styles.disclosureItem}>
              <strong>Scores and stances</strong>
              <p>
                Opportunity scores, evidence grades, tiers and research stances
                are internal research-prioritisation classifications. They are
                not target prices, guarantees or personal recommendations.
              </p>
            </div>

            <div className={styles.disclosureItem}>
              <strong>Timeliness</strong>
              <p>
                Market prices, corporate actions, ownership, index flows and
                regulations can change after the stated data cut-off.
              </p>
            </div>

            <a className={styles.disclosureLink} href="/disclosures">
              Website disclosures <ArrowUpRight size={14} />
            </a>
          </aside>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </section>
    </SiteFrame>
  )
}