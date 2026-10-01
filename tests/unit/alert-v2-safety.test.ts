import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { alertMatches } from '../../src/domain/watchlist/alerts'
import { corporateEvents, cooldownElapsed, eventDate, indiaDate, ipoMilestone, priceEventKey } from '../../src/domain/watchlist/events'
import type { MarketQuote } from '../../src/domain/equity/types'
import type { PriceAlert } from '../../src/domain/watchlist/types'

vi.mock('server-only', () => ({}))
const mocks = vi.hoisted(() => ({ admin: vi.fn(), quotes: vi.fn(), actions: vi.fn() }))
vi.mock('../../src/lib/supabase/admin', () => ({ createSupabaseAdminClient: mocks.admin }))
vi.mock('../../src/services/market-data/market-data-service', () => ({ getMarketDataProvider: () => ({ getQuotes: mocks.quotes, getCorporateActions: mocks.actions }) }))
vi.mock('../../src/domain/market/session', () => ({ getIndianMarketSession: () => 'OPEN' }))
import { evaluateCloudAlertsV2 } from '../../src/services/alerts/evaluation-service'
const now = new Date('2026-09-29T19:00:00Z') // Sep 30 IST, Sep 29 UTC
const quote = { instrumentKey: 'NSE_EQ|INE467B01029', price: 100, changePercent: 5, fiftyTwoWeekHigh: 100, fiftyTwoWeekLow: 100, availability: 'recent' } as MarketQuote
const alert = (type: PriceAlert['type'] = 'price_above', threshold: number | null = 100) => ({ id: 'a', instrumentKey: quote.instrumentKey, type, threshold, status: 'active' }) as PriceAlert
const row = (type = 'price_above', more = {}) => ({ id: 'a', user_id: 'A', entity_type: 'STOCK', instrument_key: quote.instrumentKey, symbol: 'TCS', company_name: 'TCS', exchange: 'NSE', alert_type: type, threshold: 100, status: 'active', cooldown_until: null, created_at: '2026-09-01', ...more })
type Row = ReturnType<typeof row>
let rows: Row[], ipos: Record<string, unknown>[], rpc: ReturnType<typeof vi.fn>, calls: Array<{ table: string; method: string; args: unknown[] }>
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv('VERCEL_ENV', 'test'); vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Live network forbidden in isolated QA') }))
  rows = [row()]; ipos = []; calls = []
  const notifications = new Set<string>()
  rpc = vi.fn(async (_name, args) => {
    const key = `${args.alert_id}:${args.event_dedupe_key}`
    if (notifications.has(key)) return { data: false, error: null }
    notifications.add(key); return { data: true, error: null }
  })
  mocks.admin.mockReturnValue({ rpc, from: (table: string) => {
    const filters: Record<string, unknown> = {}; let update = false
    const query: Record<string, unknown> = {}
    for (const method of ['select', 'eq', 'or', 'order', 'limit', 'in', 'update']) query[method] = (...args: unknown[]) => {
      calls.push({ table, method, args }); if (method === 'eq') filters[String(args[0])] = args[1]; if (method === 'update') update = true; return query
    }
    query.then = (resolve: (x: unknown) => unknown) => Promise.resolve({ data: update ? null : table === 'ipos' ? ipos : rows.filter(r => !filters.user_id || r.user_id === filters.user_id), error: null }).then(resolve)
    return query
  } })
  mocks.quotes.mockResolvedValue({ data: [quote] }); mocks.actions.mockResolvedValue({ data: [] })
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('price safety', () => {
  it.each([['price_above', 99, true], ['price_above', 100, true], ['price_above', 101, false], ['price_below', 101, true], ['price_below', 100, true], ['price_below', 99, false]] as const)('%s boundary %s', (type, threshold, result) => expect(alertMatches(alert(type, threshold), quote)).toBe(result))
  it.each([null, undefined, NaN, Infinity, -1, 0, '100', {}, []])('rejects malformed or missing price %j', price => expect(alertMatches(alert(), { ...quote, price } as MarketQuote)).toBe(false))
  it.each(['stale', 'unavailable', 'unknown'])('rejects %s', availability => expect(alertMatches(alert(), { ...quote, availability } as MarketQuote)).toBe(false))
  it('rejects provenance stale flag and wrong entity', () => { expect(alertMatches(alert(), { ...quote, isStale: true })).toBe(false); expect(alertMatches(alert(), { ...quote, instrumentKey: 'other' })).toBe(false) })
  it.each(['paused','disabled','expired','triggered'])('rejects %s alert', status => expect(alertMatches({ ...alert(), status } as PriceAlert, quote)).toBe(false))
  it('validates percentage and range values', () => {
    expect(alertMatches(alert('percent_rise', 5), quote)).toBe(true)
    expect(alertMatches(alert('percent_fall', 5), { ...quote, changePercent: -5 })).toBe(true)
    expect(alertMatches(alert('52_week_high', null), quote)).toBe(true)
    expect(alertMatches(alert('52_week_low', null), quote)).toBe(true)
    expect(alertMatches(alert('percent_rise', 5), { ...quote, changePercent: Infinity })).toBe(false)
    expect(alertMatches(alert('52_week_low', null), { ...quote, fiftyTwoWeekLow: Infinity })).toBe(false)
  })
})
describe('event identity and clock boundaries', () => {
  it.each([null, undefined, '', '2026-02-30', 'yesterday', 123])('does not manufacture date %j', value => expect(eventDate(value)).toBeNull())
  it('uses IST evaluation day without changing source event date', () => { expect(indiaDate(now)).toBe('2026-09-30'); expect(priceEventKey('a', now)).toBe('price_a_2026-09-30') })
  it('deduplicates deterministically regardless of provider order or description', () => {
    const data = [{ type: 'dividend', exDate: '2026-09-30', description: 'B' }, { type: 'DIVIDEND', exDate: '2026-09-30', description: 'A' }]
    expect(corporateEvents('x', data)).toEqual(corporateEvents('x', [...data].reverse()))
    expect(corporateEvents('x', data)).toHaveLength(1)
    expect(corporateEvents('y', data)[0].key).not.toBe(corporateEvents('x', data)[0].key)
  })
  it('does not keyword-match descriptions or fabricate absent dates', () => expect(corporateEvents('x', [{ type: 'other', description: 'no dividend', exDate: '2026-09-30' }, { type: 'dividend' }, null])).toEqual([]))
  it('cooldown boundary is inclusive and invalid cooldowns fail closed', () => { expect(cooldownElapsed(now.toISOString(), now)).toBe(true); expect(cooldownElapsed(new Date(+now + 1).toISOString(), now)).toBe(false); expect(cooldownElapsed('bad', now)).toBe(false); expect(cooldownElapsed(null, now)).toBe(true) })
  it.each(['ipo_open','ipo_close','ipo_listing'])('%s uses actual milestone date', type => {
    const ipo = { open_date: '2026-09-30', close_date: '2026-09-30', listing_date: '2026-09-30' }
    expect(ipoMilestone('example', type, ipo, now)?.key).toContain(type)
    expect(ipoMilestone('example', type, {}, now)).toBeNull()
    expect(ipoMilestone('example', type, ipo, new Date('2026-10-02'))).toBeNull()
  })
})
describe('server evaluator with an isolated database double', () => {
  it('scopes per-user reads/updates and confirms persistence', async () => {
    rows.push(row('price_above', { id: 'b', user_id: 'B' }))
    expect((await evaluateCloudAlertsV2('A', now)).triggeredIds).toEqual(['a'])
    expect(calls.filter(c => c.method === 'eq' && c.args[0] === 'user_id')).toHaveLength(2)
  })
  it('repeated CRON invocation has identical event keys and counts only claimed notifications', async () => {
    expect((await evaluateCloudAlertsV2(undefined, now)).triggered).toBe(1)
    expect((await evaluateCloudAlertsV2(undefined, now)).triggered).toBe(0)
    expect(rpc.mock.calls[0][1].event_dedupe_key).toBe(rpc.mock.calls[1][1].event_dedupe_key)
  })
  it.each(['dividend','bonus','split','buyback','rights','earnings'])('evaluates exact %s event and suppresses repeated provider event', async type => {
    rows = [row(`event_${type}`)]
    mocks.actions.mockResolvedValue({ data: [{ type, exDate: '2026-09-30' }, { type, exDate: '2026-09-30' }] })
    expect((await evaluateCloudAlertsV2('A', now)).triggered).toBe(1)
    expect((await evaluateCloudAlertsV2('A', now)).triggered).toBe(0)
    expect(rpc.mock.calls[0][1].cooldown_interval).toBeNull()
  })
  it.each(['ipo_open','ipo_close','ipo_listing'])('evaluates %s without duplicates', async type => {
    rows = [row(type, { entity_type: 'IPO', instrument_key: 'example' })]
    ipos = [{ slug: 'example', open_date: '2026-09-30', close_date: '2026-09-30', listing_date: '2026-09-30' }]
    expect((await evaluateCloudAlertsV2('A', now)).triggered).toBe(1)
    expect((await evaluateCloudAlertsV2('A', now)).triggered).toBe(0)
  })
  it.each([null, {}, [null, {}]])('malformed provider payload %j cannot trigger', async data => { mocks.quotes.mockResolvedValue({ data }); expect((await evaluateCloudAlertsV2('A', now)).triggered).toBe(0); expect(rpc).not.toHaveBeenCalled() })
  it.each(['stale','unavailable'])('%s quote cannot reach persistence', async availability => { mocks.quotes.mockResolvedValue({ data: [{ ...quote, availability }] }); expect((await evaluateCloudAlertsV2('A', now)).triggered).toBe(0); expect(rpc).not.toHaveBeenCalled() })
  it('missing event date cannot trigger', async () => { rows = [row('event_dividend')]; mocks.actions.mockResolvedValue({ data: [{ type: 'dividend', exDate: null }] }); expect((await evaluateCloudAlertsV2('A', now)).triggered).toBe(0) })
  it('honors cooldown before fetching provider or triggering', async () => { rows = [row('price_above', { cooldown_until: new Date(+now + 1).toISOString() })]; expect((await evaluateCloudAlertsV2('A', now)).checked).toBe(0); expect(mocks.quotes).not.toHaveBeenCalled() })
  it.each(['timeout','429','500','502','503'])('provider %s fails without success or notification writes', async failure => { mocks.quotes.mockRejectedValue(new Error(failure)); await expect(evaluateCloudAlertsV2('A', now)).rejects.toThrow(failure); expect(rpc).not.toHaveBeenCalled() })
  it('Supabase rejection never reports successful notification', async () => { rpc.mockResolvedValue({ data: true, error: new Error('database unavailable') }); await expect(evaluateCloudAlertsV2('A', now)).rejects.toThrow('database unavailable') })
  it('Preview guard blocks even direct service invocations before DB access', async () => { vi.stubEnv('VERCEL_ENV', 'preview'); vi.stubEnv('SUPABASE_BACKEND_ENV', 'production'); await expect(evaluateCloudAlertsV2('A', now)).rejects.toThrow('staging'); expect(mocks.admin).not.toHaveBeenCalled() })
})
