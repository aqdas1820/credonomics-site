'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, List } from 'lucide-react'
import styles from './page-section-nav.module.css'

type Section = { id: string; label: string }

export default function PageSectionNav() {
  const pathname = usePathname()
  const [sections, setSections] = useState<Section[]>([])
  const details = useRef<HTMLDetailsElement>(null)
  const summary = useRef<HTMLElement>(null)
  useEffect(() => {
    setSections([])
    if (details.current) details.current.open = false
    const root = document.getElementById('main-content')
    if (!root) return
    let frame = 0
    const collect = () => {
      const headings = Array.from(root.querySelectorAll<HTMLHeadingElement>('h2')).filter(node => !node.closest('aside,dialog,[role="dialog"],header,footer') && node.textContent?.trim())
      const next = headings.slice(0, 16).map((node, index) => {
        node.classList.add(styles.heading)
        if (!node.id) {
          const stem = `cn-section-${index + 1}`
          let candidate = stem
          let suffix = 1
          while (document.getElementById(candidate)) candidate = `${stem}-${suffix++}`
          node.id = candidate
        }
        return { id: node.id, label: node.textContent!.trim() }
      })
      setSections(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(collect) }
    collect()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && details.current?.open) { details.current.open = false; summary.current?.focus() }
    }
    const outside = (event: PointerEvent) => {
      if (details.current?.open && !details.current.contains(event.target as Node)) details.current.open = false
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', outside)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', outside) }
  }, [pathname])
  return <div className={styles.slot}>
    {sections.length > 1 ? <details ref={details} className={styles.details}>
      <summary ref={summary}><List size={15} aria-hidden="true" />On this page<ChevronDown size={13} aria-hidden="true" /></summary>
      <nav aria-label="On this page" className={styles.panel}>
        <span>JUMP TO A SECTION</span>
        {sections.map((section, index) => <a key={section.id} href={`#${section.id}`} onClick={() => {
          if (details.current) details.current.open = false
          const heading = document.getElementById(section.id)
          if (heading) { heading.tabIndex = -1; requestAnimationFrame(() => heading.focus({ preventScroll: true })) }
        }}><small>{String(index + 1).padStart(2, '0')}</small>{section.label}</a>)}
      </nav>
    </details> : <svg viewBox="0 0 120 34" width="120" height="34" aria-hidden="true"><path d="M5 17H35L60 5L85 17H115M35 17L60 29L85 17" fill="none" stroke="currentColor" /></svg>}
  </div>
}
