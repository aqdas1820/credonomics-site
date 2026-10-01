'use client'
import { useEffect, useRef } from 'react'
import AuthForm from '../auth/AuthForm'
import { X } from 'lucide-react'

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!isOpen) { element.close(); return }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [isOpen])
  return <dialog ref={dialog} className="authDialog" aria-labelledby="auth-dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <button type="button" onClick={onClose} aria-label="Close sign in" className="authDialogClose"><X size={20} /></button>
    <h2 id="auth-dialog-title">Sign in to continue</h2>
    <p>Save your watchlists and alerts across devices.</p>
    {isOpen && <AuthForm view="login" onComplete={onClose} />}
  </dialog>
}
