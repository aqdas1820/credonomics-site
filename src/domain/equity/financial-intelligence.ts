import type { FinancialDataMetadata } from '../financial-data'
import type { IndianEquityIdentity } from './types'

export type FinancialPoint = { period: string; value: number | null; change: number | null }
export type StatementRow = { label: string; values: Array<{ period: string; value: number | null }> }
export type FinancialPeriod = {
  period: string
  revenue: number | null
  operatingProfit: number | null
  netProfit: number | null
  eps: number | null
  operatingMargin: number | null
  yoy: number | null
  qoq: number | null
}
export type FinancialRatio = { key: string; label: string; value: number | null; sectorValue: number | null; kind: 'percent' | 'multiple' | 'money' }
export type ShareholdingQuarter = { period: string; promoter: number | null; fii: number | null; dii: number | null; mutualFunds: number | null; public: number | null }
export type PeerMetric = { instrumentKey: string; symbol: string | null; companyName: string | null; sector: string | null; description: string | null; ratios: FinancialRatio[]; current: boolean }
export function financialGrowth(current: number | null, base: number | null): number | null { return current !== null && base !== null && base !== 0 ? (current - base) / Math.abs(base) * 100 : null }
export function financialMargin(profit: number | null, revenue: number | null): number | null { return profit !== null && revenue !== null && revenue !== 0 ? profit / revenue * 100 : null }

export type CompanyFinancials = IndianEquityIdentity & FinancialDataMetadata & {
  profile: { description: string | null; sector: string | null; industry: string | null; website: string | null }
  quarterly: FinancialPeriod[]
  annual: FinancialPeriod[]
  statements: { income: StatementRow[]; balanceSheet: StatementRow[]; cashFlow: StatementRow[] }
  summary: {
    revenue: number | null; operatingProfit: number | null; ebitda: number | null; netProfit: number | null; eps: number | null
    totalAssets: number | null; totalDebt: number | null; cashEquivalents: number | null; operatingCashFlow: number | null; freeCashFlow: number | null
  }
  ratios: FinancialRatio[]
  shareholding: ShareholdingQuarter[]
  peers: PeerMetric[]
  statementType: 'consolidated' | 'standalone'
  units: 'crore'
}
