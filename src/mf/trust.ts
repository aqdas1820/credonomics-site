export function formatTrustMetric(
  value: number | null | undefined,
  suffix = ""
): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value}${suffix}`
    : "Unavailable";
}

export function formatIsinCoverageDetail(
  valid: number | null | undefined,
  eligible: number | null | undefined
): string | null {
  return typeof valid === "number" &&
    Number.isInteger(valid) &&
    typeof eligible === "number" &&
    Number.isInteger(eligible) &&
    eligible > 0
    ? `${valid} / ${eligible} eligible holdings`
    : null;
}
