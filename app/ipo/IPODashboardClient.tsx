'use client'

import { ArrowRight, ChevronDown, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { PublicIpoRecord } from '../data/ipo-types'
import { ipoStatusLabel } from '../../src/domain/ipo/display-status'
import { formatIpoDate, formatShortIpoDate, formatSubscription } from './lib/format'
import styles from './ipo-dashboard.module.css'

type View = 'open' | 'upcoming' | 'closed' | 'listed'
type Segment = 'all' | 'mainboard' | 'sme'

type ApiIpo = {
  id: string
  symbol: string | null
  company: string | null
  issueType: string
  issueSizeCrore: number | null
  priceMin: number | null
  priceMax: number | null
  lotSize: number | null
  openDate: string | null
  closeDate: string | null
  listingDate: string | null
  status: PublicIpoRecord['status']
  providerUpdatedAt: string
  normalizedAt: string
}

const views: { value: View; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'closed', label: 'Recently Closed' },
  { value: 'listed', label: 'Listed' },
]

function normalizeName(value: string) {
  return value.toLowerCase().replace(/\b(ipo|limited|ltd)\b/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function priceBand(record: PublicIpoRecord) {
  const { priceBandLow: low, priceBandHigh: high } = record.issue
  if (high === undefined && low === undefined) return '—'
  if (low === undefined || low === high) return `₹${(high ?? low)?.toLocaleString('en-IN')}`
  return `₹${low.toLocaleString('en-IN')} – ₹${high?.toLocaleString('en-IN')}`
}

function crore(value?: number) {
  return value === undefined ? '—' : `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
}

function inView(record: PublicIpoRecord, view: View) {
  if (view === 'open') return record.status === 'open' || record.status === 'closing_today'
  return record.status === view
}

export default function IPODashboardClient({ records, initialView = 'open' }: { records: PublicIpoRecord[]; initialView?: View }) {
  const [view, setView] = useState<View>(initialView)
  const [segment, setSegment] = useState<Segment>('all')
  const [query, setQuery] = useState('')
  const [liveRecords, setLiveRecords] = useState<PublicIpoRecord[]>([])

  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const response = await fetch('/api/ipos', { cache: 'no-store' })
        const payload = await response.json() as { data?: ApiIpo[] | null }
        if (!active || !payload.data) return
        const staticByName = new Map(records.map((record) => [normalizeName(record.companyName), record]))
        setLiveRecords(payload.data.filter((item) => item.company).map((item) => {
          const existing = staticByName.get(normalizeName(item.company!))
          return {
            slug: existing?.slug ?? `live:${item.id}`,
            companyName: item.company!,
            symbol: item.symbol ?? undefined,
            marketSegment: item.issueType.toLowerCase() === 'sme' ? 'sme' : 'mainboard',
            status: item.status,
            issue: {
              issueSizeCr: item.issueSizeCrore ?? undefined,
              priceBandLow: item.priceMin ?? undefined,
              priceBandHigh: item.priceMax ?? undefined,
              lotSize: item.lotSize ?? undefined,
              openDate: item.openDate ?? undefined,
              closeDate: item.closeDate ?? undefined,
              listingDate: item.listingDate ?? undefined,
            },
            financials: existing?.financials ?? [],
            subscription: existing?.subscription,
            sources: existing?.sources ?? [],
            lastUpdated: item.providerUpdatedAt,
            providerUpdatedAt: item.providerUpdatedAt,
            normalizedAt: item.normalizedAt,
            provider: 'upstox',
            researchState: existing?.researchState ?? 'exchange-live',
          }
        }))
      } catch {
        // Generated exchange records remain the resilient public fallback.
      }
    }
    void refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [records])

  const displayRecords = useMemo(() => {
    if (!liveRecords.length) return records
    const liveNames = new Set(liveRecords.map((record) => normalizeName(record.companyName)))
    return [...liveRecords, ...records.filter((record) => !liveNames.has(normalizeName(record.companyName)))]
  }, [liveRecords, records])

  const stats = useMemo(() => ({
    open: displayRecords.filter((record) => record.status === 'open').length,
    upcoming: displayRecords.filter((record) => record.status === 'upcoming').length,
    closingToday: displayRecords.filter((record) => record.status === 'closing_today').length,
    recentlyListed: displayRecords.filter((record) => record.status === 'listed').length,
  }), [displayRecords])

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return displayRecords
      .filter((record) => inView(record, view))
      .filter((record) => segment === 'all' || record.marketSegment === segment)
      .filter((record) => !normalizedQuery ||
        `${record.companyName} ${record.symbol ?? ''} ${record.marketSegment}`
          .toLowerCase()
          .includes(normalizedQuery))
      .sort((a, b) => {
        const aDate = a.issue.closeDate || a.issue.openDate || a.issue.listingDate || ''
        const bDate = b.issue.closeDate || b.issue.openDate || b.issue.listingDate || ''
        return view === 'upcoming' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
      })
  }, [displayRecords, query, segment, view])

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span>Primary market intelligence</span>
        <h1>IPO Intelligence</h1>
        <p>Current issue dates, terms and demand in one focused market view.</p>
      </section>

      <section className={styles.stats} aria-label="IPO market summary">
        <article><span>Open</span><strong>{stats.open}</strong></article>
        <article><span>Upcoming</span><strong>{stats.upcoming}</strong></article>
        <article><span>Closing today</span><strong>{stats.closingToday}</strong></article>
        <article><span>Recently listed</span><strong>{stats.recentlyListed}</strong></article>
      </section>

      <section className={styles.workspace}>
        <div className={styles.controls}>
          <label className={styles.search}>
            <Search size={17}/>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search IPO..."
              aria-label="Search IPO"
            />
          </label>

          <nav className={styles.primaryTabs} aria-label="IPO status">
            {views.map((item) => (
              <button
                type="button"
                key={item.value}
                data-active={view === item.value}
                onClick={() => setView(item.value)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className={styles.secondaryRow}>
            <div className={styles.segmented} aria-label="IPO segment">
              {(['mainboard', 'sme', 'all'] as Segment[]).map((value) => (
                <button
                  type="button"
                  key={value}
                  data-active={segment === value}
                  onClick={() => setSegment(value)}
                >
                  {value === 'all' ? 'All' : value === 'sme' ? 'SME' : 'Mainboard'}
                </button>
              ))}
            </div>

            <details className={styles.more}>
              <summary>More / Research Tools <ChevronDown size={14}/></summary>
              <div>
                <a href="/ipo/calendar">Calendar</a>
                <a href="/ipo/subscription">Subscription</a>
                <a href="/ipo/documents">Documents</a>
                <a href="/ipo/analyzer">Analyzer</a>
                <a href="/ipo/documents">Filed / RHP pipeline</a>
              </div>
            </details>
          </div>
        </div>

        <div className={styles.resultMeta}>
          <strong>{results.length} {results.length === 1 ? 'issue' : 'issues'}</strong>
          <span>Dates and status validated in Asia/Kolkata</span>
        </div>

        <div className={styles.tableHead} aria-hidden="true">
          <span>Company</span><span>Dates</span><span>Price / lot</span><span>Issue size</span><span>Demand</span><span/>
        </div>

        <div className={styles.cards}>
          {results.map((record) => {
            const subscription = formatSubscription(record.subscription?.total)
            const issueSize = record.issue.issueSizeCr ?? record.estimatedIssueValueCr
            return (
              <article className={styles.card} key={record.slug}>
                <div className={styles.identity}>
                  <div>
                    <span className={styles.board}>{record.marketSegment === 'sme' ? 'SME' : 'MAINBOARD'}</span>
                    <span className={styles.status} data-status={record.status}>{ipoStatusLabel(record.status)}</span>
                  </div>
                  <h2>{record.companyName}</h2>
                  {record.symbol ? <small>{record.symbol}</small> : null}
                </div>

                <div className={styles.dates}>
                  <small>Open — close</small>
                  <strong>{formatShortIpoDate(record.issue.openDate)} → {formatShortIpoDate(record.issue.closeDate)}</strong>
                  <span>{formatIpoDate(record.issue.closeDate)}</span>
                </div>

                <div className={styles.terms}>
                  <small>Price band</small>
                  <strong>{priceBand(record)}</strong>
                  <span>Lot: {record.issue.lotSize?.toLocaleString('en-IN') ?? '—'}</span>
                </div>

                <div className={styles.issueSize}>
                  <small>Issue size</small>
                  <strong>{crore(issueSize)}</strong>
                </div>

                <div className={styles.demand}>
                  <small>Subscription</small>
                  <strong>{subscription}</strong>
                </div>

                {record.slug.startsWith('live:') ? (
                  <span className={styles.liveOnly}>Exchange data</span>
                ) : (
                  <a className={styles.openLink} href={`/ipo/${record.slug}`}>
                    View IPO <ArrowRight size={14}/>
                  </a>
                )}
              </article>
            )
          })}
        </div>

        {!results.length ? (
          <div className={styles.empty}>
            <strong>No IPOs in this view.</strong>
            <span>Try another status, segment or search term.</span>
          </div>
        ) : null}

        <footer className={styles.freshness}>
          <span>Market data</span>
          <span>Last updated {displayRecords[0]?.providerUpdatedAt ? new Date(displayRecords[0].providerUpdatedAt).toLocaleString('en-IN') : '—'}</span>
        </footer>
      </section>
    </main>
  )
}
