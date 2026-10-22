import { rateLimit } from './rate-limit'

/** Reject protocol-relative, backslash, encoded and absolute redirect targets. */
export function safeAuthReturnPath(candidate: string | null): string {
  if (!candidate || candidate.length > 2048 || !candidate.startsWith('/') || candidate.startsWith('//')) return '/account'
  try {
    const decoded = decodeURIComponent(candidate)
    if (decoded.startsWith('//') || decoded.includes('\\') || /[\u0000-\u001f\u007f]/.test(decoded)) return '/account'
    const target = new URL(candidate, 'https://www.credonomics.in')
    if (target.origin !== 'https://www.credonomics.in') return '/account'
    return target.pathname + target.search + target.hash
  } catch { return '/account' }
}

/** Defense in depth for cookie-authenticated state-changing APIs. */
export function isSameOriginMutation(request: Request): boolean {
  const site = request.headers.get('sec-fetch-site')
  if (site === 'cross-site') return false
  const origin = request.headers.get('origin')
  // Fail closed for legacy/ambiguous cookie-authenticated POSTs without either header.
  if (origin === null) return site === 'same-origin'
  try { return new URL(origin).origin === new URL(request.url).origin }
  catch { return false }
}

/**
 * Per-isolate abuse protection; NOT a replacement for distributed/WAF limits.
 * Proxy-provided IP is a best-effort identifier, never authentication.
 */
export function clientRateLimit(request: Request, scope: string, limit: number, windowMs = 60_000): boolean {
  const remote = request.headers.get('x-real-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  return rateLimit(scope + ':' + remote.slice(0, 80), limit, windowMs)
}

/** Read a bounded JSON body based on actual bytes, not Content-Length alone. */
export async function readBoundedJson(request: Request, maxBytes = 16_384): Promise<unknown | null> {
  const declared = Number(request.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) return null
  if (!request.body) return null
  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let bytes = 0
  let raw = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > maxBytes) { await reader.cancel(); return null }
      raw += decoder.decode(value, { stream: true })
    }
    raw += decoder.decode()
    return JSON.parse(raw)
  } catch { try { await reader.cancel() } catch {} return null }
}

/** Only equity instrument keys are accepted by the public stock endpoints. */
export function validEquityInstrumentKey(value: unknown): value is string {
  return typeof value === 'string' && /^(NSE|BSE)_EQ\|INE[A-Z0-9]{9}$/.test(value)
}
