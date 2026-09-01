const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const indianNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function isValue(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function formatINR(value: number | null | undefined, fallback = "—"): string {
  return isValue(value) ? inr.format(value) : fallback;
}

export function formatIndianNumber(value: number | null | undefined, fallback = "—"): string {
  return isValue(value) ? indianNumber.format(value) : fallback;
}

export function formatCompactINR(value: number | null | undefined, fallback = "—"): string {
  if (!isValue(value)) return fallback;
  const absolute = Math.abs(value);
  if (absolute >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} crore`;
  if (absolute >= 100_000) return `₹${(value / 100_000).toFixed(2)} lakh`;
  return formatINR(value);
}

export function formatMarketCap(value: number | null | undefined, fallback = "—"): string {
  return formatCompactINR(value, fallback);
}

export function formatPercent(value: number | null | undefined, fallback = "—"): string {
  return isValue(value) ? `${percent.format(value)}%` : fallback;
}

export function formatFinancialDate(value: string | Date | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isFinite(parsed.getTime()) ? date.format(parsed) : fallback;
}

export function formatDataAsOf(value: string | null | undefined): string {
  const formatted = formatFinancialDate(value, "");
  return formatted ? `Data as of ${formatted}` : "Data date unavailable";
}
