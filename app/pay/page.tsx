import type { Metadata } from 'next'
import Link from 'next/link'
import SiteFrame from '../components/SiteFrame'
import styles from './pay.module.css'

export const metadata: Metadata = {
  title: 'Invoice Payments — Integration Preview',
  description: 'CredoNomics invoice-payment integration preview. Payment collection is not enabled on this page.',
  robots: { index: false, follow: false },
}

const journey = [
  {
    number: '01',
    title: 'Invoice confirmation',
    description: 'The final checkout will load the invoice and amount from trusted server-side records. Customers will not set payable amounts.',
  },
  {
    number: '02',
    title: 'WhatsApp OTP',
    description: 'The existing YouPI checkout will authenticate the customer before displaying a payment QR. Never share an OTP with support staff.',
  },
  {
    number: '03',
    title: 'UPI QR checkout',
    description: 'A hosted YouPI service will present a bank-linked UPI QR for the exact invoice amount when the public gateway is ready.',
  },
  {
    number: '04',
    title: 'Bank-credit review',
    description: 'Payment confirmation will require an independently reviewed Slice bank credit. A gateway SUCCESS message alone is insufficient.',
  },
]

export default function PaymentEntryPage() {
  return (
    <SiteFrame>
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="payment-heading">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>CREDONOMICS · PAYMENT OPERATIONS</span>
            <div className={styles.pilotTag}>Integration preview · Not accepting payments</div>
            <h1 id="payment-heading">Invoice payments, with verification built in.</h1>
            <p>
              We are connecting the existing CredoNomics invoice workflow to YouPI checkout.
              The planned flow includes customer WhatsApp OTP, an amount-specific UPI QR,
              and manual bank-credit verification.
            </p>
            <div className={styles.actions}>
              <Link href="/contact" className={styles.contactLink}>Contact CredoNomics <span aria-hidden="true">↗</span></Link>
              <Link href="/terms" className={styles.termsLink}>Terms of use</Link>
            </div>
          </div>
          <aside className={styles.statusCard} aria-label="Payment integration status">
            <span className={styles.statusLabel}>CURRENT AVAILABILITY</span>
            <strong>Website checkout is not live</strong>
            <p>No payment session, OTP request or UPI transaction can be started from this page.</p>
            <div className={styles.statusLine}><span>Customer OTP</span><b>Planned</b></div>
            <div className={styles.statusLine}><span>UPI checkout</span><b>Planned</b></div>
            <div className={styles.statusLine}><span>Bank verification</span><b>Manual review</b></div>
            <div className={styles.statusLine}><span>Automatic settlement</span><b>Disabled</b></div>
          </aside>
        </section>

        <section className={styles.workflow} aria-labelledby="payment-steps">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>INTEGRATION ROADMAP</span>
            <h2 id="payment-steps">How invoice checkout will work</h2>
            <p>These are the planned steps, not a claim that public payment processing is available today.</p>
          </div>
          <ol className={styles.cards}>
            {journey.map((step) => (
              <li key={step.number} className={styles.stepCard}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.notice}>
          <h2>Already have an invoice?</h2>
          <p>
            Follow the payment instructions issued with that invoice. Do not send funds to a
            QR copied from an unverified website or share UPI PINs, passwords, or OTPs with anyone.
            This preview does not update invoice status.
          </p>
        </section>
      </div>
    </SiteFrame>
  )
}
