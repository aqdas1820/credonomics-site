import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { clientRateLimit, isSameOriginMutation } from './src/services/server/security'

const canonicalHost = 'www.credonomics.in'

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase()

  if (host === 'credonomics.in') {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = canonicalHost
    return NextResponse.redirect(url, 308)
  }

  const pathname = request.nextUrl.pathname
  const mutating = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)
  const protectedMutation =
    pathname === '/api/account/signout' ||
    pathname === '/api/watchlist/quotes' ||
    pathname.startsWith('/api/watchlists') ||
    pathname.startsWith('/api/alerts')
  if (mutating && protectedMutation && !isSameOriginMutation(request)) {
    return NextResponse.json({ data: null, error: { code: 'FORBIDDEN_ORIGIN', message: 'Cross-site request denied.' } }, {
      status: 403, headers: { 'Cache-Control': 'no-store' },
    })
  }

  // Extra best-effort per-instance shield for quota-backed market APIs.
  // Provider caches and a shared WAF/rate limiter remain important.
  const expensiveGet = request.method === 'GET' &&
    (pathname.startsWith('/api/stocks/') || pathname.startsWith('/api/markets/') || pathname === '/api/public-data')
  const expensivePost = request.method === 'POST' &&
    (pathname === '/api/watchlist/quotes' || pathname === '/api/alerts/evaluate')
  if ((expensiveGet || expensivePost) &&
      !clientRateLimit(request, expensivePost ? 'market-post' : 'market-get', expensivePost ? 45 : 120)) {
    return NextResponse.json({ data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again shortly.' } }, {
      status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
    })
  }

  let response = NextResponse.next({ request })
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(url&&key){const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});await client.auth.getUser()}
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
