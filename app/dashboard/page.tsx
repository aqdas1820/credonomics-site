import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { authenticatedUser } from '../../src/lib/supabase/server'
import SiteFrame from '../components/SiteFrame'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'My Dashboard - CredoNomics',
}

export default async function DashboardPage() {
  const { user } = await authenticatedUser()
  
  if (!user) {
    redirect('/login?next=/dashboard')
  }

  return (
    <SiteFrame>
      <DashboardClient userEmail={user.email || 'User'} checkoutAvailable={process.env.STRIPE_CHECKOUT_ENABLED === 'true' && Boolean(process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_PRICE_ID?.trim())} />
    </SiteFrame>
  )
}
