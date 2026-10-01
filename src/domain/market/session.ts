import * as Sentry from '@sentry/nextjs';

export type IndianMarketSession = "PRE_OPEN" | "OPEN" | "CLOSED" | "HOLIDAY";

export function getIstDate(value = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(value);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  } catch (error) {
    Sentry.captureException(error, { tags: { domain: "market-session", function: "getIstDate" } });
    return value.toISOString().slice(0, 10);
  }
}

export function shiftIsoDate(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days, 12));
  return shifted.toISOString().slice(0, 10);
}

const DEFAULT_HOLIDAYS = new Set([
  "2026-01-26",
  "2026-03-03",
  "2026-03-20",
  "2026-04-03",
  "2026-04-14",
  "2026-05-01",
  "2026-08-15",
  "2026-09-28", // Monday holiday example that might trigger the bug (Bhagat Singh Jayanti / Anant Chaturdashi etc)
  "2026-10-02",
  "2026-11-08",
  "2026-12-25"
]);

export function getIndianMarketSession(
  value = new Date(),
  holidays: ReadonlySet<string> = DEFAULT_HOLIDAYS,
): IndianMarketSession {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(value);
    const weekday = parts.find(item => item.type === "weekday")?.value ?? "";
    if (weekday === "Sat" || weekday === "Sun") return "CLOSED";
    if (holidays.has(getIstDate(value))) return "HOLIDAY";
    const hour = Number(parts.find(item => item.type === "hour")?.value ?? -1);
    const minute = Number(parts.find(item => item.type === "minute")?.value ?? -1);
    const totalMinutes = hour * 60 + minute;
    if (totalMinutes >= 9 * 60 && totalMinutes < 9 * 60 + 15) return "PRE_OPEN";
    if (totalMinutes >= 9 * 60 + 15 && totalMinutes < 15 * 60 + 30) return "OPEN";
    return "CLOSED";
  } catch (error) {
    Sentry.captureException(error, { tags: { domain: "market-session", function: "getIndianMarketSession" } });
    return "CLOSED";
  }
}

export function marketSessionLabel(session: IndianMarketSession) {
  if (session === "OPEN") return "MARKET OPEN";
  if (session === "PRE_OPEN") return "PRE-OPEN";
  if (session === "HOLIDAY") return "HOLIDAY";
  return "MARKET CLOSED";
}

export function marketOverviewCacheControl(session: IndianMarketSession, stale = false) {
  if (session === "OPEN" || session === "PRE_OPEN") return stale
    ? "public, max-age=0, s-maxage=15, stale-while-revalidate=60"
    : "public, max-age=0, s-maxage=20, stale-while-revalidate=30";
  return stale
    ? "public, max-age=0, s-maxage=300, stale-while-revalidate=900"
    : "public, max-age=0, s-maxage=600, stale-while-revalidate=900";
}
