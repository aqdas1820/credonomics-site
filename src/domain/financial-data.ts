export const DATA_AVAILABILITIES = [
  "live",
  "recent",
  "delayed",
  "stale",
  "unavailable",
] as const;

export type DataAvailability = (typeof DATA_AVAILABILITIES)[number];
export type DataQuality = "verified" | "high" | "medium" | "low" | "unknown";

export type FinancialDataMetadata = {
  source: string;
  asOf: string | null;
  generatedAt: string;
  quality: DataQuality;
  availability: DataAvailability;
};

export type FinancialValue = number | null;
