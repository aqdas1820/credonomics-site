'use client'

import { Instagram, Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from '../core-v4.module.css'

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('credonomics-theme')
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      const useDark = stored ? stored === 'dark' : Boolean(prefersDark)
      setDark(useDark)
      document.documentElement.dataset.theme = useDark ? 'dark' : 'light'
    } catch {}
  }, [])

  const toggleTheme = () => {
    setDark((value) => {
      const next = !value
      document.documentElement.dataset.theme = next ? 'dark' : 'light'
      try { window.localStorage.setItem('credonomics-theme', next ? 'dark' : 'light') } catch {}
      return next
    })
  }

  return (
    <>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <div className={styles.utilityBar}>
        <ShieldCheck size={12} />
        Independent educational research · Not SEBI-registered · Not NISM-certified
      </div>
      <header className={styles.navShell}>
        <div className={styles.nav}>
          <a className={styles.brand} href="/" aria-label="CredoNomics home">
            <img src="/credonomics-mark.png" alt="" />
            <span className={styles.brandWords}>
              <strong>CREDONOMICS</strong>
              <small>Financial Research & Decision Tools</small>
            </span>
          </a>

          <nav className={`${styles.navLinks} ${open ? styles.navLinksOpen : ''}`} aria-label="Primary navigation">
            <a href="/tools" onClick={() => setOpen(false)}>Tools</a>
            <a href="/cards" onClick={() => setOpen(false)}>Compare Cards</a>
            <a href="/research" onClick={() => setOpen(false)}>Research</a>
            <a href="/methodology" onClick={() => setOpen(false)}>Methodology</a>
            <a href="/about" onClick={() => setOpen(false)}>About</a>
            <a href="/disclosures" onClick={() => setOpen(false)}>Disclosures</a>
          </nav>

          <div className={styles.navActions}>
            <a
              className={styles.socialMini}
              href="https://www.instagram.com/credonomics.in/"
              target="_blank"
              rel="noreferrer"
              aria-label="CredoNomics on Instagram"
            >
              <Instagram size={14} /> @credonomics.in
            </a>
            <button className={styles.iconButton} onClick={toggleTheme} aria-label="Toggle colour theme">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className={`${styles.iconButton} ${styles.menuButton}`}
              onClick={() => setOpen((v) => !v)}
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
