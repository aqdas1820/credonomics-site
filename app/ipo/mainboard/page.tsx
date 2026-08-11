import SiteFrame from '../../components/SiteFrame'
import { verifiedIpos } from '../../data/verified-ipos.generated'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoExplorer from '../components/IpoExplorer'
import IpoSubnav from '../components/IpoSubnav'

export const metadata = {
  title: 'Mainboard IPOs',
  description: 'Browse mainboard ipos in the CredoNomics source-backed IPO Intelligence database.',
  alternates: { canonical: '/ipo/mainboard' },
}

export default function Page() {
  const records = verifiedIpos
    .filter((ipo) => true)
    .filter((ipo) => ipo.marketSegment === 'mainboard')
    .sort((a, b) => String(a.issue.openDate || a.issue.listingDate || '').localeCompare(String(b.issue.openDate || b.issue.listingDate || '')))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Mainboard IPOs</span></div>
        <span className={styles.pageKicker}>IPO Intelligence / Mainboard IPOs</span>
        <h1>Mainboard IPOs</h1>
        <p className={styles.pageHeroLead}>Source-backed issue terms, dates and quantitative data — with every record separated from unverified discovery signals.</p>
      </section>

      <IpoSubnav active="Mainboard"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoExplorer records={records} emptyTitle="No normalized Mainboard IPO records yet." emptyText="Mainboard records appear here once current offer-document data has been normalized."/>
      </section>
    </SiteFrame>
  )
}
