'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useMFData } from '../useMFData'
import MFPortfolioUI from './MFPortfolioUI'
import styles from '../../stocks/[exchange]/[symbol]/stock-detail.module.css'
import ResearchSnapshot from '../../components/ResearchSnapshot'
import { ChangeIntelligenceService } from '../../../src/services/research/ChangeIntelligenceService'

export default function MFSchemeClient({ schemeId }: { schemeId: string }) {
  const { portfolio } = useMFData(schemeId)
  
  const changes = React.useMemo(() => {
    if (!portfolio?.data) return [];
    return ChangeIntelligenceService.generateMutualFundChanges(schemeId, portfolio.data);
  }, [schemeId, portfolio?.data]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/mutual-funds" className={styles.backLink}>
            <ArrowLeft size={16} /> Mutual Funds
          </Link>
        </div>
        
        {portfolio?.data ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h1>{portfolio.data.identity.schemeName}</h1>
              <div className={styles.meta}>
                <span className={styles.exchange}>{portfolio.data.identity.amc}</span>
                <span className={styles.industry}>{portfolio.data.identity.category}</span>
              </div>
            </div>
            <Link href={`/compare`} className={styles.compareBtn}>Compare</Link>
          </div>
        ) : (
          <div>
            <h1>{portfolio ? "Scheme data unavailable" : "Loading scheme..."}</h1>
          </div>
        )}
      </header>

      <nav className={styles.navigator} aria-label="Fund detail sections">
        <a href="#overview">Overview</a>
        <a href="#portfolio">Portfolio</a>
        <a href="#what-changed">What Changed</a>
        <a href="#overlap">Overlap</a>
        <a href="#security-timeline">Security Timeline</a>
        <a href={`/compare?a=${encodeURIComponent(schemeId)}`}>Compare</a>
      </nav>

      {portfolio?.data && (
        <ResearchSnapshot type="mutual_fund" portfolio={portfolio.data} changes={changes} />
      )}

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
