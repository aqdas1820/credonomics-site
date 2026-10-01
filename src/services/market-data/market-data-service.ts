import "server-only";
import { UpstoxMarketDataProvider } from "../../providers/market/upstox-provider";
import type { MarketDataProvider } from "../../providers/market/types";
import { getMarketOverview } from "./market-overview-service";
import { getMarketPulse } from "./market-pulse-service";
import { getCompanyFinancialIntelligence } from "./company-financial-intelligence";
import { fetchLiveIpos } from "../../../app/data/ipo-live";

let provider: MarketDataProvider = new UpstoxMarketDataProvider();

export function getMarketDataProvider(): MarketDataProvider {
  return provider;
}

export function registerMarketDataProvider(nextProvider: MarketDataProvider): void {
  provider = nextProvider;
}

export const MarketDataService = {
  getQuote: (key: string) => provider.getQuote(key),
  getQuotes: (keys: string[]) => provider.getQuotes(keys),
  searchStocks: (query: string) => provider.searchStocks(query),
  getCompanyProfile: (symbol: string) => provider.getCompanyProfile(symbol),
  getFundamentals: (symbol: string) => provider.getFundamentals(symbol),
  getShareholding: (symbol: string) => provider.getShareholding(symbol),
  getCorporateActions: (symbol: string) => provider.getCorporateActions(symbol),
  getHistoricalPrices: (symbol: string, range: import("../../domain/equity/types").HistoricalRange) => provider.getHistoricalPrices(symbol, range),
  getIntradayPrices: (key: string, interval?: string) => provider.getIntradayPrices(key, interval),
  getMarketStatus: () => provider.getMarketStatus(),

  // Extended domain-specific aggregates
  getMarketOverview,
  getMarketPulse,
  getCompanyFinancialIntelligence,
  getLiveIpos: fetchLiveIpos,
};
