import { CalendarDays, Database } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { getPublicIpos } from '../../data/ipo-public'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoSubnav from '../components/IpoSubnav'

export const metadata = {
  title: 'IPO Calendar India',
  description: 'IPO opening, closing, allotment and listing calendar from normalized CredoNomics IPO records.',
  alternates: { canonical: '/ipo/calendar' },
}
export const dynamic = 'force-dynamic'

export default function IpoCalendarPage() {
  const records = getPublicIpos()
    .filter((ipo) => ipo.issue.openDate || ipo.issue.closeDate || ipo.issue.allotmentDate || ipo.issue.listingDate)
    .sort((a, b) => String(a.issue.openDate || a.issue.listingDate || '').localeCompare(String(b.issue.openDate || b.issue.listingDate || '')))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Calendar</span></div>
        <span className={styles.pageKicker}><CalendarDays size={14}/> IPO timetable</span>
        <h1>IPO Calendar</h1>
        <p className={styles.pageHeroLead}>Opening, closing, allotment and listing dates from source-backed normalized IPO records.</p>
      </section>

      <IpoSubnav active="Calendar"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        {records.length ? (
          <div className={local.calendarTable}>
            <div><span>IPO</span><span>Open</span><span>Close</span><span>Allotment</span><span>Listing</span></div>
            {records.map((ipo) => (
              <a href={`/ipo/${ipo.slug}`} key={ipo.slug}>
                <span><b>{ipo.companyName}</b><small>{ipo.marketSegment}</small></span>
                <b>{ipo.issue.openDate || '—'}</b>
                <b>{ipo.issue.closeDate || '—'}</b>
                <b>{ipo.issue.allotmentDate || '—'}</b>
                <b>{ipo.issue.listingDate || '—'}</b>
              </a>
            ))}
          </div>
        ) : (
          <div className={local.explorerEmpty}><Database size={27}/><div><h2>No normalized calendar entries yet.</h2><p>Calendar rows appear only when current issue dates are verified from source documents.</p></div></div>
        )}
      </section>
    </SiteFrame>
  )
}
