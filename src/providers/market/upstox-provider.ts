import "server-only";
import type { CompanyFundamentals, CorporateAction, FinancialStatements, HistoricalPrice, HistoricalRange, IndianEquityIdentity, MarketQuote, Shareholding } from "../../domain/equity/types";
import type { FinancialDataMetadata } from "../../domain/financial-data";
import { upstoxGet, UpstoxApiError, hasUpstoxAnalyticsToken } from "../../lib/upstox/client";
import { marketQuoteSchema } from "../../schemas/equity";
import { searchInstrumentMaster } from "../../services/market-data/instrument-master";
import type { MarketDataProvider, ProviderResult } from "./types";
import { getIndianMarketSession, getIstDate, shiftIsoDate } from "../../domain/market/session";
import { calculateQuoteChange, resolvePreviousClose } from "../../domain/market/quote";
import { derive52WeekStats } from "../../domain/market/range";

function metadata(asOf: string | null, availability: FinancialDataMetadata["availability"]): FinancialDataMetadata {
  return { source: "Upstox API", asOf, generatedAt: new Date().toISOString(), quality: availability === "unavailable" ? "unknown" : "verified", availability };
}
function failure<T>(code: string, message: string, retryable = false): ProviderResult<T> {
  return { data: null, metadata: metadata(null, "unavailable"), error: { code, message, retryable } };
}
function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") { const parsed = Number(value.replace(/%$/, "")); return Number.isFinite(parsed) ? parsed : null; }
  return null;
}
function dateOrNull(value: unknown): string | null {
  if ((typeof value === "string" || typeof value === "number") && !Number.isNaN(Date.parse(String(value)))) return new Date(value).toISOString();
  return null;
}
function mapError<T>(error: unknown): ProviderResult<T> {
  if (error instanceof UpstoxApiError) return failure(error.providerCode === "AUTH_REQUIRED" || error.status === 401 || error.status === 403 ? "AUTH_REQUIRED" : error.status === 429 ? "RATE_LIMITED" : error.providerCode ?? "PROVIDER_ERROR", "Market data is temporarily unavailable.", error.retryable);
  return failure("PROVIDER_ERROR", "Market data temporarily unavailable.", true);
}
function identityFor(key: string): IndianEquityIdentity | null {
  const term = key.includes("|") ? key.split("|").at(-1) ?? "" : key;
  return searchInstrumentMaster(term, 20).find(item => item.instrumentKey === key || item.symbol.toUpperCase() === key.toUpperCase() || item.isin === key) ?? null;
}
export function transformCandles(raw: unknown): HistoricalPrice[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap(candle => Array.isArray(candle) && candle.length >= 6 && typeof candle[0] === "string" && candle.slice(1, 6).every(Number.isFinite) ? [{ date: candle[0], open: candle[1] as number, high: candle[2] as number, low: candle[3] as number, close: candle[4] as number, volume: candle[5] as number }] : []);
}

async function get52WeekStats(key: string) {
  const to = new Date();
  const from = new Date(to.getTime() - 370 * 86_400_000);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  const countCandles = (value: unknown) => Array.isArray((value as { data?: { candles?: unknown[] } }).data?.candles) ? (value as { data: { candles: unknown[] } }).data.candles.length : 0;
  const raw = await upstoxGet<{ data?: { candles?: unknown } }>(`/v3/historical-candle/${encodeURIComponent(key)}/days/1/${format(to)}/${format(from)}`, {
    ttlMs: 21_600_000,
    cacheWhen: value => countCandles(value) >= 200,
    diagnostics: { category: "52-week-daily-candles", instrumentKey: key, recordCount: countCandles },
  });
  return derive52WeekStats(transformCandles(raw.data?.candles));
}

export class UpstoxMarketDataProvider implements MarketDataProvider {
  readonly id = "upstox";
  async searchStocks(query: string) { return { data: searchInstrumentMaster(query), metadata: metadata(new Date().toISOString(), "recent") }; }

