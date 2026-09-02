import { NextRequest, NextResponse } from 'next/server'
import { getMarketDataProvider } from '../../../../src/services/market-data/market-data-service'
import { getIndianMarketSession } from '../../../../src/domain/market/session'

const validKey = /^(NSE|BSE)_EQ\|INE[A-Z0-9]{9}$/
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { instrumentKeys?: unknown } | null
  if (!Array.isArray(body?.instrumentKeys)) return NextResponse.json({ data: null, error: { code: 'INVALID_REQUEST', message: 'Instrument keys are required.' } }, { status: 400 })
  const keys = [...new Set(body.instrumentKeys.filter((key): key is string => typeof key === 'string'))]
  if (!keys.length || keys.length > 50 || keys.some((key) => !validKey.test(key))) return NextResponse.json({ data: null, error: { code: 'INVALID_INSTRUMENTS', message: 'Provide 1–50 valid equity instruments.' } }, { status: 400 })
  const result = await getMarketDataProvider().getQuotes(keys)
  return NextResponse.json({ ...result, marketSession: getIndianMarketSession() }, { status: result.error ? 502 : 200, headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=30' } })
}
