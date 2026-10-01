import { NextRequest, NextResponse } from 'next/server'
import { MutualFundIntelligenceService } from '../../../../src/services/mf/MutualFundIntelligenceService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // `isin` is the parameter name currently used by `useMFData`, but it represents `schemeId`.
  const identifier = request.nextUrl.searchParams.get('isin')?.trim()
  if (!identifier || identifier.length > 160) {
    return NextResponse.json({ data: null, error: { message: 'A valid scheme identifier is required.' } }, { status: 400 })
  }

  const portfolio = await MutualFundIntelligenceService.getSchemePortfolio(identifier);
  
  if (!portfolio) {
    return NextResponse.json({
      data: null,
      error: { code: 'DATA_UNAVAILABLE', message: 'Verified portfolio data is unavailable for this scheme.' },
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json({
    data: portfolio,
    error: null
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
