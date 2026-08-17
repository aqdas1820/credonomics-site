import { ArrowUpRight, Instagram, ShieldCheck } from 'lucide-react'
import styles from '../core-v4.module.css'

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footerTopline}`}>
        <div>
          <span>Research before decisions.</span>
          <h2>See the data and context before you act.</h2>
        </div>
        <a href="/tools">
          Explore financial tools <ArrowUpRight size={16} />
        </a>
      </div>

      <div className={`${styles.wrap} ${styles.footerMain}`}>
        <div className={styles.footerIntro}>
          <a className={styles.brand} href="/">
            <img src="/credonomics-mark.png" alt="" />
            <span className={styles.brandWords}>
              <strong>CREDONOMICS</strong>
              <small>Investment Solutions</small>
            </span>
          </a>

          <p>
            Financial research, IPO intelligence, mutual-fund portfolio analytics,
            credit-card economics and practical decision tools for India.
          </p>

          <div className={styles.footerTrust}>
            <ShieldCheck size={14} /> Official domain: credonomics.in
          </div>
        </div>

        <div className={styles.footerColumn}>
          <b>Investment intelligence</b>
          <a href="/research">Research Desk</a>
          <a href="/ipo">IPO Intelligence</a>
          <a href="/tools/mf-portfolio-tracker">Mutual Fund Intelligence</a>
          <a href="/tools">Financial Tools</a>
        </div>

        <div className={styles.footerColumn}>
          <b>Card intelligence</b>
          <a href="/cards">Compare Cards</a>
          <a href="/cards/all">Verified Cards</a>
          <a href="/cards/coverage">Coverage</a>
          <a href="/cards/compare">Head-to-Head</a>
        </div>

        <div className={styles.footerColumn}>
          <b>Company</b>
          <a href="/about">About</a>
          <a href="/official">Official Identity</a>
          <a href="/contact">Contact</a>
          <a href="/disclosures">Disclosures</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a
            href="https://www.instagram.com/credonomics.in/"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={12} /> Instagram
          </a>
        </div>
      </div>

      <div className={`${styles.wrap} ${styles.footerBottom}`}>
        <span>(c) {new Date().getFullYear()} CredoNomics Investment Solutions</span>
        <span>
          Not a SEBI-registered Investment Adviser or Research Analyst. General
          educational and informational content only.
        </span>
      </div>
    </footer>
  )
}