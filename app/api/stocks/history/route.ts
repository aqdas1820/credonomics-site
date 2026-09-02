import { NextRequest, NextResponse } from "next/server";
import type { HistoricalRange } from "../../../../src/domain/equity/types";
import { getMarketDataProvider } from "../../../../src/services/market-data/market-data-service";

const ranges = new Set<HistoricalRange>(["1m", "5m", "15m", "1h", "1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "MAX"]);
const intradayIntervals = { "1m": "1minute", "5m": "5minute", "15m": "15minute", "1h": "60minute", "1D": "1minute" } as const;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("instrumentKey")?.trim();
  const range = request.nextUrl.searchParams.get("range") as HistoricalRange;
  if (!key || !/^(NSE|BSE)_EQ\|INE[A-Z0-9]{9}$/.test(key) || !ranges.has(range)) {
    return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST", message: "Valid instrument and range are required." } }, { status: 400 });
  }

  const provider = getMarketDataProvider();
  const interval = intradayIntervals[range as keyof typeof intradayIntervals];
  const result = interval ? await provider.getIntradayPrices(key, interval) : await provider.getHistoricalPrices(key, range);
  const publicResult = result.error ? { ...result, error: { ...result.error, message: "Chart data is unavailable for this interval." } } : result;
  const cacheControl = result.error?.code === "AUTH_REQUIRED"
    ? "no-store"
    : result.data?.length
      ? result.metadata.session === "previous" ? "private, max-age=300, stale-while-revalidate=3600" : "private, max-age=30, stale-while-revalidate=300"
      : "no-store";
  return NextResponse.json(publicResult, {
    status: result.error?.code === "AUTH_REQUIRED" ? 503 : result.error ? 502 : 200,
    headers: { "Cache-Control": cacheControl },
  });
}
