import type { FinancialDataMetadata } from "../../domain/financial-data";
import type {
  CompanyFundamentals,
  CorporateAction,
  FinancialStatements,
  HistoricalPrice,
  IndianEquityIdentity,
  MarketQuote,
  Shareholding,
} from "../../domain/equity/types";
import type { MarketDataProvider, ProviderResult } from "./types";

function unavailable<T>(): ProviderResult<T> {
  const metadata: FinancialDataMetadata = {
    source: "No market-data provider configured",
    asOf: null,
    generatedAt: new Date().toISOString(),
    quality: "unknown",
    availability: "unavailable",
  };
  return {
    data: null,
    metadata,
    error: {
      code: "PROVIDER_NOT_CONFIGURED",
      message: "Indian equity data is not connected yet.",
      retryable: false,
    },
  };
}

export class UnavailableMarketDataProvider implements MarketDataProvider {
  readonly id = "unavailable";
  async getQuote() { return unavailable<MarketQuote>(); }
  async getQuotes() { return unavailable<MarketQuote[]>(); }
  async searchStocks() { return unavailable<IndianEquityIdentity[]>(); }
  async getCompanyProfile() { return unavailable<IndianEquityIdentity>(); }
  async getFundamentals() { return unavailable<CompanyFundamentals>(); }
  async getFinancialStatements() { return unavailable<FinancialStatements>(); }
  async getShareholding() { return unavailable<Shareholding>(); }
  async getCorporateActions() { return unavailable<CorporateAction[]>(); }
  async getHistoricalPrices() { return unavailable<HistoricalPrice[]>(); }
  async getIntradayPrices() { return unavailable<HistoricalPrice[]>(); }
  async getMarketStatus() { return unavailable<{ session: "UNKNOWN" }>(); }
}
