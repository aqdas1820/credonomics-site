import Link from 'next/link'
import { ExternalLink, FileWarning, Scale, ShieldCheck, Mail, HeartHandshake, CreditCard, BookOpen } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Terms of Use',
  description: 'Terms for free educational resources, voluntary support, payment issues and use of CredoNomics Investment Solutions.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Terms of Use</span></div>
        <span className={styles.pageKicker}><Scale size={14}/> Terms of use</span>
        <h1>Understand the service <span>before using it.</span></h1>
        <p className={styles.pageHeroLead}>These terms explain the scope of CredoNomics Investment Solutions&apos; financial-information website, free tools and any optional contribution flow.</p>
        <p>Last updated: 1 November 2026</p>
      </section>
      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><BookOpen size={20}/></span><h2>Services and prices</h2><p>Public educational articles, general research, comparisons and published calculators are currently available without a purchase charge. A feature that requires payment, if introduced, will disclose its description, price in INR, relevant taxes or charges, payment method and delivery terms before checkout. No paid feature is promised solely by publishing this policy.</p></article>
          <article className={styles.policyCard}><span><ShieldCheck size={20}/></span><h2>Not regulated investment advice</h2><p>Our website is for general information and educational analysis, not personalised investment advice, securities recommendations or guaranteed financial outcomes. CredoNomics is not SEBI-registered as an Investment Adviser or Research Analyst. Confirm information with current official issuer and regulatory sources, and obtain licensed professional help where appropriate.</p></article>
          <article className={styles.policyCard}><span><HeartHandshake size={20}/></span><h2>Optional one-time support</h2><p>Where enabled, users may choose a voluntary one-time contribution, with displayed examples of ₹10, ₹100 or ₹500. A contribution is not an investment, a charitable tax-deductible donation, a subscription or a purchase of research access. It carries no promise of returns, preferential content or physical delivery. When online collection is disabled, any email request is only a request for instructions, not a payment.</p></article>
          <article className={styles.policyCard}><span><CreditCard size={20}/></span><h2>Payment handling</h2><p>Payments, when enabled, are subject to the options presented by the actual checkout provider. A redirect, UPI intent or submitted payment reference alone does not confirm successful payment; confirmation depends on verified transaction information. Do not repeat a pending payment without checking its status. See the <Link href="/refund-and-cancellation-policy">Refund &amp; Cancellation Policy</Link> and <Link href="/shipping-and-delivery-policy">Delivery Policy</Link>.</p></article>
          <article className={styles.policyCard}><span><FileWarning size={20}/></span><h2>Accuracy and acceptable use</h2><p>Figures, issuer rules, fees, rewards, eligibility and product conditions can change. Outputs depend on user inputs and assumptions. Do not misuse the website, attempt unauthorised access, send malicious requests or submit someone else&apos;s confidential information. We may correct, update, suspend or remove content or features when necessary.</p></article>
          <article className={styles.policyCard}><span><ExternalLink size={20}/></span><h2>External services and limitations</h2><p>Linked third-party sites and financial products have their own conditions. A link is not a guarantee, endorsement or promise of availability. Nothing in these terms excludes mandatory consumer rights or remedies under applicable law. Questions, corrections and payment disputes can be sent to our published support contact.</p></article>
        </div>
        <div className={styles.notice}>
          <Mail size={22}/>
          <div><h2>Business and customer contact</h2><p>CredoNomics Investment Solutions · Sole proprietorship · Dhule, Maharashtra, India. Email <a href="mailto:support@credonomics.in">support@credonomics.in</a> for customer or payment concerns. Read our <Link href="/privacy">Privacy Policy</Link>, <Link href="/grievance-redressal">Grievance Process</Link> and <Link href="/official">Business Identity</Link>.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
