import type { HistoricalPrice } from "../../domain/equity/types";
import type { ProviderResult } from "./types";

export type ValidCandle = HistoricalPrice & { open: number; high: number; low: number; close: number };
export function isValidCandle(point: HistoricalPrice): point is ValidCandle {
  return Number.isFinite(Date.parse(point.date)) &&
    [point.open, point.high, point.low, point.close].every(value => typeof value === 'number' && Number.isFinite(value) && value > 0) &&
    point.high! >= Math.max(point.open!, point.close!, point.low!) &&
    point.low! <= Math.min(point.open!, point.close!) &&
    (point.volume === null || (Number.isFinite(point.volume) && point.volume >= 0));
}

export function providerNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = value.replace(/,/g, '').replace(/%$/, '').trim();
  return cleaned && Number.isFinite(Number(cleaned)) ? Number(cleaned) : null;
}

export function providerDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = typeof value === 'number' || (typeof value === 'string' && /^\d{10,13}$/.test(value));
  const timestamp = numeric ? Number(value) * (Number(value) < 1e12 ? 1000 : 1) : typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime()) ? new Date(timestamp).toISOString() : null;
}

export function transformUpstoxCandles(raw: unknown): HistoricalPrice[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((candle) =>
    Array.isArray(candle) && candle.length >= 6 && typeof candle[0] === "string" && candle.slice(1, 6).every(Number.isFinite)
      ? [{ date: candle[0], open: candle[1] as number, high: candle[2] as number, low: candle[3] as number, close: candle[4] as number, volume: candle[5] as number }]
      : [],
  ).filter(isValidCandle);
}

export function providerErrorCode(status?: number, timedOut = false): Pick<NonNullable<ProviderResult<unknown>["error"]>, "code" | "retryable"> {
  if (timedOut) return { code: "TIMEOUT", retryable: true };
  if (status === 401 || status === 403) return { code: "AUTH_REQUIRED", retryable: false };
  if (status === 429) return { code: "RATE_LIMITED", retryable: true };
  return { code: "PROVIDER_ERROR", retryable: !status || status >= 500 };
}
