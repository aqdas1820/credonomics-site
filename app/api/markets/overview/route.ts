import { NextResponse } from "next/server";
import { upstoxGet, UpstoxApiError } from "../../../../src/lib/upstox/client";

const instruments = [
  { name: "NIFTY 50", instrumentKey: "NSE_INDEX|Nifty 50" },
  { name: "SENSEX", instrumentKey: "BSE_INDEX|SENSEX" },
  { name: "BANK NIFTY", instrumentKey: "NSE_INDEX|Nifty Bank" },
  { name: "INDIA VIX", instrumentKey: "NSE_INDEX|India VIX" },
];
const numberOrNull = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const raw = await upstoxGet<{ data?: Record<string, Record<string, unknown>> }>("/v2/market-quote/quotes", { query: { instrument_key: instruments.map(item => item.instrumentKey).join(",") }, ttlMs: 15_000 });
    const data = instruments.map(instrument => {
      const quote = raw.data?.[instrument.instrumentKey];
      const ohlc = quote?.ohlc as Record<string, unknown> | undefined;
      const price = numberOrNull(quote?.last_price);
      const previousClose = numberOrNull(ohlc?.close);
      const netChange = numberOrNull(quote?.net_change);
      const netChangePercent = numberOrNull(quote?.net_change_percent);
      const change = netChange !== null ? netChange : (price !== null && previousClose !== null ? price - previousClose : null);
      const changePercent = netChangePercent !== null ? netChangePercent : (price !== null && previousClose ? ((price - previousClose) / previousClose) * 100 : null);
      return { ...instrument, price, change, changePercent, open: numberOrNull(ohlc?.open), high: numberOrNull(ohlc?.high), low: numberOrNull(ohlc?.low), previousClose, timestamp: typeof quote?.timestamp === "string" ? quote.timestamp : null };
    });
    return NextResponse.json({ data, metadata: { source: "Upstox API", availability: "live", asOf: data.find(item => item.timestamp)?.timestamp ?? null } }, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } });
  } catch (error) {
    const apiError = error instanceof UpstoxApiError ? error : null;
    return NextResponse.json({ data: null, metadata: { source: "Upstox API", availability: "unavailable", asOf: null }, error: { code: apiError?.providerCode ?? "PROVIDER_ERROR", message: apiError?.message ?? "Market data temporarily unavailable." } }, { status: apiError?.status === 429 ? 429 : 503 });
  }
}
