import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { hostedPersonalReady } from './src/lib/billing/personal-config'
import { isBillingAdmin } from './app/billing/admin-policy'

const canonicalHost = 'www.credonomics.in'

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase()

  if (host === 'credonomics.in') {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = canonicalHost
    return NextResponse.redirect(url, 308)
  }

  if (request.nextUrl.pathname.startsWith('/pay/i/')) {
    const headers = { 'Cache-Control': 'private, no-store, max-age=0',
      'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet' }
    if (process.env.YOUPI_PAYMENT_LINK_ENABLED !== 'true' || process.env.YOUPI_LINK_LEDGER_APPROVED !== 'true') {
      return new NextResponse('Not Found', { status: 404, headers })
    }
    // Bearer pages revalidate the invoice and durable ledger on the server.
    // Avoid unrelated Auth cookie refresh and remote Auth calls for these URLs.
    const response = NextResponse.next({ request })
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
    return response
  }

  // Dedicated TEST workspace. Page and every API request independently verify owner access.
  // It does not enable any existing billing flag or touch the financial ledger.
  if (request.nextUrl.pathname === '/personal-testing' || request.nextUrl.pathname.startsWith('/personal-testing/') ||
      request.nextUrl.pathname === '/api/personal-testing' || request.nextUrl.pathname.startsWith('/api/personal-testing/')) {
    const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy':'no-referrer' }
    const local = process.env.NODE_ENV === 'development' && process.env.PERSONAL_TESTING_RUNTIME === 'loopback' && !process.env.VERCEL && !process.env.RAILWAY_ENVIRONMENT_ID
    // Deny before rendering: streamed React notFound() can otherwise carry HTTP 200.
    const deny = () => new NextResponse('Not Found', { status:404, headers })
    if (process.env.PERSONAL_TESTING_ENABLED !== 'true' || (!local && !hostedPersonalReady())) return deny()
    let response = NextResponse.next({ request })
    if (!local) {
      try {
        const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
          cookies: { getAll: () => request.cookies.getAll(), setAll: values => {
            values.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            values.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          } },
        })
        const { data: { user }, error } = await client.auth.getUser()
        if (error || !isBillingAdmin(user, process.env.PERSONAL_TESTING_OWNER_ID) || user?.id.toLowerCase() !== process.env.PERSONAL_TESTING_OWNER_ID?.toLowerCase()) return deny()
      } catch { return deny() }
    }
    Object.entries(headers).forEach(([key,value]) => response.headers.set(key,value))
    return response
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
