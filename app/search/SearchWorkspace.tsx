'use client'

import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { searchIndex } from '../data/search-index.generated'
import {
  discoveryCategories,
  searchEntries,
} from '../lib/search-utils'
import styles from './search.module.css'

export default function SearchWorkspace({
  initialQuery,
}: {
  initialQuery: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('All')

  const results = useMemo(() => {
    const ranked = searchEntries(searchIndex, query, 60)

    return category === 'All'
      ? ranked
      : ranked.filter((entry) => entry.category === category)
  }, [category, query])

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <Search size={15} />
          Intelligence Search
        </span>

        <h1>
          Find the research behind the <span>decision.</span>
        </h1>

        <p>
          Search across CredoNomics reports, research, IPO intelligence,
          mutual-fund portfolio analysis, cards and financial tools.
        </p>

        <label className={styles.searchBox}>
          <Search size={20} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Company, IPO, mutual fund, report, card or tool..."
          />
        </label>
      </section>

      <section className={styles.workspace}>
        <div className={styles.filterRow}>
          <span>
            <SlidersHorizontal size={14} />
            Filter
          </span>

          {['All', ...discoveryCategories].map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? styles.activeFilter : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={styles.resultSummary}>
          <strong>{results.length}</strong>
          <span>
            {query.trim()
              ? `results for “${query.trim()}”`
              : 'CredoNomics intelligence entries'}
          </span>
        </div>

        <div className={styles.results}>
          {results.map((entry) => (
            <a className={styles.resultCard} href={entry.href} key={entry.id}>
              <div className={styles.cardTop}>
                <span>{entry.category}</span>
                <ArrowUpRight size={16} />
              </div>

              <h2>{entry.title}</h2>
              <p>{entry.description}</p>

              <div className={styles.provenance}>
                <span>{entry.source}</span>
                {entry.updated ? <span>Updated {entry.updated}</span> : null}
              </div>
            </a>
          ))}

          {!results.length ? (
            <div className={styles.empty}>
              <Search size={24} />
              <h2>No matching intelligence found.</h2>
              <p>
                Try a shorter company name, IPO, mutual fund, report or tool.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'CredoNomics',
            url: 'https://www.credonomics.in',
            potentialAction: {
              '@type': 'SearchAction',
              target:
                'https://www.credonomics.in/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </main>
  )
}
