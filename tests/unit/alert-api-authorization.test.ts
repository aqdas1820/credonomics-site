import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('server-only', () => ({}))
const mocks = vi.hoisted(() => ({ auth: vi.fn(), evaluate: vi.fn(), quotes: vi.fn(), rate: vi.fn() }))
vi.mock('../../src/lib/supabase/server', () => ({ authenticatedUser: mocks.auth }))
vi.mock('../../src/services/alerts/evaluation-service', () => ({ evaluateCloudAlertsV2: mocks.evaluate }))
vi.mock('../../src/services/market-data/market-data-service', () => ({ getMarketDataProvider: () => ({ getQuotes: mocks.quotes }) }))
vi.mock('../../src/services/server/rate-limit', () => ({ rateLimit: mocks.rate }))
import { GET, POST } from '../../app/api/alerts/evaluate/route'
import { GET as notifications, PUT as markRead } from '../../app/api/notifications/route'
import { GET as dashboard } from '../../app/api/dashboard/events/route'
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('CRON_SECRET','fixture-secret'); mocks.auth.mockResolvedValue({ user: null, client: null }); mocks.rate.mockReturnValue(true); vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Network forbidden') })) })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
describe('server authorization without database access', () => {
  it('signed-out cloud evaluation cannot reach service-role evaluator', async () => { expect((await POST(new NextRequest('https://preview.invalid/api/alerts/evaluate?scope=cloud',{method:'POST'}))).status).toBe(401); expect(mocks.evaluate).not.toHaveBeenCalled() })
  it('uses verified session ID, not a caller-provided owner', async () => { mocks.auth.mockResolvedValue({user:{id:'A'}}); mocks.evaluate.mockResolvedValue({triggered:0}); await POST(new NextRequest('https://preview.invalid/api/alerts/evaluate?scope=cloud&userId=B',{method:'POST',body:JSON.stringify({userId:'B'})})); expect(mocks.evaluate).toHaveBeenCalledWith('A') })
  it.each(['','Bearer wrong'])('CRON rejects missing/incorrect secret %s', async authorization => { expect((await GET(new NextRequest('https://preview.invalid/api/alerts/evaluate',{headers:{authorization}}))).status).toBe(401); expect(mocks.evaluate).not.toHaveBeenCalled() })
  it('missing server CRON secret is never accepted', async () => { vi.stubEnv('CRON_SECRET',''); expect((await GET(new NextRequest('https://preview.invalid/api/alerts/evaluate',{headers:{authorization:'Bearer '}}))).status).toBe(401) })
  it('authenticated CRON invokes evaluator and safely reports failures', async () => { mocks.evaluate.mockRejectedValue(new Error('fixture')); expect((await GET(new NextRequest('https://preview.invalid/api/alerts/evaluate',{headers:{authorization:'Bearer fixture-secret'}}))).status).toBe(503) })
  it('notification/dashboard endpoints require session before queries', async () => { expect((await notifications()).status).toBe(401); expect((await markRead(new NextRequest('https://preview.invalid/api/notifications',{method:'PUT'}))).status).toBe(401); expect((await dashboard()).status).toBe(401) })
  it.each([null, {}, [null], [42]])('device evaluation rejects malformed provider data %j safely', async data => {
    mocks.quotes.mockResolvedValue({data})
    const response = await POST(new NextRequest('https://preview.invalid/api/alerts/evaluate',{method:'POST',body:JSON.stringify({alerts:[{id:'a',instrumentKey:'NSE_EQ|INE467B01029',type:'price_above',status:'active',threshold:100}]})}))
    expect(response.status).toBe(502); expect(response.headers.get('cache-control')).toBe('no-store')
  })
})
