import { NextRequest, NextResponse } from 'next/server'
import { MutualFundIntelligenceService } from '../../../../src/services/mf/MutualFundIntelligenceService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const scheme1 = request.nextUrl.searchParams.get('scheme1')?.trim()
  const scheme2 = request.nextUrl.searchParams.get('scheme2')?.trim()

  if (!scheme1 || !scheme2) {
    return NextResponse.json({ data: null, error: { message: 'Two scheme identifiers are required.' } }, { status: 400 })
  }

  const overlap = await MutualFundIntelligenceService.getPortfolioOverlap(scheme1, scheme2);
  
  if (!overlap) {
    return NextResponse.json({
      data: null,
      error: { code: 'DATA_UNAVAILABLE', message: 'Verified portfolio overlap data is unavailable for these schemes.' },
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json({
    data: overlap,
    error: null
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
