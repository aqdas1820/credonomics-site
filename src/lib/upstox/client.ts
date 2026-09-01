import "server-only";

const BASE_URL = "https://api.upstox.com";
const cache = new Map<string, { expiresAt: number; value: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

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
};

export async function upstoxGet<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = process.env.UPSTOX_ANALYTICS_TOKEN?.trim();
  if (!token) throw new UpstoxApiError(endpoint, null, "AUTH_REQUIRED", "Upstox Analytics Token is not configured.", false);
  const url = new URL(endpoint, BASE_URL);
  for (const [key, value] of Object.entries(options.query ?? {})) if (value != null) url.searchParams.set(key, String(value));
  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const pending = inflight.get(cacheKey);
  if (pending) return pending as Promise<T>;

  const request = (async () => {
    let lastError: UpstoxApiError | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);
      try {
        const response = await fetch(url, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
        if (response.ok) {
          if ((options.ttlMs ?? 0) > 0) cache.set(cacheKey, { expiresAt: Date.now() + (options.ttlMs ?? 0), value: payload });
          return payload as T;
        }
        const providerError = Array.isArray(payload.errors) ? payload.errors[0] as Record<string, unknown> | undefined : undefined;
        const code = String(providerError?.errorCode ?? providerError?.error_code ?? "UPSTOX_ERROR");
        const retryable = response.status === 429 || response.status >= 500;
        const message = response.status === 401 || response.status === 403 ? "Upstox authentication or entitlement failed." : response.status === 429 ? "Upstox rate limit reached." : response.status === 404 ? "Upstox data was not found." : "Upstox data is temporarily unavailable.";
        lastError = new UpstoxApiError(endpoint, response.status, code, message, retryable);
        console.warn("Upstox request failed", { endpoint, status: response.status, providerCode: code, message });
        if (!retryable || attempt === 1) throw lastError;
      } catch (error) {
        if (error instanceof UpstoxApiError) {
          lastError = error;
          if (!error.retryable || attempt === 1) throw error;
        } else if ((error as Error).name === "AbortError") {
          lastError = new UpstoxApiError(endpoint, null, "TIMEOUT", "Upstox request timed out.", true);
          console.warn("Upstox request failed", { endpoint, status: null, providerCode: "TIMEOUT", message: lastError.message });
          if (attempt === 1) throw lastError;
        } else {
          throw new UpstoxApiError(endpoint, null, "NETWORK_ERROR", "Upstox data is temporarily unavailable.", true);
        }
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError ?? new UpstoxApiError(endpoint, null, "UPSTOX_ERROR", "Upstox data is temporarily unavailable.", true);
  })();
  inflight.set(cacheKey, request);
  try { return await request; } finally { inflight.delete(cacheKey); }
}
