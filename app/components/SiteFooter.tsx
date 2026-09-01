import Link from 'next/link'
import styles from './site-footer.module.css'

const investmentLinks = [
  { label: 'Research Desk', href: '/research' },
  { label: 'IPO Intelligence', href: '/ipo' },
  { label: 'Mutual Fund Intelligence', href: '/mutual-funds' },
  { label: 'Financial Tools', href: '/tools' },
]

const cardLinks = [
  { label: 'Credit Card Intelligence', href: '/cards' },
  { label: 'Card Directory', href: '/cards' },
  { label: 'Head-to-Head', href: '/cards' },
  { label: 'Methodology', href: '/methodology' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Official Identity', href: '/official' },
  { label: 'Contact', href: '/about' },
  { label: 'Disclosures', href: '/disclosures' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export default function SiteFooter() {
  return (
    <footer className={styles.footerShell}>
      <div className={styles.footerWrap}>
        <section className={styles.ctaPanel}>
          <div className={styles.ctaCopy}>
            <span className={styles.kicker}>CredoNomics Investment Solutions</span>
            <h2>Research the context before making the decision.</h2>
          </div>

          <Link className={styles.ctaButton} href="/research">
            Research Desk
            <span aria-hidden="true">↗</span>
          </Link>
        </section>

        <section className={styles.footerGrid}>
          <div className={styles.brandColumn}>
            <div className={styles.brandRow}>
              <span className={styles.logoPlate}>
                <img src="/credonomics-mark.png" alt="CredoNomics logo" />
              </span>

              <span className={styles.wordmark}>
                <strong>CredoNomics</strong>
                <small>Investment Solutions</small>
              </span>
            </div>

            <p className={styles.brandDescription}>
              India-focused financial intelligence across investment research,
              IPOs, mutual-fund portfolios, credit-card economics and
              transparent decision tools.
            </p>

            <a className={styles.domainBadge} href="https://credonomics.in">
              Official domain: credonomics.in
            </a>
          </div>

          <nav className={styles.linkColumn} aria-label="Investment intelligence">
            <span className={styles.columnTitle}>Investment Intelligence</span>
            {investmentLinks.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className={styles.linkColumn} aria-label="Financial products">
            <span className={styles.columnTitle}>Financial Products</span>
            {cardLinks.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className={styles.linkColumn} aria-label="Company">
            <span className={styles.columnTitle}>Company</span>
            {companyLinks.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </nav>
        </section>

        <section className={styles.footnoteRow}>
          <p>© 2026 CredoNomics Investment Solutions</p>
          <p>
            Not a SEBI-registered Investment Adviser or Research Analyst ·
            General educational and informational content only
          </p>
        </section>
      </div>
    </footer>
  )
}
