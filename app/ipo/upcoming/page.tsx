import SiteFrame from '../../components/SiteFrame'
import { publicIpos } from '../../data/ipo-public'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoExplorer from '../components/IpoExplorer'
import IpoSubnav from '../components/IpoSubnav'
import IpoMarketStatus from '../components/IpoMarketStatus'

export const metadata = {
  title: 'Upcoming IPOs',
  description: 'Browse upcoming ipos using the CredoNomics exchange market master and normalized IPO research database.',
  alternates: { canonical: '/ipo/upcoming' },
}

export default function Page() {
  const records = publicIpos
    .filter((ipo) => ipo.status === 'upcoming')
    .sort((a, b) => String(a.issue.openDate || a.issue.listingDate || '').localeCompare(String(b.issue.openDate || b.issue.listingDate || '')))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Upcoming IPOs</span></div>
        <span className={styles.pageKicker}>IPO Intelligence / Upcoming IPOs</span>
        <h1>Upcoming IPOs</h1>
        <p className={styles.pageHeroLead}>Exchange-backed issue status first; deeper financial research is layered in only after offer-document normalization.</p>
      </section>

      <IpoSubnav active="Upcoming"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoExplorer
          records={records}
          emptyTitle="No future-dated exchange IPO is normalized yet."
          emptyText="Recent RHP/SEBI filing discoveries remain visible below while exchange dates are awaited."
        />
        <IpoMarketStatus/>
      </section>
    </SiteFrame>
  )
}
