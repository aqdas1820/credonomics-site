// Request-scoped feasibility prototype. Not deployed and not a streaming replacement.
const json = (data, status = 200) => Response.json(data, { status, headers: {
  'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff',
} })
async function equalSecret(a, b) {
  const hash = s => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  const [x, y] = await Promise.all([hash(a), hash(b)])
  const left = new Uint8Array(x); const right = new Uint8Array(y)
  let different = 0; for (let i = 0; i < left.length; i++) different |= left[i] ^ right[i]
  return different === 0
}
async function boundedJson(response) {
  if (!response.body) throw new Error('Unavailable')
  const reader = response.body.getReader(); const parts = []; let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break
      size += value.byteLength
      if (size > 32768) { await reader.cancel(); throw new Error('Unavailable') }
      parts.push(value)
    }
    const all = new Uint8Array(size); let offset = 0
    for (const part of parts) { all.set(part, offset); offset += part.length }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(all))
  } finally { reader.releaseLock() }
}
export function createQuoteWorker(fetcher = fetch) {
  return {
    async fetch(request, env = {}) {
      const url = new URL(request.url)
      if (request.method !== 'GET') return json({ error: 'Method unavailable' }, 405)
      if (url.pathname === '/health') return json({ mode: 'stateless-prototype', streaming: false })
      if (url.pathname !== '/api/v1/market/quote') return json({ error: 'Unavailable' }, 404)
      const auth = request.headers.get('authorization') ?? ''
      if (!env.EDGE_API_KEY || env.EDGE_API_KEY.length < 32 || auth.length > 1024 ||
          !await equalSecret(auth, 'Bearer ' + env.EDGE_API_KEY)) return json({ error: 'Unauthorized' }, 401)
      const origin = request.headers.get('origin')
      if (origin && origin !== env.APPROVED_APP_ORIGIN) return json({ error: 'Forbidden' }, 403)
      if (env.MARKET_READ_ENABLED !== 'true' || env.MARKET_DATA_ENTITLEMENT_APPROVED !== 'true' || !env.UPSTOX_ACCESS_TOKEN) return json({ error: 'Provider unavailable' }, 503)
      const key = url.searchParams.get('instrumentKey')
      if (!key || !/^NSE_EQ\|INE[A-Z0-9]{9}$/.test(key) || [...url.searchParams.keys()].some(k => k !== 'instrumentKey') || url.searchParams.getAll('instrumentKey').length !== 1) return json({ error: 'Invalid instrument' }, 400)
      try {
        const endpoint = new URL('https://api.upstox.com/v2/market-quote/quotes')
        endpoint.searchParams.set('instrument_key', key)
        const response = await fetcher(endpoint, { headers: { Authorization: 'Bearer ' + env.UPSTOX_ACCESS_TOKEN, Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(3000) })
        if (!response.ok) return json({ error: 'Provider unavailable' }, 502)
        const body = await boundedJson(response)
        const values = body?.status === 'success' && body.data && typeof body.data === 'object' ? Object.values(body.data) : []
        if (values.length !== 1) return json({ error: 'Provider unavailable' }, 502)
        const q = values[0]
        if (!q || q.instrument_token !== key || typeof q.last_price !== 'number' || !Number.isFinite(q.last_price) || q.last_price < 0) return json({ error: 'Provider unavailable' }, 502)
        return json({ data: { instrumentKey: key, lastPrice: q.last_price }, meta: { source: 'Upstox', status: 'SNAPSHOT', isLive: false, streaming: false } })
      } catch { return json({ error: 'Provider unavailable' }, 502) }
    },
  }
}
export default createQuoteWorker()
