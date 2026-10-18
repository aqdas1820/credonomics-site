import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'

export const metadata: Metadata = {
  title: 'Billing — Development Preview',
  description: 'CredoNomics Billing development preview. No live invoices or payments are processed.',
  robots: { index: false, follow: false },
}

export default function BillingPreviewPage() {
  return (
    <SiteFrame>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', minHeight: '65vh' }}>
        <p style={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: 12 }}>CREDONOMICS · BILLING</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '16px 0' }}>Invoice generator — in development</h1>
        <p>We are preparing a private invoice generator with downloadable UNPAID invoices and admin-reviewed bank-credit confirmation.</p>
        <section aria-label="Billing safety status" style={{ marginTop: 28, padding: 24, border: '1px solid currentColor', borderRadius: 12 }}>
          <h2 style={{ fontSize: 20 }}>No live billing or payment collection</h2>
          <p>This page is informational only. Invoice creation, customer lookup, WhatsApp OTP, PDF download and UPI payment initiation are not enabled.</p>
          <p>Only independently confirmed Slice bank credit may authorize a PAID receipt in the future system.</p>
        </section>
      </main>
    </SiteFrame>
  )
}
