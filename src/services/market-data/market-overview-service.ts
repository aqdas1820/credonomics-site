import "server-only";
import { withProvenance, aggregateProvenance } from "../../domain/provenance";
import type { FinancialDataMetadata } from "../../domain/financial-data";
import { marketObservationAvailability } from "../../domain/freshness";
import { providerDate, providerNumber } from "../../providers/market/upstox-transform";
import { calculateQuoteChange, resolvePreviousClose, resolveProviderQuote } from "../../domain/market/quote";
import { getIndianMarketSession } from "../../domain/market/session";
import { upstoxGet, UpstoxApiError, getUpstoxProvenance } from "../../lib/upstox/client";

const instruments = [
  { name: "NIFTY 50", instrumentKey: "NSE_INDEX|Nifty 50" },
  { name: "SENSEX", instrumentKey: "BSE_INDEX|SENSEX" },
  { name: "BANK NIFTY", instrumentKey: "NSE_INDEX|Nifty Bank" },
  { name: "INDIA VIX", instrumentKey: "NSE_INDEX|India VIX" },
] as const;

export type IndexQuote = typeof instruments[number] & {
  price: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  timestamp: string | null;
  metadata: FinancialDataMetadata;
};

const lastKnown = new Map<string, IndexQuote>();
const numberOrNull = providerNumber;

export async function getMarketOverview() {
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
      const normalized: IndexQuote = { ...instrument, price, change, changePercent, open: numberOrNull(ohlc?.open), high: numberOrNull(ohlc?.high), low: numberOrNull(ohlc?.low), previousClose, timestamp: providerDate(quote?.timestamp), metadata: withProvenance({ source: "Upstox API", asOf: providerDate(quote?.timestamp), availability: marketObservationAvailability(providerDate(quote?.timestamp), session === "OPEN"), generatedAt: new Date().toISOString(), quality: "verified" }, getUpstoxProvenance(raw)) };
      if (normalized.price !== null) lastKnown.set(instrument.instrumentKey, normalized);
      return normalized;
    });
    if (data.some(item => item.price === null)) throw new Error("Incomplete index quote response");
    return { data, metadata: aggregateProvenance(data.map(item => item.metadata), "Upstox API"), error: null };
  } catch (error) {
    const fallback = instruments.map(item => lastKnown.get(item.instrumentKey)).filter((item): item is IndexQuote => Boolean(item)).map(item => ({ ...item, metadata: withProvenance({ ...item.metadata, availability: "stale" }, { fetchedAt: item.metadata.fetchedAt ?? null, cachedAt: item.metadata.cachedAt ?? null, delivery: "cache" }) }));
    if (fallback.length === instruments.length) return { data: fallback, metadata: aggregateProvenance(fallback.map(item => item.metadata), "Upstox API"), error: null };
    const apiError = error instanceof UpstoxApiError ? error : null;
    return { data: null, metadata: { source: "Exchange market data", availability: "unavailable", asOf: null }, error: { code: apiError?.providerCode ?? "PROVIDER_ERROR", message: "Market index data is temporarily unavailable." } };
  }
}
