import { useState, useEffect } from 'react'
import type { CompanyFundamentals, CorporateAction, MarketQuote, Shareholding } from '../../../../src/domain/equity/types'
import type { CompanyFinancials } from '../../../../src/domain/equity/financial-intelligence'
import { fetchJson } from '../../../../src/lib/client-json'
type Result<T> = { data: T | null; metadata: { availability: string; asOf: string | null }; error?: { message: string } }
const unavailable = <T,>(): Result<T> => ({ data: null, metadata: { availability: 'unavailable', asOf: null }, error: { message: 'Data temporarily unavailable.' } })

export function useMarketData(instrumentKey: string) {
  const [quote, setQuote] = useState<Result<MarketQuote> | null>(null)
  const [fundamentals, setFundamentals] = useState<Result<CompanyFundamentals> | null>(null)
  const [shareholding, setShareholding] = useState<Result<Shareholding> | null>(null)
  const [actions, setActions] = useState<Result<CorporateAction[]> | null>(null)
  const [financials, setFinancials] = useState<Result<CompanyFinancials> | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const load = <T,>(endpoint: string, set: (result: Result<T> | null) => void) => {
      set(null)
      fetchJson<Result<T>>(`/api/stocks/${endpoint}?instrumentKey=${encodeURIComponent(instrumentKey)}`, { signal: controller.signal })
        .then(result => { if (!controller.signal.aborted) set(result) })
        .catch(() => { if (!controller.signal.aborted) set(unavailable<T>()) })
    }
    load('quote', setQuote)
    load('fundamentals', setFundamentals)
    load('shareholding', setShareholding)
    load('corporate-actions', setActions)
    load('financial-intelligence', setFinancials)
    return () => controller.abort()
  }, [instrumentKey])
  return { quote, fundamentals, shareholding, actions, financials }
}
