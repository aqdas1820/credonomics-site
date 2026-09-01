import type { HistoricalPrice } from "../../domain/equity/types";
import type { ProviderResult } from "./types";

export function transformUpstoxCandles(raw: unknown): HistoricalPrice[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((candle) =>
    Array.isArray(candle) && candle.length >= 6 && typeof candle[0] === "string" && candle.slice(1, 6).every(Number.isFinite)
      ? [{ date: candle[0], open: candle[1] as number, high: candle[2] as number, low: candle[3] as number, close: candle[4] as number, volume: candle[5] as number }]
      : [],
  );
}

export function providerErrorCode(status?: number, timedOut = false): Pick<NonNullable<ProviderResult<unknown>["error"]>, "code" | "retryable"> {
  if (timedOut) return { code: "TIMEOUT", retryable: true };
  if (status === 401 || status === 403) return { code: "AUTH_REQUIRED", retryable: false };
  if (status === 429) return { code: "RATE_LIMITED", retryable: true };
  return { code: "PROVIDER_ERROR", retryable: !status || status >= 500 };
}
