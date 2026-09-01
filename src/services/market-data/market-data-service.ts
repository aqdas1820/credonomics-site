import "server-only";
import { UpstoxMarketDataProvider } from "../../providers/market/upstox-provider";
import type { MarketDataProvider } from "../../providers/market/types";

let provider: MarketDataProvider = new UpstoxMarketDataProvider();

export function getMarketDataProvider(): MarketDataProvider {
  return provider;
}

export function registerMarketDataProvider(nextProvider: MarketDataProvider): void {
  provider = nextProvider;
}
