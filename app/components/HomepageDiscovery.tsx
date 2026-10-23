import { ArrowUpRight, Search } from 'lucide-react'
import { searchIndex } from '../data/search-index.generated'
import styles from './homepage-discovery.module.css'
import DiscoveryExplorer from './DiscoveryExplorer'

export default function HomepageDiscovery() {
  const preferredCategories = [
    'Reports',
    'Research',
    'IPO',
    'Mutual Funds',
    'Cards',
    'Tools',
  ]

  const entries = searchIndex
    .filter(entry => preferredCategories.includes(entry.category))
    .map(({ id, title, description, href, category, source, updated }) => ({ id, title, description, href, category, source, updated }))

  return (
    <section id="intelligence-discovery" className={styles.section} aria-label="Explore CredoNomics intelligence">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <span>
            <Search size={14} />
            Intelligence Discovery
          </span>
          <h2>One research platform. Search across every intelligence layer.</h2>
          <p>
            Move from a report to an IPO record, mutual-fund portfolio
            intelligence, product economics or a decision tool without losing
            the source context.
          </p>

          <div className={styles.actions}>
            <a className={styles.primary} href="/search">
              Search CredoNomics <ArrowUpRight size={14} />
            </a>
            <a className={styles.secondary} href="/discover">
              Discovery hub
            </a>
          </div>
        </div>

        <DiscoveryExplorer entries={entries} />
      </div>
    </section>
  )
}
