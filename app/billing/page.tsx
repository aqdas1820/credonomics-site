import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'
import BillingForm from './BillingForm'

export const metadata: Metadata = {
  title: 'Billing — Restricted Development Draft',
  description: 'Restricted development-only invoice drafting. No payment collection.',
  robots: { index: false, follow: false },
}

// Explicit opt-in for preview builds only. This is NOT admin authentication.
// No customer data should be entered until a proper authenticated operator workflow exists.
export default function BillingPreviewPage() {
  const enabled = process.env.VERCEL_ENV === 'preview' && process.env.BILLING_DRAFT_ENABLED === 'true'
  return (
    <SiteFrame>
      {enabled ? <BillingForm /> : (
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
          <h1>Billing is not publicly available</h1>
          <p>CredoNomics Billing is under development. Invoice drafting, customer access and payment collection are disabled on this deployment.</p>
        </main>
      )}
    </SiteFrame>
  )
}
