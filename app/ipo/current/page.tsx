import SiteFrame from '../../components/SiteFrame'
import { verifiedIpos } from '../../data/verified-ipos.generated'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoExplorer from '../components/IpoExplorer'
import IpoSubnav from '../components/IpoSubnav'

export const metadata = {
  title: 'Current IPOs',
  description: 'Browse current ipos in the CredoNomics source-backed IPO Intelligence database.',
  alternates: { canonical: '/ipo/current' },
}

export default function Page() {
  const records = verifiedIpos
    .filter((ipo) => ipo.status === 'open')
    .filter((ipo) => true)
    .sort((a, b) => String(a.issue.openDate || a.issue.listingDate || '').localeCompare(String(b.issue.openDate || b.issue.listingDate || '')))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Current IPOs</span></div>
        <span className={styles.pageKicker}>IPO Intelligence / Current IPOs</span>
        <h1>Current IPOs</h1>
        <p className={styles.pageHeroLead}>Source-backed issue terms, dates and quantitative data — with every record separated from unverified discovery signals.</p>
      </section>

      <IpoSubnav active="Open"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoExplorer records={records} emptyTitle="No currently-open normalized IPOs." emptyText="A current IPO appears here only after its open/close dates and issue terms are source-backed in the normalized database."/>
      </section>
    </SiteFrame>
  )
}
