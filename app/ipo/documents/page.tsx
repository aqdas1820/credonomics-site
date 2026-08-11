import { FileText } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { ipoDiscovery } from '../../data/ipo-discovery.generated'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoDiscovery from '../components/IpoDiscovery'
import IpoSubnav from '../components/IpoSubnav'

export const metadata = {
  title: 'IPO Offer Documents — DRHP, RHP & Prospectus',
  description: 'Search recent SEBI IPO DRHP, RHP, prospectus, addendum and corrigendum discovery records.',
  alternates: { canonical: '/ipo/documents' },
}

export default function IpoDocumentsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Documents</span></div>
        <span className={styles.pageKicker}><FileText size={14}/> Official filing discovery</span>
        <h1>IPO Documents</h1>
        <p className={styles.pageHeroLead}>Search recent DRHP, RHP, prospectus and amendment records detected from SEBI's public-issues filing surface.</p>
      </section>

      <IpoSubnav active="Documents"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoDiscovery records={ipoDiscovery}/>
      </section>
    </SiteFrame>
  )
}
