import SiteFrame from '../../components/SiteFrame'
import ResearchWatchBrief from '../../components/ResearchWatchBrief'
import { researchWatch } from '../../data/research-watch'
import styles from '../../core-v4.module.css'
const latestPublication = researchWatch
  .map(item => item.publishedAt ?? item.checkedAt)
  .sort()
  .at(-1)!
const publicationLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(latestPublication))

export const metadata = { title: 'Research Watch: Verified Changes & Action Dates', description: 'Source-checked card, deposit, market and mutual-fund updates from CredoNomics Research Watch, with affected holders and action dates.', alternates: { canonical: '/research/watch' } }
export default function WatchPage() {
  return <SiteFrame><section className={`${styles.wrap} ${styles.pageHero}`}><div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/research">Research</a><span>/</span><span>Research Watch</span></div><span className={styles.pageKicker}>LATEST PUBLICATION · {publicationLabel.toUpperCase()}</span><h1>Know what changes. <span>Know what to check next.</span></h1><p className={styles.pageHeroLead}>Selected findings from Research Watch, checked against original issuer, regulator and fund notices. Each guide identifies affected holders, relevant dates, actions and limits.</p></section><ResearchWatchBrief/></SiteFrame>
}
