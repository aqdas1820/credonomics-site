import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findInstrument } from '../../../../src/services/market-data/instrument-master'
import SiteFrame from '../../../components/SiteFrame'
import StockDetailClient from './StockDetailClient'

type Props = { params: Promise<{ exchange: string; symbol: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const params = await paramsPromise
  const stock = findInstrument(params.exchange, params.symbol)
  if (!stock) return { title: 'Stock unavailable' }
  const ogUrl = `https://www.credonomics.in/api/og?title=${encodeURIComponent(stock.companyName)}&subtitle=${encodeURIComponent(stock.symbol + ' | ' + stock.exchange)}`
  return {
    title: `${stock.companyName} (${stock.symbol})`,
    description: `Verified ${stock.exchange} security identity and available market data for ${stock.companyName}.`,
    alternates: { canonical: `/stocks/${stock.exchange.toLowerCase()}/${encodeURIComponent(stock.symbol)}` },
    openGraph: {
      images: [ogUrl]
    }
  }
}

export default async function StockPage({ params: paramsPromise }: Props) {
  const params = await paramsPromise
  const stock = findInstrument(params.exchange, decodeURIComponent(params.symbol))
  if (!stock) notFound()
  return <SiteFrame><StockDetailClient stock={stock} /></SiteFrame>
}
