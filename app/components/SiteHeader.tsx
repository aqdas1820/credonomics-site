'use client'

import Link from 'next/link'
import { BarChart3, Bell, Eye, Home, Menu, UserRound, Wrench, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import styles from '../core-v4.module.css'
import ThemeModeToggle from './ThemeModeToggle'
import SiteSearch from './SiteSearch'

const primaryNav = [
  { href: '/markets', label: 'Markets' },
  { href: '/research', label: 'Research' },
  { href: '/ipo', label: 'IPOs' },
  { href: '/tools/mf-portfolio-tracker', label: 'Mutual Funds' },
  { href: '/cards', label: 'Cards' },
  { href: '/tools', label: 'Tools' },
  { href: '/discover', label: 'Discover' },
]

const mobileNav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/markets', label: 'Markets', icon: BarChart3 },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
  { href: '/research', label: 'Research', icon: BarChart3 },
  { href: '/tools', label: 'Tools', icon: Wrench },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus() }
    }
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onPointer) }
  }, [open])

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

      <header ref={header} className={styles.globalHeader}>
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
            id="cn-primary-navigation"
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
            <Link href="/account" className={styles.mobileUtility} onClick={() => setOpen(false)}>Account</Link>
            <Link href="/alerts" className={styles.mobileUtility} onClick={() => setOpen(false)}>Alerts</Link>
          </nav>

          <div className={styles.globalHeaderActions}>
            <Link href="/alerts" className={styles.utilityAction} aria-label="Alerts"><Bell size={18}/></Link>
            <Link href="/account" className={styles.utilityAction} aria-label="Account"><UserRound size={18}/></Link>
            <SiteSearch />
            <ThemeModeToggle compact />

            <Link href="/research" className={styles.globalResearchCta}>
              Research Desk <span>→</span>
            </Link>

            <button
              ref={menuButton}
              type="button"
              className={styles.globalMenuButton}
              aria-label="Toggle navigation"
              aria-expanded={open}
              aria-controls="cn-primary-navigation"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <nav className={styles.mobileDock} aria-label="Mobile primary navigation">
        {mobileNav.map(({ href, label, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className={isActive(href) ? styles.mobileDockActive : undefined}
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
