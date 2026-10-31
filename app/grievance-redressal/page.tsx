import Link from 'next/link'
import { Clock3, FileCheck2, Mail, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Customer Support & Grievance Redressal',
  description: 'How to report CredoNomics website, payment, privacy and consumer complaints and request escalation.',
  alternates: { canonical: '/grievance-redressal' },
}

export default function GrievanceRedressalPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Customer Support &amp; Grievances</span></div>
        <span className={styles.pageKicker}><Mail size={14}/> Customer assistance</span>
        <h1>Get help with a <span>specific issue.</span></h1>
        <p className={styles.pageHeroLead}>For concerns about content, data, access, payments or a refund, use the contact details below. You do not need to share financial passwords or authentication codes.</p>
        <p>Last updated: 1 November 2026</p>
      </section>
      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><Mail size={20}/></span><h2>Contact channel</h2><p>Email <a href="mailto:support@credonomics.in">support@credonomics.in</a> with “Customer grievance”, “Payment issue”, “Refund request” or “Content correction” in the subject. Our business is CredoNomics Investment Solutions, a sole proprietorship in Dhule, Maharashtra, India.</p></article>
          <article className={styles.policyCard}><span><FileCheck2 size={20}/></span><h2>Helpful details</h2><p>Explain the issue, affected URL or service, relevant dates and the outcome you seek. For a payment issue, share only the amount, date, transaction reference and a redacted payment confirmation where needed. Never share OTPs, passwords, card PINs, CVVs or complete card numbers.</p></article>
          <article className={styles.policyCard}><span><Clock3 size={20}/></span><h2>Review and updates</h2><p>We aim to acknowledge support requests within 2 business days and ordinarily review complete payment or refund requests within 7 business days. Some cases need independent bank, provider or source verification and may take longer. We will communicate material delays when possible.</p></article>
          <article className={styles.policyCard}><span><ShieldCheck size={20}/></span><h2>If an issue remains unresolved</h2><p>Reply to the same email thread with “Escalation requested” and the original complaint details. You may also pursue appropriate remedies through your bank, payment provider or competent consumer authority where applicable. This process does not restrict statutory rights.</p></article>
        </div>
        <div className={styles.notice}>
          <ShieldCheck size={22}/>
          <div><h2>Further information</h2><p>Read our <Link href="/refund-and-cancellation-policy">Refund &amp; Cancellation Policy</Link>, <Link href="/privacy">Privacy Policy</Link>, <Link href="/shipping-and-delivery-policy">Delivery Policy</Link> and <Link href="/official">Registered Business Identity</Link>.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
