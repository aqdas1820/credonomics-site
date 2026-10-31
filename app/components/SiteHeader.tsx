'use client'

import Link from 'next/link'
import { BarChart3, Bell, Eye, Home, Menu, UserRound, Wrench, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import styles from '../core-v4.module.css'
import navStyles from './site-navigation.module.css'
import { primarySections, sectionForPath } from '../data/site-navigation'
import { ChevronDown } from 'lucide-react'
import ThemeModeToggle from './ThemeModeToggle'
import SiteSearch from './SiteSearch'

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
  const [expanded, setExpanded] = useState<string | null>(null)
  const sectionButtons = useRef<Record<string, HTMLButtonElement | null>>({})
  const menuButton = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  const primaryNavigation = useRef<HTMLElement>(null)

  useEffect(() => { setOpen(false); setExpanded(null) }, [pathname])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => {
      primaryNavigation.current?.querySelector<HTMLElement>('a, button')?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open && !expanded) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (expanded) { sectionButtons.current[expanded]?.focus(); setExpanded(null) }
        else { setOpen(false); menuButton.current?.focus() }
      }
    }
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) { setOpen(false); setExpanded(null) }
    }
    const onFocus = (event: FocusEvent) => {
      if (!header.current?.contains(event.target as Node)) { setOpen(false); setExpanded(null) }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('focusin', onFocus)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('focusin', onFocus)
    }
  }, [open, expanded])

  const currentSection = sectionForPath(pathname)
  const isActive = (href: string) => href === '/' ? pathname === '/' : href === '/markets' ? currentSection?.id === 'markets' : pathname === href || pathname.startsWith(`${href}/`)

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
            ref={primaryNavigation}
            id="cn-primary-navigation"
            className={`${navStyles.navigation} ${open ? navStyles.open : ''}`}
            aria-label="Primary navigation"
          >
            {primarySections.map(section => (
              <div className={navStyles.group} key={section.id}>
                <div className={navStyles.groupHeading}>
                  <Link href={section.href} className={currentSection?.id === section.id ? navStyles.active : undefined} aria-current={pathname === section.href ? 'page' : undefined} onClick={() => { setOpen(false); setExpanded(null) }}>{section.label}</Link>
                  <button
                    ref={node => { sectionButtons.current[section.id] = node }}
                    type="button"
                    aria-label={`${expanded === section.id ? 'Close' : 'Open'} ${section.label} menu`}
                    aria-haspopup="true"
                    aria-expanded={expanded === section.id}
                    aria-controls={`nav-${section.id}`}
                    onClick={() => setExpanded(value => value === section.id ? null : section.id)}
                  ><ChevronDown size={13} aria-hidden="true"/></button>
                </div>
                <div id={`nav-${section.id}`} className={navStyles.dropdown} hidden={expanded !== section.id}>
                  <p>{section.description}</p>
                  {section.links.map(link => <Link href={link.href} key={link.href} onClick={() => { setOpen(false); setExpanded(null) }}><b>{link.label}</b><small>{link.description}</small></Link>)}
                </div>
              </div>
            ))}
            <div className={navStyles.mobileExtras}><Link href="/discover" onClick={() => setOpen(false)}>Explore all sections</Link><Link href="/watchlist" onClick={() => setOpen(false)}>My Workspace</Link><Link href="/about" onClick={() => setOpen(false)}>About & Trust</Link></div>
          </nav>

          <div className={styles.globalHeaderActions}>
            <Link href="/alerts" className={styles.utilityAction} aria-label="Alerts"><Bell size={18}/></Link>
            <Link href="/account" className={styles.utilityAction} aria-label="Account"><UserRound size={18}/></Link>
            <SiteSearch />
            <ThemeModeToggle compact />

            <Link href="/discover" className={styles.globalResearchCta}>
              Explore <span>→</span>
            </Link>

            <button
              ref={menuButton}
              type="button"
              className={styles.globalMenuButton}
              aria-label={open ? 'Close navigation' : 'Open navigation'}
              aria-expanded={open}
              aria-controls="cn-primary-navigation"
              onClick={() => { setOpen(value => !value); setExpanded(null) }}
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
