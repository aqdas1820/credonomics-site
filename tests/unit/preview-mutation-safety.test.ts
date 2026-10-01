import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('server-only', () => ({}))
vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn(() => { throw new Error('Unexpected SDK access') }) }))
import { guardedSupabaseFetch, previewWritesBlocked } from '../../src/lib/supabase/mutation-safety'
import { middleware } from '../../middleware'
import { assertBrowserAuthAllowed } from '../../src/lib/supabase/auth-safety'
import { GET as getAuthSafety } from '../../app/api/auth/safety/route'
beforeEach(() => { vi.stubEnv('VERCEL_ENV','preview'); vi.stubEnv('SUPABASE_BACKEND_ENV','production'); vi.stubEnv('SUPABASE_STAGING_PROJECT_REF','stagefixture'); vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://prodfixture.supabase.co'); vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('{}'))) })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
describe('Preview write safety', () => {
  it('reports only verified non-secret Preview identity', async () => {
    vi.stubEnv('SUPABASE_STAGING_PROJECT_REF', 'abcdefghijklmnopqrst')
    vi.stubEnv('SUPABASE_BACKEND_ENV', 'staging')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abcdefghijklmnopqrst.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'must-never-be-returned')
    const response = getAuthSafety()
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ mutationsAllowed: true, previewIdentity: {
      environment: 'preview', backend: 'staging', projectRef: 'abcdefghijklmnopqrst', hostname: 'abcdefghijklmnopqrst.supabase.co',
    } })
  })
  it('reports valid mismatched identifiers while keeping writes blocked', async () => {
    vi.stubEnv('SUPABASE_BACKEND_ENV', 'staging')
    vi.stubEnv('SUPABASE_STAGING_PROJECT_REF', 'abcdefghijklmnopqrst')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://zyxwvutsrqponmlkjihg.supabase.co')
    expect(await getAuthSafety().json()).toEqual({ mutationsAllowed: false, previewIdentity: {
      environment: 'preview', backend: 'staging', projectRef: 'abcdefghijklmnopqrst', hostname: 'zyxwvutsrqponmlkjihg.supabase.co',
    } })
  })
  it('withholds unverified identifiers and leaves Production response unchanged', async () => {
    expect(await getAuthSafety().json()).toEqual({ mutationsAllowed: false, previewIdentity: {
      environment: 'preview', backend: 'unverified', projectRef: null, hostname: null,
    } })
    vi.stubEnv('VERCEL_ENV', 'production')
    expect(await getAuthSafety().json()).toEqual({ mutationsAllowed: true })
  })
  it.each(['production','','unknown'])('blocks %s backend', kind => { vi.stubEnv('SUPABASE_BACKEND_ENV',kind); expect(previewWritesBlocked()).toBe(true) })
  it('requires both staging declaration and exact pinned project', () => { vi.stubEnv('SUPABASE_BACKEND_ENV','staging'); expect(previewWritesBlocked()).toBe(true); vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://stagefixture.supabase.co'); expect(previewWritesBlocked()).toBe(false) })
  it.each(['http://stagefixture.supabase.co','https://stagefixture.supabase.co.evil.invalid','https://stagefixture.supabase.co:444','not a URL'])('rejects malformed/mismatched URL %s', url => { vi.stubEnv('SUPABASE_BACKEND_ENV','staging'); vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL',url); expect(previewWritesBlocked()).toBe(true) })
  it('does not disable Production behavior', () => { vi.stubEnv('VERCEL_ENV','production'); expect(previewWritesBlocked()).toBe(false) })
  it.each(['POST','PATCH','PUT','DELETE'])('blocks %s SDK writes before network', async method => { await expect(guardedSupabaseFetch('https://prodfixture.supabase.co/rest/v1/alerts',{method})).rejects.toThrow('staging'); expect(fetch).not.toHaveBeenCalled() })
  it('blocks GET RPC execution but permits ordinary reads', async () => { await expect(guardedSupabaseFetch('https://prodfixture.supabase.co/rest/v1/rpc/trigger_alert_v2')).rejects.toThrow('staging'); await guardedSupabaseFetch('https://prodfixture.supabase.co/rest/v1/alerts'); expect(fetch).toHaveBeenCalledTimes(1) })
  it.each(['/api/alerts','/api/alerts/id','/api/watchlists','/api/watchlists/id/items','/api/notifications','/api/alerts/evaluate?scope=cloud'])('blocks route %s before auth/provider', async path => { expect((await middleware(new NextRequest(`https://preview.example${path}`,{method:'POST'}))).status).toBe(503); expect(fetch).not.toHaveBeenCalled() })
  it.each(['/api/alerts/evaluate','/auth/callback?code=fixture','/api/auth/callback?code=fixture'])('blocks mutating GET %s', async path => expect((await middleware(new NextRequest(`https://preview.example${path}`))).status).toBe(503))
  it.each(['/api/alerts','/api/watchlists','/api/notifications','/api/dashboard/events','/api/auth/safety'])('preserves read route %s', async path => expect((await middleware(new NextRequest(`https://preview.example${path}`))).status).toBe(200))
  it('permits device evaluation with no DB write', async () => expect((await middleware(new NextRequest('https://preview.example/api/alerts/evaluate',{method:'POST'}))).status).toBe(200))
  it('browser auth fails closed on negative/malformed server permission', async () => { vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({mutationsAllowed:false}))); await expect(assertBrowserAuthAllowed()).rejects.toThrow('staging') })
})
