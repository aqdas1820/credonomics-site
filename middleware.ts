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

  let response = NextResponse.next({ request })
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(url&&key){const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});await client.auth.getUser()}
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
