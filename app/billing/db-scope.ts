/**
 * Fail-closed Supabase project scope validation for CredoNomics Billing.
 * No billing API or admin page may access a database until an independent
 * owner-approved Supabase project ref matches the configured API host.
 */
export function isBillingDatabaseScopeConfirmed(
  expectedProjectRef: string | undefined,
  supabaseUrl: string | undefined,
): boolean {
  if (!expectedProjectRef || !/^[a-z0-9]{20}$/.test(expectedProjectRef) || !supabaseUrl) return false
  try {
    const url = new URL(supabaseUrl)
    return url.protocol === 'https:' &&
      url.hostname === expectedProjectRef + '.supabase.co' &&
      url.username === '' && url.password === '' &&
      url.port === '' && (url.pathname === '/' || url.pathname === '') &&
      url.search === '' && url.hash === ''
  } catch { return false }
}

export function billingDatabaseScopeReady(): boolean {
  return isBillingDatabaseScopeConfirmed(
    process.env.BILLING_EXPECTED_SUPABASE_PROJECT_REF,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  )
}
