import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'
import PricingClient from './PricingClient'
import { authenticatedUser } from '../../src/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Pricing & Pro Subscription - CredoNomics',
  description: 'Upgrade to CredoNomics Pro to unlock deep equity insights, full IPO intelligence, and complete mutual fund overlaps.',
}

export default async function PricingPage() {
  const { user } = await authenticatedUser()

  return (
    <SiteFrame>
      <main style={{ minHeight: '80vh', padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '40px', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Unlock Professional Insights</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Get unlimited access to proprietary valuation models, advanced stock screeners, and premium research reports.
          </p>
        </header>

        <PricingClient isAuth={!!user} checkoutAvailable={process.env.STRIPE_CHECKOUT_ENABLED === 'true' && Boolean(process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_PRICE_ID?.trim())} />
      </main>
    </SiteFrame>
  )
}
