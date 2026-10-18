import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'
import BillingForm from './BillingForm'

export const metadata: Metadata = {
  title: 'Billing — Local Invoice Draft Preview',
  description: 'Development-only invoice drafting and browser PDF printing. No payment collection.',
  robots: { index: false, follow: false },
}

export default function BillingPreviewPage() {
  return (
    <SiteFrame>
      <BillingForm />
    </SiteFrame>
  )
}
