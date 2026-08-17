'use client'

import { BarChart3, Instagram, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import styles from '../core-v4.module.css'

const navItems = [
  { href: '/research', label: 'Research' },
  { href: '/ipo', label: 'IPOs' },
  { href: '/tools/mf-portfolio-tracker', label: 'Mutual Funds' },
  { href: '/cards', label: 'Cards' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/cards') {
      return pathname === '/cards' || pathname.startsWith('/cards/')
    }

    if (href === '/ipo') {
      return pathname === '/ipo' || pathname.startsWith('/ipo/')
    }

    if (href === '/tools/mf-portfolio-tracker') {
      return pathname.startsWith('/tools/mf-portfolio-tracker')
    }

    if (href === '/tools') {
      return pathname === '/tools' ||
        (pathname.startsWith('/tools/') &&
          !pathname.startsWith('/tools/mf-portfolio-tracker'))
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <div className={styles.utilityBar}>
        <span>
          Independent financial research Â· Source-linked data Â· India-focused
        </span>
        <a href="/disclosures">Disclosures â†’</a>
      </div>

      <header className={styles.navShell}>
        <div className={styles.nav}>
          <a className={styles.brand} href="/" aria-label="CredoNomics home">
            <img src="/credonomics-mark.png" alt="" />
            <span className={styles.brandWords}>
              <strong>CREDONOMICS</strong>
              <small>Investment Solutions</small>
            </span>
          </a>

          <nav
            className={`${styles.navLinks} ${open ? styles.navLinksOpen : ''}`}
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? styles.navActive : undefined}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.navActions}>
            <a
              className={styles.navCoverage}
              href="/tools/mf-portfolio-tracker"
            >
              <BarChart3 size={14} />
              MF Intelligence
            </a>

            <a
              className={styles.iconButton}
              href="https://www.instagram.com/credonomics.in/"
              target="_blank"
              rel="noreferrer"
              aria-label="CredoNomics on Instagram"
            >
              <Instagram size={16} />
            </a>

            <button
              className={`${styles.iconButton} ${styles.menuButton}`}
              onClick={() => setOpen((value) => !value)}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}