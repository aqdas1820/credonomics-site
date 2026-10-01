import { NextRequest, NextResponse } from 'next/server'
import { MutualFundIntelligenceService } from '../../../../../src/services/mf/MutualFundIntelligenceService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ data: null, error: { message: 'Security slug is required.' } }, { status: 400 })
  }

  const timeline = await MutualFundIntelligenceService.getSecurityTimeline(slug);
  
  if (!timeline) {
    return NextResponse.json({
      data: null,
      error: { code: 'DATA_UNAVAILABLE', message: 'Verified timeline data is unavailable for this security.' },
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json({
    data: timeline,
    error: null
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
