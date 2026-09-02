import { NextResponse } from "next/server";
import { calculateQuoteChange, resolvePreviousClose, resolveProviderQuote } from "../../../../src/domain/market/quote";
import { getIndianMarketSession, marketOverviewCacheControl } from "../../../../src/domain/market/session";
import { upstoxGet, UpstoxApiError } from "../../../../src/lib/upstox/client";

const instruments = [
  { name: "NIFTY 50", instrumentKey: "NSE_INDEX|Nifty 50" },
  { name: "SENSEX", instrumentKey: "BSE_INDEX|SENSEX" },
  { name: "BANK NIFTY", instrumentKey: "NSE_INDEX|Nifty Bank" },
  { name: "INDIA VIX", instrumentKey: "NSE_INDEX|India VIX" },
] as const;

type IndexQuote = typeof instruments[number] & {
  price: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  timestamp: string | null;
};

const lastKnown = new Map<string, IndexQuote>();
const numberOrNull = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export const dynamic = "force-dynamic";

export async function GET() {
  const instrumentKeys = instruments.map(item => item.instrumentKey);
  const session = getIndianMarketSession();
  try {
    const raw = await upstoxGet<{ data?: Record<string, Record<string, unknown>> }>("/v2/market-quote/quotes", {
      query: { instrument_key: instrumentKeys.join(",") },
      ttlMs: 15_000,
      diagnostics: { category: "index-quotes", instrumentKey: instrumentKeys.join(","), recordCount: value => Object.keys((value as { data?: object }).data ?? {}).length },
    });
    const data = instruments.map(instrument => {
      const quote = resolveProviderQuote(raw.data, instrument.instrumentKey);
      const ohlc = quote?.ohlc as Record<string, unknown> | undefined;
      const price = numberOrNull(quote?.last_price);
      const previousClose = resolvePreviousClose(price, numberOrNull(quote?.net_change), numberOrNull(ohlc?.close));
      const { change, changePercent } = calculateQuoteChange(price, previousClose);
      const normalized: IndexQuote = { ...instrument, price, change, changePercent, open: numberOrNull(ohlc?.open), high: numberOrNull(ohlc?.high), low: numberOrNull(ohlc?.low), previousClose, timestamp: typeof quote?.timestamp === "string" ? quote.timestamp : null };
      if (normalized.price !== null) lastKnown.set(instrument.instrumentKey, normalized);
      return normalized.price !== null ? normalized : lastKnown.get(instrument.instrumentKey) ?? normalized;
    });
    if (data.some(item => item.price === null)) throw new Error("Incomplete index quote response");
    const availability = session === "OPEN" ? "live" : "recent";
    return NextResponse.json({ data, metadata: { source: "Exchange market data", availability, asOf: data.find(item => item.timestamp)?.timestamp ?? null } }, { headers: { "Cache-Control": marketOverviewCacheControl(session) } });
  } catch (error) {
    const fallback = instruments.map(item => lastKnown.get(item.instrumentKey)).filter((item): item is IndexQuote => Boolean(item));
    if (fallback.length === instruments.length) return NextResponse.json({ data: fallback, metadata: { source: "Exchange market data", availability: "stale", asOf: fallback.find(item => item.timestamp)?.timestamp ?? null } }, { headers: { "Cache-Control": marketOverviewCacheControl(session, true) } });
    const apiError = error instanceof UpstoxApiError ? error : null;
    return NextResponse.json({ data: null, metadata: { source: "Exchange market data", availability: "unavailable", asOf: null }, error: { code: apiError?.providerCode ?? "PROVIDER_ERROR", message: "Market index data is temporarily unavailable." } }, { status: apiError?.status === 429 ? 429 : 503, headers: { "Cache-Control": "no-store" } });
  }
}
