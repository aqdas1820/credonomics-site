import type {
  CompanyFundamentals,
  CorporateAction,
  FinancialStatements,
  HistoricalPrice,
  HistoricalRange,
  IndianEquityIdentity,
  MarketQuote,
  Shareholding,
} from "../../domain/equity/types";
import type { FinancialDataMetadata } from "../../domain/financial-data";

export type ProviderResult<T> = {
  data: T | null;
  metadata: FinancialDataMetadata;
  error?: { code: string; message: string; retryable: boolean };
};

export interface MarketDataProvider {
  readonly id: string;
  getQuote(instrumentKey: string): Promise<ProviderResult<MarketQuote>>;
  getQuotes(instrumentKeys: string[]): Promise<ProviderResult<MarketQuote[]>>;
  searchStocks(query: string): Promise<ProviderResult<IndianEquityIdentity[]>>;
  getCompanyProfile(symbol: string): Promise<ProviderResult<IndianEquityIdentity>>;
  getFundamentals(symbol: string): Promise<ProviderResult<CompanyFundamentals>>;
  getFinancialStatements(symbol: string): Promise<ProviderResult<FinancialStatements>>;
  getShareholding(symbol: string): Promise<ProviderResult<Shareholding>>;
  getCorporateActions(symbol: string): Promise<ProviderResult<CorporateAction[]>>;
  getHistoricalPrices(symbol: string, range: HistoricalRange): Promise<ProviderResult<HistoricalPrice[]>>;
  getIntradayPrices(instrumentKey: string): Promise<ProviderResult<HistoricalPrice[]>>;
  getMarketStatus(): Promise<ProviderResult<{ session: "PRE_OPEN" | "OPEN" | "CLOSED" | "HOLIDAY" | "UNKNOWN" }>>;
}
