import type { Metadata } from 'next'
import { ArrowUpRight, CalendarDays, FileText, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { reports } from '../data/reports'
import styles from './reports.module.css'

export const metadata: Metadata = {
  title: 'Research Reports',
  description:
    'Public CredoNomics research publications with issue dates, data cut-offs, methodology context and downloadable source documents.',
  alternates: {
    canonical: '/reports',
  },
}

export default function ReportsPage() {
  return (
    <SiteFrame>
      <section className={styles.libraryPage}>
        <div className={styles.libraryHero}>
          <div>
            <span className={styles.eyebrow}>
              <FileText size={15} />
              CredoNomics Research Publications
            </span>

            <h1>
              Research reports with the <span>context attached.</span>
            </h1>

            <p>
              Browse public CredoNomics publications with visible issue dates,
              data cut-offs, source standards, methodology context and
              limitations.
            </p>
          </div>

          <div className={styles.libraryPrinciple}>
            <ShieldCheck size={21} />
            <div>
              <strong>Publication standard</strong>
              <span>
                Date-aware · source-aware · methodology-aware · limitations visible
              </span>
            </div>
          </div>
        </div>

        <div className={styles.reportGrid}>
          {reports.map((report, index) => (
            <a
              className={styles.reportCard}
              href={`/reports/${report.slug}`}
              key={report.slug}
            >
              <div className={styles.reportCover}>
                <div className={styles.coverBrand}>
                  <img src="/credonomics-mark.png" alt="" />
                  <span>
                    <strong>CredoNomics</strong>
                    <small>Investment Solutions</small>
                  </span>
                </div>

                <span className={styles.coverType}>Monthly Research Publication</span>

                <h2>{report.shortTitle}</h2>
                <p>{report.edition}</p>

                <div className={styles.coverRule} />

                <div className={styles.coverMeta}>
                  <span>{report.category}</span>
                  <span>{report.pages} pages</span>
                </div>
              </div>

              <div className={styles.reportCardBody}>
                <div className={styles.reportCardTop}>
                  <span>{index === 0 ? 'Latest publication' : report.category}</span>
                  <ArrowUpRight size={17} />
                </div>

                <h2>{report.title}</h2>
                <p>{report.description}</p>

                <div className={styles.cardFacts}>
                  <span>
                    <CalendarDays size={14} />
                    Published {report.issueDate}
                  </span>
                  <span>Data through {report.dataCutoff}</span>
                  <span>Ref {report.reference}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </SiteFrame>
  )
}