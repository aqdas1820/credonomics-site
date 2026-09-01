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
  if (!Number.isFinite(timestamp)) return "unavailable";

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
