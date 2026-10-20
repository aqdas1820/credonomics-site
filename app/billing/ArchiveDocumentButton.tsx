'use client'

import { useState } from 'react'

export default function ArchiveDocumentButton({ id, kind }: { id: string; kind: 'invoice' | 'receipt' }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function download() {
    if (busy) return
    setBusy(true); setError('')
    try {
      const response = await fetch(`/api/billing/admin/invoices/${encodeURIComponent(id)}/documents/${kind}`, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error',
      })
      if (!response.ok || response.headers.get('content-type') !== 'application/pdf') throw new Error('Unavailable')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = `${kind}-v1.pdf`; document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch { setError('Archived PDF unavailable. Please contact the billing administrator.') }
    finally { setBusy(false) }
  }
  return <span>
    <button type="button" onClick={download} disabled={busy}>{busy ? 'Preparing PDF…' : 'Download archived PDF'}</button>
    <span role="status" aria-live="polite">{error}</span>
  </span>
}
