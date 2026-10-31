import type { Metadata } from 'next'
import SiteFrame from '../../components/SiteFrame'
import PublicDataClient from './PublicDataClient'
import styles from './public-data.module.css'

export const metadata: Metadata = {
  title: 'Free Indian Finance Data Tools | NAV, IFSC, Forex, Gold & Silver',
  description: 'Look up Indian mutual fund NAVs and bank IFSC codes, convert reference currencies, and view delayed indicative gold and silver spot prices with sources and dates.',
  alternates: { canonical: '/tools/live-data' },
}

export default function LiveDataPage() {
  return (
    <SiteFrame>
      <div className={styles.wrap}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/tools">Tools</a><span>/</span><span>Public data</span></nav>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>CREDONOMICS / SOURCE-LINKED UTILITIES</p>
          <h1>Four useful tools.<br/><span>Actual source data.</span></h1>
          <p>Look up mutual fund NAVs and bank IFSCs, estimate currency conversions and view indicative precious-metal spot rates. Source dates and limitations stay visible with every result.</p>
          <div className={styles.chips}><span>No login needed</span><span>Read-only data</span><span>Provider attribution</span></div>
        </header>
        <PublicDataClient />
        <section className={styles.methodology} aria-labelledby="public-data-notes">
          <h2 id="public-data-notes">How these results should be used</h2>
          <p>Mutual fund NAVs are published for completed valuation dates, not traded intraday. IFSC details should be independently confirmed with the receiving bank before a transfer. Frankfurter provides daily reference exchange rates, not card-network settlement or bank FX offers. Gold and silver are delayed indicative international spot-derived prices, not Indian jewellery quotations; GST, import duties, dealer premiums and making charges are excluded. Results are informational, not a payment confirmation or investment recommendation.</p>
          <p><a href="/methodology">Research methodology</a> · <a href="/corrections">Report an issue</a></p>
        </section>
      </div>
    </SiteFrame>
  )
}
