import { NextResponse } from "next/server";
import { getMarketOverview } from "../../../../src/services/market-data/market-overview-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getMarketOverview();
  if (result.error) {
    return NextResponse.json({ data: null, metadata: result.metadata, error: result.error }, { status: result.error.code === 'RATE_LIMITED' ? 429 : 503, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ data: result.data, metadata: result.metadata }, { headers: { "Cache-Control": "no-store" } });
}
