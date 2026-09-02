import type { PublicIpoRecord } from './ipo-types'

function normalized(value?: string | null) {
  return (value ?? '').toLowerCase().replace(/\b(ipo|limited|ltd)\b/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function identityKeys(record: PublicIpoRecord) {
  const segment = record.marketSegment || 'unknown'
  const keys: string[] = []
  if (record.exchangeId) keys.push(`exchange:${normalized(record.exchangeId)}`)
  const isin = record.isin || record.listing?.isin
  if (isin) keys.push(`isin:${isin.toUpperCase()}`)
  if (record.symbol) keys.push(`symbol:${normalized(record.symbol)}:${segment}`)
  if (record.companyName && record.issue.openDate && record.issue.closeDate) keys.push(`issue:${normalized(record.companyName)}:${record.issue.openDate.slice(0, 10)}:${record.issue.closeDate.slice(0, 10)}`)
  return keys
}

function completeness(record: PublicIpoRecord) {
  return [record.exchangeId, record.isin, record.symbol, record.issue.openDate, record.issue.closeDate, record.issue.listingDate, record.issue.issueSizeCr, record.issue.priceBandLow, record.issue.priceBandHigh, record.issue.lotSize, record.subscription?.total, record.sharesOffered, record.sharesBid, record.estimatedIssueValueCr].filter((value) => value !== undefined && value !== null && value !== '').length
}

function authority(record: PublicIpoRecord) {
  const officialSources = record.sources.filter((source) => ['NSE', 'BSE', 'SEBI', 'Issuer', 'Registrar'].includes(source.sourceType)).length
  return (record.exchangeId ? 100 : 0) + ((record.isin || record.listing?.isin) ? 50 : 0) + officialSources * 10 + (record.researchState === 'normalized' ? 5 : 0)
}

function mergeDefined<T extends object>(preferred: T | undefined, fallback: T | undefined): T | undefined {
  if (!preferred) return fallback
  if (!fallback) return preferred
  const result = { ...fallback, ...preferred } as Record<string, unknown>
  for (const [key, value] of Object.entries(preferred)) if (value === undefined || value === null) result[key] = (fallback as Record<string, unknown>)[key]
  return result as T
}

function conflicts(left: PublicIpoRecord, right: PublicIpoRecord) {
  const pairs: Array<[string, unknown, unknown]> = [['companyName', left.companyName, right.companyName], ['issueSizeCr', left.issue.issueSizeCr ?? left.estimatedIssueValueCr, right.issue.issueSizeCr ?? right.estimatedIssueValueCr], ['priceBandLow', left.issue.priceBandLow, right.issue.priceBandLow], ['priceBandHigh', left.issue.priceBandHigh, right.issue.priceBandHigh], ['openDate', left.issue.openDate, right.issue.openDate], ['closeDate', left.issue.closeDate, right.issue.closeDate], ['subscriptionTotal', left.subscription?.total, right.subscription?.total]]
  return pairs.filter(([, a, b]) => a !== undefined && a !== null && b !== undefined && b !== null && a !== b).map(([field, a, b]) => ({ field, values: [a, b] }))
}

function mergeRecords(left: PublicIpoRecord, right: PublicIpoRecord): PublicIpoRecord {
  const preferred = authority(right) > authority(left) || (authority(right) === authority(left) && completeness(right) > completeness(left)) ? right : left
  const fallback = preferred === left ? right : left
  const sourceKeys = new Set<string>()
  const sources = [...preferred.sources, ...fallback.sources].filter((source) => { const key = `${source.sourceType}:${source.url}`; if (sourceKeys.has(key)) return false; sourceKeys.add(key); return true })
  return { ...fallback, ...preferred, slug: preferred.slug.startsWith('live:') && !fallback.slug.startsWith('live:') ? fallback.slug : preferred.slug, symbol: preferred.symbol || fallback.symbol, exchangeId: preferred.exchangeId || fallback.exchangeId, isin: preferred.isin || fallback.isin, issue: mergeDefined(preferred.issue, fallback.issue)!, subscription: mergeDefined(preferred.subscription, fallback.subscription), listing: mergeDefined(preferred.listing, fallback.listing), sources, financials: preferred.financials.length ? preferred.financials : fallback.financials, lastUpdated: preferred.lastUpdated > fallback.lastUpdated ? preferred.lastUpdated : fallback.lastUpdated, providerUpdatedAt: preferred.providerUpdatedAt > fallback.providerUpdatedAt ? preferred.providerUpdatedAt : fallback.providerUpdatedAt, normalizedAt: preferred.normalizedAt > fallback.normalizedAt ? preferred.normalizedAt : fallback.normalizedAt }
}

export function deduplicatePublicIpos(records: PublicIpoRecord[], logConflicts = typeof window === 'undefined'): PublicIpoRecord[] {
  const result: PublicIpoRecord[] = []
  const aliases = new Map<string, number>()
  for (const record of records) {
    const keys = identityKeys(record)
    const match = keys.map((key) => aliases.get(key)).find((index) => index !== undefined)
    if (match === undefined) { const index = result.push(record) - 1; keys.forEach((key) => aliases.set(key, index)); continue }
    const found = result[match]!
    const foundConflicts = conflicts(found, record)
    if (logConflicts && foundConflicts.length) console.warn('IPO record conflict', { identity: keys, conflicts: foundConflicts })
    const merged = mergeRecords(found, record)
    result[match] = merged
    for (const key of [...identityKeys(found), ...keys, ...identityKeys(merged)]) aliases.set(key, match)
  }
  return result
}
