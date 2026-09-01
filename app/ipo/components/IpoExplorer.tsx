import { ArrowRight, CalendarDays, Database, IndianRupee } from 'lucide-react'
import type { PublicIpoRecord } from '../../data/ipo-types'
import { ipoStatusLabel } from '../../../src/domain/ipo/display-status'
import { formatIpoDate, formatSubscription } from '../lib/format'
import styles from '../ipo.module.css'

function money(value?: number) {
  return value === undefined ? '—' : `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
}

function priceBand(ipo: PublicIpoRecord) {
  const { priceBandLow: low, priceBandHigh: high } = ipo.issue
  if (high === undefined && low === undefined) return '—'
  if (low === undefined || low === high) return `₹${high ?? low}`
  return `₹${low}–₹${high}`
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
  if (!records.length) {
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
        <span>IPO</span><span>Dates</span><span>Issue / price</span><span>Subscription</span><span/>
      </div>

      {records.map((ipo) => (
        <a href={`/ipo/${ipo.slug}`} key={ipo.slug}>
          <div className={styles.explorerIdentity}>
            <div className={styles.explorerBadges}>
              <span data-status={ipo.status}>{ipoStatusLabel(ipo.status)}</span>
            </div>
            <h3>{ipo.companyName}</h3>
            <small>{ipo.marketSegment === 'sme' ? 'SME' : 'Mainboard'} {ipo.symbol ? `· ${ipo.symbol}` : ''}</small>
          </div>

          <div className={styles.explorerDates}>
            <CalendarDays size={14}/>
            <span><small>Open</small><b>{formatIpoDate(ipo.issue.openDate)}</b></span>
            <span><small>Close</small><b>{formatIpoDate(ipo.issue.closeDate)}</b></span>
          </div>

          <div className={styles.explorerMoney}>
            <IndianRupee size={14}/>
            <span><small>Issue size</small><b>{money(ipo.issue.issueSizeCr ?? ipo.estimatedIssueValueCr)}</b></span>
            <span><small>Price band</small><b>{priceBand(ipo)}</b></span>
          </div>

          <div className={styles.explorerScore}>
            <strong>{formatSubscription(ipo.subscription?.total)}</strong>
            <span><small>DEMAND</small><b>{ipo.subscription?.total === undefined ? 'Not available' : 'Reported'}</b></span>
          </div>

          <ArrowRight size={16}/>
        </a>
      ))}
    </div>
  )
}
