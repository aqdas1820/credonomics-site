'use client'

import { Check, Copy, Printer } from 'lucide-react'
import { useState } from 'react'
import styles from './tool-trust.module.css'

export default function ToolUtilities() {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <div className={styles.utilities}>
      <button type="button" onClick={() => window.print()}>
        <Printer size={15} />
        Print / save result
      </button>
      <button type="button" onClick={copyLink}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? 'Link copied' : 'Copy tool link'}
      </button>
    </div>
  )
}
