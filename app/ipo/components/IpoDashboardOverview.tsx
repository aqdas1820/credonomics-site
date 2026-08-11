import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock3,
  Database,
  FileSearch,
  FileText,
  Gauge,
  Landmark,
  ListFilter,
  ShieldCheck,
} from 'lucide-react'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import { ipoDiscovery, ipoDiscoveryMeta } from '../../data/ipo-discovery.generated'
import { verifiedIpos } from '../../data/verified-ipos.generated'
import styles from '../ipo.module.css'

function count(status: string) {
  return verifiedIpos.filter((ipo) => ipo.status === status).length
}

export default function IpoDashboardOverview() {
  const ranked = verifiedIpos
    .map((ipo) => ({ ipo, score: calculateIpoDataScore(ipo) }))
    .filter((item) => item.score.score !== null)
    .sort((a, b) => (b.score.score || 0) - (a.score.score || 0))
    .slice(0, 5)

  const recent = ipoDiscovery.slice(0, 7)

  return (
    <>
      <div className={styles.marketSnapshot}>
        <a href="/ipo/current"><span><BarChart3 size={17}/><small>Open now</small></span><strong>{count('open')}</strong><b>Current IPOs <ArrowRight size={12}/></b></a>
        <a href="/ipo/upcoming"><span><Clock3 size={17}/><small>Upcoming</small></span><strong>{count('upcoming')}</strong><b>Upcoming IPOs <ArrowRight size={12}/></b></a>
        <a href="/ipo/mainboard"><span><Landmark size={17}/><small>Mainboard</small></span><strong>{verifiedIpos.filter((ipo) => ipo.marketSegment === 'mainboard').length}</strong><b>Mainboard database <ArrowRight size={12}/></b></a>
        <a href="/ipo/sme"><span><ListFilter size={17}/><small>SME</small></span><strong>{verifiedIpos.filter((ipo) => ipo.marketSegment === 'sme').length}</strong><b>SME database <ArrowRight size={12}/></b></a>
        <a href="/ipo/documents"><span><FileText size={17}/><small>SEBI filings</small></span><strong>{ipoDiscovery.length}</strong><b>Document discovery <ArrowRight size={12}/></b></a>
      </div>

      <div className={styles.dashboardColumns}>
        <section className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHead}>
            <div><span>Research queue</span><h2>Latest SEBI public-issue filings</h2></div>
            <a href="/ipo/documents">All documents →</a>
          </div>
          <div className={styles.compactFilingList}>
            {recent.map((record) => (
              <a href={record.documentUrl || record.sourceUrl} target="_blank" rel="noreferrer" key={record.id}>
                <FileSearch size={16}/>
                <div><b>{record.companyName}</b><small>{record.documentStage.toUpperCase()} · {record.filingDate || 'Date pending'}</small></div>
                <ArrowRight size={13}/>
              </a>
            ))}
          </div>
          <div className={styles.dashboardFoot}>
            <span>Discovery refreshed {ipoDiscoveryMeta.generatedAt ? new Date(ipoDiscoveryMeta.generatedAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</span>
            <span><ShieldCheck size={12}/> Discovery ≠ verified IPO ranking</span>
          </div>
        </section>

        <section className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHead}>
            <div><span>Quantitative research</span><h2>Highest current Data Scores</h2></div>
            <a href="/ipo/methodology">Methodology →</a>
          </div>
          {ranked.length ? (
            <div className={styles.compactRankList}>
              {ranked.map((item, index) => (
                <a href={`/ipo/${item.ipo.slug}`} key={item.ipo.slug}>
                  <span>#{index + 1}</span>
                  <div><b>{item.ipo.companyName}</b><small>{item.ipo.marketSegment} · {item.score.coverage}% data coverage</small></div>
                  <strong>{item.score.score}<small>/100</small></strong>
                </a>
              ))}
            </div>
          ) : (
            <div className={styles.dashboardEmpty}>
              <Gauge size={23}/>
              <p>No IPO is ranked until enough source-backed offer-document fields have been normalized.</p>
            </div>
          )}
          <a className={styles.dashboardAnalyzer} href="/ipo/analyzer"><Gauge size={15}/> Test an IPO in the quantitative analyzer <ArrowRight size={13}/></a>
        </section>
      </div>

      <div className={styles.researchShortcuts}>
        <a href="/ipo/calendar"><CalendarDays size={18}/><span><b>IPO Calendar</b><small>Open, close, allotment and listing dates</small></span><ArrowRight size={14}/></a>
        <a href="/ipo/subscription"><BarChart3 size={18}/><span><b>Subscription Tracker</b><small>QIB, NII and retail data when source-backed</small></span><ArrowRight size={14}/></a>
        <a href="/ipo/documents"><FileText size={18}/><span><b>Offer Documents</b><small>DRHP, RHP, prospectus and amendments</small></span><ArrowRight size={14}/></a>
        <a href="/ipo/analyzer"><Gauge size={18}/><span><b>IPO Analyzer</b><small>Transparent 100-point statistical framework</small></span><ArrowRight size={14}/></a>
      </div>
    </>
  )
}
