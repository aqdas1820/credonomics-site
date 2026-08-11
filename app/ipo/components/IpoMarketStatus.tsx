import { ArrowRight, Clock3, FileSearch, Radio, ShieldCheck } from 'lucide-react'
import { ipoDiscovery } from '../../data/ipo-discovery.generated'
import { publicIpos, ipoMarketMasterMeta } from '../../data/ipo-public'
import styles from '../ipo.module.css'

export default function IpoMarketStatus() {
  const upcoming = publicIpos.filter((ipo) => ipo.status === 'upcoming').slice(0, 5)
  const recentlyClosed = publicIpos
    .filter((ipo) => ipo.status === 'closed')
    .sort((a, b) => String(b.issue.closeDate || '').localeCompare(String(a.issue.closeDate || '')))
    .slice(0, 5)

  const rhpQueue = ipoDiscovery
    .filter((record) => record.documentStage === 'rhp' || record.documentStage === 'prospectus')
    .slice(0, 5)

  return (
    <section className={styles.marketStatus}>
      <div className={styles.marketStatusHead}>
        <div>
          <span><Radio size={13}/> Official market-feed status</span>
          <h2>No blank page: show what the IPO pipeline knows now.</h2>
          <p>
            Current IPOs come from exchange issue-status data. Offer-document filings remain a separate
            pipeline until dates and terms are confirmed.
          </p>
        </div>
        <div>
          <small>Last market refresh</small>
          <b>{ipoMarketMasterMeta.generatedAt ? new Date(ipoMarketMasterMeta.generatedAt).toLocaleString('en-IN') : 'Not refreshed yet'}</b>
          <span>{ipoMarketMasterMeta.sourceStatus}</span>
        </div>
      </div>

      <div className={styles.marketStatusGrid}>
        <article>
          <div><Clock3 size={17}/><span>Upcoming on exchange feed</span></div>
          {upcoming.length ? upcoming.map((ipo) => (
            <a href={`/ipo/${ipo.slug}`} key={ipo.slug}>
              <b>{ipo.companyName}</b>
              <small>{ipo.issue.openDate || 'Date pending'} · {ipo.marketSegment}</small>
              <ArrowRight size={12}/>
            </a>
          )) : <p>No future-dated exchange issue is currently in the market master.</p>}
        </article>

        <article>
          <div><ShieldCheck size={17}/><span>Recently closed exchange issues</span></div>
          {recentlyClosed.length ? recentlyClosed.map((ipo) => (
            <a href={`/ipo/${ipo.slug}`} key={ipo.slug}>
              <b>{ipo.companyName}</b>
              <small>Closed {ipo.issue.closeDate || 'recently'} · {ipo.marketSegment}</small>
              <ArrowRight size={12}/>
            </a>
          )) : <p>No recently closed exchange issue is retained yet.</p>}
        </article>

        <article>
          <div><FileSearch size={17}/><span>RHP / prospectus research queue</span></div>
          {rhpQueue.length ? rhpQueue.map((record) => (
            <a href={record.documentUrl || record.sourceUrl} target="_blank" rel="noreferrer" key={record.id}>
              <b>{record.companyName}</b>
              <small>{record.documentStage.toUpperCase()} · {record.filingDate || 'Date pending'}</small>
              <ArrowRight size={12}/>
            </a>
          )) : <p>No recent RHP/prospectus discovery record is available.</p>}
        </article>
      </div>
    </section>
  )
}
