'use client'

import { useEffect, useState } from 'react'
import { discoveryFilterUrl, readDiscoveryFilters } from '../lib/discovery-filters'

/** Native history avoids a server navigation or scroll jump on each keystroke. */
export function useDiscoveryFilters(prefix = '', initialQuery = '') {
  const [filters, setFilters] = useState({ query: initialQuery, category: 'All' })
  useEffect(() => {
    const restore = () => setFilters(readDiscoveryFilters(window.location.search, prefix))
    restore()
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [prefix, initialQuery])

  const updateFilters = (query: string, category: string) => {
    setFilters({ query, category })
    const href = discoveryFilterUrl(window.location.href, query, category, prefix)
    window.history.replaceState(window.history.state, '', href)
  }
  return { ...filters, updateFilters }
}
