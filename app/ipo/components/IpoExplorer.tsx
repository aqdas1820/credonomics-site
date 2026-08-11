import {
  ArrowRight,
  CalendarDays,
  Database,
  Gauge,
  IndianRupee,
  Radio,
} from 'lucide-react'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import type { PublicIpoRecord } from '../../data/ipo-types'
import styles from '../ipo.module.css'

const statusLabels: Record<PublicIpoRecord['status'], string> = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  open: 'Open',
  closed: 'Closed',
  listed: 'Listed',
  withdrawn: 'Withdrawn',
  unknown: 'Status pending',
}

function money(value?: number) {
  return value === undefined ? '—' : `₹${value.toLocaleString('en-IN')} Cr`
}

function priceBand(ipo: PublicIpoRecord) {
  const { priceBandLow, priceBandHigh } = ipo.issue
  if (priceBandHigh === undefined) return '—'
  if (priceBandLow === undefined || priceBandLow === priceBandHigh) return `₹${priceBandHigh}`
  return `₹${priceBandLow}–₹${priceBandHigh}`
}

export default function IpoExplorer({
  records,
  emptyTitle,
  emptyText,
}: {
  records: PublicIpoRecord[]
  emptyTitle: string
  emptyText: string
}) {
  if (records.length === 0) {
    return (
      <div className={styles.explorerEmpty}>
        <Database size={27}/>
        <div><h2>{emptyTitle}</h2><p>{emptyText}</p></div>
      </div>
    )
  }

  return (
    <div className={styles.explorerTable}>
      <div className={styles.explorerHead}>
        <span>IPO</span><span>Dates</span><span>Issue / price</span><span>Research</span><span/>
      </div>

      {records.map((ipo) => {
        const score = ipo.researchState === 'normalized'
          ? calculateIpoDataScore({
              ...ipo,
              lastVerified: ipo.lastUpdated.slice(0, 10),
            })
          : null

        return (
          <a href={`/ipo/${ipo.slug}`} key={ipo.slug}>
            <div className={styles.explorerIdentity}>
              <div className={styles.explorerBadges}>
                <span data-status={ipo.status}>{statusLabels[ipo.status]}</span>
                <i data-state={ipo.researchState}>
                  {ipo.researchState === 'normalized' ? 'Research normalized' : 'Exchange live'}
                </i>
              </div>
              <h3>{ipo.companyName}</h3>
              <small>{ipo.marketSegment} {ipo.symbol ? `· ${ipo.symbol}` : ''}</small>
            </div>

            <div className={styles.explorerDates}>
              <CalendarDays size={14}/>
              <span><small>Open</small><b>{ipo.issue.openDate || '—'}</b></span>
              <span><small>Close</small><b>{ipo.issue.closeDate || '—'}</b></span>
            </div>

            <div className={styles.explorerMoney}>
              <IndianRupee size={14}/>
              <span>
                <small>{ipo.issue.issueSizeCr !== undefined ? 'Issue size' : 'Est. issue value'}</small>
                <b>{ipo.issue.issueSizeCr !== undefined ? money(ipo.issue.issueSizeCr) : money(ipo.estimatedIssueValueCr)}</b>
              </span>
              <span><small>Price band</small><b>{priceBand(ipo)}</b></span>
            </div>

            <div className={styles.explorerScore}>
              {score?.score !== null && score ? <Gauge size={14}/> : <Radio size={14}/>}
              <strong>{score?.score ?? 'LIVE'}</strong>
              <span>
                <small>{score ? '/100' : 'EXCHANGE'}</small>
                <b>{score ? `${score.coverage}% data coverage` : (ipo.subscription?.total !== undefined ? `${ipo.subscription.total}× subscribed` : 'Score pending')}</b>
              </span>
            </div>

            <ArrowRight size={16}/>
          </a>
        )
      })}
    </div>
  )
}
