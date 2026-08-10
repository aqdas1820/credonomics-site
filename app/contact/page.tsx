import { Instagram, Mail, Phone } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Contact',
  description: 'Official CredoNomics contact channels.',
}

export default function ContactPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Contact</span></div>
        <span className={styles.pageKicker}><Mail size={14}/> Official channels</span>
        <h1>Research question, correction or <span>website feedback?</span></h1>
        <p className={styles.pageHeroLead}>Use the official channels below. Never send banking passwords, OTPs, PINs, CVVs or other authentication credentials.</p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.contactGrid}>
          <a className={styles.contactCard} href="https://www.instagram.com/credonomics.in/" target="_blank" rel="noreferrer">
            <span className={styles.iconTile}><Instagram size={21}/></span>
            <small>Official Instagram</small><h2>@credonomics.in</h2><p>Updates, educational posts and CredoNomics announcements.</p><strong>Open Instagram ↗</strong>
          </a>
          <a className={styles.contactCard} href="mailto:hello@credonomics.in">
            <span className={styles.iconTile}><Mail size={21}/></span>
            <small>Email</small><h2>hello@credonomics.in</h2><p>Research corrections, website feedback and general enquiries.</p><strong>Send email →</strong>
          </a>
          <a className={styles.contactCard} href="tel:+912562455327">
            <span className={styles.iconTile}><Phone size={21}/></span>
            <small>Phone</small><h2>02562 455327</h2><p>General CredoNomics contact number.</p><strong>Call →</strong>
          </a>
        </div>
      </section>
    </SiteFrame>
  )
}
