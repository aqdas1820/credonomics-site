import {
  ArrowRight,
  CalendarDays,
  Database,
  Gauge,
  IndianRupee,
  Landmark,
} from 'lucide-react'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import type { IpoLifecycleStatus, IpoMarketSegment, VerifiedIpoRecord } from '../../data/ipo-types'
import styles from '../ipo.module.css'

const statusLabels: Record<IpoLifecycleStatus, string> = {
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

export default function IpoExplorer({
  records,
  emptyTitle,
  emptyText,
}: {
  records: VerifiedIpoRecord[]
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
        <span>IPO</span><span>Dates</span><span>Issue / price</span><span>Data score</span><span/>
      </div>
      {records.map((ipo) => {
        const score = calculateIpoDataScore(ipo)
        return (
          <a href={`/ipo/${ipo.slug}`} key={ipo.slug}>
            <div className={styles.explorerIdentity}>
              <span data-status={ipo.status}>{statusLabels[ipo.status]}</span>
              <h3>{ipo.companyName}</h3>
              <small>{ipo.marketSegment} · {ipo.sector || ipo.industry || 'Sector pending'}</small>
            </div>
            <div className={styles.explorerDates}>
              <CalendarDays size={14}/>
              <span><small>Open</small><b>{ipo.issue.openDate || '—'}</b></span>
              <span><small>Close</small><b>{ipo.issue.closeDate || '—'}</b></span>
            </div>
            <div className={styles.explorerMoney}>
              <IndianRupee size={14}/>
              <span><small>Issue size</small><b>{money(ipo.issue.issueSizeCr)}</b></span>
              <span><small>Price band</small><b>{ipo.issue.priceBandHigh !== undefined ? `₹${ipo.issue.priceBandLow ?? ipo.issue.priceBandHigh}–₹${ipo.issue.priceBandHigh}` : '—'}</b></span>
            </div>
            <div className={styles.explorerScore}>
              <Gauge size={14}/>
              <strong>{score.score ?? '—'}</strong>
              <span><small>/100</small><b>{score.coverage}% coverage</b></span>
            </div>
            <ArrowRight size={16}/>
          </a>
        )
      })}
    </div>
  )
}
