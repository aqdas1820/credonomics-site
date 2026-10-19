import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../src/lib/supabase/server'
import { safeAuthReturn } from '../safe-return'

export async function GET(request: NextRequest) {
  const redirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url))
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Referrer-Policy', 'no-referrer')
    return response
  }
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return redirect('/account?auth=failed')
  try {
    const client = await createSupabaseServerClient()
    if (!client) return redirect('/account?auth=unavailable')
    const { error } = await client.auth.exchangeCodeForSession(code)
    if (error) return redirect('/account?auth=failed')
    return redirect(safeAuthReturn(request.nextUrl.searchParams.get('next')))
  } catch { return redirect('/account?auth=failed') }
}
