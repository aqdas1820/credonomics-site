'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import PageSectionNav from './PageSectionNav'
import { sectionForPath, activeSectionLink } from '../data/site-navigation'
import styles from './site-navigation.module.css'

/** Presentation only; never requests data or changes financial/account state. */
export default function SiteExperience() {
  const pathname = usePathname()
  const calm = /^\/(account|auth|alerts|watchlist)(\/|$)/.test(pathname)
  const section = sectionForPath(pathname)
  const active = section ? activeSectionLink(pathname, section) : undefined
  useEffect(() => {
    const root = document.getElementById('main-content')
    if (!root || calm) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches || !('IntersectionObserver' in window)) return
    const observed = new WeakSet<Element>()
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('cn-entered')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.04 })
    // Visible by default, including with JS disabled. Only below-fold entrances animate.
    const observe = () => root.querySelectorAll('section, article').forEach(node => {
      if (!observed.has(node) && node.getBoundingClientRect().top > window.innerHeight && !node.closest('[data-cm-home]')) {
        observed.add(node); observer.observe(node)
      }
    })
    observe()
    const mutation = new MutationObserver(observe)
    mutation.observe(root, { childList: true, subtree: true })
    const stop = () => { if (reduced.matches) observer.disconnect() }
    reduced.addEventListener('change', stop)
    return () => { observer.disconnect(); mutation.disconnect(); reduced.removeEventListener('change', stop) }
  }, [pathname, calm])
  if (pathname === '/' || !section) return null
  // IPO pages already have a dedicated stage/filter navigation bar.
  if (section.id === 'ipo') return <aside className="cn-context" aria-label="IPO research navigation"><a className={styles.sectionName} href="/ipo">IPO Intelligence</a><PageSectionNav key={pathname}/></aside>
  return <div className={styles.sectionBar}>
    <a className={styles.sectionName} href={section.href}>{section.label}</a>
    <nav className={styles.sectionNav} aria-label={`${section.label} section navigation`}>
      {section.links.map(link => <a href={link.href} key={link.href} aria-current={active === link.href ? 'page' : undefined}>{link.label}</a>)}
    </nav>
    {!calm && <PageSectionNav key={pathname}/>}
  </div>
}
