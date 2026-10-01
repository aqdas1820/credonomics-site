import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseConfigured } from './config'
import { guardedSupabaseFetch } from './mutation-safety'

export async function createSupabaseServerClient() {
  if (!supabaseConfigured()) return null
  const store = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { global: { fetch: guardedSupabaseFetch }, cookies: { getAll: () => store.getAll(), setAll: values => { try { values.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {} } } })
}

export async function authenticatedUser() {
  const client = await createSupabaseServerClient()
  if (!client) return { client: null, user: null }
  const { data: { user } } = await client.auth.getUser()
  return { client, user }
}
