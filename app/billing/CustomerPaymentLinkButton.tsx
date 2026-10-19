'use client'

import { useState } from 'react'

/** Admin UI only. Server rechecks Auth, origin, invoice, gateway approvals, and private scope. */
export default function CustomerPaymentLinkButton({ invoiceId }: { invoiceId: string }) {
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function generate() {
    if (busy) return
    setBusy(true); setLink(''); setMessage('')
    try {
      const res = await fetch('/api/youpi/admin/invoices/' + encodeURIComponent(invoiceId) + '/session', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) throw Error(typeof data?.error === 'string' ? data.error : 'Customer payment link unavailable')
      if (data?.settlement !== 'NOT_VERIFIED' || data?.gatewayStatus !== 'INITIATED' ||
          typeof data?.customerPaymentLink !== 'string') throw Error('Unexpected gateway response')
      const url = new URL(data.customerPaymentLink)
      if (url.origin !== window.location.origin || !url.pathname.startsWith('/pay/i/') ||
          url.search || url.hash) throw Error('Payment link failed origin validation')
      setLink(url.href)
      setMessage('Private 72-hour checkout link prepared. No payment or bank credit confirmed.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Customer payment link unavailable')
    } finally { setBusy(false) }
  }
  async function copy() {
    if (!link) return
    try { await navigator.clipboard.writeText(link); setMessage('Private link copied. Send only to the intended customer.') }
    catch { setMessage('Clipboard unavailable. Select the full URL and copy manually.') }
  }
  return <section style={{ border: '1px solid #adcfc4', borderRadius: 8, padding: 16, margin: '15px 0' }}>
    <h2 style={{ fontSize: 17, marginTop: 0 }}>YouPI customer payment link</h2>
    <p style={{ fontSize: 13 }}>Creates a checkout handoff for the server-stored UNPAID invoice. No receipt is issued.</p>
    <button type="button" disabled={busy} onClick={generate}>{busy ? 'Preparing…' : 'Generate private payment link'}</button>
    {link && <div style={{ marginTop: 12 }}>
      <label htmlFor="youpi-customer-link" style={{ display: 'block', fontSize: 13 }}>Customer link (share privately)</label>
      <input id="youpi-customer-link" readOnly value={link} onFocus={e => e.currentTarget.select()}
        style={{ display: 'block', width: '100%', marginTop: 5, padding: 9 }} />
      <button type="button" onClick={() => void copy()}>Copy link</button>
    </div>}
    <p role="status" style={{ fontSize: 13 }}>{message}</p>
  </section>
}
