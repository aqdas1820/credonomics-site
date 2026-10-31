import Link from 'next/link'
import { ArrowLeftRight, Clock3, HeartHandshake, Mail, RotateCcw, ShieldCheck, Wallet } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'CredoNomics Investment Solutions refund, cancellation and payment dispute policy for voluntary contributions and any future paid services.',
  alternates: { canonical: '/refund-and-cancellation-policy' },
}

export default function RefundAndCancellationPolicyPage() {
  return (
    <SiteFrame>
      <section className={[styles.wrap, styles.pageHero].join(' ')}>
        <div className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Refund & Cancellation Policy</span></div>
        <span className={styles.pageKicker}><RotateCcw size={14} /> Payments & support</span>
        <h1>Refunds and cancellations, <span>explained clearly.</span></h1>
        <p className={styles.pageHeroLead}>
          This policy explains payment issues, eligible refund requests, cancellation options and how to reach CredoNomics Investment Solutions.
        </p>
        <p>Effective and last updated: 31 October 2026</p>
      </section>

      <section className={[styles.wrap, styles.pageBody].join(' ')}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}>
            <span><HeartHandshake size={20} /></span>
            <h2>What this policy covers</h2>
            <p>CredoNomics currently provides free financial education, research, comparisons and online tools. Where enabled, users may voluntarily support development through one-time contributions. Contributions are not investments, purchases of securities or payments for guaranteed returns, tax deductions or privileged research access.</p>
            <p>Online collection may be unavailable while payment verification is being set up. This page does not itself offer a payment facility or mean that a payment gateway is live.</p>
          </article>

          <article className={styles.policyCard}>
            <span><ArrowLeftRight size={20} /></span>
            <h2>Cancellation</h2>
            <p>Free website access can be discontinued at any time without a cancellation charge. A one-time voluntary contribution may be cancelled before the payment is completed. After a successful payment, please request a refund using the process below rather than attempting to cancel the completed transaction.</p>
            <p>We do not currently offer automatic recurring subscriptions through this website. If a paid product or recurring plan is introduced, its price, delivery and cancellation terms will be disclosed before payment.</p>
          </article>

          <article className={styles.policyCard}>
            <span><ShieldCheck size={20} /></span>
            <h2>When a refund may apply</h2>
            <p>We review requests for accidental or duplicate payments, amounts debited without confirmed payment credit, incorrect charges, and other genuine payment errors. We will also address non-delivery of any specifically purchased paid service, if introduced, and refunds required by applicable law.</p>
            <p>Because voluntary contributions do not purchase a specific deliverable, a change of mind alone does not automatically entitle a contributor to a refund. Other requests will be considered fairly on their facts and any applicable consumer rights.</p>
          </article>

          <article className={styles.policyCard}>
            <span><Mail size={20} /></span>
            <h2>How to request a refund</h2>
            <p>Email <a href="mailto:support@credonomics.in">support@credonomics.in</a> with the subject “Refund request — CredoNomics”. Include the payment date, amount, transaction/reference ID, payment method and a brief reason. You may attach a redacted proof of payment.</p>
            <p>Please contact us within 7 calendar days of noticing an issue where practical. This request window does not restrict any longer right available under law. Never email passwords, OTPs, full card numbers, PINs or CVVs.</p>
          </article>

          <article className={styles.policyCard}>
            <span><Clock3 size={20} /></span>
            <h2>Review and processing timelines</h2>
            <p>We aim to acknowledge requests within 2 business days and ordinarily review complete requests within 7 business days. Additional verification with a bank or payment provider may take longer.</p>
            <p>If approved, we initiate the refund through the original payment channel wherever supported. Funds commonly take about 5–7 business days after initiation to reach the originating account, but actual bank and payment-provider timelines may vary. We will communicate material delays where possible.</p>
          </article>

          <article className={styles.policyCard}>
            <span><Wallet size={20} /></span>
            <h2>Failed, pending or unauthorized payments</h2>
            <p>If money is debited but your transaction is pending or unconfirmed, do not immediately pay again. Contact us with the reference ID so the payment can be reconciled before a refund or correction is initiated.</p>
            <p>For a payment you did not authorize, promptly contact your bank or payment-app provider as well as our support address. Chargebacks, disputes and reversals are handled according to the relevant bank, network and payment-provider rules.</p>
          </article>
        </div>

        <div className={styles.notice}>
          <ShieldCheck size={22} />
          <div>
            <h2>Questions about a payment?</h2>
            <p>Contact <a href="mailto:support@credonomics.in">support@credonomics.in</a>. CredoNomics Investment Solutions is operated as a sole proprietorship in Maharashtra, India. Please also read our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy page</Link>. This policy may be updated prospectively; rights arising under applicable law remain unaffected.</p>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
