import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Json = Record<string, unknown>
const object = (v: unknown): Json => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Json : {}
const text = (v: unknown): string => typeof v === 'string' ? v.trim() : ''
const numeric = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isFinite(n) && n > 0 ? n : null
}
const fail = (message: string, status: number) =>
  NextResponse.json({ data: null, error: { code: status === 400 ? 'INVALID_INPUT' : 'SOURCE_UNAVAILABLE', message } }, { status, headers: { 'Cache-Control': 'no-store' } })
const ok = (data: unknown) => NextResponse.json({ data, error: null }, { headers: { 'Cache-Control': 'public, s-maxage=300' } })

async function sourceJson(url: string, ttl: number): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: ttl }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('upstream unavailable: ' + res.status)
  return res.json() as Promise<unknown>
}

/**
 * All upstream hosts and paths are fixed. User input is strictly allowlisted
 * before interpolation so the public proxy cannot be used for SSRF or arbitrary
 * external requests. No auth or payment flows are involved.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const tool = p.get('tool')
  try {
    if (tool === 'mf-search') {
      const query = (p.get('q') || '').trim()
      if (query.length < 3 || query.length > 80 || !/^[\p{L}\p{N} .&()-]+$/u.test(query)) return fail('Enter a scheme name of 3 to 80 letters/numbers.', 400)
      const items = await sourceJson('https://api.mfapi.in/mf/search?q=' + encodeURIComponent(query), 1800)
      if (!Array.isArray(items)) throw new Error('Unexpected MF search response')
      const results = items.slice(0, 12).map(item => {
        const row = object(item)
        const code = numeric(row.schemeCode)
        return { schemeCode: code, schemeName: text(row.schemeName) }
      }).filter(item => item.schemeCode !== null && item.schemeName)
      return ok({ results, source: 'MFapi.in' })
    }
    if (tool === 'mf-nav') {
      const code = p.get('code') || ''
      if (!/^\d{5,8}$/.test(code)) return fail('Enter a valid mutual fund scheme code.', 400)
      const result = object(await sourceJson('https://api.mfapi.in/mf/' + code + '/latest', 1800))
      const meta = object(result.meta)
      const first = Array.isArray(result.data) ? object(result.data[0]) : {}
      const nav = numeric(first.nav)
      if (!nav || !text(meta.scheme_name) || !text(first.date)) throw new Error('Incomplete MF NAV response')
      return ok({ schemeCode: code, schemeName: text(meta.scheme_name), fundHouse: text(meta.fund_house), category: text(meta.scheme_category), nav, date: text(first.date), source: 'MFapi.in' })
    }
    if (tool === 'ifsc') {
      const code = (p.get('code') || '').trim().toUpperCase()
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) return fail('Enter an 11-character IFSC (example HDFC0000001).', 400)
      const row = object(await sourceJson('https://ifsc.razorpay.com/' + code, 86400))
      if (!text(row.IFSC) || !text(row.BANK) || text(row.IFSC) !== code) throw new Error('Incomplete IFSC record')
      return ok({ ifsc: code, bank: text(row.BANK), branch: text(row.BRANCH), address: text(row.ADDRESS), city: text(row.CITY), district: text(row.DISTRICT), state: text(row.STATE), rtgs: row.RTGS === true, neft: row.NEFT === true, imps: row.IMPS === true, source: 'Razorpay IFSC Toolkit' })
    }
    if (tool === 'fx') {
      const base = (p.get('base') || 'USD').toUpperCase()
      const quote = (p.get('quote') || 'INR').toUpperCase()
      const allowed = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'JPY', 'CAD', 'AUD']
      if (!allowed.includes(base) || !allowed.includes(quote) || base === quote) return fail('Choose two different supported currencies.', 400)
      const row = object(await sourceJson('https://api.frankfurter.dev/v2/rate/' + base + '/' + quote, 86400))
      const rate = numeric(row.rate)
      if (!rate || !text(row.date)) throw new Error('Incomplete currency rate')
      return ok({ base, quote, rate, date: text(row.date), source: 'Frankfurter (official reference rates)', kind: 'reference' })
    }
    if (tool === 'metal') {
      const metal = p.get('metal') || 'gold'
      if (metal !== 'gold' && metal !== 'silver') return fail('Choose gold or silver.', 400)
      if (metal === 'gold') {
        const row = object(await sourceJson('https://api.goldprice.dev/v1/carat?currency=INR', 3600))
        const perGram24k = numeric(row.price_gram_24k)
        if (!perGram24k || !text(row.timestamp)) throw new Error('Incomplete gold quote')
        return ok({ metal, currency: 'INR', perGram: perGram24k, perGram22k: numeric(row.price_gram_22k), perGram18k: numeric(row.price_gram_18k), timestamp: text(row.timestamp), delayed: true, source: 'goldprice.dev' })
      }
      const row = object(await sourceJson('https://api.goldprice.dev/v1/convert?from=XAG&to=INR&amount=1&unit=gram', 3600))
      const perGram = numeric(row.result)
      if (!perGram || !text(row.timestamp)) throw new Error('Incomplete silver quote')
      return ok({ metal, currency: 'INR', perGram, timestamp: text(row.timestamp), delayed: true, source: 'goldprice.dev' })
    }
    return fail('Choose a supported data tool.', 400)
  } catch {
    // Never echo upstream payloads, request URLs, or exceptions to end users.
    return fail('Data provider is temporarily unavailable. No estimate is shown.', 502)
  }
}
