import { describe, expect, it } from 'vitest'
import { isSameOriginMutation, readBoundedJson, safeAuthReturnPath } from '../../src/services/server/security'
import { rateLimit } from '../../src/services/server/rate-limit'

describe('OAuth callback redirect safety', () => {
  it('allows relative in-site navigation', () => {
    expect(safeAuthReturnPath('/account')).toBe('/account')
    expect(safeAuthReturnPath('/watchlist?tab=1')).toBe('/watchlist?tab=1')
  })
  it('blocks external and ambiguous destinations', () => {
    for (const value of ['https://phishing.example/', '//phishing.example/', '/\\phishing.example',
      '/%2fphishing.example/', '/%5cphishing.example/', '/%0d%0aLocation:%20https://bad.example']) {
      expect(safeAuthReturnPath(value)).toBe('/account')
    }
  })
  it('defaults to account on malformed URLs', () => {
    expect(safeAuthReturnPath(null)).toBe('/account')
    expect(safeAuthReturnPath('%broken')).toBe('/account')
  })
})

describe('same-origin mutation policy', () => {
  const target = 'https://www.credonomics.in/api/watchlists'
  it('accepts valid same-origin authenticated browser requests', () => {
    expect(isSameOriginMutation(new Request(target, { headers: { origin: 'https://www.credonomics.in', 'sec-fetch-site': 'same-origin' } }))).toBe(true)
  })
  it('rejects forged cross-site and null origins', () => {
    expect(isSameOriginMutation(new Request(target, { headers: { origin: 'https://evil.example' } }))).toBe(false)
    expect(isSameOriginMutation(new Request(target, { headers: { origin: 'null' } }))).toBe(false)
    expect(isSameOriginMutation(new Request(target, { headers: { 'sec-fetch-site': 'cross-site' } }))).toBe(false)
  })
})

describe('bounded JSON reading', () => {
  it('parses small bodies', async () => {
    expect(await readBoundedJson(new Request('https://www.credonomics.in/api/watchlist/quotes', {
      method: 'POST', body: JSON.stringify({ instrumentKeys: ['x'] }),
    }), 80)).toEqual({ instrumentKeys: ['x'] })
  })
  it('accepts normal stock-search text', () => {
    const controlCharacters = /[\u0000-\u001f\u007f]/
    expect(controlCharacters.test('Reliance')).toBe(false)
    expect(controlCharacters.test('TCS')).toBe(false)
    expect(controlCharacters.test('bad\nline')).toBe(true)
  })
  it('rejects oversized content even when Content-Length is missing', async () => {
    expect(await readBoundedJson(new Request('https://www.credonomics.in/api/watchlist/quotes', {
      method: 'POST', body: JSON.stringify({ value: 'a'.repeat(1024) }),
    }), 128)).toBeNull()
  })
})

describe('best-effort local throttling', () => {
  it('limits consecutive events per key', () => {
    const key = 'security-test-key'
    expect(rateLimit(key, 2)).toBe(true)
    expect(rateLimit(key, 2)).toBe(true)
    expect(rateLimit(key, 2)).toBe(false)
  })
})
