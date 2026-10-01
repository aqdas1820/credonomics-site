'use client'
import { useEffect, type RefObject } from 'react'
export function useDialogFocus(ref: RefObject<HTMLElement>, open: boolean, close: () => void) {
  useEffect(() => {
    const element = ref.current
    if (!open || !element) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const selector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]'
    const elements = () => Array.from(element.querySelectorAll<HTMLElement>(selector)).filter(item => item.getClientRects().length)
    elements()[0]?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (event.key !== 'Tab') return
      const items = elements(), first = items[0], last = items.at(-1)
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || !element.contains(document.activeElement))) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !element.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    element.addEventListener('keydown', onKey)
    return () => { element.removeEventListener('keydown', onKey); previous?.focus() }
  }, [ref, open, close])
}
