import { discoveryCategories } from './search-utils'

export const filterCategories = ['All', ...discoveryCategories]

export function readDiscoveryFilters(search: string, prefix = '') {
  const params = new URLSearchParams(search)
  const category = params.get(`${prefix}category`) ?? 'All'
  return {
    query: params.get(`${prefix}q`) ?? '',
    category: filterCategories.includes(category) ? category : 'All',
  }
}

/** Keep unrelated query parameters and the current anchor intact. */
export function discoveryFilterUrl(href: string, query: string, category: string, prefix = '') {
  const url = new URL(href)
  if (query) url.searchParams.set(`${prefix}q`, query)
  else url.searchParams.delete(`${prefix}q`)
  if (category !== 'All' && filterCategories.includes(category)) url.searchParams.set(`${prefix}category`, category)
  else url.searchParams.delete(`${prefix}category`)
  return `${url.pathname}${url.search}${url.hash}`
}
