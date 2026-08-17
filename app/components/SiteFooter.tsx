import {
  ArrowUpRight,
  BarChart3,
  Instagram,
  ShieldCheck,
} from 'lucide-react'
import styles from '../core-v4.module.css'

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footerTopline}`}>
        <div>
          <span>CredoNomics Investment Solutions</span>
          <h2>Research the context before making the decision.</h2>
        </div>

        <a href="/research">
          Research Desk <ArrowUpRight size={16} />
        </a>
      </div>

      <div className={`${styles.wrap} ${styles.footerMain}`}>
        <div className={styles.footerIntro}>
          <a className={styles.brand} href="/">
            <img src="/credonomics-mark.png" alt="" />
            <span className={styles.brandWords}>
              <strong>CredoNomics</strong>
              <small>Investment Solutions</small>
            </span>
          </a>

          <p>
            India-focused financial intelligence across investment research,
            IPOs, mutual-fund portfolios, credit-card economics and transparent
            decision tools.
          </p>

          <div className={styles.footerTrust}>
            <ShieldCheck size={14} />
            Official domain: credonomics.in
          </div>
        </div>

        <div className={styles.footerColumn}>
          <b>Investment intelligence</b>
          <a href="/research">Research Desk</a>
          <a href="/reports">Research Reports</a>
          <a href="/ipo">IPO Intelligence</a>
          <a href="/tools/mf-portfolio-tracker">
            <BarChart3 size={12} /> Mutual Fund Intelligence
          </a>
          <a href="/tools">Financial Tools</a>
        </div>

        <div className={styles.footerColumn}>
          <b>Financial products</b>
          <a href="/cards">Credit Card Intelligence</a>
          <a href="/cards/all">Card Directory</a>
          <a href="/cards/compare">Head-to-Head</a>
          <a href="/methodology">Methodology</a>
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
        <span>
          Â© {new Date().getFullYear()} CredoNomics Investment Solutions
        </span>
        <span>
          Not a SEBI-registered Investment Adviser or Research Analyst Â·
          General educational and informational content only
        </span>
      </div>
    </footer>
  )
}