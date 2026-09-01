import { ipoMarketMaster, ipoMarketMasterMeta } from './ipo-market-master.generated'
import type {
  IpoMarketRecord,
  PublicIpoRecord,
  VerifiedIpoRecord,
} from './ipo-types'
import { verifiedIpos } from './verified-ipos.generated'
import { getIpoDisplayStatus } from '../../src/domain/ipo/display-status'

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\blimited\b/g, 'ltd')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function marketToPublic(record: IpoMarketRecord, normalizedAt: string): PublicIpoRecord {
  return {
    slug: record.slug,
    companyName: record.companyName,
    symbol: record.symbol,
    marketSegment: record.marketSegment,
    status: getIpoDisplayStatus({ ...record.issue, providerStatus: record.status }),
    issue: record.issue,
    financials: [],
    subscription: record.subscription,
    sources: [
      {
        label: `${record.marketSource} public-issue market record`,
        url: record.issueInfoUrl || record.sourceUrl,
        checkedAt: record.fetchedAt.slice(0, 10),
        sourceType: record.marketSource.includes('NSE') ? 'NSE' : 'BSE',
      },
    ],
    lastUpdated: record.fetchedAt,
    providerUpdatedAt: record.fetchedAt,
    normalizedAt,
    provider: record.marketSource.toLowerCase(),
    researchState: 'exchange-live',
    sharesOffered: record.sharesOffered,
    sharesBid: record.sharesBid,
    estimatedIssueValueCr: record.estimatedIssueValueCr,
  }
}

function verifiedToPublic(record: VerifiedIpoRecord, normalizedAt: string): PublicIpoRecord {
  return {
    ...record,
    status: getIpoDisplayStatus({ ...record.issue, providerStatus: record.status }),
    lastUpdated: record.lastVerified,
    providerUpdatedAt: record.lastVerified,
    normalizedAt,
    provider: 'official-filing',
    researchState: 'normalized',
  }
}

function mergeMarketIntoVerified(
  verified: PublicIpoRecord,
  market?: IpoMarketRecord,
): PublicIpoRecord {
  if (!market) return verified

  return {
    ...verified,
    symbol: market.symbol || verified.symbol,
    marketSegment:
      verified.marketSegment === 'unknown' ? market.marketSegment : verified.marketSegment,
    status: getIpoDisplayStatus({
      ...market.issue,
      ...verified.issue,
      openDate: market.issue.openDate || verified.issue.openDate,
      closeDate: market.issue.closeDate || verified.issue.closeDate,
      listingDate: verified.issue.listingDate,
      providerStatus: market.status === 'unknown' ? verified.status : market.status,
    }),
    issue: {
      ...market.issue,
      ...verified.issue,
      openDate: market.issue.openDate || verified.issue.openDate,
      closeDate: market.issue.closeDate || verified.issue.closeDate,
      priceBandLow: market.issue.priceBandLow ?? verified.issue.priceBandLow,
      priceBandHigh: market.issue.priceBandHigh ?? verified.issue.priceBandHigh,
      lotSize: market.issue.lotSize ?? verified.issue.lotSize,
      faceValue: market.issue.faceValue ?? verified.issue.faceValue,
    },
    subscription: market.subscription || verified.subscription,
    sources: [
      ...verified.sources,
      {
        label: `${market.marketSource} public-issue market record`,
        url: market.issueInfoUrl || market.sourceUrl,
        checkedAt: market.fetchedAt.slice(0, 10),
        sourceType: market.marketSource.includes('NSE') ? 'NSE' : 'BSE',
      },
    ],
    lastUpdated: market.fetchedAt > verified.lastUpdated ? market.fetchedAt : verified.lastUpdated,
    providerUpdatedAt: market.fetchedAt,
    sharesOffered: market.sharesOffered,
    sharesBid: market.sharesBid,
    estimatedIssueValueCr: market.estimatedIssueValueCr,
  }
}

const marketByName = new Map(
  ipoMarketMaster.map((record) => [normalizeName(record.companyName), record]),
)

const verifiedNames = new Set(
  verifiedIpos.map((record) => normalizeName(record.companyName)),
)

export function getPublicIpos(now = new Date()): PublicIpoRecord[] {
  const normalizedAt = now.toISOString()
  return [
  ...verifiedIpos.map((record) =>
    mergeMarketIntoVerified(
      verifiedToPublic(record, normalizedAt),
      marketByName.get(normalizeName(record.companyName)),
    ),
  ),
  ...ipoMarketMaster
    .filter((record) => !verifiedNames.has(normalizeName(record.companyName)))
    .map((record) => marketToPublic(record, normalizedAt)),
].sort((a, b) => {
  const statusOrder = { closing_today: 0, open: 1, upcoming: 2, closed: 3, listed: 4, draft: 5, unknown: 6, withdrawn: 7 }
  const aStatus = statusOrder[a.status] ?? 9
  const bStatus = statusOrder[b.status] ?? 9
  return aStatus - bStatus ||
    String(a.issue.openDate || '').localeCompare(String(b.issue.openDate || '')) ||
    a.companyName.localeCompare(b.companyName)
})
}

export const publicIpos: PublicIpoRecord[] = getPublicIpos()

export function getPublicIpo(slug: string) {
  return getPublicIpos().find((ipo) => ipo.slug === slug)
}

export function publicIposByStatus(status: PublicIpoRecord['status']) {
  return getPublicIpos().filter((ipo) => ipo.status === status)
}

export function publicIposBySegment(segment: PublicIpoRecord['marketSegment']) {
  return getPublicIpos().filter((ipo) => ipo.marketSegment === segment)
}

export { ipoMarketMasterMeta }
