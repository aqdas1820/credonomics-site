import { expect, it } from 'vitest'
import { authCookieOptions } from '../../src/lib/supabase/cookie-policy'
it('production Auth cookies require HTTPS and allow same-site OAuth redirects', () => {
  expect(authCookieOptions(true)).toEqual({path:'/',sameSite:'lax',secure:true})
  expect(authCookieOptions(false)).toEqual({path:'/',sameSite:'lax',secure:false})
})
