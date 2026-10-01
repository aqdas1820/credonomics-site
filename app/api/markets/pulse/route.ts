import { NextResponse } from 'next/server'
import { getMarketPulse } from '../../../../src/services/market-data/market-pulse-service'
export const dynamic = 'force-dynamic'
export async function GET() {
  try { const data = await getMarketPulse(); return NextResponse.json({ data, metadata: data.metadata }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ data: null, error: { code: 'DATA_UNAVAILABLE', message: 'Market intelligence is temporarily unavailable.' } }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
