import type { Metadata } from 'next'
import {
  ArrowUpRight,
  Database,
  FileSearch,
  Search,
  ShieldCheck,
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { searchIndex } from '../data/search-index.generated'
import { discoveryCategories } from '../lib/search-utils'
import styles from './discover.module.css'

export const metadata: Metadata = {
  title: 'Intelligence Discovery',
  description:
    'Discover CredoNomics research reports, IPO intelligence, mutual-fund portfolio research, card intelligence and financial tools.',
  alternates: {
    canonical: '/discover',
  },
  openGraph: {
    title: 'CredoNomics Intelligence Discovery',
    description:
      'One research-discovery layer across CredoNomics reports, IPOs, mutual funds, cards and tools.',
    url: '/discover',
  },
}

export default function DiscoverPage() {
  const featured = searchIndex
    .filter((entry) =>
      ['Reports', 'Research', 'IPO', 'Mutual Funds', 'Cards', 'Tools'].includes(
        entry.category,
      ),
    )
    .slice(0, 12)

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CredoNomics Intelligence Discovery',
    itemListElement: featured.slice(0, 10).map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.title,
      url: `https://www.credonomics.in${entry.href}`,
    })),
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.credonomics.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Intelligence Discovery',
        item: 'https://www.credonomics.in/discover',
      },
    ],
  }

  return (
    <SiteFrame>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              <Search size={15} />
              CredoNomics Intelligence Discovery
            </span>
            <h1>
              One place to find the <span>research layer.</span>
            </h1>
            <p>
              Move across reports, research frameworks, IPO records,
              mutual-fund intelligence, product economics and decision tools
              without treating them as separate websites.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primary} href="/search">
                Search CredoNomics <ArrowUpRight size={15} />
              </a>
              <a className={styles.secondary} href="/reports">
                Research Reports
              </a>
            </div>
          </div>

          <aside className={styles.discoveryStandard}>
            <ShieldCheck size={21} />
            <div>
              <strong>Discovery standard</strong>
              <span>Source-aware</span>
              <span>Freshness visible where available</span>
              <span>No fabricated live market data</span>
            </div>
          </aside>
        </section>

        <section className={styles.categorySection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>Research map</span>
              <h2>Explore by intelligence layer.</h2>
            </div>
            <p>
              Each category uses the most relevant source context for that type
              of research.
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {discoveryCategories.map((category) => {
              const entries = searchIndex
                .filter((entry) => entry.category === category)
                .slice(0, 3)

              if (!entries.length) return null

              return (
                <article className={styles.categoryCard} key={category}>
                  <div className={styles.categoryTop}>
                    {category === 'Mutual Funds' ? (
                      <Database size={18} />
                    ) : (
                      <FileSearch size={18} />
                    )}
                    <span>{entries.length} featured</span>
                  </div>

                  <h2>{category}</h2>

                  <div className={styles.categoryLinks}>
                    {entries.map((entry) => (
                      <a href={entry.href} key={entry.id}>
                        <span>
                          <strong>{entry.title}</strong>
                          <small>
                            {entry.source}
                            {entry.updated ? ` Â· ${entry.updated}` : ''}
                          </small>
                        </span>
                        <ArrowUpRight size={14} />
                      </a>
                    ))}
                  </div>

                  <a
                    className={styles.viewCategory}
                    href={`/search?q=${encodeURIComponent(category)}`}
                  >
                    Search {category} <ArrowUpRight size={13} />
                  </a>
                </article>
              )
            })}
          </div>
        </section>

        <section className={styles.featuredSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>Featured intelligence</span>
              <h2>Research worth opening next.</h2>
            </div>
          </div>

          <div className={styles.featuredGrid}>
            {featured.slice(0, 6).map((entry) => (
              <a className={styles.featuredCard} href={entry.href} key={entry.id}>
                <span>{entry.category}</span>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
                <div>
                  <small>{entry.source}</small>
                  {entry.updated ? <small>{entry.updated}</small> : null}
                </div>
              </a>
            ))}
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
        />
      </main>
    </SiteFrame>
  )
}