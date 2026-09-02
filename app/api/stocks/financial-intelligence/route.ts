import { NextRequest, NextResponse } from 'next/server'
import { getCompanyFinancialIntelligence } from '../../../../src/services/market-data/company-financial-intelligence'
import { searchInstrumentMaster } from '../../../../src/services/market-data/instrument-master'
import { UpstoxApiError } from '../../../../src/lib/upstox/client'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('instrumentKey')?.trim() ?? ''
  const valid = /^((NSE|BSE)_EQ\|IN[A-Z0-9]{10})$/.test(key) && searchInstrumentMaster(key.split('|')[1]!, 20).some(x => x.instrumentKey === key)
  if (!valid) return NextResponse.json({ data: null, error: { code: 'INVALID_REQUEST', message: 'A valid equity instrument is required.' } }, { status: 400 })
  try { const data = await getCompanyFinancialIntelligence(key); return NextResponse.json({ data, error: data ? undefined : { code: 'NOT_FOUND', message: 'Financial data unavailable for this company.' } }, { status: data ? 200 : 404, headers: { 'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400' } }) }
  catch (error) { const status = error instanceof UpstoxApiError && error.status === 429 ? 429 : 502; return NextResponse.json({ data: null, error: { code: status === 429 ? 'RATE_LIMITED' : 'DATA_UNAVAILABLE', message: 'Financial data is temporarily unavailable.' } }, { status }) }
}
