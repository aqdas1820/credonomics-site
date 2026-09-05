'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useMFData } from '../useMFData'
import MFPortfolioUI from './MFPortfolioUI'
import styles from '../../stocks/[exchange]/[symbol]/stock-detail.module.css'

export default function MFSchemeClient({ schemeId }: { schemeId: string }) {
  const { portfolio } = useMFData(schemeId)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/mutual-funds" className={styles.backLink}>
            <ArrowLeft size={16} /> Mutual Funds
          </Link>
        </div>
        
        {portfolio?.data ? (
          <div>
            <h1>{portfolio.data.identity.schemeName}</h1>
            <div className={styles.meta}>
              <span className={styles.exchange}>{portfolio.data.identity.amc}</span>
              <span className={styles.industry}>{portfolio.data.identity.category}</span>
            </div>
          </div>
        ) : (
          <div>
            <h1>Loading Scheme...</h1>
          </div>
        )}
      </header>

      <div className={styles.brokerLayout}>
        <div className={styles.mainContent}>
          {portfolio?.error ? (
            <div className={styles.notice}>{portfolio.error.message}</div>
          ) : !portfolio ? (
            <div className={styles.notice}>Loading portfolio intelligence...</div>
          ) : portfolio.data ? (
            <MFPortfolioUI data={portfolio.data} />
          ) : null}
        </div>
      </div>
    </main>
  )
}
