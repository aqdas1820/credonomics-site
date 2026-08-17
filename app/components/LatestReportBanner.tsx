'use client'

import { ArrowUpRight, FileText } from 'lucide-react'
import { latestReport } from '../data/reports'
import styles from './latest-report-banner.module.css'

export default function LatestReportBanner() {
  return (
    <section className={styles.banner} aria-label="Latest research publication">
      <div className={styles.inner}>
        <div className={styles.icon}>
          <FileText size={20} />
        </div>

        <div className={styles.copy}>
          <span>New research publication</span>
          <strong>
            {latestReport.title} Â· {latestReport.edition}
          </strong>
          <small>
            {latestReport.pages} pages Â· 12 priority research ideas Â· Data
            through {latestReport.dataCutoff}
          </small>
        </div>

        <a href={`/reports/${latestReport.slug}`}>
          View publication <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  )
}