import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const canonicalHost = 'www.credonomics.in'

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase()

  if (host === 'credonomics.in') {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = canonicalHost
    return NextResponse.redirect(url, 308)
  }

  // Deny hosted invoice portal until explicitly enabled; page performs verified admin authorization.
  if ((request.nextUrl.pathname === '/billing' || request.nextUrl.pathname.startsWith('/billing/')) && process.env.BILLING_PORTAL_ENABLED !== 'true') {
    return new NextResponse('Not Found', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } })
  }

  // Internal billing API remains disabled until explicit activation. Every API
  // handler must additionally enforce trusted auth, role and database checks.
  if ((request.nextUrl.pathname === '/api/billing' || request.nextUrl.pathname.startsWith('/api/billing/')) &&
      process.env.BILLING_API_ENABLED !== 'true') {
    return new NextResponse('Not Found', {
      status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
    })
  }

  let response = NextResponse.next({ request })
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(url&&key){const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});await client.auth.getUser()}
  if (request.nextUrl.pathname.startsWith('/billing')) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
