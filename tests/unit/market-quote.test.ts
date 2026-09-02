import { describe, expect, it } from "vitest";
import { calculateQuoteChange, resolvePreviousClose, resolveProviderQuote } from "../../src/domain/market/quote";

describe("market quote normalization", () => {
  it("resolves colon-keyed provider responses by canonical instrument key", () => {
    const quote = { instrument_token: "NSE_INDEX|Nifty 50", last_price: 25_000 };
    expect(resolveProviderQuote({ "NSE_INDEX:Nifty 50": quote }, "NSE_INDEX|Nifty 50")).toBe(quote);
  });
  it("derives absolute and percentage change from the same values", () => {
    expect(calculateQuoteChange(1309, 1309)).toEqual({ change: 0, changePercent: 0 });
    const result = calculateQuoteChange(1341, 1309);
    expect(result.change).toBe(32);
    expect(result.changePercent).toBeCloseTo(2.4446, 3);
  });
  it("derives previous close from the canonical provider net change", () => {
    expect(resolvePreviousClose(1297.6, -11.4, 1297.6)).toBeCloseTo(1309);
    expect(resolvePreviousClose(1309, null, 1309)).toBe(1309);
  });
  it("handles missing and zero previous closes", () => {
    expect(calculateQuoteChange(null, 100)).toEqual({ change: null, changePercent: null });
    expect(calculateQuoteChange(100, 0)).toEqual({ change: 100, changePercent: null });
  });
});
