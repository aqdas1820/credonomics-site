/** Fail-closed billing admin authorization for server-verified identities only. */
export type BillingIdentity = { id: string; app_metadata?: object | null }
export function isBillingAdmin(user: BillingIdentity | null, allowlist: string | undefined): boolean {
  if (!user || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) return false
  const ids = (allowlist ?? '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean)
  return ids.includes(user.id.toLowerCase()) && !!user.app_metadata &&
    Object.prototype.hasOwnProperty.call(user.app_metadata, 'billing_admin') &&
    Reflect.get(user.app_metadata, 'billing_admin') === true
}
