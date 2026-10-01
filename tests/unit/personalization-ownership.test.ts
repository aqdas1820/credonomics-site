import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('server-only', () => ({}))
const mocks = vi.hoisted(() => ({ auth: vi.fn(), actions: vi.fn() }))
vi.mock('../../src/lib/supabase/server', () => ({ authenticatedUser: mocks.auth }))
vi.mock('../../src/lib/supabase/admin', () => ({ createSupabaseAdminClient: () => { throw new Error('Normal user routes must not use service role') } }))
vi.mock('../../src/services/market-data/market-data-service', () => ({ getMarketDataProvider: () => ({ getCorporateActions: mocks.actions }) }))
import { GET as getNotifications, PUT as putNotifications } from '../../app/api/notifications/route'
import { GET as getEvents } from '../../app/api/dashboard/events/route'

let calls: Array<{ table: string; method: string; args: unknown[] }>
let dbError: Error | null
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv('VERCEL_ENV', 'test'); vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Network forbidden') })); vi.spyOn(console,'error').mockImplementation(() => {})
  calls = []; dbError = null
  mocks.auth.mockResolvedValue({ user: { id: 'session-owner' }, client: { from: (table: string) => {
    const query: Record<string, unknown> = {}
    for (const method of ['select','eq','in','is','order','limit','update']) query[method] = (...args: unknown[]) => { calls.push({table,method,args}); return query }
    query.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ error: dbError, count: 73, data: table === 'watchlists' ? [{id:'owned-list'}] : table === 'watchlist_items' ? [{instrument_key:'BSE_EQ|INE467B01029',symbol:'TCS',company_name:'Fixture'}] : [] }).then(resolve)
    return query
  } } })
  mocks.actions.mockResolvedValue({data:[]})
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks() })
describe('personalization query ownership contracts (mocked, no user writes)', () => {
  it('notification rows and full unread count both use verified owner', async () => {
    const response = await getNotifications()
    expect((await response.json()).unreadCount).toBe(73)
    expect(calls.filter(c=>c.method==='eq')).toEqual([{table:'notifications',method:'eq',args:['user_id','session-owner']},{table:'notifications',method:'eq',args:['user_id','session-owner']}])
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
  it('notification mutations ignore supplied owner and arbitrary content', async () => {
    const response = await putNotifications(new NextRequest('https://preview.invalid/api/notifications',{method:'PUT',body:JSON.stringify({markAllRead:true,user_id:'untrusted-owner',title:'untrusted'})}))
    expect(response.status).toBe(200)
    expect(calls.find(c=>c.method==='update')?.args[0]).toEqual({read_at:expect.any(String)})
    expect(calls.find(c=>c.method==='eq')?.args).toEqual(['user_id','session-owner'])
  })
  it('persistence failure is never returned as success', async () => { dbError = new Error('fixture'); const r = await putNotifications(new NextRequest('https://preview.invalid/api/notifications',{method:'PUT',body:JSON.stringify({markAllRead:true})})); expect(r.status).toBe(500); expect((await r.json()).success).toBeUndefined() })
  it('dashboard queries only owned lists/items and preserves BSE event identity', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-30T06:00:00Z'))
    mocks.actions.mockResolvedValue({data:[{type:'dividend',exDate:'2026-10-01',amount:5},{type:'dividend',exDate:'2026-10-01',amount:5},{type:'bonus',exDate:null}]})
    try {
      const body = await (await getEvents()).json()
      expect(body.data.upcomingEvents).toHaveLength(1); expect(body.data.dividends[0].exchange).toBe('BSE')
      expect(calls.find(c=>c.table==='watchlists'&&c.method==='eq')?.args).toEqual(['user_id','session-owner'])
      expect(calls.find(c=>c.table==='watchlist_items'&&c.method==='in')?.args).toEqual(['watchlist_id',['owned-list']])
    } finally { vi.useRealTimers() }
  })
  it('database failure is not a successful empty calendar', async () => { dbError = new Error('fixture'); expect((await getEvents()).status).toBe(500); expect(mocks.actions).not.toHaveBeenCalled() })
})
