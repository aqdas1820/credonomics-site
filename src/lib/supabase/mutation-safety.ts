import 'server-only'

/** Unknown Preview backends are treated as Production until explicitly pinned. */
export function previewWritesBlocked() {
  if (process.env.VERCEL_ENV !== 'preview') return false
  const expected = process.env.SUPABASE_STAGING_PROJECT_REF?.trim()
  if (process.env.SUPABASE_BACKEND_ENV !== 'staging' || !expected || !/^[a-z0-9]+$/.test(expected)) return true
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    return url.protocol !== 'https:' || url.hostname !== `${expected}.supabase.co` || url.port !== '' || url.username !== '' || url.password !== ''
  } catch { return true }
}

export function assertSupabaseWritesAllowed() {
  if (previewWritesBlocked()) throw new Error('Cloud changes are unavailable until the staging backend is connected.')
}

/** Defense in depth for every server SDK write, including RPCs invoked via GET. */
export const guardedSupabaseFetch: typeof fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) || url.pathname.startsWith('/rest/v1/rpc/')) assertSupabaseWritesAllowed()
  return fetch(input, init)
}
