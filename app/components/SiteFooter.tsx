import { ArrowUpRight, Instagram, ShieldCheck } from 'lucide-react'
import styles from '../core-v4.module.css'

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footerTopline}`}>
        <div>
          <span>Research before rewards.</span>
          <h2>See the economics before you choose the card.</h2>
        </div>
        <a href="/cards">Compare real cards <ArrowUpRight size={16}/></a>
      </div>

      <div className={`${styles.wrap} ${styles.footerMain}`}>
        <div className={styles.footerIntro}>
          <a className={styles.brand} href="/">
            <img src="/credonomics-mark.png" alt="" />
            <span className={styles.brandWords}>
              <strong>CREDONOMICS</strong>
              <small>Indian Credit Card Intelligence</small>
            </span>
          </a>
          <p>
            Source-linked financial research, real-card comparisons and transparent calculators
            designed to make Indian credit-card economics easier to inspect.
          </p>
          <div className={styles.footerTrust}><ShieldCheck size={14}/> Official domain: credonomics.in</div>
        </div>

        <div className={styles.footerColumn}>
          <b>Card intelligence</b>
          <a href="/cards">Compare Cards</a>
          <a href="/cards/all">All Verified Cards</a>
          <a href="/cards/coverage">Coverage</a>
          <a href="/cards/compare">Head-to-Head</a>
        </div>

        <div className={styles.footerColumn}>
          <b>Research</b>
          <a href="/research">Research Desk</a>
          <a href="/tools">Calculators</a>
          <a href="/methodology">Methodology</a>
          <a href="/corrections">Corrections</a>
        </div>

        <div className={styles.footerColumn}>
          <b>Company</b>
          <a href="/about">About</a>
          <a href="/official">Official Identity</a>
          <a href="/contact">Contact</a>
          <a href="/disclosures">Disclosures</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="https://www.instagram.com/credonomics.in/" target="_blank" rel="noreferrer">
            <Instagram size={12}/> Instagram
          </a>
        </div>
      </div>

      <div className={`${styles.wrap} ${styles.footerBottom}`}>
        <span>© {new Date().getFullYear()} CredoNomics</span>
        <span>Not SEBI-registered · Not NISM-certified · General information only</span>
      </div>
    </footer>
  )
}
