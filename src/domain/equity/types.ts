import type { FinancialDataMetadata, FinancialValue } from "../financial-data";

export type IndianExchange = "NSE" | "BSE";

export type IndianEquityIdentity = {
  instrumentKey: string;
  symbol: string;
  exchange: IndianExchange;
  companyName: string;
  bseCode?: string | null;
  isin?: string | null;
  sector?: string | null;
  industry?: string | null;
  tradingSymbol?: string;
  instrumentType?: string;
  lotSize?: number | null;
  tickSize?: number | null;
};

export type MarketQuote = IndianEquityIdentity &
  FinancialDataMetadata & {
    price: FinancialValue;
    change: FinancialValue;
    changePercent: FinancialValue;
    timestamp: string | null;
    previousClose: FinancialValue;
    open: FinancialValue;
    high: FinancialValue;
    low: FinancialValue;
    volume: FinancialValue;
    fiftyTwoWeekHigh: FinancialValue;
    fiftyTwoWeekLow: FinancialValue;
  };

export type CompanyFundamentals = IndianEquityIdentity &
  FinancialDataMetadata & {
    marketCap: FinancialValue;
    pe: FinancialValue;
    pb: FinancialValue;
    eps: FinancialValue;
    bookValue: FinancialValue;
    dividendYield: FinancialValue;
    roe: FinancialValue;
    roce: FinancialValue;
    roa: FinancialValue;
    evEbitda: FinancialValue;
    debtToEquity: FinancialValue;
  };

export type FinancialStatements = IndianEquityIdentity &
  FinancialDataMetadata & {
    revenue: FinancialValue;
    profit: FinancialValue;
    operatingProfit: FinancialValue;
    netWorth: FinancialValue;
    borrowings: FinancialValue;
    cashFlow: FinancialValue;
  };

export type Shareholding = IndianEquityIdentity &
  FinancialDataMetadata & {
    promoterHolding: FinancialValue;
    fiiHolding: FinancialValue;
    diiHolding: FinancialValue;
    mutualFundHolding: FinancialValue;
    publicHolding: FinancialValue;
    history: Array<{ category?: string; history?: Array<{ period?: string; value?: number }> }>;
  };

export type HistoricalPrice = {
  date: string;
  open: FinancialValue;
  high: FinancialValue;
  low: FinancialValue;
  close: FinancialValue;
  volume: FinancialValue;
};

export type CorporateAction = {
  type: "dividend" | "split" | "bonus" | "rights" | "buyback" | "other";
  exDate: string | null;
  recordDate: string | null;
  announcementDate: string | null;
  amount: number | null;
  ratio: string | null;
  description: string;
};

export type HistoricalRange = "1m" | "5m" | "15m" | "1h" | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "MAX";
