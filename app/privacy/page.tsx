import Link from 'next/link'
import { Database, EyeOff, Mail, ShieldCheck, LockKeyhole, Cookie, UserRoundCheck, Network } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How CredoNomics Investment Solutions handles website, account, contact and payment-related information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Privacy Policy</span></div>
        <span className={styles.pageKicker}><ShieldCheck size={14}/> Privacy &amp; data</span>
        <h1>Clear information about <span>your privacy.</span></h1>
        <p className={styles.pageHeroLead}>This policy describes information that CredoNomics Investment Solutions may handle when you browse, use tools, create an account, contact us or make a payment where collection is enabled.</p>
        <p>Last updated: 1 November 2026</p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><Database size={20}/></span><h2>Information involved</h2><p>Depending on the features you use, information may include account identifiers, email addresses and sign-in details; messages submitted to us; information entered in research tools; technical usage data such as IP address, browser, request and error logs; and payment references, amount or confirmation status for applicable transactions.</p><p>Not every visitor provides every type of information. Some tools and browser preferences may work locally on your device.</p></article>
          <article className={styles.policyCard}><span><LockKeyhole size={20}/></span><h2>Why information is used</h2><p>Relevant information is used to deliver website features, respond to support or correction requests, protect against abuse, administer accounts, maintain security and performance, investigate payment issues and meet applicable legal or accounting obligations. Where required, separate notice or consent may be requested for optional uses.</p></article>
          <article className={styles.policyCard}><span><Network size={20}/></span><h2>Service providers and payments</h2><p>Hosting, security, authentication, analytics or payment service providers may process information needed for their services. If online collection is enabled, payments are handled through the disclosed payment flow and its provider; transaction verification can involve bank or payment-system records. We do not ask users to send banking passwords, OTPs, card PINs or CVVs.</p><p>We may also disclose information where required by law or to protect against fraud or misuse. This policy does not imply that any particular payment gateway has been activated.</p></article>
          <article className={styles.policyCard}><span><Cookie size={20}/></span><h2>Cookies and local storage</h2><p>The website may use browser storage, cookies or similar technologies for functions such as preferences, sign-in sessions and security. Hosting or third-party integrations may also set technology-specific cookies. Browser settings can be used to manage these, but disabling them may affect some features.</p></article>
          <article className={styles.policyCard}><span><EyeOff size={20}/></span><h2>Security and retention</h2><p>Reasonable technical and organisational precautions should be used to protect records, but no internet service can promise absolute security. Information is retained as needed for operating features, responding to requests, resolving disputes and complying with applicable requirements, then deleted or de-identified when appropriate. Retention can vary by record type and provider.</p></article>
          <article className={styles.policyCard}><span><UserRoundCheck size={20}/></span><h2>Questions and privacy requests</h2><p>To request access, correction or deletion of personal information, or raise a privacy concern, email <a href="mailto:support@credonomics.in">support@credonomics.in</a>. Please describe the relevant feature or record without sharing unnecessary sensitive data. Requests may need identity checks and may be limited by security or legal record-keeping duties.</p></article>
        </div>
        <div className={styles.notice}>
          <Mail size={22}/>
          <div><h2>Responsible business and contact</h2><p>CredoNomics Investment Solutions · Sole proprietorship · Dhule, Maharashtra, India. Registered business contact: <a href="mailto:credonomicsinvest@gmail.com">credonomicsinvest@gmail.com</a>; privacy and customer support: <a href="mailto:support@credonomics.in">support@credonomics.in</a>. See <Link href="/official">Official Business Identity</Link>, <Link href="/terms">Terms of Use</Link> and <Link href="/grievance-redressal">Customer Support &amp; Grievances</Link>.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
