import { Database, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Privacy',
  description: 'CredoNomics privacy information and safe-use guidance.',
}

export default function PrivacyPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Privacy</span></div>
        <span className={styles.pageKicker}><ShieldCheck size={14}/> Privacy</span>
        <h1>Use financial tools without sharing <span>sensitive credentials.</span></h1>
        <p className={styles.pageHeroLead}>CredoNomics is designed for research and calculations. You should never provide passwords, OTPs, PINs, CVVs or banking login credentials to the website.</p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><EyeOff size={20}/></span><h2>Sensitive information</h2><p>Do not enter banking passwords, card PINs, CVVs, OTPs, authentication codes or other secrets into CredoNomics calculators, emails or social-media messages.</p></article>
          <article className={styles.policyCard}><span><Database size={20}/></span><h2>Technical data</h2><p>Hosting and infrastructure providers may process standard technical information such as IP address, request logs, browser information and security telemetry as part of operating the website.</p></article>
          <article className={styles.policyCard}><span><Mail size={20}/></span><h2>Messages you send</h2><p>If you email or message CredoNomics, the information you choose to provide may be retained as needed to respond, maintain records or improve the website.</p></article>
          <article className={styles.policyCard}><span><ShieldCheck size={20}/></span><h2>Browser preferences</h2><p>The website may store simple browser preferences such as colour theme. These preferences are not intended to store financial-account credentials.</p></article>
        </div>
      </section>
    </SiteFrame>
  )
}
