import { isBillingDatabaseScopeConfirmed } from '../../../app/billing/db-scope'
import { isBillingUuid } from '../../../app/billing/uuid-policy'

// Edge-compatible readiness check. Never returns configuration or key material.
export function hostedPersonalReady() {
  return process.env.PERSONAL_TESTING_ENABLED === 'true' &&
    process.env.PERSONAL_TESTING_RUNTIME === 'hosted' &&
    /^[a-f0-9]{64}$/.test(process.env.PERSONAL_TESTING_ENCRYPTION_KEY ?? '') &&
    isBillingUuid(process.env.PERSONAL_TESTING_OWNER_ID) &&
    isBillingDatabaseScopeConfirmed(process.env.PERSONAL_TESTING_EXPECTED_SUPABASE_PROJECT_REF, process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim())
}

export const personalProductionOrigin = 'https://www.credonomics.in'
