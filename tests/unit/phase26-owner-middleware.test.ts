import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), create: vi.fn() }))
vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.create }))
import { middleware } from '../../middleware'
const owner = '11111111-1111-4111-8111-111111111111'
beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('PERSONAL_TESTING_ENABLED', 'true'); vi.stubEnv('PERSONAL_TESTING_RUNTIME', 'hosted')
  vi.stubEnv('PERSONAL_TESTING_ENCRYPTION_KEY', '25'.repeat(32)); vi.stubEnv('PERSONAL_TESTING_OWNER_ID', owner)
  vi.stubEnv('PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF', 'a'.repeat(20)); vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', `https://${'a'.repeat(20)}.supabase.co`)
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-publishable')
  mocks.create.mockReturnValue({ auth: { getUser: mocks.getUser } })
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
})
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks() })
const request = (path = '/personal-testing') => new NextRequest('https://www.credonomics.in' + path)
it('missing or wrong project/configuration denies before Auth or page streaming', async () => {
  for (const [name, value] of [['PERSONAL_TESTING_ENABLED', 'false'], ['PERSONAL_TESTING_RUNTIME', 'loopback'], ['PERSONAL_TESTING_RUNTIME', ''],
    ['PERSONAL_TESTING_OWNER_ID', ''], ['PERSONAL_TESTING_ENCRYPTION_KEY', 'bad'], ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', ' '],
    ['PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF', 'b'.repeat(20)]]) {
    const previous = process.env[name]; vi.stubEnv(name, value)
    const response = await middleware(request()); expect(response.status).toBe(404); expect(response.headers.get('cache-control')).toContain('no-store')
    vi.stubEnv(name, previous)
  }
  expect(mocks.create).not.toHaveBeenCalled()
})
it('denies anonymous, user metadata, string claims, another admin and Auth errors on pages and APIs', async () => {
  for (const user of [null, { id: owner, user_metadata: { billing_admin: true } }, { id: owner, app_metadata: { billing_admin: 'true' } },
    { id: '22222222-2222-4222-8222-222222222222', app_metadata: { billing_admin: true } }]) {
    mocks.getUser.mockResolvedValue({ data: { user }, error: null })
    for (const path of ['/personal-testing', '/api/personal-testing', '/api/personal-testing/session']) expect((await middleware(request(path))).status).toBe(404)
  }
  mocks.getUser.mockRejectedValue(new Error('Synthetic Auth outage')); expect((await middleware(request())).status).toBe(404)
  mocks.getUser.mockResolvedValue({ data: { user: { id: owner, app_metadata: { billing_admin: true } } }, error: new Error('Synthetic invalid session') })
  expect((await middleware(request())).status).toBe(404)
})
it('accepts only the server-verified exact owner and preserves refreshed cookies and privacy headers', async () => {
  mocks.create.mockImplementation((_url, _key, options) => {
    options.cookies.setAll([{ name: 'synthetic-refresh', value: 'synthetic-value', options: { httpOnly: true, secure: true, sameSite: 'lax' } }])
    return { auth: { getUser: mocks.getUser } }
  })
  mocks.getUser.mockResolvedValue({ data: { user: { id: owner, app_metadata: { billing_admin: true } } }, error: null })
  const response = await middleware(request())
  expect(mocks.getUser).toHaveBeenCalledOnce(); expect(response.headers.get('x-middleware-next')).toBe('1')
  expect(response.cookies.get('synthetic-refresh')?.value).toBe('synthetic-value')
  expect(response.headers.get('cache-control')).toContain('no-store'); expect(response.headers.get('x-robots-tag')).toContain('noindex')
  mocks.getUser.mockResolvedValue({ data: { user: { id: owner, app_metadata: { billing_admin: false } } }, error: null })
  expect((await middleware(request())).status).toBe(404)
})
