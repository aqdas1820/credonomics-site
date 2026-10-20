/** Supabase SSR uses browser-readable cookies for refresh; production transport must be HTTPS. */
export function authCookieOptions(production = process.env.NODE_ENV === 'production') {
  return { path: '/', sameSite: 'lax' as const, secure: production }
}
