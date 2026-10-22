import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../src/lib/supabase/server'
import { safeAuthReturnPath } from '../../../src/services/server/security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = safeAuthReturnPath(request.nextUrl.searchParams.get('next'))
  if (code) {
    const client = await createSupabaseServerClient()
    await client?.auth.exchangeCodeForSession(code)
  }
  // Use an explicit trusted origin, not attacker-controlled redirect URLs.
  const response = NextResponse.redirect(new URL(next, request.nextUrl.origin))
  response.headers.set('Cache-Control', 'no-store')
  return response
}
