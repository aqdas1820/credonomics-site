import { describe, expect, it } from "vitest";
import { availabilityFromDate, MONTHLY_PORTFOLIO_FRESHNESS_POLICY, marketObservationAvailability, latestObservation } from "../../src/domain/freshness";

describe("financial freshness", () => {
  const now = new Date("2026-09-01T00:00:00.000Z");
  it("does not label monthly portfolio data live", () => expect(availabilityFromDate("2026-08-31T00:00:00.000Z", now, MONTHLY_PORTFOLIO_FRESHNESS_POLICY)).toBe("recent"));
  it("labels old portfolio data stale", () => expect(availabilityFromDate("2026-02-28T00:00:00.000Z", now, MONTHLY_PORTFOLIO_FRESHNESS_POLICY)).toBe("stale"));
  it("labels missing dates unavailable", () => expect(availabilityFromDate(null, now)).toBe("unavailable"));
  it('does not label future observations live', () => expect(availabilityFromDate('2026-09-02T00:00:00Z', now)).toBe('unavailable'));
  it('never labels closed-market snapshots live', () => expect(marketObservationAvailability(now.toISOString(), false, now)).toBe('recent'));
  it('allows live only for fresh open-market observations', () => expect(marketObservationAvailability(now.toISOString(), true, now)).toBe('live'));
  it('does not turn stale candles live because the market is open', () => expect(marketObservationAvailability('2026-08-01', true, now)).toBe('stale'));
  it('selects the latest observation regardless of provider ordering', () => expect(latestObservation(['invalid', '2026-08-30', '2026-08-31', '2026-08-29'])).toBe('2026-08-31'));
  it('keeps missing observation times unknown', () => expect(latestObservation([])).toBeNull());
});
