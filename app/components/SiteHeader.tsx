'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import { BarChart3, Bell, Eye, Home, Menu, UserRound, Wrench, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '../../src/lib/supabase/browser'
import styles from '../core-v4.module.css'
import ThemeModeToggle from './ThemeModeToggle'
import SiteSearch from './SiteSearch'

const primaryNav = [
  { href: '/markets', label: 'Markets' },
  { href: '/research', label: 'Research' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/ipo', label: 'IPOs' },
  { href: '/tools/mf-portfolio-tracker', label: 'Mutual Funds' },
  { href: '/cards', label: 'Cards' },
  { href: '/tools', label: 'Tools' },
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
  const [user, setUser] = useState<User | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (!supabase) return
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    void fetchUser().catch(() => setUser(null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

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
              <Image src="/credonomics-mark.png" alt="" width={40} height={40} />
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
            id="primary-navigation"
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
            <div className={styles.mobileTheme}><ThemeModeToggle /></div>
          </nav>

          <div className={styles.globalHeaderActions}>
            <Link className={styles.headerAlerts} href="/alerts" aria-label="Alerts"><Bell size={18}/></Link>
            <SiteSearch />
            <span className={styles.headerTheme}><ThemeModeToggle compact /></span>

            <Link href="/research" className={styles.globalResearchCta}>
              Research Desk <span>→</span>
            </Link>

            <Link className={styles.headerAccount} href={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Log in'}><UserRound size={18} /></Link>

            <button type="button" className={styles.globalMenuButton} aria-label="Toggle navigation" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(value => !value)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
      </header>
      <nav className={styles.mobileDock} aria-label="Mobile primary navigation">
        {mobileNav.map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={isActive(href) ? styles.mobileDockActive : undefined} aria-current={isActive(href) ? 'page' : undefined}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
      </nav>
    </>
  )
}