  async getQuote(key: string): Promise<ProviderResult<MarketQuote>> {
    if (!hasUpstoxAnalyticsToken()) return failure("AUTH_REQUIRED", "Market data authentication is not configured.");
    const instrument = identityFor(key);
    if (!instrument) return failure("NOT_FOUND", "Unable to retrieve this security.");
    try {
      const raw = await upstoxGet<{ data?: Record<string, Record<string, unknown>> }>("/v2/market-quote/quotes", { query: { instrument_key: key }, ttlMs: 15_000, diagnostics: { category: "quote", instrumentKey: key, recordCount: value => Object.keys((value as { data?: object }).data ?? {}).length } });
      const item = Object.values(raw.data ?? {})[0] ?? {};
      const ohlc = item.ohlc as Record<string, unknown> | undefined;
      const price = numberOrNull(item.last_price);
      const previousClose = resolvePreviousClose(price, numberOrNull(item.net_change), numberOrNull(ohlc?.close));
      const timestamp = dateOrNull(item.timestamp ?? item.last_trade_time);
      const availability = timestamp && Date.now() - Date.parse(timestamp) < 120_000 ? "live" : "delayed";
      const { change, changePercent } = calculateQuoteChange(price, previousClose);
      let fiftyTwoWeekHigh = numberOrNull(item.ohlc_52_week_high);
      let fiftyTwoWeekLow = numberOrNull(item.ohlc_52_week_low);
      if (fiftyTwoWeekHigh === null || fiftyTwoWeekLow === null) {
        try {
          const derived = await get52WeekStats(key);
          fiftyTwoWeekHigh ??= derived.high;
          fiftyTwoWeekLow ??= derived.low;
        } catch (error) {
          console.warn("Market data request failed", { category: "52-week-daily-candles", instrumentKey: key, providerCode: error instanceof UpstoxApiError ? error.providerCode : "PROVIDER_ERROR" });
        }
      }

      const quote = { ...instrument, price, previousClose, change, changePercent, open: numberOrNull(ohlc?.open), high: numberOrNull(ohlc?.high), low: numberOrNull(ohlc?.low), volume: numberOrNull(item.volume), fiftyTwoWeekHigh, fiftyTwoWeekLow, timestamp, ...metadata(timestamp, availability) };
      const parsed = marketQuoteSchema.safeParse(quote);
      return parsed.success ? { data: parsed.data, metadata: metadata(timestamp, availability) } : failure("INVALID_RESPONSE", "Market data temporarily unavailable.");
    } catch (error) { return mapError(error); }
  }

  async getQuotes(keys: string[]): Promise<ProviderResult<MarketQuote[]>> {
    const results = await Promise.all(keys.map(key => this.getQuote(key)));
    return { data: results.flatMap(result => result.data ? [result.data] : []), metadata: metadata(new Date().toISOString(), results.some(result => result.data) ? "delayed" : "unavailable"), error: results.every(result => !result.data) ? results[0]?.error : undefined };
  }

