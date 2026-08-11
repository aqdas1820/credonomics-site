import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { ipoDiscovery } from '../data/ipo-discovery.generated'
import { verifiedIpos } from '../data/verified-ipos.generated'
import styles from '../core-v4.module.css'
import local from './ipo.module.css'
import IpoDashboardOverview from './components/IpoDashboardOverview'
import IpoDiscovery from './components/IpoDiscovery'
import IpoSubnav from './components/IpoSubnav'

export const metadata = {
  title: 'IPO Intelligence India',
  description:
    'IPO dashboard for India with SEBI filing discovery, current and upcoming IPO research, Mainboard and SME filters, calendar, subscription data and transparent quantitative analysis.',
  alternates: { canonical: '/ipo' },
}

export default function IpoPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.dashboardHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>IPO Intelligence</span></div>
        <span className={styles.pageKicker}><TrendingUp size={14}/> CredoNomics IPO Command Center</span>
        <h1>Every important IPO research surface, <span>without the clutter.</span></h1>
        <p className={styles.pageHeroLead}>
          Current and upcoming issues, Mainboard and SME research, calendars, subscription data,
          offer documents, financials, valuation and a transparent quantitative Data Score.
        </p>
        <div className={local.heroActions}>
          <a className={styles.primaryButton} href="/ipo/current">Current IPOs <ArrowRight size={15}/></a>
          <a className={styles.secondaryButton} href="/ipo/analyzer">Analyze an IPO</a>
          <a className={styles.secondaryButton} href="/ipo/documents">SEBI documents</a>
        </div>
      </section>

      <IpoSubnav active="Dashboard"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoDashboardOverview/>

        <section className={local.commandSection}>
          <div className={local.sectionHead}>
            <div><span>Complete filing feed</span><h2>Search the latest SEBI public-issue documents.</h2></div>
            <p>
              This layer is intentionally broader than the ranked database. A new filing can appear
              immediately while financial normalization and verification happen separately.
            </p>
          </div>
          <IpoDiscovery records={ipoDiscovery}/>
        </section>

        <section className={local.sourcePanel}>
          <div>
            <small>Primary official sources</small>
            <h2>CredoNomics links back to the official market record.</h2>
          </div>
          <div>
            <a href="https://www.sebi.gov.in/filings/public-issues.html" target="_blank" rel="noreferrer">SEBI Public Issues <ExternalLink size={12}/></a>
            <a href="https://www.nseindia.com/market-data/all-upcoming-issues-ipo" target="_blank" rel="noreferrer">NSE Public Issues <ExternalLink size={12}/></a>
            <a href="https://www.nseindia.com/ipo-tracker?type=ipo_year" target="_blank" rel="noreferrer">NSE IPO Tracker <ExternalLink size={12}/></a>
          </div>
        </section>

        <div className={local.regulatoryNotice}>
          <ShieldCheck size={20}/>
          <p>
            <b>Research boundary:</b> {verifiedIpos.length} normalized IPO record(s) currently meet the public data schema.
            CredoNomics does not convert its statistical Data Score into Subscribe/Avoid/Buy calls, price targets or
            listing-gain predictions.
          </p>
        </div>
      </section>
    </SiteFrame>
  )
}
