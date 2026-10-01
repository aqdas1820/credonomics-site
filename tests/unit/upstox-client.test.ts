import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
let client: typeof import('../../src/lib/upstox/client');
const fetchMock = vi.fn();
const response = (body: unknown, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-29T06:00:00Z'));
  vi.stubEnv('UPSTOX_ANALYTICS_TOKEN', 'test-token');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  client = await import('../../src/lib/upstox/client');
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('Upstox transport failure boundaries', () => {
  it.each([null, [], {}, { data: null }, { data: 0 }, { data: {}, status: 'error' }, { data: {}, errors: [{ errorCode: 'FAIL' }] }])('rejects malformed or failed success envelopes: %j', async body => {
    fetchMock.mockImplementation(() => Promise.resolve(response(body)));
    await expect(client.upstoxGet('/v2/test', { ttlMs: 1000 })).rejects.toMatchObject({ providerCode: 'INVALID_RESPONSE' });
    await expect(client.upstoxGet('/v2/test')).rejects.toMatchObject({ providerCode: 'INVALID_RESPONSE' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403, 404])('does not retry permanent HTTP %i failures', async status => {
    fetchMock.mockResolvedValue(response(null, status));
    await expect(client.upstoxGet('/v2/test')).rejects.toMatchObject({ status, retryable: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(['60', 'Tue, 29 Sep 2026 06:01:00 GMT'])('honors Retry-After %s across endpoints without retrying', async retryAfter => {
    fetchMock.mockResolvedValueOnce(response(null, 429, { 'Retry-After': retryAfter })).mockResolvedValue(response({ data: [] }));
    await expect(client.upstoxGet('/v2/test')).rejects.toMatchObject({ status: 429 });
    vi.advanceTimersByTime(59_000);
    await expect(client.upstoxGet('/v2/other')).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    await expect(client.upstoxGet('/v2/other')).resolves.toEqual({ data: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses a bounded default cooldown when Retry-After is missing', async () => {
    fetchMock.mockResolvedValueOnce(response({}, 429)).mockResolvedValue(response({ data: {} }));
    await expect(client.upstoxGet('/v2/test')).rejects.toMatchObject({ status: 429 });
    vi.advanceTimersByTime(30_000);
    await expect(client.upstoxGet('/v2/test')).resolves.toEqual({ data: {} });
  });

  it('shares concurrent requests and caches only until expiry', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(response({ data: { price: 123 } })));
    const options = { ttlMs: 1000 };
    await Promise.all([client.upstoxGet('/v2/test', options), client.upstoxGet('/v2/test', options)]);
    await client.upstoxGet('/v2/test', options);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1001);
    await client.upstoxGet('/v2/test', options);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('keeps instruments isolated in the cache', async () => {
    fetchMock.mockResolvedValueOnce(response({ data: { price: 123 } })).mockResolvedValueOnce(response({ data: { price: 456 } }));
    const first = await client.upstoxGet('/v2/test', { query: { instrument_key: 'A' }, ttlMs: 1000 });
    const second = await client.upstoxGet('/v2/test', { query: { instrument_key: 'B' }, ttlMs: 1000 });
    expect(first).not.toEqual(second);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([500, 502, 503])('retries transient HTTP %i once', async status => {
    fetchMock.mockResolvedValueOnce(response({}, status)).mockResolvedValueOnce(response({ data: [] }));
    const result = expect(client.upstoxGet('/v2/test')).resolves.toEqual({ data: [] });
    await vi.runAllTimersAsync();
    await result;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('bounds timeouts to two attempts and clears the failed in-flight request', async () => {
    fetchMock.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const result = expect(client.upstoxGet('/v2/test', { timeoutMs: 100 })).rejects.toMatchObject({ providerCode: 'TIMEOUT' });
    await vi.runAllTimersAsync();
    await result;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockResolvedValue(response({ data: [] }));
    await expect(client.upstoxGet('/v2/test')).resolves.toEqual({ data: [] });
  });

  it('does not send credentials to another origin or fetch without configuration', async () => {
    await expect(client.upstoxGet('https://example.com/test')).rejects.toMatchObject({ providerCode: 'INVALID_ENDPOINT' });
    vi.stubEnv('UPSTOX_ANALYTICS_TOKEN', '');
    await expect(client.upstoxGet('/v2/test')).rejects.toMatchObject({ providerCode: 'AUTH_REQUIRED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