  async getHistoricalPrices(key: string, range: HistoricalRange): Promise<ProviderResult<HistoricalPrice[]>> {
    if (!hasUpstoxAnalyticsToken()) return failure("AUTH_REQUIRED", "Market data authentication is not configured.");
    const settings: Partial<Record<HistoricalRange, { days: number; unit: "days" | "weeks" | "months" }>> = { "1D": { days: 1, unit: "days" }, "1W": { days: 7, unit: "days" }, "1M": { days: 31, unit: "days" }, "3M": { days: 93, unit: "days" }, "6M": { days: 186, unit: "days" }, "1Y": { days: 366, unit: "days" }, "3Y": { days: 1096, unit: "weeks" }, "5Y": { days: 1827, unit: "weeks" }, "MAX": { days: 3650, unit: "months" } };
    const config = settings[range] ?? settings["1M"]!;
    const { days, unit } = config;
    const to = new Date(); const from = new Date(to.getTime() - days * 86_400_000); const format = (date: Date) => date.toISOString().slice(0, 10);
    try {
      const raw = await upstoxGet<{ data?: { candles?: unknown } }>(`/v3/historical-candle/${encodeURIComponent(key)}/${unit}/1/${format(to)}/${format(from)}`, { ttlMs: 3_600_000, diagnostics: { category: "historical-candles", instrumentKey: key, recordCount: value => Array.isArray((value as { data?: { candles?: unknown[] } }).data?.candles) ? (value as { data: { candles: unknown[] } }).data.candles.length : 0 } });
      const data = transformCandles(raw.data?.candles);
      return { data, metadata: metadata(data[0]?.date ?? null, data.length ? "recent" : "unavailable") };
    } catch (error) { return mapError(error); }
  }

  async getIntradayPrices(key: string, interval: "1minute" | "5minute" | "15minute" | "30minute" | "60minute" = "5minute"): Promise<ProviderResult<HistoricalPrice[]>> {
    if (!hasUpstoxAnalyticsToken()) return failure("AUTH_REQUIRED", "Market data authentication is not configured.");
    try {
      const specification = interval === "60minute"
        ? { unit: "hours", value: "1" }
        : { unit: "minutes", value: interval.replace("minute", "") };
      const countCandles = (value: unknown) => Array.isArray((value as { data?: { candles?: unknown[] } }).data?.candles) ? (value as { data: { candles: unknown[] } }).data.candles.length : 0;
      const raw = await upstoxGet<{ data?: { candles?: unknown } }>(`/v3/historical-candle/intraday/${encodeURIComponent(key)}/${specification.unit}/${specification.value}`, {
        ttlMs: 30_000,
        cacheWhen: value => countCandles(value) > 0,
        diagnostics: { category: "intraday-candles", instrumentKey: key, recordCount: countCandles },
      });
      const data = transformCandles(raw.data?.candles);
      if (data.length) {
        const currentMetadata = metadata(data[0]?.date ?? null, getIndianMarketSession() === "OPEN" ? "live" : "recent");
        return { data, metadata: { ...currentMetadata, session: "current", sessionDate: data[0]!.date.slice(0, 10) } };
      }

      const today = getIstDate();
      const toDate = shiftIsoDate(today, -1);
      const fromDate = shiftIsoDate(today, -10);
      const fallbackRaw = await upstoxGet<{ data?: { candles?: unknown } }>(`/v3/historical-candle/${encodeURIComponent(key)}/${specification.unit}/${specification.value}/${toDate}/${fromDate}`, {
        ttlMs: 3_600_000,
        cacheWhen: value => countCandles(value) > 0,
        diagnostics: { category: "previous-session-candles", instrumentKey: key, recordCount: countCandles },
      });
      const fallback = transformCandles(fallbackRaw.data?.candles);
      const sessionDate = fallback.reduce((latest, candle) => candle.date.slice(0, 10) > latest ? candle.date.slice(0, 10) : latest, "");
      const previousSession = sessionDate ? fallback.filter(candle => candle.date.startsWith(sessionDate)) : [];
      const previousMetadata = metadata(previousSession[0]?.date ?? null, previousSession.length ? "recent" : "unavailable");
      return { data: previousSession, metadata: { ...previousMetadata, session: "previous", sessionDate: sessionDate || undefined } };
    } catch (error) { return mapError(error); }
  }

  async getCompanyProfile(symbol: string) { const data = identityFor(symbol); return { data, metadata: metadata(null, data ? "recent" : "unavailable") }; }

