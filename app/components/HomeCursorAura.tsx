'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import styles from './home-cursor-aura.module.css'

const HALO_RADIUS = 250

/**
 * Client-only body portal: escaping the homepage's overflow:hidden and
 * stacked sections makes the decorative pointer spotlight reliably visible.
 * Pointer positions stay entirely local and never leave the browser.
 */
export default function HomeCursorAura() {
  const [mounted, setMounted] = useState(false)
  const haloRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const halo = haloRef.current
    if (!halo) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const forcedColors = window.matchMedia('(forced-colors: active)')
    let frame = 0
    let enabled = false
    let x = -1000
    let y = -1000

    const paint = () => {
      frame = 0
      halo.style.transform = 'translate3d(' + (x - HALO_RADIUS) + 'px,' + (y - HALO_RADIUS) + 'px,0)'
    }

    const moveTo = (clientX: number, clientY: number) => {
      if (!enabled) return
      x = clientX
      y = clientY
      halo.dataset.active = 'true'
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') moveTo(event.clientX, event.clientY)
    }
    const onMouse = (event: MouseEvent) => {
      if (!('PointerEvent' in window)) moveTo(event.clientX, event.clientY)
    }
    const hide = () => { halo.dataset.active = 'false' }
    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) hide()
    }
    const onVisibility = () => { if (document.hidden) hide() }

    const sync = () => {
      const allow = window.innerWidth > 760 && !motionPreference.matches && !forcedColors.matches
      if (allow === enabled) return
      enabled = allow
      if (enabled) {
        window.addEventListener('pointermove', onPointer, { passive: true })
        window.addEventListener('mousemove', onMouse, { passive: true })
        document.addEventListener('mouseout', onMouseOut)
        document.addEventListener('visibilitychange', onVisibility)
      } else {
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('mousemove', onMouse)
        document.removeEventListener('mouseout', onMouseOut)
        document.removeEventListener('visibilitychange', onVisibility)
        window.cancelAnimationFrame(frame)
        frame = 0
        hide()
      }
    }

    motionPreference.addEventListener('change', sync)
    forcedColors.addEventListener('change', sync)
    window.addEventListener('resize', sync, { passive: true })
    sync()

    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', sync)
      motionPreference.removeEventListener('change', sync)
      forcedColors.removeEventListener('change', sync)
      window.cancelAnimationFrame(frame)
    }
  }, [mounted])

  if (!mounted) return null

  return createPortal(
    <div className={styles.aura} aria-hidden="true" data-cm-cursor-aura>
      <div className={styles.halo} data-cm-cursor-halo ref={haloRef}>
        <div className={styles.innerRing} />
      </div>
    </div>,
    document.body,
  )
}
