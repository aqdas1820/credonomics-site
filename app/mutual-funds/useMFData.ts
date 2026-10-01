import { useState, useEffect } from 'react'
import type { MFPortfolioData } from '../../src/domain/mf/types'
import { fetchJson } from '../../src/lib/client-json'
type Result<T> = { data: T | null; error?: { message: string } }
export function useMFData(isin: string) {
  const [portfolio, setPortfolio] = useState<Result<MFPortfolioData> | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    setPortfolio(null)
    if (!isin) { setPortfolio({ data: null, error: { message: 'No scheme selected.' } }); return }
    fetchJson<Result<MFPortfolioData>>(`/api/mf/portfolio?isin=${encodeURIComponent(isin)}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setPortfolio(result) })
      .catch(() => { if (!controller.signal.aborted) setPortfolio({ data: null, error: { message: 'Mutual fund data temporarily unavailable.' } }) })
    return () => controller.abort()
  }, [isin])
  return { portfolio }
}
