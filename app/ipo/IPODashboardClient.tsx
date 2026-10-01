'use client'
import DataFreshness from '../components/DataFreshness'
import type { FinancialDataMetadata } from '../../src/domain/financial-data'

import { ArrowRight, ChevronDown, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { PublicIpoRecord } from '../data/ipo-types'
import { getIpoDisplayStatus, ipoStatusLabel } from '../../src/domain/ipo/display-status'
import { fetchJson } from '../../src/lib/client-json'
import { formatIpoDate, formatShortIpoDate, formatSubscription } from './lib/format'
import styles from './ipo-dashboard.module.css'
import { deduplicatePublicIpos } from '../data/ipo-dedup'

type View = 'open' | 'announced' | 'closed' | 'listed'
type Segment = 'all' | 'mainboard' | 'sme'

type ApiIpo = {
  id: string
  isin?: string | null
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
  providerUpdatedAt: string | null
  normalizedAt: string
}

const views: { value: View; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'announced', label: 'Upcoming' },
  { value: 'closed', label: 'Closed / Allotment' },
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
  return record.status === view
}

export default function IPODashboardClient({ records, initialView = 'open' }: { records: PublicIpoRecord[]; initialView?: View }) {
  const [view, setView] = useState<View>(initialView)
  const [segment, setSegment] = useState<Segment>('all')
  const [query, setQuery] = useState('')
  const [liveMetadata, setLiveMetadata] = useState<FinancialDataMetadata | null>(null)
  const [liveRecords, setLiveRecords] = useState<PublicIpoRecord[]>([])
  const [refreshError, setRefreshError] = useState('')
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const refresh = async () => {
      setNow(new Date())
      try {
        const payload = await fetchJson<{ data?: ApiIpo[] | null; metadata?: FinancialDataMetadata }>('/api/ipos', { cache: 'no-store', signal: controller.signal })
        if (!active || !payload.data) return
        setRefreshError('')
        setLiveMetadata(payload.metadata ?? null)
        const staticByName = new Map(records.map((record) => [normalizeName(record.companyName), record]))
        setLiveRecords(payload.data.filter((item) => item.company).map((item) => {
          const existing = staticByName.get(normalizeName(item.company!))
          return {
            exchangeId: item.id,
            isin: item.isin ?? undefined,
            slug: existing?.slug ?? `live:${item.id}`,
            companyName: item.company!,
            symbol: item.symbol ?? undefined,
            marketSegment: item.issueType.toLowerCase() === 'sme' ? 'sme' : item.issueType.toLowerCase() === 'mainboard' ? 'mainboard' : 'unknown',
            status: item.status,
            issue: {
              ...existing?.issue,
              issueSizeCr: (existing?.researchState === 'normalized' ? existing?.issue?.issueSizeCr : undefined) ?? item.issueSizeCrore ?? existing?.issue?.issueSizeCr ?? undefined,
              priceBandLow: (existing?.researchState === 'normalized' ? existing?.issue?.priceBandLow : undefined) ?? item.priceMin ?? existing?.issue?.priceBandLow ?? undefined,
              priceBandHigh: (existing?.researchState === 'normalized' ? existing?.issue?.priceBandHigh : undefined) ?? item.priceMax ?? existing?.issue?.priceBandHigh ?? undefined,
              lotSize: (existing?.researchState === 'normalized' ? existing?.issue?.lotSize : undefined) ?? item.lotSize ?? existing?.issue?.lotSize ?? undefined,
              openDate: item.openDate ?? existing?.issue?.openDate ?? undefined,
              closeDate: item.closeDate ?? existing?.issue?.closeDate ?? undefined,
              listingDate: item.listingDate ?? existing?.issue?.listingDate ?? undefined,
            },
            financials: existing?.financials ?? [],
            subscription: existing?.subscription,
            sources: existing?.sources ?? [],
            lastUpdated: item.providerUpdatedAt ?? existing?.lastUpdated ?? '',
            providerUpdatedAt: item.providerUpdatedAt ?? '',
            normalizedAt: item.normalizedAt,
            provider: 'upstox',
            researchState: existing?.researchState ?? 'exchange-live',
            estimatedIssueValueCr: existing?.estimatedIssueValueCr,
            sharesOffered: existing?.sharesOffered,
            sharesBid: existing?.sharesBid,
          }
        }))
      } catch {
        if (active) setRefreshError('Live IPO updates are unavailable. Showing the last published records; check the source dates.')
      }
    }
    void refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => { active = false; controller.abort(); window.clearInterval(timer) }
  }, [records])

  const displayRecords = useMemo(() => {
    const merged = liveRecords.length ? deduplicatePublicIpos([...liveRecords, ...records], false) : records
    return now ? merged.map(record => ({ ...record, status: getIpoDisplayStatus({ ...record.issue, providerStatus: record.status }, now) })) : merged
  }, [liveRecords, records, now])

  const stats = useMemo(() => ({
    open: displayRecords.filter((record) => record.status === 'open').length,
    announced: displayRecords.filter((record) => record.status === 'announced').length,
    closed: displayRecords.filter((record) => record.status === 'closed').length,
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
        return view === 'announced' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
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
        <article><span>Upcoming</span><strong>{stats.announced}</strong></article>
        <article><span>Closed / Allotment</span><strong>{stats.closed}</strong></article>
        <article><span>Listed</span><strong>{stats.recentlyListed}</strong></article>
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
                  <small>{record.issue.issueSizeCr !== undefined ? 'Issue size' : 'Est. issue value'}</small>
                  <strong>{crore(issueSize)}</strong>
                  {(record.issue.freshIssueCr !== undefined || record.issue.ofsCr !== undefined) ? (
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginTop: '2px' }}>
                      {record.issue.freshIssueCr !== undefined ? `Fresh: ${crore(record.issue.freshIssueCr)}` : ''}
                      {record.issue.freshIssueCr !== undefined && record.issue.ofsCr !== undefined ? ' · ' : ''}
                      {record.issue.ofsCr !== undefined ? `OFS: ${crore(record.issue.ofsCr)}` : ''}
                    </span>
                  ) : null}
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
          {refreshError && <span role="status">{refreshError}</span>}
          <span>Market data</span>
          {liveMetadata ? <DataFreshness metadata={liveMetadata} /> : <span>Published data ? see source dates</span>}
        </footer>
      </section>
    </main>
  )
}
