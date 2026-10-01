import { withProvenance, aggregateProvenance } from '../../domain/provenance'
import 'server-only'
import { financialGrowth, financialMargin, type CompanyFinancials, type FinancialPeriod, type FinancialPoint, type FinancialRatio, type PeerMetric, type ShareholdingQuarter, type StatementRow } from '../../domain/equity/financial-intelligence'
import type { IndianEquityIdentity } from '../../domain/equity/types'
import type { DetailedFinancialPeriod, PeriodType } from '../../domain/research/historical-intelligence'
import { upstoxGet, getUpstoxProvenance } from '../../lib/upstox/client'
import { searchInstrumentMaster } from './instrument-master'

type History = { period?: string; value?: unknown; change?: string }
type Line = { category?: string; particular?: string; name?: string; company_value?: unknown; sector_value?: unknown; history?: History[] }
type Statement = { income_statement?: Line[]; cash_flow?: Line[]; history?: Array<{ period?: string; total_asset?: unknown; total_liability?: unknown }>; full_statement?: Line[] }
const TTL = 43_200_000
const n = (value: unknown) => { const parsed = typeof value === 'string' ? Number(value.replace(/[,%×]/g, '')) : value; return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null }
const change = (value?: string) => n(value)
const clean = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null
const periodTime = (period: string) => { const time = Date.parse(`1 ${period}`); return Number.isFinite(time) ? time : 0 }
const identity = (key: string) => searchInstrumentMaster(key.split('|').at(-1) ?? key, 25).find(x => x.instrumentKey === key || x.symbol.toUpperCase() === key.toUpperCase() || x.isin === key) ?? null
const series = (lines: Line[] | undefined, category: string): FinancialPoint[] => (lines?.find(x => x.category === category)?.history ?? []).flatMap(x => clean(x.period) ? [{ period: x.period!, value: n(x.value), change: change(x.change) }] : [])
const lineRows = (lines: Line[] | undefined): StatementRow[] => (lines ?? []).flatMap(x => {
  const label = clean(x.particular); if (!label) return []
  const values = (x.history ?? []).flatMap(h => clean(h.period) ? [{ period: h.period!, value: n(h.value) }] : [])
  return values.some(v => v.value !== null) ? [{ label, values }] : []
})
const valueFor = (rows: StatementRow[], labels: RegExp, period?: string) => rows.find(row => labels.test(row.label))?.values.find(v => !period || v.period === period)?.value ?? null
const ratiosFrom = (lines: Line[] | undefined): FinancialRatio[] => (lines ?? []).flatMap(item => {
  const label = clean(item.name); if (!label) return []
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const kind = /roe|roce|roa|margin|yield/i.test(label) ? 'percent' : /market cap|enterprise value/i.test(label) ? 'money' : 'multiple'
  return [{ key, label, value: n(item.company_value), sectorValue: n(item.sector_value), kind }]
})
function periods(lines: Line[] | undefined, incomeRows: StatementRow[], frequency: 'quarterly' | 'annual'): FinancialPeriod[] {
  const revenueSeries = series(lines, 'revenue').sort((a,b) => periodTime(b.period)-periodTime(a.period)), operating = series(lines, 'operating_profit'), profit = series(lines, 'net_profit')
  return revenueSeries.map((item, index) => {
    const rawRev = valueFor(incomeRows, /^Revenue from Operations|Operating Revenue/i, item.period);
    const rev = rawRev !== null ? rawRev : item.value;
    const rawOp = operating.find(x => x.period === item.period)?.value ?? null;
    const op = valueFor(incomeRows, /^Operating Profit/i, item.period) ?? rawOp;
    const net = profit.find(x => x.period === item.period)?.value ?? null;
    
    let yearBase = null;
    if (frequency === 'quarterly' && index + 4 < revenueSeries.length) {
      yearBase = valueFor(incomeRows, /^Revenue from Operations|Operating Revenue/i, revenueSeries[index + 4]!.period) ?? revenueSeries[index + 4]!.value;
    } else if (frequency === 'annual' && index + 1 < revenueSeries.length) {
      yearBase = valueFor(incomeRows, /^Revenue from Operations|Operating Revenue/i, revenueSeries[index + 1]!.period) ?? revenueSeries[index + 1]!.value;
    }
    const yoy = financialGrowth(rev, yearBase);

    let qoq = null;
    if (frequency === 'quarterly' && index + 1 < revenueSeries.length) {
      const qBase = valueFor(incomeRows, /^Revenue from Operations|Operating Revenue/i, revenueSeries[index + 1]!.period) ?? revenueSeries[index + 1]!.value;
      qoq = financialGrowth(rev, qBase);
    }

    return { period: item.period, revenue: rev, operatingProfit: op, netProfit: net, eps: valueFor(incomeRows, /^EPS\s*-?\s*(Basic|Diluted)?$/i, item.period), operatingMargin: financialMargin(op, rev), yoy, qoq }
  }).filter((item, index, all) => all.findIndex(x => x.period === item.period) === index).sort((a,b) => periodTime(b.period) - periodTime(a.period))
}
function shareholding(data: Array<{ category?: string; history?: History[] }> | undefined): ShareholdingQuarter[] {
  const categories = new Map((data ?? []).map(x => [x.category, x.history ?? []])); const periods = [...new Set([...categories.values()].flat().flatMap(x => clean(x.period) ? [x.period!] : []))]
  const get = (key: string, period: string) => n(categories.get(key)?.find(x => x.period === period)?.value)
  return periods.map(period => ({ period, promoter: get('promoters', period), fii: get('fii', period), dii: get('other_dii', period), mutualFunds: get('mutual_funds', period), public: get('retail_and_other', period) })).sort((a,b) => periodTime(b.period) - periodTime(a.period))
}
async function peerMetrics(raw: Array<Record<string, unknown>> | undefined, current: IndianEquityIdentity): Promise<PeerMetric[]> {
  const candidates = [{ instrument_key: current.instrumentKey, sector: current.sector }, ...(raw ?? [])].slice(0, 6)
  return Promise.all(candidates.map(async item => {
    const key = clean(item.instrument_key) ?? current.instrumentKey; const isin = key.split('|').at(-1)!; const found = identity(key)
    let ratios: FinancialRatio[] = []; try { const response = await upstoxGet<{ data?: Line[] }>(`/v2/fundamentals/${isin}/key-ratios`, { ttlMs: TTL }); ratios = ratiosFrom(response.data) } catch {}
    return { instrumentKey: key, symbol: found?.symbol ?? null, companyName: found?.companyName ?? null, sector: clean(item.sector) ?? found?.sector ?? null, industry: found?.industry ?? null, description: clean(item.company_profile), ratios, current: key === current.instrumentKey, reportingPeriod: null }
  }))
}
export async function getCompanyFinancialIntelligence(instrumentKey: string): Promise<CompanyFinancials | null> {
  const stock = identity(instrumentKey); if (!stock?.isin) return null; const base = `/v2/fundamentals/${stock.isin}`
  const safe = async <T,>(request: Promise<T>, fallback: T): Promise<T> => { try { return await request } catch { return fallback } }
  const [profile, quarterly, annual, balance, cash, ratio, holdings, competitors] = await Promise.all([
    safe(upstoxGet<{ data?: Record<string, unknown> }>(`${base}/profile`, { ttlMs: TTL }), {}),
    safe(upstoxGet<{ data?: Statement }>(`${base}/income-statement`, { query: { type: 'consolidated', time_period: 'quarterly' }, ttlMs: TTL }), {}),
    safe(upstoxGet<{ data?: Statement }>(`${base}/income-statement`, { query: { type: 'consolidated', time_period: 'yearly', fs: true }, ttlMs: TTL }), {}),
    safe(upstoxGet<{ data?: Statement }>(`${base}/balance-sheet`, { query: { type: 'consolidated', fs: true }, ttlMs: TTL }), {}),
    safe(upstoxGet<{ data?: Statement }>(`${base}/cash-flow`, { query: { type: 'consolidated', fs: true }, ttlMs: TTL }), {}),
    safe(upstoxGet<{ data?: Line[] }>(`${base}/key-ratios`, { ttlMs: TTL }), {}), safe(upstoxGet<{ data?: Array<{ category?: string; history?: History[] }> }>(`${base}/share-holdings`, { ttlMs: TTL }), {}),
    safe(upstoxGet<{ data?: Array<Record<string, unknown>> }>(`/v2/fundamentals/${encodeURIComponent(stock.instrumentKey)}/competitors`, { ttlMs: TTL }), {}),
  ])
  const incomeRows = lineRows(annual.data?.full_statement), balanceRows = lineRows(balance.data?.full_statement), cashRows = lineRows(cash.data?.full_statement)
  const annualPeriods = periods(annual.data?.income_statement, incomeRows, 'annual'), quarterlyPeriods = periods(quarterly.data?.income_statement, [], 'quarterly')
  const latest = annualPeriods[0], period = latest?.period; const operatingCashFlow = series(cash.data?.cash_flow, 'operating')[0]?.value ?? null
  const capex = valueFor(cashRows, /purchase.*(property|plant|equipment)|capital expenditure/i, period)
  const verifiedSector = clean(profile.data?.sector) ?? stock.sector ?? null
  
  const toDetailed = (ps: FinancialPeriod[], type: 'Q' | 'FY'): DetailedFinancialPeriod[] => {
    return ps.map(p => {
      const yearMatch = p.period.match(/\b(20\d\d)\b/);
      const fiscalYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      let periodType: PeriodType = type === 'Q' ? 'Q4' : 'FY';
      if (type === 'Q') {
        if (/Jun/i.test(p.period)) periodType = 'Q1';
        else if (/Sep/i.test(p.period)) periodType = 'Q2';
        else if (/Dec/i.test(p.period)) periodType = 'Q3';
        else if (/Mar/i.test(p.period)) periodType = 'Q4';
      }
      return {
        periodType,
        fiscalYear,
        fiscalQuarter: type === 'Q' ? parseInt(periodType.replace('Q','')) : undefined,
        periodStart: null,
        periodEnd: null,
        reportedAt: null,
        sourcePublishedAt: null,
        source: 'Upstox',
        availability: p.revenue !== null && p.netProfit !== null ? 'complete' : 'partial',
        periodLabel: p.period,
        revenue: p.revenue,
        operatingProfit: p.operatingProfit,
        ebitda: valueFor(incomeRows, /EBITDA/i, p.period),
        netProfit: p.netProfit,
        eps: p.eps,
        totalAssets: valueFor(balanceRows, /^Total Assets$/i, p.period),
        totalDebt: valueFor(balanceRows, /total debt|borrowings/i, p.period),
        cashEquivalents: valueFor(balanceRows, /cash.*equivalent/i, p.period),
        netDebt: null,
        equity: valueFor(balanceRows, /equity|net worth/i, p.period),
        operatingCashFlow: valueFor(cashRows, /operating/i, p.period),
        investingCashFlow: valueFor(cashRows, /investing/i, p.period),
        financingCashFlow: valueFor(cashRows, /financing/i, p.period),
        freeCashFlow: null,
        operatingMargin: p.operatingMargin,
        netMargin: financialMargin(p.netProfit, p.revenue),
        roe: null,
        roce: null
      };
    });
  }

  return { ...stock, profile: { description: clean(profile.data?.company_profile), sector: verifiedSector, industry: stock.industry ?? null, website: null }, quarterly: quarterlyPeriods, annual: annualPeriods, historicalQuarterly: toDetailed(quarterlyPeriods, 'Q'), historicalAnnual: toDetailed(annualPeriods, 'FY'), statements: { income: incomeRows, balanceSheet: balanceRows, cashFlow: cashRows }, summary: { revenue: latest?.revenue ?? null, operatingProfit: latest?.operatingProfit ?? null, ebitda: valueFor(incomeRows, /EBITDA/i, period), netProfit: latest?.netProfit ?? null, eps: latest?.eps ?? null, totalAssets: n(balance.data?.history?.[0]?.total_asset) ?? valueFor(balanceRows, /^Total Assets$/i, period), totalDebt: valueFor(balanceRows, /total debt|borrowings/i, period), cashEquivalents: valueFor(balanceRows, /cash.*equivalent/i, period), operatingCashFlow, freeCashFlow: operatingCashFlow !== null && capex !== null ? operatingCashFlow + capex : null }, ratios: ratiosFrom(ratio.data), shareholding: shareholding(holdings.data), peers: await peerMetrics(competitors.data, { ...stock, sector: verifiedSector }), statementType: 'consolidated', units: 'crore', reportingPeriod: period ?? null, ...aggregateProvenance([profile, quarterly, annual, balance, cash, ratio, holdings, competitors].map(raw => withProvenance({ source: 'Upstox API', asOf: null, generatedAt: new Date().toISOString(), quality: 'unknown', availability: 'unavailable' }, getUpstoxProvenance(raw))), 'Upstox API') }
}
