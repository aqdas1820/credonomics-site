'use client'
import { useEffect, useRef } from 'react'
import styles from './home-cursor-aura.module.css'

/** Decorative homepage glow: pointer coordinates stay local, with no React rerenders. */
export default function HomeCursorAura() {
  const glowRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    const fine = matchMedia('(hover:hover) and (pointer:fine)')
    const reduced = matchMedia('(prefers-reduced-motion:reduce)')
    let frame = 0, x = 0, y = 0, enabled = false
    const render = () => {
      frame = 0
      glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX
      y = event.clientY
      glow.dataset.active = 'true'
      if (!frame) frame = requestAnimationFrame(render)
    }
    const exit = (event: MouseEvent) => {
      if (!event.relatedTarget) glow.dataset.active = 'false'
    }
    const visibility = () => { if (document.hidden) glow.dataset.active = 'false' }
    const sync = () => {
      const next = fine.matches && !reduced.matches
      if (next === enabled) return
      enabled = next
      if (enabled) {
        window.addEventListener('pointermove', move, { passive: true })
        document.addEventListener('mouseout', exit)
        document.addEventListener('visibilitychange', visibility)
      } else {
        window.removeEventListener('pointermove', move)
        document.removeEventListener('mouseout', exit)
        document.removeEventListener('visibilitychange', visibility)
        glow.dataset.active = 'false'
      }
    }
    fine.addEventListener('change', sync)
    reduced.addEventListener('change', sync)
    sync()
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseout', exit)
      document.removeEventListener('visibilitychange', visibility)
      fine.removeEventListener('change', sync)
      reduced.removeEventListener('change', sync)
      cancelAnimationFrame(frame)
    }
  }, [])
  return <div className={styles.aura} data-cm-cursor-aura aria-hidden="true"><div className={styles.glow} ref={glowRef}/></div>
}
