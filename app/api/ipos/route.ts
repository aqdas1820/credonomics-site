import { NextResponse } from 'next/server'
import { MarketDataService } from '../../../src/services/market-data/market-data-service'
export const dynamic = 'force-dynamic'
export async function GET() {
  const result = await MarketDataService.getLiveIpos();
  return NextResponse.json(result, { status: result.error ? 503 : 200, headers: { 'Cache-Control': 'no-store' } });
}
