'use client'

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronRight,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  ipoDashboardRecords,
  ipoNavigation,
  type IPODashboardRecord,
} from '../data/ipo-dashboard.generated'
import styles from './ipo-dashboard.module.css'

const filters = [
  ['All', 'All'],
  ['Open', 'Open'],
  ['Upcoming', 'Upcoming'],
  ['Recent', 'Recent'],
  ['Mainboard', 'Mainboard'],
  ['SME', 'SME'],
] as const

function recentRecord(record: IPODashboardRecord) {
  return record.status === 'Closed' || record.status === 'Listed'
}

function displayValue(value: string, fallback = 'â€”') {
  return value?.trim() || fallback
}

function statusClass(status: string) {
  if (status === 'Open') return styles.statusOpen
  if (status === 'Upcoming') return styles.statusUpcoming
  if (status === 'Listed') return styles.statusListed
  return styles.statusNeutral
}

export default function IPODashboardClient() {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')

  const stats = useMemo(() => {
    const open = ipoDashboardRecords.filter((item) => item.status === 'Open')
      .length
    const upcoming = ipoDashboardRecords.filter(
      (item) => item.status === 'Upcoming',
    ).length
    const mainboard = ipoDashboardRecords.filter(
      (item) => item.board === 'Mainboard',
    ).length
    const sme = ipoDashboardRecords.filter((item) => item.board === 'SME')
      .length

    return { open, upcoming, mainboard, sme }
  }, [])

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return ipoDashboardRecords.filter((record) => {
      const queryMatch =
        !normalizedQuery ||
        `${record.company} ${record.board} ${record.status} ${record.exchange}`
          .toLowerCase()
          .includes(normalizedQuery)

      let filterMatch = true

      if (filter === 'Open') filterMatch = record.status === 'Open'
      if (filter === 'Upcoming') filterMatch = record.status === 'Upcoming'
      if (filter === 'Recent') filterMatch = recentRecord(record)
      if (filter === 'Mainboard') filterMatch = record.board === 'Mainboard'
      if (filter === 'SME') filterMatch = record.board === 'SME'

      return queryMatch && filterMatch
    })
  }, [filter, query])

  const nextEvents = useMemo(
    () =>
      ipoDashboardRecords
        .filter(
          (record) =>
            record.status === 'Open' || record.status === 'Upcoming',
        )
        .slice(0, 5),
    [],
  )

  return (
    <>
      <section className={styles.utilityBar} aria-label="IPO intelligence tools">
        <div className={styles.utilityInner}>
          <span className={styles.utilityIdentity}>
            <span className={styles.liveDot} />
            IPO Intelligence
          </span>

          <nav className={styles.utilityNav}>
            {ipoNavigation.map((item) => (
              <a href={item.href} key={item.key}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <TrendingUp size={15} />
              Primary Market Intelligence
            </span>

            <h1>
              IPO research built around the <span>actual issue.</span>
            </h1>

            <p>
              Track current and upcoming IPOs, Mainboard and SME issues,
              important dates, price bands and the research workflow around
              each public issue. Data shown here comes from CredoNomics&apos;
              existing IPO records; unavailable fields stay visibly
              unavailable rather than being estimated.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primary} href="/ipo/current">
                Current IPOs <ArrowUpRight size={15} />
              </a>
              <a className={styles.secondary} href="/ipo/calendar">
                IPO Calendar
              </a>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.panelTop}>
              <span>IPO Market Board</span>
              <small>CredoNomics dataset</small>
            </div>

            <div className={styles.statGrid}>
              <div>
                <span>Open now</span>
                <strong>{stats.open}</strong>
              </div>
              <div>
                <span>Upcoming</span>
                <strong>{stats.upcoming}</strong>
              </div>
              <div>
                <span>Mainboard</span>
                <strong>{stats.mainboard}</strong>
              </div>
              <div>
                <span>SME</span>
                <strong>{stats.sme}</strong>
              </div>
            </div>

            <div className={styles.panelNote}>
              <Sparkles size={15} />
              <p>
                GMP and subscription figures appear only when present in the
                existing CredoNomics source record. They are never fabricated.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.marketSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>IPO dashboard</span>
              <h2>Current, upcoming and recently completed issues.</h2>
            </div>

            <p>
              Use the filters like a primary-market terminal, then open an
              issue for its detailed CredoNomics research record.
            </p>
          </div>

          <div className={styles.controlBar}>
            <label className={styles.searchBox}>
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company, board or exchange..."
                aria-label="Search IPOs"
              />
            </label>

            <div className={styles.filters} aria-label="IPO filters">
              {filters.map(([label, value]) => (
                <button
                  key={value}
                  type="button"
                  className={filter === value ? styles.filterActive : ''}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.resultMeta}>
            <span>
              <strong>{results.length}</strong> issues
            </span>
            <span>
              Fields marked â€” are not available in the normalized public record.
            </span>
          </div>

          <div className={styles.desktopTableWrap}>
            <table className={styles.ipoTable}>
              <thead>
                <tr>
                  <th>Company / board</th>
                  <th>Status</th>
                  <th>Open</th>
                  <th>Close</th>
                  <th>Price band</th>
                  <th>Lot</th>
                  <th>Issue size</th>
                  <th>Listing</th>
                  <th aria-label="Open details" />
                </tr>
              </thead>

              <tbody>
                {results.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <a className={styles.companyCell} href={record.href}>
                        <strong>{record.company}</strong>
                        <span>
                          {record.board}
                          {record.exchange ? ` Â· ${record.exchange}` : ''}
                        </span>
                      </a>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${statusClass(
                          record.status,
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{displayValue(record.openDate)}</td>
                    <td>{displayValue(record.closeDate)}</td>
                    <td>{displayValue(record.priceBand)}</td>
                    <td>{displayValue(record.lotSize)}</td>
                    <td>{displayValue(record.issueSize)}</td>
                    <td>{displayValue(record.listingDate)}</td>
                    <td>
                      <a
                        className={styles.rowArrow}
                        href={record.href}
                        aria-label={`Open ${record.company} IPO`}
                      >
                        <ChevronRight size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileCards}>
            {results.map((record) => (
              <article className={styles.mobileCard} key={record.id}>
                <div className={styles.mobileCardHead}>
                  <div>
                    <span>{record.board}</span>
                    <h3>{record.company}</h3>
                  </div>

                  <span
                    className={`${styles.status} ${statusClass(record.status)}`}
                  >
                    {record.status}
                  </span>
                </div>

                <dl>
                  <div>
                    <dt>Open</dt>
                    <dd>{displayValue(record.openDate)}</dd>
                  </div>
                  <div>
                    <dt>Close</dt>
                    <dd>{displayValue(record.closeDate)}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{displayValue(record.priceBand)}</dd>
                  </div>
                  <div>
                    <dt>Lot</dt>
                    <dd>{displayValue(record.lotSize)}</dd>
                  </div>
                </dl>

                <a href={record.href}>
                  Open IPO details <ArrowUpRight size={14} />
                </a>
              </article>
            ))}
          </div>

          {!results.length ? (
            <div className={styles.empty}>
              <Search size={22} />
              <strong>No IPO matches this filter.</strong>
              <span>Try All, Mainboard, SME or a shorter company name.</span>
            </div>
          ) : null}
        </section>

        <section className={styles.lowerGrid}>
          <div className={styles.timelinePanel}>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>IPO timeline</span>
                <h2>Important dates ahead.</h2>
              </div>
              <CalendarDays size={20} />
            </div>

            <div className={styles.timeline}>
              {nextEvents.length ? (
                nextEvents.map((record) => (
                  <a href={record.href} key={record.id}>
                    <span className={styles.timelineDate}>
                      {record.openDate || record.closeDate || 'Date pending'}
                    </span>
                    <span>
                      <strong>{record.company}</strong>
                      <small>
                        {record.status} Â· {record.board}
                      </small>
                    </span>
                    <ChevronRight size={15} />
                  </a>
                ))
              ) : (
                <p className={styles.timelineEmpty}>
                  No normalized open/upcoming dates are currently available.
                </p>
              )}
            </div>
          </div>

          <div className={styles.researchPanel}>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>Research utilities</span>
                <h2>Go deeper than the IPO list.</h2>
              </div>
              <Building2 size={20} />
            </div>

            <div className={styles.researchLinks}>
              {ipoNavigation.slice(0, 8).map((item) => (
                <a href={item.href} key={item.key}>
                  <span>{item.label}</span>
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.disclosure}>
          <strong>CredoNomics IPO data standard</strong>
          <p>
            IPO dates, price bands, subscription figures, allotment information
            and listing schedules can change. CredoNomics presents research
            information from its available records and does not convert missing
            values into estimates. Verify current public-issue information with
            the issuer, exchange and applicable regulatory filings before
            acting on it. This page does not constitute an IPO recommendation.
          </p>
        </section>
      </main>
    </>
  )
}