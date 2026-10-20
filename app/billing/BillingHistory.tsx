'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type InvoiceSummary = {
  id: string; invoiceNumber: string; customer: string; date: string
  totalPaise: number; status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'VOID'
}
const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n / 100)

/** Admin-only invoice history. API authorizes every request server-side. */
export default function BillingHistory() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  async function reload() {
    setLoading(true); setMessage('')
    try {
      const response = await fetch('/api/billing/admin/invoices', { cache: 'no-store', credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok || !Array.isArray(data?.invoices)) throw new Error(data?.error || 'History unavailable')
      setInvoices(data.invoices)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'History unavailable')
    } finally { setLoading(false) }
  }
  useEffect(() => { void reload() }, [])
  return (
    <section style={{ maxWidth: 1000, padding: '16px 20px 70px', margin: 'auto' }}>
      <h2>Issued invoice history</h2>
      <p>Private operator records. Customer access is disabled until genuine WhatsApp OTP verification is integrated.</p>
      <button type="button" onClick={reload} disabled={loading} style={{ padding: '9px 15px', borderRadius: 6 }}>
        {loading ? 'Refreshing…' : 'Refresh invoices'}
      </button>
      {message && <p role="status">{message}</p>}
      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {invoices.map(invoice => <tr key={invoice.id}>
              <td>{invoice.invoiceNumber}</td>
              <td>{invoice.customer}</td>
              <td>{invoice.date}</td>
              <td>{money(invoice.totalPaise)}</td>
              <td>{invoice.status}</td>
              <td><Link href={'/billing/invoices/' + encodeURIComponent(invoice.id)}>View invoice</Link></td>
            </tr>)}
            {!loading && invoices.length === 0 && <tr><td colSpan={6}>No accessible invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <style jsx>{`th,td { padding: 12px; border-bottom: 1px solid #cbd5e1; } th { font-size: 13px; }`}</style>
    </section>
  )
}
