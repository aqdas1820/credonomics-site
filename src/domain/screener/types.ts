export type Operator = '>' | '>=' | '<' | '<=' | 'between' | 'equals' | 'exists' | 'differs';

export type FilterCondition = {
  field: string;
  operator: Operator;
  value?: number | string | boolean | [number, number];
  // Explicit semantics for change/growth fields
  periodSemantics?: 'yoy_quarterly' | 'annual_yoy' | 'ttm' | 'sequential_quarterly';
};

export type ScreenerQuery = {
  filters: FilterCondition[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
};

export interface ScreenerResultItem {
  instrumentKey: string;
  symbol: string;
  companyName: string;
  sector: string;
  // Common fields to surface in screener results
  price: number | null;
  marketCap: number | null;
  pe: number | null;
  pb: number | null;
  revenueGrowthYoY: number | null;
  profitGrowthYoY: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  promoterHolding: number | null;
  fiiHolding: number | null;
  diiHolding: number | null;
  latestReportingPeriod: string | null;
  dataFreshness: string; // 'live' | 'recent' | 'delayed' | 'stale' | 'unavailable'
  // Flexible bucket for matched metrics that aren't in the common list
  matchedMetrics?: Record<string, number | string | boolean | null>;
}

export interface ScreenerResult {
  items: ScreenerResultItem[];
  totalEvaluated: number;
  totalMatched: number;
  dataCoverage: {
    financials: string;
    shareholding: string;
    price: string;
  };
}
