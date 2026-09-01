import { describe, expect, it } from "vitest";
import { marketQuoteSchema } from "../../src/schemas/equity";

const metadata = { source: "test", asOf: "2026-08-31T00:00:00.000Z", generatedAt: "2026-08-31T01:00:00.000Z", quality: "verified", availability: "recent" } as const;
const identity = { instrumentKey: "NSE_EQ|INE009A01021", symbol: "INFY", exchange: "NSE", companyName: "Infosys Limited" } as const;
const quoteFields = { change: null, changePercent: null, timestamp: "2026-08-31T00:00:00.000Z", previousClose: null, open: null, high: null, low: null, volume: null, fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null };

describe("market quote schema", () => {
  it("accepts explicit nullable provider fields", () => expect(marketQuoteSchema.safeParse({ ...metadata, ...identity, ...quoteFields, price: 1500 }).success).toBe(true));
  it("rejects available quotes without a price", () => expect(marketQuoteSchema.safeParse({ ...metadata, ...identity, ...quoteFields, price: null }).success).toBe(false));
  it("rejects malformed ISINs", () => expect(marketQuoteSchema.safeParse({ ...metadata, ...identity, ...quoteFields, isin: "fake", price: 1 }).success).toBe(false));
});
