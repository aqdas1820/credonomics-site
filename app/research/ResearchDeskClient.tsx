'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getRecentViews } from '../../src/services/recent-views';
import type { IndianEquityIdentity } from '../../src/domain/equity/types';
import styles from './research-desk.module.css';

export default function ResearchDeskClient({ reports }: { reports: { title: string, slug: string, issueDate: string }[] }) {
  const [recent, setRecent] = useState<IndianEquityIdentity[]>([]);

  useEffect(() => {
    setRecent(getRecentViews());
  }, []);

  return (
    <div className={styles.deskContainer}>
      <header className={styles.deskHeader}>
        <h1>CredoNomics Research Workspace</h1>
        <p>Your command center for factual financial intelligence.</p>
      </header>

      <section className={styles.deskSection}>
        <h2>Research Search</h2>
        <div className={styles.searchBox}>
          <Link href="/search" className={styles.searchFakeInput}>
            <Search size={18} />
            <span>Search stocks, mutual funds, IPOs, sectors, or reports...</span>
          </Link>
        </div>
      </section>

      {recent.length > 0 && (
        <section className={styles.deskSection}>
          <h2>Recently Viewed</h2>
          <div className={styles.recentGrid}>
            {recent.map(r => (
              <Link key={r.instrumentKey} href={`/stocks/${r.exchange.toLowerCase()}/${r.symbol}`} className={styles.recentCard}>
                <strong>{r.symbol}</strong>
                <small>{r.companyName}</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className={styles.twoColumnGrid}>
        <section className={styles.deskSection}>
          <h2>Market & Company Changes</h2>
          <div className={styles.deskLinkCard}>
            <Link href="/compare">Go to Universal Compare Workspace →</Link>
            <p>Analyze differences between stocks and mutual funds.</p>
          </div>
        </section>

        <section className={styles.deskSection}>
          <h2>Recent Financial Results</h2>
          <div className={styles.deskLinkCard}>
            <p className={styles.comingSoon}>Aggregate Results Timeline</p>
            <p>Track latest quarterly and annual factual updates across your watchlist. (Powered by Historical Intelligence Engine)</p>
          </div>
        </section>

        <section className={styles.deskSection}>
          <h2>Corporate Filings & Events</h2>
          <div className={styles.deskLinkCard}>
            <p className={styles.comingSoon}>Filing Feed</p>
            <p>Dividends, bonuses, splits, and verified exchange announcements.</p>
          </div>
        </section>

        <section className={styles.deskSection}>
          <h2>IPO Events</h2>
          <div className={styles.deskLinkCard}>
            <Link href="/ipo/current">View Current IPOs →</Link>
            <p>Track primary market status and issue structure.</p>
          </div>
        </section>

        <section className={styles.deskSection}>
          <h2>Mutual Fund Portfolio Changes</h2>
          <div className={styles.deskLinkCard}>
            <Link href="/tools/mf-portfolio-tracker">Open MF Intelligence Workspace →</Link>
            <p>Inspect scheme holdings and concentration.</p>
          </div>
        </section>

        <section className={styles.deskSection}>
          <h2>Research Reports</h2>
          <div className={styles.reportList}>
            {reports.slice(0, 3).map(r => (
              <Link key={r.slug} href={`/reports/${r.slug}`} className={styles.reportItem}>
                <strong>{r.title}</strong>
                <small>{r.issueDate}</small>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
