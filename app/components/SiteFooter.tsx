import Link from 'next/link'
import styles from './site-footer.module.css'
import { siteSections } from '../data/site-navigation'

export default function SiteFooter() {
  return (
    <footer className={styles.footerShell}>
      <div className={styles.footerWrap}>
        <section className={styles.ctaPanel}>
          <div className={styles.ctaCopy}>
            <span className={styles.kicker}>CredoNomics Investment Solutions</span>
            <h2>Research the context before making the decision.</h2>
          </div>

          <Link className={styles.ctaButton} href="/discover">
            Explore the platform
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

          {siteSections.map(section => <nav className={styles.linkColumn} aria-label={`${section.label} footer links`} key={section.id}>
            <Link className={styles.columnTitle} href={section.href}>{section.label}</Link>
            {section.links.slice(0, section.id === 'company' ? 7 : 4).map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>)}
        </section>

        <section className={styles.footnoteRow}>
          <p>© 2026 CredoNomics Investment Solutions · <Link href="/discover">Platform directory</Link></p>
          <p>
            Not a SEBI-registered Investment Adviser or Research Analyst ·
            General educational and informational content only
          </p>
        </section>
      </div>
    </footer>
  )
}
