import { describe, expect, it } from 'vitest'
import { discoveryFilterUrl, readDiscoveryFilters } from '../../app/lib/discovery-filters'

describe('shareable discovery filters', () => {
  it('round-trips category and punctuation without losing unrelated parameters or anchors', () => {
    const href = discoveryFilterUrl('https://www.credonomics.in/?campaign=research#intelligence-discovery', 'fees & cashback + ₹', 'Tools', 'discovery_')
    const url = new URL(href, 'https://www.credonomics.in')
    expect(readDiscoveryFilters(url.search, 'discovery_')).toEqual({ query: 'fees & cashback + ₹', category: 'Tools' })
    expect(url.searchParams.get('campaign')).toBe('research')
    expect(url.hash).toBe('#intelligence-discovery')
  })
  it('reset removes only the filters belonging to that workspace', () => {
    expect(discoveryFilterUrl('https://www.credonomics.in/?discovery_q=fees&discovery_category=Tools&campaign=research#section', '', 'All', 'discovery_')).toBe('/?campaign=research#section')
  })
  it('validates external category values and supports full search URLs', () => {
    expect(readDiscoveryFilters('?q=cashback&category=Tools')).toEqual({ query: 'cashback', category: 'Tools' })
    expect(readDiscoveryFilters('?category=Unknown')).toEqual({ query: '', category: 'All' })
    expect(discoveryFilterUrl('https://www.credonomics.in/search?q=old', '', 'Unknown')).toBe('/search')
  })
})
