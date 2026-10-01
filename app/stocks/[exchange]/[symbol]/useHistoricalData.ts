import { useState, useEffect, useMemo } from 'react'
import type { HistoricalPrice, HistoricalRange } from '../../../../src/domain/equity/types'
import { fetchJson } from '../../../../src/lib/client-json'
import { isValidCandle } from '../../../../src/providers/market/upstox-transform'

type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null; session?: 'current' | 'previous'; sessionDate?: string }; error?: { message: string } }

export function useHistoricalData(instrumentKey: string, range: HistoricalRange) {
  const [history, setHistory] = useState<Result<HistoricalPrice[]> | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    setHistory(null)
    fetchJson<Result<HistoricalPrice[]>>(`/api/stocks/history?instrumentKey=${encodeURIComponent(instrumentKey)}&range=${range}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setHistory(result) })
      .catch(() => { if (!controller.signal.aborted) setHistory({ data: null, metadata: { availability: 'unavailable', asOf: null }, error: { message: 'Historical data temporarily unavailable.' } }) })
    return () => controller.abort()
  }, [range, instrumentKey])
  const points = useMemo(() => Array.isArray(history?.data) ? history.data.filter(isValidCandle) : [], [history])
  return { history, points, isIntraday: ['1m', '5m', '15m', '1h', '1D'].includes(range) }
}
