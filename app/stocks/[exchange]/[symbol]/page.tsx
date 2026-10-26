import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findInstrument } from '../../../../src/services/market-data/instrument-master'
import SiteFrame from '../../../components/SiteFrame'
import StockDetailClient from './StockDetailClient'

type Props = { params: Promise<{ exchange: string; symbol: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exchange, symbol } = await params
  const stock = findInstrument(exchange, decodeURIComponent(symbol))
  if (!stock) return { title: 'Stock unavailable' }
  return {
    title: `${stock.companyName} (${stock.symbol})`,
    description: `Verified ${stock.exchange} security identity and available market data for ${stock.companyName}.`,
    alternates: { canonical: `/stocks/${stock.exchange.toLowerCase()}/${encodeURIComponent(stock.symbol)}` },
  }
}

export default async function StockPage({ params }: Props) {
  const { exchange, symbol } = await params
  const stock = findInstrument(exchange, decodeURIComponent(symbol))
  if (!stock) notFound()
  return <SiteFrame><StockDetailClient stock={stock} /></SiteFrame>
}
