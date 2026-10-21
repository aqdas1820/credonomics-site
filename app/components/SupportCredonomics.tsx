'use client'

import { ArrowRight, Check, Heart, HeartHandshake, Mail, ShieldCheck, Sparkles, X } from 'lucide-react'
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
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    setCopyState('idle')
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

  const requestText = 'Hello CredoNomics Team,\n\nI would like to voluntarily contribute ₹' + amount + ' to support the development of your financial research and tools. Please share verified contribution instructions.\n\nThank you.'
  const subject = encodeURIComponent('Voluntary support for CredoNomics')
  const body = encodeURIComponent(requestText)
  const emailHref = `mailto:hello@credonomics.in?subject=${subject}&body=${body}`

  const copyRequest = async () => {
    if (!navigator.clipboard?.writeText) { setCopyState('error'); return }
    try {
      await navigator.clipboard.writeText(requestText)
      setCopyState('copied')
    } catch { setCopyState('error') }
  }

  return (
    <>
      {!open && !hintVisible && (
        <button
          id="support-credonomics"
          type="button"
          className={styles.launcher}
          onClick={openDialog}
          aria-haspopup="dialog"
          aria-label="Support CredoNomics"
        >
          <span className={styles.launcherHeart}><Heart size={16} fill="currentColor" aria-hidden="true" /></span>
          <span>Support CredoNomics</span>
          <ArrowRight size={14} aria-hidden="true" />
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
          <div className={styles.ambient} aria-hidden="true" />
          <header className={styles.top}>
            <span className={styles.eyebrow}>
              <img src="/credonomics-mark.png" width="25" height="25" alt="" />
              <span><strong>CredoNomics</strong><small>Community supported research</small></span>
            </span>
            <button type="button" className={styles.close} onClick={dismiss} aria-label="Close support popup">
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div className={styles.visualBadge} aria-hidden="true">
            <HeartHandshake size={30} strokeWidth={1.6} />
            <Sparkles size={17} className={styles.badgeSpark} />
          </div>
          <p className={styles.subheading}>BUILD SOMETHING BETTER, TOGETHER</p>
          <h2 id="support-title">A little support. <em>A lot of possibility.</em></h2>
          <p id="support-description" className={styles.intro}>
            We are building practical financial tools and source-aware research. Your optional support helps us keep improving them.
          </p>

          <div className={styles.choiceHeading}><p className={styles.chooseLabel}>Choose your contribution</p><span>100% voluntary</span></div>
          <div className={styles.amounts} role="group" aria-label="Contribution amount">
            {SUPPORT_AMOUNTS.map((value) => (
              <button
                type="button"
                key={value}
                className={`${styles.amount} ${value === amount ? styles.selected : ''}`}
                aria-pressed={value === amount}
                onClick={() => { setAmount(value); setCopyState('idle') }}
              >
                {value === 100 ? <span className={styles.popular}>RECOMMENDED</span> : null}
                <span className={styles.amountCheck} aria-hidden="true">{value === amount ? <Check size={12} strokeWidth={3} /> : null}</span>
                <strong>₹{value}</strong>
                <small>{value === 10 ? 'Small boost' : value === 100 ? 'Supporter' : 'Champion'}</small>
              </button>
            ))}
          </div>

          <div className={styles.selectionSummary} aria-live="polite" aria-atomic="true">
            <span><Heart size={14} fill="currentColor" aria-hidden="true" /> YOUR SELECTION</span>
            <strong key={amount}>₹{amount}</strong>
          </div>

          <div className={styles.paymentNotice} role="status">
            <ShieldCheck size={19} aria-hidden="true" />
            <p>{contributionStatus === 'SUCCESS' ? <><strong>Contribution successful.</strong> Thank you. Your contribution was confirmed against verified bank credit.</> : contributionStatus === 'PENDING' ? <><strong>Bank confirmation pending.</strong> A checkout return alone does not confirm payment. Please do not pay again while verification is pending.</> : collectionAvailable ? <><strong>Contribute through YouPI.</strong> Continue to the original secure checkout. Confirmation requires verified bank credit.</> : <><strong>Online contributions are not active yet.</strong> Request verified instructions by email. This does not collect money, confirm payment, or create a receipt.</>}</p>
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
            {collectionAvailable ? 'Contribute' : 'Request instructions for'} ₹{amount}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
          <button type="button" className={styles.copyCta} onClick={copyRequest}>
            {copyState === 'copied' ? <Check size={15} aria-hidden="true" /> : <Mail size={15} aria-hidden="true" />}
            {copyState === 'copied' ? 'Request text copied' : 'Copy request text instead'}
          </button>
          {copyState === 'error' ? <p className={styles.copyError} role="status">Copy unavailable. Use the email link instead.</p> : null}
          <button type="button" className={styles.later} onClick={dismiss}>Maybe later</button>

          <p className={styles.disclaimer}>
            Not an investment · No returns, tax deduction or preferential research access promised.
          </p>
        </div>
      </dialog>
    </>
  )
}
