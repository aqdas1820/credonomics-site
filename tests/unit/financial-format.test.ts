import { describe, expect, it } from "vitest";
import { formatCompactINR, formatIndianNumber, formatINR, formatPercent } from "../../src/lib/financial-format";

describe("financial formatting", () => {
  it("uses Indian grouping", () => expect(formatIndianNumber(125000)).toBe("1,25,000"));
  it("formats lakh and crore", () => { expect(formatCompactINR(125000)).toBe("₹1.25 lakh"); expect(formatCompactINR(12500000)).toBe("₹1.25 crore"); });
  it("never renders missing values as zero", () => { expect(formatINR(null)).toBe("—"); expect(formatPercent(undefined)).toBe("—"); });
});
