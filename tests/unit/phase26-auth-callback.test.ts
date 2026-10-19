import { afterEach, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ client: vi.fn(), exchange: vi.fn() }))
vi.mock('../../src/lib/supabase/server', () => ({ createSupabaseServerClient: mocks.client }))
import { GET } from '../../app/auth/callback/route'
import { safeAuthReturn } from '../../app/auth/safe-return'
afterEach(() => vi.resetAllMocks())
it('rejects external, protocol-relative, backslash and control-character OAuth return locations', () => {
  for (const path of [null, '', 'https://evil.example', '//evil.example', '/\\evil.example', '/\nevil', 'javascript:alert(1)']) expect(safeAuthReturn(path)).toBe('/account')
  expect(safeAuthReturn('/personal-testing')).toBe('/personal-testing')
  expect(safeAuthReturn('/account?tab=saved')).toBe('/account?tab=saved')
})
const request = (query: string) => new NextRequest('https://www.credonomics.in/auth/callback?' + query)
it('only returns to a safe same-origin path after a successful server code exchange', async () => {
  mocks.client.mockResolvedValue({ auth: { exchangeCodeForSession: mocks.exchange } }); mocks.exchange.mockResolvedValue({ error: null })
  const response = await GET(request('code=SYNTHETIC&next=https%3A%2F%2Fevil.example'))
  expect(response.headers.get('location')).toBe('https://www.credonomics.in/account')
  expect(response.headers.get('cache-control')).toContain('no-store'); expect(mocks.exchange).toHaveBeenCalledWith('SYNTHETIC')
})
it('missing configuration, missing code, rejected exchange and exceptions never redirect to the owner workspace', async () => {
  mocks.client.mockResolvedValue(null)
  expect((await GET(request('code=SYNTHETIC&next=/personal-testing'))).headers.get('location')).toContain('/account?auth=unavailable')
  expect((await GET(request('next=/personal-testing'))).headers.get('location')).toContain('/account?auth=failed')
  mocks.client.mockResolvedValue({ auth: { exchangeCodeForSession: mocks.exchange } }); mocks.exchange.mockResolvedValue({ error: new Error('synthetic') })
  expect((await GET(request('code=SYNTHETIC&next=/personal-testing'))).headers.get('location')).toContain('/account?auth=failed')
  mocks.exchange.mockRejectedValue(new Error('synthetic outage'))
  expect((await GET(request('code=SYNTHETIC&next=/personal-testing'))).headers.get('location')).toContain('/account?auth=failed')
})
