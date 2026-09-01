import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BarChart3, Database, Search } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from './markets.module.css'
import MarketOverview from './MarketOverview'

export const metadata: Metadata = {
  title: 'Indian Markets & Stock Search',
  description: 'Search the verified CredoNomics Indian equity security master and open source-aware stock market pages.',
  alternates: { canonical: '/markets' },
}

const popular = [
  ['RELIANCE', 'Reliance Industries', '/stocks/nse/RELIANCE'],
  ['TCS', 'Tata Consultancy Services', '/stocks/nse/TCS'],
  ['HDFCBANK', 'HDFC Bank', '/stocks/nse/HDFCBANK'],
]

export default function MarketsPage() {
  return (
    <SiteFrame>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}><BarChart3 size={15} /> Markets</span>
            <h1>Indian markets, with the data context intact.</h1>
            <p>Find a listed security by company name, symbol, ISIN or BSE code. Prices and charts appear only when the connected market-data provider returns verified data.</p>
          </div>
          <form action="/stocks/search" className={styles.search}>
            <Search size={20} aria-hidden="true" />
            <label className={styles.srOnly} htmlFor="market-search">Search stocks</label>
            <input id="market-search" name="q" placeholder="Search company, symbol, ISIN or BSE code" />
            <button type="submit">Search</button>
          </form>
        </section>

        <MarketOverview />

        <section className={styles.grid} aria-label="Market data availability">
          <article><Database size={19} /><span>Security master</span><strong>Verified instruments</strong><p>Identity records power search and canonical stock routes.</p></article>
          <article><BarChart3 size={19} /><span>Quotes & history</span><strong>Provider-backed only</strong><p>Unavailable values remain unavailable—never estimated.</p></article>
        </section>

        <section className={styles.watch}>
          <div className={styles.sectionHead}><div><span>Explore stocks</span><h2>Popular security routes</h2></div><Link href="/search">Search all <ArrowRight size={15} /></Link></div>
          <div className={styles.rows}>{popular.map(([symbol,name,href]) => <Link href={href} key={symbol}><div><strong>{name}</strong><span>{symbol} · NSE</span></div><ArrowRight size={17} /></Link>)}</div>
        </section>
      </main>
    </SiteFrame>
  )
}
