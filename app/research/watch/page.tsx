import SiteFrame from '../../components/SiteFrame'
import ResearchWatchBrief from '../../components/ResearchWatchBrief'
import styles from '../../core-v4.module.css'
export const metadata = { title: 'Research Watch: Verified Changes & Action Dates', description: 'Selected source-checked card, market and mutual-fund notices from CredoNomics Research Watch, with the latest publication on 25 October 2026 with scope and action dates.', alternates: { canonical: '/research/watch' } }
export default function WatchPage() {
  return <SiteFrame><section className={`${styles.wrap} ${styles.pageHero}`}><div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/research">Research</a><span>/</span><span>Research Watch</span></div><span className={styles.pageKicker}>LATEST PUBLICATION · 25 OCTOBER 2026</span><h1>Know what changes. <span>Know what to check next.</span></h1><p className={styles.pageHeroLead}>Selected findings from Research Watch, checked against original issuer, regulator and fund notices. Each guide identifies affected holders, relevant dates, actions and limits.</p></section><ResearchWatchBrief/></SiteFrame>
}
