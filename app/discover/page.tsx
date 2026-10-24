import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'
import SiteDirectory from '../components/SiteDirectory'
import { siteSections } from '../data/site-navigation'
import styles from '../core-v4.module.css'

export const metadata: Metadata = {
  title: 'Explore CredoNomics — Platform Directory',
  description: 'Find every CredoNomics workspace: markets, research, IPOs, mutual funds, credit cards, calculators, watchlists and platform information.',
  alternates: { canonical: '/discover' },
}

export default function DiscoverPage() {
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'CredoNomics Platform Directory', url: 'https://www.credonomics.in/discover', mainEntity: { '@type': 'ItemList', itemListElement: siteSections.filter(section => section.id !== 'workspace').map((section, index) => ({ '@type': 'ListItem', position: index + 1, name: section.label, url: `https://www.credonomics.in${section.href}` })) } }
  return <SiteFrame>
    <section className={`${styles.wrap} ${styles.pageHero}`}>
      <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Explore</span></div>
      <span className={styles.pageKicker}>THE CREDONOMICS PLATFORM</span>
      <h1>A clear route to <span>every research workspace.</span></h1>
      <p className={styles.pageHeroLead}>Browse the platform by purpose. Start with a section overview, open a working tool or return to your personal workspace.</p>
      <div style={{marginTop:20}}><a className={styles.primaryButton} href="/search">Search reports, companies & research →</a></div>
    </section>
    <div className={`${styles.wrap} ${styles.pageBody}`}><SiteDirectory/></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
  </SiteFrame>
}
