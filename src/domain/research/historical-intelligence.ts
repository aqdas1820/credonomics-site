export type PeriodType = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FY' | 'TTM' | 'H1' | 'H2';
export type PeriodAvailability = 'complete' | 'partial' | 'stale' | 'unavailable';

export interface DetailedFinancialPeriod {
  // Period Metadata
  periodType: PeriodType;
  fiscalYear: number;
  fiscalQuarter?: number;
  periodStart: string | null;
  periodEnd: string | null;
  reportedAt: string | null;
  sourcePublishedAt: string | null;
  source: string;
  availability: PeriodAvailability;
  
  periodLabel: string; // e.g., "Q1 FY27", "FY26", "TTM"

  // Income Statement
  revenue: number | null;
  operatingProfit: number | null;
  ebitda: number | null;
  netProfit: number | null;
  eps: number | null;

  // Balance Sheet
  totalAssets: number | null;
  totalDebt: number | null;
  cashEquivalents: number | null;
  netDebt: number | null;
  equity: number | null;

  // Cash Flow
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  freeCashFlow: number | null;

  // Calculated Margins
  operatingMargin: number | null;
  netMargin: number | null;

  // Calculated Returns
  roe: number | null;
  roce: number | null;
}

export interface TrendCalculation {
  metric: string;
  currentValue: number | null;
  previousValue: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  currentPeriod: string;
  previousPeriod: string;
  unit: 'percent' | 'money' | 'multiple';
  calculationMethod: string;
}

export class HistoricalTrendEngine {
  static calculateGrowth(current: number | null, previous: number | null): number | null {
    if (current === null || previous === null || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  static calculateMargin(profit: number | null, revenue: number | null): number | null {
    if (profit === null || revenue === null || revenue === 0) return null;
    return (profit / revenue) * 100;
  }

  static compare(
    current: DetailedFinancialPeriod,
    previous: DetailedFinancialPeriod,
    metricKey: keyof DetailedFinancialPeriod,
    metricName: string,
    unit: 'percent' | 'money' | 'multiple',
    method: string
  ): TrendCalculation | null {
    const currVal = current[metricKey] as number | null;
    const prevVal = previous[metricKey] as number | null;
    
    if (currVal === null || prevVal === null) return null;

    let pctChange = null;
    if (unit === 'money' || unit === 'multiple') {
      pctChange = this.calculateGrowth(currVal, prevVal);
    } else if (unit === 'percent') {
      // For percentages (like margins), absolute change is the diff in percentage points
      pctChange = currVal - prevVal;
    }

    return {
      metric: metricName,
      currentValue: currVal,
      previousValue: prevVal,
      absoluteChange: currVal - prevVal,
      percentageChange: pctChange,
      currentPeriod: current.periodLabel,
      previousPeriod: previous.periodLabel,
      unit,
      calculationMethod: method
    };
  }

  static buildTrendList(current: DetailedFinancialPeriod, previous: DetailedFinancialPeriod): TrendCalculation[] {
    const trends: TrendCalculation[] = [];
    
    const revenueTrend = this.compare(current, previous, 'revenue', 'Revenue', 'money', 'YoY Growth');
    if (revenueTrend) trends.push(revenueTrend);

    const profitTrend = this.compare(current, previous, 'netProfit', 'Net Profit', 'money', 'YoY Growth');
    if (profitTrend) trends.push(profitTrend);

    const opMarginTrend = this.compare(current, previous, 'operatingMargin', 'Operating Margin', 'percent', 'YoY Change');
    if (opMarginTrend) trends.push(opMarginTrend);

    const debtTrend = this.compare(current, previous, 'totalDebt', 'Total Debt', 'money', 'YoY Change');
    if (debtTrend) trends.push(debtTrend);

    return trends;
  }
}
