import { describe, expect, it } from "vitest";
import { buildMarketTrends, buildPulseSummary, classifyBreadth, type PulseQuote } from "../../src/domain/market/pulse";

const quote = (name: string, change: number, changePercent = change): PulseQuote => ({ name, symbol: name, instrumentKey: name, price: 100, change, changePercent, volume: 1, timestamp: null });

describe("market pulse", () => {
  it("classifies only valid breadth observations", () => {
    const missing = { ...quote("Missing", 0), change: null };
    expect(classifyBreadth([quote("A", 1), quote("B", -1), quote("C", 0), missing])).toEqual({ advances: 1, declines: 1, unchanged: 1, universeSize: 3 });
  });

  it("builds a deterministic, factual summary", () => {
    const summary = buildPulseSummary([quote("NIFTY 50", -1, -0.5), quote("INDIA VIX", 1, 2)], [quote("Nifty IT", 1, 1.2)], { advances: 3, declines: 2, unchanged: 0, universeSize: 5 });
    expect(summary).toEqual(["NIFTY 50 is down 0.50%, with strength in IT.", "Tracked liquid-stock breadth has 3 advances, 2 declines and 0 unchanged.", "India VIX is up 2.00%."]);
  });

  it("classifies factual trend cards without predictions", () => {
    const trends = buildMarketTrends([quote("NIFTY 50", -1, -0.5), quote("BANK NIFTY", 1, 0.25), quote("INDIA VIX", -1, -2)], { advances: 3, declines: 2, unchanged: 0, universeSize: 5 }, [{ label: "FII", segment: "NSE cash", buy: 10, sell: 8, net: 2, timestamp: "2026-01-01" }]);
    expect(trends.map(item => item.classification)).toEqual(["Below previous close", "Above previous close", "Volatility easing", "Positive breadth", "Net buyer"]);
  });
});
