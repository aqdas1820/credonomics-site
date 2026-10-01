import { NextRequest, NextResponse } from 'next/server'
import { alertMatches } from '../../../../src/domain/watchlist/alerts'
import type { AlertType, PriceAlert } from '../../../../src/domain/watchlist/types'
import { getMarketDataProvider } from '../../../../src/services/market-data/market-data-service'
import { evaluateCloudAlertsV2 } from '../../../../src/services/alerts/evaluation-service'
import { authenticatedUser } from '../../../../src/lib/supabase/server'
import { rateLimit } from '../../../../src/services/server/rate-limit'
const validKey = /^(NSE|BSE)_EQ\|INE[A-Z0-9]{9}$/
const types = new Set<AlertType>(['price_above', 'price_below', 'percent_rise', 'percent_fall', '52_week_high', '52_week_low'])
export async function POST(request: NextRequest) {
  if (request.nextUrl.searchParams.get('scope') === 'cloud') {
    const { user } = await authenticatedUser()
    if (!user) return NextResponse.json({ error: { message: 'Sign in to evaluate cloud alerts.' } }, { status: 401 })
    if (!rateLimit(`evaluate:${user.id}`, 5)) return NextResponse.json({ error: { message: 'Please wait before evaluating again.' } }, { status: 429 })
    try { return NextResponse.json({ data: await evaluateCloudAlertsV2(user.id) }, { headers: { 'Cache-Control': 'no-store' } }) }
    catch { return NextResponse.json({ error: { message: 'Cloud alert evaluation is temporarily unavailable.' } }, { status: 503 }) }
  }
  if (!rateLimit('device-alert-evaluation', 60)) return NextResponse.json({ error: { message: 'Please wait before evaluating again.' } }, { status: 429 })
  if (Number(request.headers.get('content-length') ?? 0) > 32_768) return NextResponse.json({ data: null, error: { code: 'REQUEST_TOO_LARGE', message: 'Alert request is too large.' } }, { status: 413 })
  const body = await request.json().catch(() => null) as { alerts?: unknown } | null
  if (!Array.isArray(body?.alerts) || !body.alerts.length || body.alerts.length > 100) return NextResponse.json({ data: null, error: { code: 'INVALID_REQUEST', message: 'Provide 1–100 active alerts.' } }, { status: 400 })
  const alerts = body.alerts.filter((value): value is PriceAlert => Boolean(value && typeof value === 'object'))
  const invalid = alerts.length !== body.alerts.length || alerts.some((alert) => typeof alert.id !== 'string' || !validKey.test(alert.instrumentKey) || !types.has(alert.type) || alert.status !== 'active' || (['price_above', 'price_below', 'percent_rise', 'percent_fall'].includes(alert.type) && (typeof alert.threshold !== 'number' || !Number.isFinite(alert.threshold) || alert.threshold <= 0)))
  if (invalid) return NextResponse.json({ data: null, error: { code: 'INVALID_ALERT', message: 'One or more alert conditions are invalid.' } }, { status: 400 })
  const keys = [...new Set(alerts.map((alert) => alert.instrumentKey))]
  if (keys.length > 50) return NextResponse.json({ data: null, error: { code: 'TOO_MANY_INSTRUMENTS', message: 'A maximum of 50 unique instruments can be evaluated.' } }, { status: 400 })
  try {
  const result = await getMarketDataProvider().getQuotes(keys)
  if (!Array.isArray(result.data) || result.data.some(q => !q || typeof q.instrumentKey !== 'string')) throw new Error('Invalid provider response')
  const quotes = new Map(result.data.map((quote) => [quote.instrumentKey, quote]))
  const triggeredIds = alerts.filter((alert) => { const quote = quotes.get(alert.instrumentKey); return quote ? alertMatches(alert, quote) : false }).map((alert) => alert.id)
  return NextResponse.json({ data: { triggeredIds, quotes: result.data }, metadata: result.metadata }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ data: null, error: { code: 'MARKET_DATA_UNAVAILABLE', message: 'Alert evaluation is temporarily unavailable.' } }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
export async function GET(request:NextRequest){const expected=process.env.CRON_SECRET,authorization=request.headers.get('authorization');if(!expected||authorization!==`Bearer ${expected}`)return NextResponse.json({data:null,error:{code:'UNAUTHORIZED',message:'Unauthorized.'}},{status:401});try{return NextResponse.json({data:await evaluateCloudAlertsV2()},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({data:null,error:{code:'EVALUATION_FAILED',message:'Alert evaluation failed safely.'}},{status:503,headers:{'Cache-Control':'no-store'}})}}
