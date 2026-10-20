'use client'
import { useState } from 'react'

type Settlement = {
  status: 'UNPAID' | 'PARTIAL' | 'PAID'
  paidPaise: number
  outstandingPaise: number
  canIssuePaidReceipt: boolean
}
const rupees = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100)

/**
 * Human bank-credit review only. An operator must verify a BOOKED credit
 * directly in the official Slice bank record, independent of YouPI status.
 */
export default function BillingCreditReview({ invoiceId, invoiceTotalPaise }: { invoiceId: string; invoiceTotalPaise: number }) {
  const [utr, setUtr] = useState('')
  const [amount, setAmount] = useState('')
  const [bookedAt, setBookedAt] = useState('')
  const [reference, setReference] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [settlement, setSettlement] = useState<Settlement | null>(null)

  async function verifyCredit() {
    if (busy || !confirmed) return
    setBusy(true); setMessage('')
    try {
      if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(amount)) throw new Error('Enter an exact INR amount')
      const [integer, fractional = ''] = amount.split('.')
      const amountPaise = Number(integer) * 100 + Number(fractional.padEnd(2, '0'))
      if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0 || amountPaise > 10_000_000_000) throw new Error('Invalid bank credit amount')
      const booked = new Date(bookedAt)
      if (!Number.isFinite(booked.getTime())) throw new Error('Select booked-credit date and time')
      const response = await fetch('/api/billing/admin/invoices/' + encodeURIComponent(invoiceId) + '/verify-credit', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr, amountPaise, bookedAt: booked.toISOString(), evidenceReference: reference,
          confirmedBookedInSlice: true,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || 'Bank credit review failed')
      if (!result?.settlement || !['PARTIAL', 'PAID'].includes(result.settlement.status)) {
        throw new Error('Unexpected bank-credit response; manual review required')
      }
      setSettlement(result.settlement)
      setConfirmed(false); setUtr(''); setAmount(''); setReference(''); setBookedAt('')
      setMessage('Verified Slice bank credit recorded. The original UNPAID invoice remains unchanged.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bank credit could not be recorded')
    } finally { setBusy(false) }
  }

  return (
    <section className="cn-credit-review" aria-labelledby="cn-review-title" style={{ border: '1px solid #94a3b8', padding: 20, marginTop: 26, borderRadius: 10 }}>
      <h2 id="cn-review-title">Independent Slice Bank Credit Review</h2>
      <p>Invoice total: <strong>{rupees(invoiceTotalPaise)}</strong>. Gateway SUCCESS, payment screenshot and customer UTR alone are NOT proof of booked bank credit.</p>
      {settlement && <p role="status"><strong>Settlement: {settlement.status}</strong> · Credited {rupees(settlement.paidPaise)} · Outstanding {rupees(settlement.outstandingPaise)}. {settlement.canIssuePaidReceipt ? 'Eligible for a separately generated PAID receipt.' : 'Not yet eligible for PAID receipt.'}</p>}
      {settlement?.status !== 'PAID' && <>
        <div className="cn-grid">
          <label>Slice bank UTR<input value={utr} maxLength={80} onChange={e => setUtr(e.target.value)} placeholder="As shown in bank statement" /></label>
          <label>Booked amount (INR)<input value={amount} inputMode="decimal" onChange={e => setAmount(e.target.value)} placeholder="1500.00" /></label>
          <label>Bank booked date and time<input type="datetime-local" value={bookedAt} onChange={e => setBookedAt(e.target.value)} /></label>
          <label>Official statement reference<input value={reference} maxLength={500} onChange={e => setReference(e.target.value)} placeholder="Exact bank statement entry reference" /></label>
        </div>
        <label style={{ marginTop: 14, display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <input style={{ width: 'auto' }} type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
          I personally checked the booked credit in the official Slice bank record, independently of YouPI and customer claims.
        </label>
        <button type="button" disabled={busy || !confirmed || !utr || !reference || !amount || !bookedAt} onClick={verifyCredit}>
          {busy ? 'Recording credit…' : 'Record independently verified credit'}
        </button>
      </>}
      {message && <p role="status">{message}</p>}
      <p style={{ fontSize: 12 }}>This feature is server-disabled until bank-review controls and the settlement migration are approved. It never initiates a payment.</p>
    </section>
  )
}
