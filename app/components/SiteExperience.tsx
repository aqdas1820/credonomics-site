'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const families = [
  ['/research', 'Research Desk', 'Sources', 'Frameworks', 'Perspective'],
  ['/reports', 'Research Publications', 'Sources', 'Analysis', 'Limitations'],
  ['/ipo', 'IPO Intelligence', 'Filings', 'Issue context', 'Research'],
  ['/mutual-funds', 'Mutual Fund Intelligence', 'Disclosures', 'Holdings', 'Context'],
  ['/tools/mf-portfolio-tracker', 'Portfolio Intelligence', 'Disclosures', 'Holdings', 'Context'],
  ['/cards', 'Card Intelligence', 'Issuer terms', 'Fees & caps', 'Economics'],
  ['/tools', 'Financial Tools', 'Your inputs', 'Calculation', 'Explanation'],
  ['/discover', 'Intelligence Discovery', 'Explore', 'Find context', 'Read sources'],
  ['/search', 'Intelligence Search', 'Explore', 'Find context', 'Read sources'],
  ['/stocks', 'Equity Intelligence', 'Sources', 'Fundamentals', 'Risk'],
  ['/markets', 'Market Intelligence', 'Sources', 'Market context', 'Perspective'],
]

/** Presentation only; never requests data or changes financial/account state. */
export default function SiteExperience() {
  const pathname = usePathname()
  const calm = /^\/(account|auth|alerts|watchlist)(\/|$)/.test(pathname)
  const family = families.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
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
  if (pathname === '/' || calm || !family) return null
  return <aside className="cn-context" aria-label={`${family[1]} framework`}>
    <span className="cn-context-name"><i aria-hidden="true" />{family[1]}</span>
    <span className="cn-context-flow" aria-label="Conceptual workflow">{family.slice(2).map((label, index) => <span key={label}>{index > 0 && <b aria-hidden="true">→</b>}{label}</span>)}</span>
    <svg viewBox="0 0 120 34" width="120" height="34" aria-hidden="true"><path d="M5 17H35L60 5L85 17H115M35 17L60 29L85 17" /><circle cx="5" cy="17" r="3"/><circle cx="60" cy="5" r="3"/><circle cx="60" cy="29" r="3"/><circle cx="115" cy="17" r="3"/></svg>
  </aside>
}
