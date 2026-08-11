import SiteFrame from '../../components/SiteFrame'
import { verifiedIpos } from '../../data/verified-ipos.generated'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoExplorer from '../components/IpoExplorer'
import IpoSubnav from '../components/IpoSubnav'

export const metadata = {
  title: 'SME IPOs',
  description: 'Browse sme ipos in the CredoNomics source-backed IPO Intelligence database.',
  alternates: { canonical: '/ipo/sme' },
}

export default function Page() {
  const records = verifiedIpos
    .filter((ipo) => true)
    .filter((ipo) => ipo.marketSegment === 'sme')
    .sort((a, b) => String(a.issue.openDate || a.issue.listingDate || '').localeCompare(String(b.issue.openDate || b.issue.listingDate || '')))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>SME IPOs</span></div>
        <span className={styles.pageKicker}>IPO Intelligence / SME IPOs</span>
        <h1>SME IPOs</h1>
        <p className={styles.pageHeroLead}>Source-backed issue terms, dates and quantitative data — with every record separated from unverified discovery signals.</p>
      </section>

      <IpoSubnav active="SME"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoExplorer records={records} emptyTitle="No normalized SME IPO records yet." emptyText="SME issues use the same source-first architecture but remain clearly separated from Mainboard issues."/>
      </section>
    </SiteFrame>
  )
}
