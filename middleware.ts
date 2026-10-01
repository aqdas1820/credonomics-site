import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { previewWritesBlocked } from './src/lib/supabase/mutation-safety'

const canonicalHost = 'www.credonomics.in'

export async function middleware(request: NextRequest) {
  const locked = previewWritesBlocked()
  const path = request.nextUrl.pathname
  const cloudMutation = /^\/api\/(alerts|watchlists|notifications)(\/|$)/.test(path) && path !== '/api/alerts/evaluate' && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
  if (locked && (cloudMutation || path === '/api/alerts/evaluate' && request.nextUrl.searchParams.get('scope') === 'cloud' || path === '/api/alerts/evaluate' && request.method === 'GET' || path === '/auth/callback' || path === '/api/auth/callback')) {
    return NextResponse.json({ error: { code: 'PREVIEW_WRITES_BLOCKED', message: 'Cloud changes are unavailable until the staging backend is connected.' } }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin')
    if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: { message: 'Invalid request origin.' } }, { status: 403 })
  }
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase()

  if (host === 'credonomics.in') {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = canonicalHost
    return NextResponse.redirect(url, 308)
  }

  let response = NextResponse.next({ request })
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(url&&key&&!locked){const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});await client.auth.getUser()}
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
