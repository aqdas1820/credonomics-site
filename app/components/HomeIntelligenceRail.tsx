'use client'

import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  Database,
  Landmark,
  Layers3,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from './home-intelligence.module.css'

type IntelligencePayload = {
  generatedAt: string
  ipo: {
    total: number
    market: number
    open: number
    upcoming: number
    filed: number
    mainboard: number
    sme: number
    healthySourceCount: number
  }
  mutualFunds: {
    available: boolean
    count: number
    label: string
  }
  report: {
    title: string
    href: string
    fileName: string
    period: string
  } | null
  links: {
    ipo: string
    mutualFunds: string
    reports: string
    research: string
  }
}

function formatUpdatedAt(value: string) {
  if (!value) {
    return 'Data refresh active'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Data refresh active'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function numberOrDash(value: number) {
  return Number.isFinite(value)
    ? value.toLocaleString('en-IN')
    : '--'
}

export default function HomeIntelligenceRail() {
  const [data, setData] =
    useState<IntelligencePayload | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true

    fetch('/api/home-intelligence', {
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Home intelligence ${response.status}`,
          )
        }

        return response.json()
      })
      .then((payload: IntelligencePayload) => {
        if (active) {
          setData(payload)
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const reportTitle =
    data?.report?.title ??
    'CredoNomics Research Library'

  const reportMeta =
    data?.report?.period ||
    'Independent financial research'

  return (
    <section
      className={styles.section}
      aria-labelledby="live-intelligence-title"
    >
      <div className={styles.shell}>
        <div className={styles.headingRow}>
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.liveDot} />
              Live intelligence
            </span>

            <h2 id="live-intelligence-title">
              What changed across CredoNomics.
            </h2>

            <p>
              A single view of primary markets, regulatory
              filings, mutual-fund intelligence and newly
              published research.
            </p>
          </div>

          <div className={styles.freshness}>
            <Clock3 size={15} />
            <span>
              {data
                ? formatUpdatedAt(data.generatedAt)
                : failed
                  ? 'Data status temporarily unavailable'
                  : 'Loading latest intelligence...'}
            </span>
          </div>
        </div>

        <div className={styles.reportBanner}>
          <div className={styles.reportIcon}>
            <BookOpen size={19} />
          </div>

          <div className={styles.reportCopy}>
            <span>
              {data?.report
                ? 'New research published'
                : 'Research desk'}
            </span>

            <strong>{reportTitle}</strong>

            <small>{reportMeta}</small>
          </div>

          <a
            href={
              data?.report?.href ??
              data?.links.reports ??
              '/reports'
            }
            className={styles.reportAction}
          >
            Open research
            <ArrowUpRight size={15} />
          </a>
        </div>

        <div className={styles.grid}>
          <a
            href={data?.links.ipo ?? '/ipo'}
            className={styles.card}
          >
            <div className={styles.cardTop}>
              <span className={styles.iconBox}>
                <Landmark size={18} />
              </span>

              <span className={styles.cardKicker}>
                Primary market
              </span>

              <ArrowUpRight
                className={styles.arrow}
                size={16}
              />
            </div>

            <strong className={styles.cardValue}>
              {data
                ? numberOrDash(data.ipo.open)
                : '--'}
              <span> open</span>
            </strong>

            <p>
              {data
                ? `${numberOrDash(
                    data.ipo.upcoming,
                  )} upcoming issue${
                    data.ipo.upcoming === 1
                      ? ''
                      : 's'
                  }`
                : 'Live IPO discovery loading'}
            </p>

            <div className={styles.miniStats}>
              <span>
                {data
                  ? numberOrDash(
                      data.ipo.mainboard,
                    )
                  : '--'}{' '}
                Mainboard
              </span>

              <span>
                {data
                  ? numberOrDash(data.ipo.sme)
                  : '--'}{' '}
                SME
              </span>
            </div>
          </a>

          <a
            href={data?.links.ipo ?? '/ipo'}
            className={styles.card}
          >
            <div className={styles.cardTop}>
              <span className={styles.iconBox}>
                <Layers3 size={18} />
              </span>

              <span className={styles.cardKicker}>
                Filing pipeline
              </span>

              <ArrowUpRight
                className={styles.arrow}
                size={16}
              />
            </div>

            <strong className={styles.cardValue}>
              {data
                ? numberOrDash(data.ipo.filed)
                : '--'}
              <span> filed</span>
            </strong>

            <p>
              DRHP, RHP and research-stage records
              separated from market-stage IPOs.
            </p>

            <div className={styles.miniStats}>
              <span>
                {data
                  ? numberOrDash(
                      data.ipo.market,
                    )
                  : '--'}{' '}
                market-stage
              </span>

              <span>
                {data
                  ? numberOrDash(
                      data.ipo.healthySourceCount,
                    )
                  : '--'}{' '}
                source signals
              </span>
            </div>
          </a>

          <a
            href={
              data?.links.mutualFunds ??
              '/mutual-funds'
            }
            className={styles.card}
          >
            <div className={styles.cardTop}>
              <span className={styles.iconBox}>
                <Database size={18} />
              </span>

              <span className={styles.cardKicker}>
                Mutual funds
              </span>

              <ArrowUpRight
                className={styles.arrow}
                size={16}
              />
            </div>

            <strong className={styles.cardValue}>
              {data?.mutualFunds.count
                ? numberOrDash(
                    data.mutualFunds.count,
                  )
                : data?.mutualFunds.available
                  ? 'Live'
                  : '--'}
            </strong>

            <p>
              {data?.mutualFunds.label ??
                'Portfolio intelligence loading'}
            </p>

            <div className={styles.miniStats}>
              <span>Portfolio analytics</span>
              <span>Holding changes</span>
            </div>
          </a>

          <a
            href={
              data?.links.research ??
              '/research'
            }
            className={`${styles.card} ${styles.researchCard}`}
          >
            <div className={styles.cardTop}>
              <span className={styles.iconBox}>
                <Sparkles size={18} />
              </span>

              <span className={styles.cardKicker}>
                Research desk
              </span>

              <ArrowUpRight
                className={styles.arrow}
                size={16}
              />
            </div>

            <strong
              className={styles.researchTitle}
            >
              {reportTitle}
            </strong>

            <p>
              {data?.report
                ? `${reportMeta} - latest publication`
                : 'Frameworks, reports and source-aware research'}
            </p>

            <div className={styles.miniStats}>
              <span>Valuation</span>
              <span>Catalysts</span>
              <span>Risk</span>
            </div>
          </a>
        </div>

        <div className={styles.sourceLine}>
          <span>
            <span className={styles.liveDot} />
            Automated intelligence layer
          </span>

          <span>
            NSE / SEBI / BSE and CredoNomics normalized
            datasets
          </span>

          <a href="/methodology">
            Methodology
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </section>
  )
}