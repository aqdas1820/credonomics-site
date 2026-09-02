import { describe, expect, it } from "vitest";
import { getIndianMarketSession, getIstDate, marketOverviewCacheControl, shiftIsoDate } from "../../src/domain/market/session";

describe("Indian market session", () => {
  it("is closed after midnight IST", () => {
    expect(getIndianMarketSession(new Date("2026-09-01T19:00:00.000Z"))).toBe("CLOSED");
  });
  it("distinguishes pre-open and the normal session", () => {
    expect(getIndianMarketSession(new Date("2026-09-02T03:35:00.000Z"))).toBe("PRE_OPEN");
    expect(getIndianMarketSession(new Date("2026-09-02T03:45:00.000Z"))).toBe("OPEN");
    expect(getIndianMarketSession(new Date("2026-09-02T10:00:00.000Z"))).toBe("CLOSED");
  });
  it("closes weekends and supports explicit holidays", () => {
    expect(getIndianMarketSession(new Date("2026-09-05T05:00:00.000Z"))).toBe("CLOSED");
    expect(getIndianMarketSession(new Date("2026-09-02T05:00:00.000Z"), new Set(["2026-09-02"]))).toBe("HOLIDAY");
  });
  it("provides stable IST date helpers", () => {
    expect(getIstDate(new Date("2026-09-01T19:00:00.000Z"))).toBe("2026-09-02");
    expect(shiftIsoDate("2026-09-01", -1)).toBe("2026-08-31");
  });
  it("uses short live and longer closed overview caches", () => {
    expect(marketOverviewCacheControl("OPEN")).toContain("s-maxage=20");
    expect(marketOverviewCacheControl("PRE_OPEN")).toContain("s-maxage=20");
    expect(marketOverviewCacheControl("CLOSED")).toContain("s-maxage=600");
    expect(marketOverviewCacheControl("OPEN", true)).toContain("s-maxage=15");
  });
});
