import type { DataAvailability, FinancialDataMetadata } from "./financial-data";

export type FreshnessPolicy = {
  liveMinutes: number;
  recentHours: number;
  delayedDays: number;
  staleAfterDays: number;
};

export const DEFAULT_FINANCIAL_FRESHNESS_POLICY: FreshnessPolicy = {
  liveMinutes: 15,
  recentHours: 24,
  delayedDays: 7,
  staleAfterDays: 30,
};

export const MONTHLY_PORTFOLIO_FRESHNESS_POLICY: FreshnessPolicy = {
  liveMinutes: 0,
  recentHours: 24 * 45,
  delayedDays: 75,
  staleAfterDays: 100,
};

export function availabilityFromDate(
  asOf: string | null | undefined,
  now = new Date(),
  policy = DEFAULT_FINANCIAL_FRESHNESS_POLICY,
): DataAvailability {
  if (!asOf) return "unavailable";
  const timestamp = new Date(asOf).getTime();
  if (!Number.isFinite(timestamp) || timestamp > now.getTime() + 60_000) return "unavailable";

  const ageMs = Math.max(0, now.getTime() - timestamp);
  const minutes = ageMs / 60_000;
  const hours = minutes / 60;
  const days = hours / 24;

  if (policy.liveMinutes > 0 && minutes <= policy.liveMinutes) return "live";
  if (hours <= policy.recentHours) return "recent";
  if (days <= policy.delayedDays) return "delayed";
  if (days > policy.staleAfterDays) return "stale";
  return "delayed";
}

export function withDerivedAvailability(
  metadata: Omit<FinancialDataMetadata, "availability">,
  policy?: FreshnessPolicy,
  now?: Date,
): FinancialDataMetadata {
  return {
    ...metadata,
    availability: availabilityFromDate(metadata.asOf, now, policy),
  };
}

export const availabilityLabels: Record<DataAvailability, string> = {
  live: "Live",
  recent: "Recent",
  delayed: "Delayed",
  stale: "Stale",
  unavailable: "Unavailable",
};

// Freshness is based on observation time, never the time this request was served.
export function marketObservationAvailability(asOf: string | null, marketOpen: boolean, now = new Date(), liveMinutes = 2): DataAvailability {
  const availability = availabilityFromDate(asOf, now, { liveMinutes, recentHours: 24, delayedDays: 7, staleAfterDays: 7 });
  return availability === 'live' && !marketOpen ? 'recent' : availability;
}

export function latestObservation(dates: string[]): string | null {
  return dates.filter(date => Number.isFinite(Date.parse(date)))
    .reduce<string | null>((latest, date) => !latest || Date.parse(date) > Date.parse(latest) ? date : latest, null);
}
