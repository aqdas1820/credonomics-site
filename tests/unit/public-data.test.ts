import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../app/api/public-data/route'

const request = (query: string) => new NextRequest('https://www.credonomics.in/api/public-data?' + query)
const mock = (body: unknown, status = 200) => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('public finance data API', () => {
  it('rejects unsupported tools without contacting the network', async () => {
    const fetcher = mock({})
    const r = await GET(request('tool=unknown'))
    expect(r.status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects invalid IFSC and injection-like scheme queries before fetch', async () => {
    const fetcher = mock({})
    expect((await GET(request('tool=ifsc&code=../../secret'))).status).toBe(400)
    expect((await GET(request('tool=mf-search&q=https%3A%2F%2Fevil.example'))).status).toBe(400)
    expect((await GET(request('tool=mf-nav&code=../../'))).status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('returns sanitized mutual fund search results', async () => {
    const fetcher = mock([{ schemeCode: 125497, schemeName: 'Sample Fund' }, { schemeCode: 'garbage', schemeName: 'Bad' }])
    const r = await GET(request('tool=mf-search&q=HDFC'))
    expect(r.status).toBe(200)
    const json = await r.json()
    expect(json.data.results).toEqual([{ schemeCode: 125497, schemeName: 'Sample Fund' }])
    expect(String(fetcher.mock.calls[0][0])).toContain('/mf/search?q=HDFC')
  })

  it('returns NAV with the actual published valuation date', async () => {
    mock({ meta: { scheme_name: 'Sample Fund', fund_house: 'Example AMC' }, data: [{ date: '30-10-2026', nav: '124.90' }] })
    const r = await GET(request('tool=mf-nav&code=125497'))
    expect(r.status).toBe(200)
    expect((await r.json()).data).toMatchObject({ nav: 124.9, date: '30-10-2026' })
  })

  it('only returns validated IFSC branch records', async () => {
    mock({ IFSC: 'HDFC0000001', BANK: 'HDFC BANK', BRANCH: 'FORT', CITY: 'MUMBAI', RTGS: true })
    const r = await GET(request('tool=ifsc&code=hdfc0000001'))
    expect(r.status).toBe(200)
    expect((await r.json()).data).toMatchObject({ ifsc: 'HDFC0000001', bank: 'HDFC BANK', rtgs: true })
  })

  it('checks pair allowlist and normalizes a dated FX reference rate', async () => {
    const fetcher = mock({ base: 'USD', quote: 'INR', date: '2026-10-30', rate: 87.2 })
    expect((await GET(request('tool=fx&base=ABC&quote=INR'))).status).toBe(400)
    expect((await GET(request('tool=fx&base=USD&quote=USD'))).status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
    const r = await GET(request('tool=fx&base=USD&quote=INR'))
    expect((await r.json()).data).toMatchObject({ rate: 87.2, date: '2026-10-30' })
  })

  it('returns gold INR/gram only from a validated upstream quote', async () => {
    const fetcher = mock({ price_gram_24k: '13121.50', price_gram_22k: '12028.04', timestamp: '2026-11-01T01:00:00Z' })
    const r = await GET(request('tool=metal&metal=gold'))
    expect((await r.json()).data).toMatchObject({ perGram: 13121.5, delayed: true, source: 'goldprice.dev' })
    expect(String(fetcher.mock.calls[0][0])).toContain('/v1/carat?currency=INR')
  })

  it('returns unavailable when upstream errors instead of inventing a financial value', async () => {
    mock({ status: 'error' }, 429)
    const r = await GET(request('tool=metal&metal=silver'))
    expect(r.status).toBe(502)
    expect((await r.json()).data).toBeNull()
  })
})
