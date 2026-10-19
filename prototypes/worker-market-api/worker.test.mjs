import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createQuoteWorker } from './worker.mjs'
const env = { EDGE_API_KEY: 'synthetic-edge-key-for-local-tests-only', UPSTOX_ACCESS_TOKEN: 'synthetic-provider-fixture-only', MARKET_READ_ENABLED: 'true', MARKET_DATA_ENTITLEMENT_APPROVED: 'true' }
const key = 'NSE_EQ|INE002A01018'
const request = (query = `instrumentKey=${encodeURIComponent(key)}`, options = {}) => new Request('https://example.test/api/v1/market/quote?' + query, { headers: { authorization: 'Bearer ' + env.EDGE_API_KEY }, ...options })
const fixture = () => Response.json({ status: 'success', data: { synthetic: { instrument_token: key, last_price: 100, access_token: 'must-not-escape' } } })
test('defaults unavailable, rejects unauthenticated and preserves provider entitlement boundary', async () => {
  let calls = 0; const worker = createQuoteWorker(async () => { calls++; return fixture() })
  assert.equal((await worker.fetch(request())).status, 401)
  assert.equal((await worker.fetch(request(), { EDGE_API_KEY: env.EDGE_API_KEY })).status, 503)
  assert.equal((await worker.fetch(request(), { ...env, MARKET_DATA_ENTITLEMENT_APPROVED: 'false' })).status, 503)
  assert.equal(calls, 0)
})
test('returns bounded snapshot projection and fixes upstream origin/path without relaying credentials', async () => {
  const worker = createQuoteWorker(async (url, options) => {
    assert.equal(url.origin, 'https://api.upstox.com'); assert.equal(url.pathname, '/v2/market-quote/quotes')
    assert.equal(options.redirect, 'error'); return fixture()
  })
  const response = await worker.fetch(request(), env); assert.equal(response.status, 200)
  const body = await response.text(); assert(!body.includes('must-not-escape')); assert(!body.includes(env.UPSTOX_ACCESS_TOKEN))
  assert.equal(JSON.parse(body).meta.isLive, false)
})
test('rejects duplicates, SSRF inputs, writes and cross-origin access before provider fetch', async () => {
  let calls = 0; const worker = createQuoteWorker(async () => { calls++; return fixture() })
  for (const query of ['instrumentKey=https://attacker.invalid', `instrumentKey=${key}&instrumentKey=${key}`, `instrumentKey=${key}&url=https://attacker.invalid`]) assert.equal((await worker.fetch(request(query), env)).status, 400)
  assert.equal((await worker.fetch(request(undefined, { method: 'POST' }), env)).status, 405)
  assert.equal((await worker.fetch(request(undefined, { headers: { authorization: 'Bearer ' + env.EDGE_API_KEY, origin: 'https://attacker.invalid' } }), env)).status, 403)
  assert.equal(calls, 0)
})
test('fails mismatched, oversized, invalid and failed provider responses closed', async () => {
  for (const response of [Response.json({ status: 'success', data: { q: { instrument_token: 'other', last_price: 100 } } }), new Response('x'.repeat(32769)), Response.json({ status: 'error' }), new Response('private details', { status: 401 })]) {
    const r = await createQuoteWorker(async () => response).fetch(request(), env)
    assert.equal(r.status, 502); assert(!((await r.text()).includes('private details')))
  }
})
