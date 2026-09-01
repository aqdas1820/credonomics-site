import { describe, expect, it } from "vitest";
import { availabilityFromDate, MONTHLY_PORTFOLIO_FRESHNESS_POLICY } from "../../src/domain/freshness";

describe("financial freshness", () => {
  const now = new Date("2026-09-01T00:00:00.000Z");
  it("does not label monthly portfolio data live", () => expect(availabilityFromDate("2026-08-31T00:00:00.000Z", now, MONTHLY_PORTFOLIO_FRESHNESS_POLICY)).toBe("recent"));
  it("labels old portfolio data stale", () => expect(availabilityFromDate("2026-02-28T00:00:00.000Z", now, MONTHLY_PORTFOLIO_FRESHNESS_POLICY)).toBe("stale"));
  it("labels missing dates unavailable", () => expect(availabilityFromDate(null, now)).toBe("unavailable"));
});
