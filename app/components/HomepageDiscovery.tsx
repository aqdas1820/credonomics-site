import { ArrowUpRight, Search } from 'lucide-react'
import { searchIndex } from '../data/search-index.generated'
import styles from './homepage-discovery.module.css'

export default function HomepageDiscovery() {
  const preferredCategories = [
    'Reports',
    'Research',
    'IPO',
    'Mutual Funds',
    'Cards',
    'Tools',
  ]

  const entries = preferredCategories
    .map((category) =>
      searchIndex.find((entry) => entry.category === category),
    )
    .filter(Boolean)
    .slice(0, 4)

  return (
    <section className={styles.section} aria-label="Explore CredoNomics intelligence">
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

        <div className={styles.grid}>
          {entries.map((entry) => (
            <a href={entry!.href} className={styles.card} key={entry!.id}>
              <span>{entry!.category}</span>
              <strong>{entry!.title}</strong>
              <small>
                {entry!.source}
                {entry!.updated ? ` Â· ${entry!.updated}` : ''}
              </small>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}