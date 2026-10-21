'use client'

import { useEffect, useRef } from 'react'
import styles from './home-cursor-aura.module.css'

const HALO_RADIUS = 260

/**
 * Decorative mouse-following glow. Coordinates remain in the browser.
 * Use actual pointer events rather than requiring the mouse to be the OS's
 * primary pointing device: Windows hybrid touch+mouse setups are supported.
 */
export default function HomeCursorAura() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const forcedColors = window.matchMedia('(forced-colors: active)')
    let frame = 0
    let x = -9999
    let y = -9999
    let enabled = false

    const paint = () => {
      frame = 0
      glow.style.transform = 'translate3d(' + (x - HALO_RADIUS) + 'px, ' + (y - HALO_RADIUS) + 'px, 0)'
    }

    const moveTo = (clientX: number, clientY: number) => {
      if (!enabled) return
      x = clientX
      y = clientY
      glow.dataset.active = 'true'
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      moveTo(event.clientX, event.clientY)
    }

    // Legacy browser fallback. On modern browsers pointermove is preferred.
    const onMouseMove = (event: MouseEvent) => {
      if (!('PointerEvent' in window)) moveTo(event.clientX, event.clientY)
    }

    const hide = () => { glow.dataset.active = 'false' }
    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) hide()
    }
    const onVisibility = () => { if (document.hidden) hide() }
    const onResize = () => sync()

    function sync() {
      const shouldEnable = window.innerWidth > 760 && !reducedMotion.matches && !forcedColors.matches
      if (shouldEnable === enabled) return
      enabled = shouldEnable
      if (enabled) {
        window.addEventListener('pointermove', onPointerMove, { passive: true })
        window.addEventListener('mousemove', onMouseMove, { passive: true })
        document.addEventListener('mouseout', onMouseOut)
        document.addEventListener('visibilitychange', onVisibility)
      } else {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseout', onMouseOut)
        document.removeEventListener('visibilitychange', onVisibility)
        hide()
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    reducedMotion.addEventListener('change', sync)
    forcedColors.addEventListener('change', sync)
    window.addEventListener('resize', onResize, { passive: true })
    sync()

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      reducedMotion.removeEventListener('change', sync)
      forcedColors.removeEventListener('change', sync)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className={styles.aura} data-cm-cursor-aura aria-hidden="true">
      <div className={styles.halo} data-cm-cursor-halo ref={glowRef} />
    </div>
  )
}
