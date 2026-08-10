import { Instagram } from 'lucide-react'
import styles from '../core-v4.module.css'

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footerMain}`}>
        <div className={styles.footerIntro}>
          <a className={styles.brand} href="/">
            <img src="/credonomics-mark.png" alt="" />
            <span className={styles.brandWords}>
              <strong>CREDONOMICS</strong>
              <small>Financial Research & Decision Tools</small>
            </span>
          </a>
          <p>
            CredoNomics Investment Solutions publishes general financial research,
            comparisons and calculators designed to make product economics easier to inspect.
          </p>
        </div>

        <div className={styles.footerColumn}>
          <b>Explore</b>
          <a href="/tools">Tools</a>
          <a href="/research">Research</a>
          <a href="/methodology">Methodology</a>
        </div>

        <div className={styles.footerColumn}>
          <b>Company</b>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/disclosures">Disclosures</a>
        </div>

        <div className={styles.footerColumn}>
          <b>Legal & social</b>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="https://www.instagram.com/credonomics.in/" target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
        </div>
      </div>

      <div className={`${styles.wrap} ${styles.footerBottom}`}>
        <span>© {new Date().getFullYear()} CredoNomics Investment Solutions.</span>
        <span>Not SEBI-registered · Not NISM-certified · General information only</span>
      </div>
    </footer>
  )
}
