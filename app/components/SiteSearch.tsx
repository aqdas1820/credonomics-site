'use client'

import {
  ArrowUpRight,
  Clock3,
  Command,
  FileSearch,
  Search,
  X,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { searchIndex, type SearchEntry } from '../data/search-index.generated'
import { searchEntries } from '../lib/search-utils'
import styles from './site-search.module.css'

const RECENT_KEY = 'credonomics:recent-intelligence'
const MAX_RECENT = 5

function loadRecent() {
  if (typeof window === 'undefined') return [] as SearchEntry[]

  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((id) => searchIndex.find((entry) => entry.id === id))
      .filter(Boolean)
      .slice(0, MAX_RECENT) as SearchEntry[]
  } catch {
    return []
  }
}

function remember(entry: SearchEntry) {
  try {
    const current = loadRecent()
      .filter((item) => item.id !== entry.id)
      .map((item) => item.id)

    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([entry.id, ...current].slice(0, MAX_RECENT)),
    )
  } catch {
    // Search still works if storage is unavailable.
  }
}

export default function SiteSearch() {
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<SearchEntry[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(
    () => searchEntries(searchIndex, query, 9),
    [query],
  )

  const visibleEntries = query.trim() ? results : recent.length ? recent : results

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [])

  const navigate = useCallback(
    (entry: SearchEntry) => {
      remember(entry)
      setRecent(loadRecent())
      close()
      router.push(entry.href)
    },
    [close, router],
  )

  useEffect(() => {
    setRecent(loadRecent())
  }, [])

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
        return
      }

      if (!open) return

      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((value) =>
          Math.min(value + 1, Math.max(visibleEntries.length - 1, 0)),
        )
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((value) => Math.max(value - 1, 0))
      }

      if (event.key === 'Enter') {
        const entry = visibleEntries[activeIndex]
        if (entry) {
          event.preventDefault()
          navigate(entry)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, close, navigate, open, visibleEntries])

  useEffect(() => {
    if (!open) return

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'

    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)

    return () => {
      window.clearTimeout(timer)
      root.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  return (
    <>
      <button
        type="button"
        className={styles.searchTrigger}
        aria-label="Search CredoNomics"
        onClick={() => setOpen(true)}
      >
        <Search size={15} />
        <span className={styles.triggerLabel}>Search</span>
        <kbd>
          <Command size={11} />
          K
        </kbd>
      </button>

      {open ? (
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <section
            className={styles.palette}
            role="dialog"
            aria-modal="true"
            aria-label="CredoNomics Intelligence Search"
          >
            <div className={styles.searchTop}>
              <Search size={19} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reports, IPOs, mutual funds, cards, tools..."
                aria-label="Search CredoNomics intelligence"
              />
              <button type="button" aria-label="Close search" onClick={close}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.paletteMeta}>
              <span>
                {query.trim()
                  ? `${visibleEntries.length} best matches`
                  : recent.length
                    ? 'Recently viewed'
                    : 'Explore CredoNomics'}
              </span>
              <span className={styles.desktopHint}>
                â†‘ â†“ navigate Â· Enter open Â· Esc close
              </span>
            </div>

            <div className={styles.results}>
              {visibleEntries.length ? (
                visibleEntries.map((entry, index) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`${styles.result} ${
                      index === activeIndex ? styles.resultActive : ''
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => navigate(entry)}
                  >
                    <span className={styles.resultIcon}>
                      {recent.some((item) => item.id === entry.id) && !query ? (
                        <Clock3 size={16} />
                      ) : (
                        <FileSearch size={16} />
                      )}
                    </span>

                    <span className={styles.resultCopy}>
                      <span className={styles.resultHead}>
                        <strong>{entry.title}</strong>
                        <small>{entry.category}</small>
                      </span>
                      <span className={styles.resultDescription}>
                        {entry.description}
                      </span>
                      <span className={styles.resultProvenance}>
                        {entry.source}
                        {entry.updated ? ` Â· ${entry.updated}` : ''}
                      </span>
                    </span>

                    <ArrowUpRight size={16} className={styles.resultArrow} />
                  </button>
                ))
              ) : (
                <div className={styles.empty}>
                  <Search size={22} />
                  <strong>No matching CredoNomics research found.</strong>
                  <span>Try a company, IPO, mutual fund, report or tool name.</span>
                </div>
              )}
            </div>

            <footer className={styles.paletteFooter}>
              <a href="/search">
                Advanced search <ArrowUpRight size={13} />
              </a>
              <a href="/discover">
                Discovery hub <ArrowUpRight size={13} />
              </a>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  )
}