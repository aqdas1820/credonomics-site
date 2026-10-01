import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../src/lib/upstox/client', () => ({ upstoxGet: mocks.get, getUpstoxProvenance: () => ({ delivery: "provider", fetchedAt: null, cachedAt: null }), hasUpstoxAnalyticsToken: () => true, UpstoxApiError: class extends Error {} }));
vi.mock('../../src/services/market-data/instrument-master', () => ({ searchInstrumentMaster: () => [{ instrumentKey: 'NSE_EQ|INE467B01029', isin: 'INE467B01029', symbol: 'TCS', exchange: 'NSE', companyName: 'TCS' }] }));
import { UpstoxMarketDataProvider } from '../../src/providers/market/upstox-provider';
const provider = new UpstoxMarketDataProvider();
afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });
describe('provider observation dates', () => {
  it.each(['getFundamentals', 'getShareholding', 'getCorporateActions'] as const)('%s never substitutes retrieval time for missing observation time', async method => {
    mocks.get.mockResolvedValue({ data: [] });
    const result = await provider[method]('NSE_EQ|INE467B01029');
    expect(result.metadata.asOf).toBeNull();
    expect(result.metadata.availability).toBe('unavailable');
    expect(result.metadata.generatedAt).toBeTruthy();
    expect(result.error).toBeUndefined();
  });
  it('old intraday candles remain stale during an open market', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-29T05:00:00Z'));
    mocks.get.mockResolvedValue({ data: { candles: [['2026-08-01T09:15:00+05:30', 10, 12, 9, 11, 100]] } });
    const result = await provider.getIntradayPrices('NSE_EQ|INE467B01029');
    expect(result.metadata).toMatchObject({ availability: 'stale', asOf: '2026-08-01T03:45:00.000Z', session: 'previous' });
  });
});
