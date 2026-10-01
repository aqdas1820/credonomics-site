export type TransactionType = 
  | 'BUY' 
  | 'SELL' 
  | 'DIVIDEND' 
  | 'BONUS' 
  | 'SPLIT' 
  | 'RIGHTS' 
  | 'TRANSFER_IN' 
  | 'TRANSFER_OUT' 
  | 'FEE' 
  | 'TAX' 
  | 'OTHER';

export interface PortfolioInstrument {
  instrumentKey: string; // Canonical identity
  symbol: string;
  exchange: string;
  isin?: string;
  name?: string;
}

export interface PortfolioTransaction {
  id: string;
  portfolioId: string;
  date: string; // ISO8601
  type: TransactionType;
  quantity: number;
  price: number;
  grossAmount: number; // was amount
  fees: number;
  tax: number; // explicitly requested
  netAmount: number; // explicitly requested
  instrument: PortfolioInstrument;
  source?: string; // e.g., 'MANUAL', 'ZERODHA', 'GROWW'
  referenceId?: string; // Reference ID from broker (was externalId)
}

export interface PortfolioHolding {
  instrument: PortfolioInstrument;
  quantity: number;
  averageCost: number;
  investedValue: number;
  
  // Market data
  currentPrice: number | null;
  currentValue: number | null;
  unrealizedPnL: number | null;
  unrealizedPnLPercent: number | null;
  
  // Meta
  portfolioWeight?: number;
  sector?: string;
  industry?: string;
  priceObservationTimestamp?: string;
  currency: string;
  availability: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
}

export interface PortfolioCashFlow {
  date: string;
  amount: number;
  type: 'DIVIDEND' | 'FEE' | 'TAX' | 'DEPOSIT' | 'WITHDRAWAL' | 'OTHER';
  instrumentKey?: string;
  description?: string;
}

export interface CorporateActionAdjustment {
  date: string;
  type: 'SPLIT' | 'BONUS' | 'RIGHTS' | 'MERGER';
  instrumentKey: string;
  ratio: string;
  originalQuantity: number;
  newQuantity: number;
  description?: string;
}

export interface PortfolioSnapshot {
  date: string; // ISO8601
  portfolioId: string;
  
  currentValue: number | null;
  investedValue: number;
  unrealizedPnL: number | null;
  realizedPnL: number | null; // For portfolio analytics, not tax reporting
  cash: number | null;
  holdingsCount: number;

  topHoldings: PortfolioHolding[];
  sectorExposure: Record<string, { value: number; weight: number }>;
  industryExposure: Record<string, { value: number; weight: number }>;
  
  largestGainers: PortfolioHolding[];
  largestLosers: PortfolioHolding[];
}

export interface PortfolioDataCoverage {
  transactionCoverage: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
  instrumentMapping: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
  priceCoverage: 'COMPLETE' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE';
  sectorMapping: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
  corporateActions: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
  historicalPriceCoverage: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
  resultsCoverage: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
}

export interface Portfolio {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  holdings: PortfolioHolding[];
  transactions: PortfolioTransaction[];
  cashFlows: PortfolioCashFlow[];
  coverage: PortfolioDataCoverage;
  currency: string;
}

export interface PortfolioAccount {
  id: string;
  portfolioId: string;
  broker: string;
  accountName: string;
  transactions: PortfolioTransaction[];
}

export interface ExplainableMetric {
  value: number | string | null;
  formula: string;
  inputs: Record<string, string | number>;
  coverage: string;
  period?: string;
  limitations?: string;
}
