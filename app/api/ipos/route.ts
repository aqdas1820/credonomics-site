import { NextResponse } from 'next/server'
import { getIpoDisplayStatus } from '../../../src/domain/ipo/display-status'
import { upstoxGet, UpstoxApiError } from '../../../src/lib/upstox/client'

type RawIpo = {
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

export const dynamic = 'force-dynamic'

export async function GET() {
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
      .flatMap((response) => response.data ?? [])
      .filter((item) => item.id && !seen.has(item.id) && seen.add(item.id))

    const data = records.map((item) => ({
      id: item.id,
      symbol: item.symbol ?? null,
      company: item.name ?? null,
      isin: item.isin ?? null,
      issueType: item.issue_type === 'sme' ? 'SME' : 'Mainboard',
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
      providerUpdatedAt: item.updated_at ?? normalizedAt,
      normalizedAt,
    }))

    return NextResponse.json({
      data,
      metadata: {
        source: 'Exchange data',
        availability: 'recent',
        asOf: normalizedAt,
        provider: 'upstox',
        providerUpdatedAt: records.reduce<string | null>((latest, item) =>
          item.updated_at && (!latest || item.updated_at > latest) ? item.updated_at : latest, null),
        normalizedAt,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    const apiError = error instanceof UpstoxApiError ? error : null
    return NextResponse.json({
      data: null,
      metadata: { source: 'Exchange data', provider: 'upstox', normalizedAt },
      error: {
        code: apiError?.providerCode ?? 'PROVIDER_ERROR',
        message: 'IPO data temporarily unavailable.',
      },
    }, { status: 503 })
  }
}
