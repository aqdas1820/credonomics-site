import { withProvenance, aggregateProvenance } from '../../src/domain/provenance'
import { availabilityFromDate } from '../../src/domain/freshness'
import { providerDate } from '../../src/providers/market/upstox-transform'
import { getIpoDisplayStatus } from '../../src/domain/ipo/display-status'
import { upstoxGet, UpstoxApiError, getUpstoxProvenance } from '../../src/lib/upstox/client'

export type RawIpo = {
  id?: string
  symbol?: string
  name?: string
  status?: string
  isin?: string
  issue_type?: string
  issue_size?: number
  industry?: string
  minimum_price?: number
  maximum_price?: number
  minimum_lot?: number
  bidding_start_date?: string
  bidding_end_date?: string
  bidding_end_time?: string
  listing_date?: string
  updated_at?: string
}

export async function fetchLiveIpos() {
  const normalizedAt = new Date().toISOString()
  try {
    const statuses = ['open', 'upcoming', 'closed', 'listed']
    const responses = await Promise.all(statuses.map((status) =>
      upstoxGet<{ data?: RawIpo[] }>('/v2/ipos', {
        query: { status, page_size: 25 },
        ttlMs: 300_000,
      }),
    ))
    const seen = new Set<string>()
    const records = responses
      .flatMap((response) => (response.data ?? []).map(item => ({ ...item, delivery: getUpstoxProvenance(response) })))
      .filter((item) => item.id && !seen.has(item.id) && seen.add(item.id))

    const data = records.map((item) => ({
      id: item.id,
      symbol: item.symbol ?? null,
      company: item.name ?? null,
      isin: item.isin ?? null,
      issueType: item.issue_type?.toLowerCase() === 'sme' ? 'SME' : item.issue_type?.toLowerCase() === 'mainboard' ? 'Mainboard' : 'Unknown',
      issueSizeCrore: item.issue_size ?? null,
      industry: item.industry ?? null,
      priceMin: item.minimum_price ?? null,
      priceMax: item.maximum_price ?? null,
      lotSize: item.minimum_lot ?? null,
      openDate: item.bidding_start_date ?? null,
      closeDate: item.bidding_end_date ?? null,
      listingDate: item.listing_date ?? null,
      status: getIpoDisplayStatus({
        openDate: item.bidding_start_date,
        closeDate: item.bidding_end_date,
        biddingEndAt: item.bidding_end_time,
        listingDate: item.listing_date,
        providerStatus: item.status,
      }),
      providerUpdatedAt: item.updated_at ?? null,
      normalizedAt,
      metadata: withProvenance({ source: 'Upstox API', asOf: providerDate(item.updated_at), availability: availabilityFromDate(providerDate(item.updated_at)), generatedAt: normalizedAt, quality: 'verified' }, item.delivery),
    }))

    return { data, metadata: aggregateProvenance(data.map(item => item.metadata), 'Upstox API'), error: null }
  } catch (error) {
    const apiError = error instanceof UpstoxApiError ? error : null
    return {
      data: null,
      error: {
        code: apiError?.providerCode ?? 'PROVIDER_ERROR',
        message: 'IPO data temporarily unavailable.',
      }
    }
  }
}
