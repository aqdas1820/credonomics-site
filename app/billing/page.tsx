import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteFrame from '../components/SiteFrame'
import BillingForm from './BillingForm'
import BillingHistory from './BillingHistory'
import { authenticatedUser } from '../../src/lib/supabase/server'
import { isBillingAdmin } from './admin-policy'
import { billingDatabaseScopeReady } from './db-scope'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'CredoNomics Billing — Admin Only',
  description: 'Restricted billing administration. Invoice records are private.',
  robots: { index: false, follow: false, noarchive: true },
}

/** No public invoice form: only signed-in, explicitly allowlisted billing admins. */
export default async function BillingAdminPage() {
  if (process.env.BILLING_PORTAL_ENABLED !== 'true' || (process.env.BILLING_API_ENABLED !== 'true' || !billingDatabaseScopeReady())) notFound()
  const { user } = await authenticatedUser()
  if (!isBillingAdmin(user, process.env.BILLING_ADMIN_USER_IDS)) notFound()
  return <SiteFrame><BillingForm enableSettlement={process.env.BILLING_SETTLEMENT_ENABLED === 'true'} /><BillingHistory /></SiteFrame>
}
