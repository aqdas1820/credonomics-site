import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../src/lib/supabase/server'
import { safeRedirectPath } from '../../../src/lib/auth-redirect'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = safeRedirectPath(url.searchParams.get('next'))
  const code = url.searchParams.get('code')
  try {
    const client = await createSupabaseServerClient()
    if (code && client) {
      const { error } = await client.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(new URL(next, url.origin))
    }
  } catch { /* Show a retry path without exposing provider details. */ }
  const destination = new URL('/login', url.origin)
  destination.searchParams.set('error', 'Invalid_Auth_Code')
  destination.searchParams.set('next', next)
  return NextResponse.redirect(destination)
}