  async getFundamentals(symbol: string): Promise<ProviderResult<CompanyFundamentals>> {
    const instrument = identityFor(symbol);
    if (!instrument?.isin) return failure("NOT_FOUND", "Fundamental data is unavailable for this security.");
    try {
      const raw = await upstoxGet<{ data?: Array<{ name?: string; company_value?: string }> }>(`/v2/fundamentals/${instrument.isin}/key-ratios`, { ttlMs: 21_600_000 });
      const ratios = new Map((raw.data ?? []).map(item => [item.name, numberOrNull(item.company_value)]));
      return { data: { ...instrument, marketCap: null, pe: ratios.get("P/E") ?? null, pb: ratios.get("P/B") ?? null, eps: null, bookValue: null, dividendYield: null, roe: ratios.get("ROE") ?? null, roce: ratios.get("ROCE") ?? null, roa: ratios.get("ROA") ?? null, evEbitda: ratios.get("EV/EBITDA") ?? null, debtToEquity: null, ...metadata(new Date().toISOString(), "recent") }, metadata: metadata(new Date().toISOString(), "recent") };
    } catch (error) { return mapError(error); }
  }
  async getFinancialStatements(): Promise<ProviderResult<FinancialStatements>> { return failure("NOT_SUPPORTED", "Financial statements are not yet normalized."); }

  async getShareholding(symbol: string): Promise<ProviderResult<Shareholding>> {
    const instrument = identityFor(symbol); if (!instrument?.isin) return failure("NOT_FOUND", "Shareholding data is unavailable for this security.");
    try {
      const raw = await upstoxGet<{ data?: Array<{ category?: string; history?: Array<{ period?: string; value?: number }> }> }>(`/v2/fundamentals/${instrument.isin}/share-holdings`, { ttlMs: 21_600_000 });
      const entries = new Map((raw.data ?? []).map(item => [item.category, item.history?.[0]?.value ?? null]));
      return { data: { ...instrument, promoterHolding: entries.get("promoters") ?? null, fiiHolding: entries.get("fii") ?? null, diiHolding: entries.get("other_dii") ?? null, mutualFundHolding: entries.get("mutual_funds") ?? null, publicHolding: entries.get("retail_and_other") ?? null, history: raw.data ?? [], ...metadata(new Date().toISOString(), "recent") }, metadata: metadata(new Date().toISOString(), "recent") };
    } catch (error) { return mapError(error); }
  }

  async getCorporateActions(symbol: string): Promise<ProviderResult<CorporateAction[]>> {
    const instrument = identityFor(symbol); if (!instrument?.isin) return failure("NOT_FOUND", "Corporate actions are unavailable for this security.");
    try {
      const raw = await upstoxGet<{ data?: Array<{ name?: string; expiry_date?: string; amount?: number; ratio?: string | null; event_details?: Array<{ name?: string; value?: string }> }> }>(`/v2/fundamentals/${instrument.isin}/corporate-actions`, { ttlMs: 21_600_000 });
      const data = (raw.data ?? []).map(action => { const details = new Map((action.event_details ?? []).map(item => [item.name?.toLowerCase(), item.value ?? null])); const name = action.name?.toLowerCase() ?? "other"; const type: CorporateAction["type"] = name.includes("dividend") ? "dividend" : name.includes("split") ? "split" : name.includes("bonus") ? "bonus" : name.includes("right") ? "rights" : name.includes("buyback") ? "buyback" : "other"; return { type, exDate: details.get("ex dividend date") ?? action.expiry_date ?? null, recordDate: details.get("record date") ?? null, announcementDate: details.get("announcement date") ?? null, amount: action.amount ?? null, ratio: action.ratio ?? null, description: details.get("details") ?? action.name ?? "Corporate action" }; });
      return { data, metadata: metadata(new Date().toISOString(), "recent") };
    } catch (error) { return mapError(error); }
  }

  async getMarketStatus(): Promise<ProviderResult<{ session: "PRE_OPEN" | "OPEN" | "CLOSED" | "HOLIDAY" }>> {
    return { data: { session: getIndianMarketSession() }, metadata: metadata(new Date().toISOString(), "recent") };
  }
}
