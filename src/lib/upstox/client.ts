import "server-only";
import { unknownDelivery, type DeliveryProvenance } from '../../domain/provenance';
const deliveries = new WeakMap<object, DeliveryProvenance>();
export function getUpstoxProvenance(value: unknown): DeliveryProvenance {
  return value && typeof value === 'object' ? deliveries.get(value) ?? unknownDelivery : unknownDelivery;
}
function delivered<T>(value: T, provenance: DeliveryProvenance): T {
  const copy = { ...value };
  deliveries.set(copy as object, provenance);
  return copy;
}

const BASE_URL = "https://api.upstox.com";
const cache = new Map<string, { expiresAt: number; value: unknown }>();
const inflight = new Map<string, Promise<unknown>>();
// Provider throttling applies across requests within this server instance.
let rateLimitedUntil = 0;

function retryAfterMs(value: string | null): number {
  if (!value?.trim()) return 30_000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();
  return Number.isFinite(delay) ? Math.max(1_000, delay) : 30_000;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

export class UpstoxApiError extends Error {
  constructor(
    readonly endpoint: string,
    readonly status: number | null,
    readonly providerCode: string | null,
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "UpstoxApiError";
  }
}

export function hasUpstoxAnalyticsToken(): boolean {
  return Boolean(process.env.UPSTOX_ANALYTICS_TOKEN?.trim());
}

type RequestOptions = {
  query?: Record<string, string | number | boolean | null | undefined>;
  ttlMs?: number;
  timeoutMs?: number;
  cacheWhen?: (value: unknown) => boolean;
  diagnostics?: {
    category: string;
    instrumentKey?: string;
    recordCount?: (value: unknown) => number;
  };
};

export async function upstoxGet<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = process.env.UPSTOX_ANALYTICS_TOKEN?.trim();
  if (!token) throw new UpstoxApiError(endpoint, null, "AUTH_REQUIRED", "Upstox Analytics Token is not configured.", false);
  const url = new URL(endpoint, BASE_URL);
  if (url.origin !== BASE_URL) throw new UpstoxApiError(endpoint, null, 'INVALID_ENDPOINT', 'Invalid provider endpoint.', false);
  for (const [key, value] of Object.entries(options.query ?? {})) if (value != null) url.searchParams.set(key, String(value));
  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  for (const [key, entry] of cache) if (entry.expiresAt <= Date.now()) cache.delete(key);
  if (cached && cached.expiresAt > Date.now()) return delivered(cached.value as T, { ...getUpstoxProvenance(cached.value), delivery: 'cache' });
  const pending = inflight.get(cacheKey);
  if (pending) return pending as Promise<T>;
  if (Date.now() < rateLimitedUntil) throw new UpstoxApiError(endpoint, 429, 'RATE_LIMITED', 'Upstox rate limit reached.', true);

  const request = (async () => {
    let lastError: UpstoxApiError | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (Date.now() < rateLimitedUntil) throw new UpstoxApiError(endpoint, 429, 'RATE_LIMITED', 'Upstox rate limit reached.', true);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);
      try {
        const response = await fetch(url, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = record(await response.json().catch(() => null));
        if (response.ok) {
          if (!payload || payload.data == null || typeof payload.data !== 'object' ||
            (payload.status !== undefined && payload.status !== 'success') ||
            (payload.errors !== undefined && (!Array.isArray(payload.errors) || payload.errors.length > 0))) {
            throw new UpstoxApiError(endpoint, response.status, 'INVALID_RESPONSE', 'Invalid market data response.', false);
          }
          const shouldCache = options.cacheWhen ? options.cacheWhen(payload) : true;
          const fetchedAt = new Date().toISOString();
          deliveries.set(payload, { fetchedAt, cachedAt: (options.ttlMs ?? 0) > 0 && shouldCache ? fetchedAt : null, delivery: 'provider' });
          if ((options.ttlMs ?? 0) > 0 && shouldCache) {
            if (cache.size >= 500) cache.delete(cache.keys().next().value!);
            cache.set(cacheKey, { expiresAt: Date.now() + (options.ttlMs ?? 0), value: payload });
          }
          if (options.diagnostics && process.env.NODE_ENV === 'development') console.info("Market data request", {
            category: options.diagnostics.category,
            instrumentKey: options.diagnostics.instrumentKey,
            status: response.status,
            providerCode: null,
            records: options.diagnostics.recordCount?.(payload) ?? null,
          });
          return payload as T;
        }
        const providerError = Array.isArray(payload?.errors) ? record(payload.errors[0]) : null;
        const rawCode = providerError?.errorCode ?? providerError?.error_code;
        const code = typeof rawCode === 'string' && /^[A-Z0-9_]{1,64}$/.test(rawCode) ? rawCode : "UPSTOX_ERROR";
        if (response.status === 429) rateLimitedUntil = Date.now() + retryAfterMs(response.headers.get('retry-after'));
        const retryable = response.status === 429 || response.status >= 500;
        const message = response.status === 401 || response.status === 403 ? "Upstox authentication or entitlement failed." : response.status === 429 ? "Upstox rate limit reached." : response.status === 404 ? "Upstox data was not found." : "Upstox data is temporarily unavailable.";
        lastError = new UpstoxApiError(endpoint, response.status, code, message, retryable);
        console.warn("Market data request failed", { category: options.diagnostics?.category ?? "market-data", instrumentKey: options.diagnostics?.instrumentKey, status: response.status, providerCode: code });
        if (!retryable || response.status === 429 || attempt === 1) throw lastError;
      } catch (error) {
        if (error instanceof UpstoxApiError) {
          lastError = error;
          if (!error.retryable || error.status === 429 || attempt === 1) throw error;
        } else if ((error as Error).name === "AbortError") {
          lastError = new UpstoxApiError(endpoint, null, "TIMEOUT", "Upstox request timed out.", true);
          console.warn("Market data request failed", { category: options.diagnostics?.category ?? "market-data", instrumentKey: options.diagnostics?.instrumentKey, status: null, providerCode: "TIMEOUT" });
          if (attempt === 1) throw lastError;
        } else {
          lastError = new UpstoxApiError(endpoint, null, "NETWORK_ERROR", "Upstox data is temporarily unavailable.", true);
          if (attempt === 1) throw lastError;
        }
      } finally {
        clearTimeout(timer);
      }
      await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
    throw lastError ?? new UpstoxApiError(endpoint, null, "UPSTOX_ERROR", "Upstox data is temporarily unavailable.", true);
  })();
  inflight.set(cacheKey, request);
  try { return await request; } finally { inflight.delete(cacheKey); }
}
