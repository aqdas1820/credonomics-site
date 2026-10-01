'use client'
import { createBrowserClient } from '@supabase/ssr'
import { assertBrowserAuthAllowed } from './auth-safety'
const guardedFetch: typeof fetch = async (input, init) => {
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) || url.pathname.startsWith('/rest/v1/rpc/')) await assertBrowserAuthAllowed()
  return fetch(input, init)
}
export function createSupabaseBrowserClient() { const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;return url&&key?createBrowserClient(url,key,{global:{fetch:guardedFetch}}):null }
