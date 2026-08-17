import type { SearchEntry } from '../data/search-index.generated'

export function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase('en-IN')
    .replace(/[^\p{L}\p{N}\sâ‚¹&.+/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function includesEveryToken(haystack: string, tokens: string[]) {
  return tokens.every((token) => haystack.includes(token))
}

export function scoreSearchEntry(entry: SearchEntry, query: string) {
  const normalizedQuery = normalizeSearch(query)

  if (!normalizedQuery) {
    return entry.priority
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean)
  const title = normalizeSearch(entry.title)
  const category = normalizeSearch(entry.category)
  const keywords = normalizeSearch(entry.keywords)
  const description = normalizeSearch(entry.description)
  const href = normalizeSearch(entry.href)

  let score = 0

  if (title === normalizedQuery) score += 240
  if (title.startsWith(normalizedQuery)) score += 150
  if (title.includes(normalizedQuery)) score += 110
  if (category.includes(normalizedQuery)) score += 55
  if (keywords.includes(normalizedQuery)) score += 70
  if (description.includes(normalizedQuery)) score += 35
  if (href.includes(normalizedQuery)) score += 18

  if (includesEveryToken(title, tokens)) score += 80
  if (includesEveryToken(`${title} ${keywords}`, tokens)) score += 55
  if (tokens.some((token) => title.startsWith(token))) score += 24

  return score + Math.min(entry.priority, 100) / 10
}

export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
  limit = 20,
) {
  const normalizedQuery = normalizeSearch(query)

  return entries
    .map((entry) => ({
      entry,
      score: scoreSearchEntry(entry, normalizedQuery),
    }))
    .filter((item) => !normalizedQuery || item.score > 12)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.entry.priority - a.entry.priority ||
        a.entry.title.localeCompare(b.entry.title),
    )
    .slice(0, limit)
    .map((item) => item.entry)
}

export const discoveryCategories = [
  'Reports',
  'Research',
  'IPO',
  'Mutual Funds',
  'Cards',
  'Tools',
] as const