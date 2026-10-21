'use client'

import { ArrowRight, HeartHandshake, Mail, ShieldCheck, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  mayAutoPrompt,
  safeDismissUntil,
  SUPPORT_AMOUNTS,
  SUPPORT_DELAY_MS,
  SUPPORT_DISMISS_MS,
  type SupportAmount,
} from './support-logic'
import styles from './support-credonomics.module.css'
import { initiateSupport, supportConfirmation } from './support-payment'

const DISMISSED_KEY = 'credonomics-support-dismissed-until'
const SESSION_KEY = 'credonomics-support-shown-in-session'

function getStoredDismissal(): number {
  try {
    return safeDismissUntil(window.localStorage.getItem(DISMISSED_KEY))
  } catch {
    return 0
  }
}

function hasSeenPrompt(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function markPromptSeen() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1')
  } catch {}
}

export default function SupportCredonomics() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const contributionBusy = useRef(false)
  const contributionNonce = useRef<string | null>(null)
  const [collectionAvailable, setCollectionAvailable] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/contributions', { cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(result => setCollectionAvailable(result?.available === true))
      .catch(() => {})
    return () => controller.abort()
  }, [])
  const [amount, setAmount] = useState<SupportAmount>(100)
  const [open, setOpen] = useState(false)
  const [elapsed, setElapsed] = useState(false)
  const [engaged, setEngaged] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [contributionStatus, setContributionStatus] = useState<'SUCCESS' | 'PENDING' | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    const check = async () => {
      const status = await supportConfirmation()
      if (cancelled) return
      setContributionStatus(status)
      if (status === 'PENDING' && ++attempts < 12) timer = setTimeout(check, 5000)
    }
    void check()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    markPromptSeen()
    setHintVisible(false)
    setOpen(true)
  }, [])

  const dismiss = useCallback(() => {
    dialogRef.current?.close()
    setOpen(false)
    setHintVisible(false)
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now() + SUPPORT_DISMISS_MS))
    } catch {}
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setElapsed(true), SUPPORT_DELAY_MS)
    const onScroll = () => {
      const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      if (window.scrollY >= Math.max(250, scrollable * 0.2)) setEngaged(true)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!mayAutoPrompt({
      elapsed,
      engaged,
      dismissedUntil: getStoredDismissal(),
      now: Date.now(),
      shownThisSession: hasSeenPrompt(),
    })) return

    markPromptSeen()
    if (window.matchMedia('(max-width: 640px)').matches) {
      setHintVisible(true)
    } else {
      openDialog()
    }
  }, [elapsed, engaged, openDialog])

  useEffect(() => {
    if (!open) return
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = priorOverflow
    }
  }, [open])

  const subject = encodeURIComponent('Voluntary support for CredoNomics')
  const body = encodeURIComponent(
    `Hello CredoNomics Team,\n\nI would like to voluntarily contribute ₹${amount} to support your independent financial tools and research. Please share the verified contribution instructions.\n\nThank you.`,
  )
  const emailHref = `mailto:hello@credonomics.in?subject=${subject}&body=${body}`

  return (
    <>
      {!open && (
        <button
          id="support-credonomics"
          type="button"
          className={styles.launcher}
          onClick={openDialog}
          aria-haspopup="dialog"
          aria-label="Support CredoNomics"
        >
          <HeartHandshake size={18} aria-hidden="true" />
          <span>Support CredoNomics</span>
        </button>
      )}

      {hintVisible && !open && (
        <div className={styles.mobileHint} role="group" aria-label="Optional CredoNomics support">
          <button type="button" className={styles.hintAction} onClick={openDialog}>
            <HeartHandshake size={17} aria-hidden="true" />
            <span>Support free tools from ₹10</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button type="button" className={styles.hintClose} onClick={dismiss} aria-label="Dismiss support invitation">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="support-title"
        aria-describedby="support-description"
        onCancel={(event) => {
          event.preventDefault()
          dismiss()
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) dismiss()
        }}
        onClose={() => setOpen(false)}
      >
        <div className={styles.card}>
          <header className={styles.top}>
            <span className={styles.eyebrow}>
              <HeartHandshake size={16} aria-hidden="true" />
              COMMUNITY SUPPORTED
            </span>
            <button type="button" className={styles.close} onClick={dismiss} aria-label="Close support popup">
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <h2 id="support-title">Help us build a better CredoNomics.</h2>
          <p id="support-description" className={styles.intro}>
            We are developing accessible financial research and practical tools.
            If our work helps you, an optional contribution supports their ongoing development.
          </p>

          <p className={styles.chooseLabel}>Choose a contribution amount</p>
          <div className={styles.amounts} role="group" aria-label="Contribution amount">
            {SUPPORT_AMOUNTS.map((value) => (
              <button
                type="button"
                key={value}
                className={`${styles.amount} ${value === amount ? styles.selected : ''}`}
                aria-pressed={value === amount}
                onClick={() => setAmount(value)}
              >
                <strong>₹{value}</strong>
                <small>{value === 10 ? 'Small support' : value === 100 ? 'Supporter' : 'Champion'}</small>
              </button>
            ))}
          </div>

          <div className={styles.paymentNotice} role="status">
            <ShieldCheck size={19} aria-hidden="true" />
            <p>{contributionStatus === 'SUCCESS' ? <><strong>Contribution successful.</strong> Thank you. Your contribution was confirmed against verified bank credit.</> : contributionStatus === 'PENDING' ? <><strong>Bank confirmation pending.</strong> A checkout return alone does not confirm payment. Please do not pay again while verification is pending.</> : collectionAvailable ? <><strong>Contribute through YouPI.</strong> Continue to the original secure checkout. Confirmation requires verified bank credit.</> : <><strong>Online contributions are not active yet.</strong> You can request verified payment details by email. No payment is collected in this popup.</>}</p>
          </div>

          <a className={styles.emailCta} href={emailHref} onClick={async (event) => {
            if (!collectionAvailable) { dismiss(); return }
            event.preventDefault()
            if (contributionBusy.current) return
            contributionBusy.current = true
            dismiss()
            try {
              contributionNonce.current ||= window.crypto.randomUUID()
              const checkoutUrl = await initiateSupport(amount, contributionNonce.current)
              window.location.assign(checkoutUrl || emailHref)
            } catch { window.location.assign(emailHref) }
            finally { contributionBusy.current = false }
          }}>
            <Mail size={17} aria-hidden="true" />
            {collectionAvailable ? 'Contribute' : 'Ask how to contribute'} ₹{amount}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
          <button type="button" className={styles.later} onClick={dismiss}>Maybe later</button>

          <p className={styles.disclaimer}>
            100% voluntary · Not an investment · No returns, preferential research access or tax-deduction benefit is promised.
          </p>
        </div>
      </dialog>
    </>
  )
}
