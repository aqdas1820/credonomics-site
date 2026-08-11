import SiteFrame from '../../components/SiteFrame'
import { publicIpos } from '../../data/ipo-public'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoExplorer from '../components/IpoExplorer'
import IpoSubnav from '../components/IpoSubnav'
import IpoMarketStatus from '../components/IpoMarketStatus'

export const metadata = {
  title: 'Current IPOs',
  description: 'Browse current ipos using the CredoNomics exchange market master and normalized IPO research database.',
  alternates: { canonical: '/ipo/current' },
}

export default function Page() {
  const records = publicIpos
    .filter((ipo) => ipo.status === 'open')
    .sort((a, b) => String(a.issue.openDate || a.issue.listingDate || '').localeCompare(String(b.issue.openDate || b.issue.listingDate || '')))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Current IPOs</span></div>
        <span className={styles.pageKicker}>IPO Intelligence / Current IPOs</span>
        <h1>Current IPOs</h1>
        <p className={styles.pageHeroLead}>Exchange-backed issue status first; deeper financial research is layered in only after offer-document normalization.</p>
      </section>

      <IpoSubnav active="Current"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoExplorer
          records={records}
          emptyTitle="No IPO is open on the current exchange feed."
          emptyText="That can be a genuine market state. The panels below still show upcoming exchange issues, recently closed issues and recent RHP/prospectus filings."
        />
        <IpoMarketStatus/>
      </section>
    </SiteFrame>
  )
}
