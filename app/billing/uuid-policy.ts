/**
 * Postgres UUID-shaped billing identifiers only. No look-alike IDs,
 * partial UUIDs, whitespace, long dash-runs or user-provided SQL fragments.
 */
export function isBillingUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}
