'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import styles from '../core-v4.module.css'
import ThemeModeToggle from './ThemeModeToggle'

const primaryNav = [
  { href: '/research', label: 'Research' },
  { href: '/ipo', label: 'IPOs' },
  { href: '/tools/mf-portfolio-tracker', label: 'Mutual Funds' },
  { href: '/cards', label: 'Cards' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
]

const intelligenceNav = [
  { href: '/research', title: 'Research', detail: 'Frameworks' },
  { href: '/ipo/calendar', title: 'IPO Calendar', detail: 'Primary market' },
  {
    href: '/tools/mf-portfolio-tracker',
    title: 'MF Intelligence',
    detail: 'Portfolio data',
  },
  { href: '/cards', title: 'Card Intelligence', detail: 'Product economics' },
  { href: '/methodology', title: 'Methodology', detail: 'Sources & limits' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/tools/mf-portfolio-tracker') {
      return pathname.startsWith('/tools/mf-portfolio-tracker')
    }

    if (href === '/tools') {
      return (
        pathname === '/tools' ||
        (pathname.startsWith('/tools/') &&
          !pathname.startsWith('/tools/mf-portfolio-tracker'))
      )
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.globalHeader}>
        <div className={styles.globalHeaderInner}>
          <Link
            href="/"
            className={styles.globalBrand}
            aria-label="CredoNomics home"
            onClick={() => setOpen(false)}
          >
            <span className={styles.globalBrandMarkShell}>
              <img src="/credonomics-mark.png" alt="" />
            </span>

            <span className={styles.globalBrandWords}>
              <strong>CredoNomics</strong>
              <small>Investment Solutions</small>
            </span>
          </Link>

          <nav
            className={`${styles.globalNav} ${
              open ? styles.globalNavOpen : ''
            }`}
            aria-label="Primary navigation"
          >
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive(item.href) ? styles.globalNavActive : undefined
                }
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.globalHeaderActions}>
            <ThemeModeToggle compact />

            <Link href="/research" className={styles.globalResearchCta}>
              Research Desk <span>â†’</span>
            </Link>

            <button
              type="button"
              className={styles.globalMenuButton}
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.intelligenceStrip}>
        <div className={styles.intelligenceStripInner}>
          <div className={styles.intelligenceIdentity}>
            <span className={styles.intelligenceLive}>
              <i />
              Intelligence Desk
            </span>

            <span className={styles.intelligenceDivider} />
            <span className={styles.intelligenceStatus}>
              Source-aware research
            </span>
          </div>

          <nav
            className={styles.intelligenceNav}
            aria-label="Intelligence shortcuts"
          >
            {intelligenceNav.map((item) => (
              <Link href={item.href} key={item.href}>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}