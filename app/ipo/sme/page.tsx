import SiteFrame from '../../components/SiteFrame'
import { publicIpos } from '../../data/ipo-public'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoExplorer from '../components/IpoExplorer'
import IpoSubnav from '../components/IpoSubnav'

export const metadata = {
  title: 'SME IPOs',
  description: 'Browse sme ipos using the CredoNomics exchange market master and normalized IPO research database.',
  alternates: { canonical: '/ipo/sme' },
}

export default function Page() {
  const records = publicIpos
    .filter((ipo) => ipo.marketSegment === 'sme')
    .sort((a, b) => String(a.issue.openDate || a.issue.listingDate || '').localeCompare(String(b.issue.openDate || b.issue.listingDate || '')))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>SME IPOs</span></div>
        <span className={styles.pageKicker}>IPO Intelligence / SME IPOs</span>
        <h1>SME IPOs</h1>
        <p className={styles.pageHeroLead}>Exchange-backed issue status first; deeper financial research is layered in only after offer-document normalization.</p>
      </section>

      <IpoSubnav active="SME"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <IpoExplorer
          records={records}
          emptyTitle="No SME exchange record is available yet."
          emptyText="The exchange market master refreshes automatically and keeps SME records separate from Mainboard issues."
        />
      </section>
    </SiteFrame>
  )
}
