/** CSRF guard for browser-originated invoice write requests. */
export function sameOrigin(origin: string | null, expectedOrigin: string): boolean {
  if (!origin) return false
  try {
    const incoming = new URL(origin)
    const expected = new URL(expectedOrigin)
    return !incoming.username && !incoming.password && incoming.pathname === '/' && !incoming.search && !incoming.hash &&
      (incoming.protocol === 'https:' || (incoming.protocol === 'http:' && (incoming.hostname === 'localhost' || incoming.hostname === '127.0.0.1'))) &&
      incoming.origin === expected.origin
  } catch {
    return false
  }
}
