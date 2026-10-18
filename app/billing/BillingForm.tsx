'use client'

import { useState } from 'react'
import { calculateInvoice } from './invoice-math'

type Item = { description: string; quantity: string; rate: string }
const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

export default function BillingForm() {
  const [number, setNumber] = useState('')
  const [date, setDate] = useState('2026-10-18')
  const [customer, setCustomer] = useState('')
  const [address, setAddress] = useState('')
  const [items, setItems] = useState<Item[]>([{ description: 'Financial documentation and factual analytics assistance', quantity: '1', rate: '' }])
  const calculation = calculateInvoice({ number, date, customer, items })
  const valid = calculation.valid
  const total = calculation.totalPaise / 100
  const totals = calculation.linePaise.map(paise => paise / 100)
  const updateItem = (i: number, key: keyof Item, value: string) => setItems(xs => xs.map((x, j) => i === j ? { ...x, [key]: value } : x))

  return (
    <main className="cn-billing" style={{ maxWidth: 980, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div className="cn-controls">
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em' }}>CREDONOMICS · BILLING DEVELOPMENT PREVIEW</p>
        <h1 style={{ fontSize: 32, margin: '8px 0' }}>UNPAID Invoice Generator</h1>
        <p>This is a browser-only draft. No invoice is saved, numbered automatically, sent, or connected to Slice or YouPI. Use sample data only on shared devices.</p>
        <div className="cn-grid">
          <label>Invoice number<input value={number} maxLength={40} onChange={e => setNumber(e.target.value)} placeholder="e.g. 1511" /></label>
          <label>Invoice date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label>Customer name<input value={customer} maxLength={120} onChange={e => setCustomer(e.target.value)} placeholder="Customer name" /></label>
          <label>Customer address (optional)<input value={address} maxLength={300} onChange={e => setAddress(e.target.value)} /></label>
        </div>
        <h2 style={{ fontSize: 20, marginTop: 24 }}>Items</h2>
        {items.map((item, i) => (
          <div className="cn-item" key={i}>
            <label>Description<input value={item.description} maxLength={300} onChange={e => updateItem(i, 'description', e.target.value)} /></label>
            <label>Quantity<input type="number" min="0.01" step="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} /></label>
            <label>Rate (₹)<input type="number" min="0" step="0.01" value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)} /></label>
            <button type="button" disabled={items.length === 1} onClick={() => setItems(xs => xs.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button type="button" disabled={items.length >= 100} onClick={() => setItems(xs => [...xs, { description: '', quantity: '1', rate: '' }])}>+ Add item</button>
        <p role="status"><strong>Total: {money(total)}</strong></p>
        <button type="button" disabled={!valid || total <= 0} onClick={() => window.print()}>Print / Save as PDF (UNPAID)</button>
        {!valid && <p role="alert">{calculation.errors.join("; ")}</p>}
        <p><strong>Safety:</strong> This prototype never marks an invoice PAID. A future PAID receipt requires independent manual Slice bank-credit verification by an authorized admin.</p>
      </div>
      <section className={`cn-sheet ${valid ? "" : "cn-invalid-print"}`} aria-label="Invoice print preview">
        <header className="cn-head"><div><strong>CredoNomics Investment Solutions</strong><p>Dhule, Maharashtra, India</p></div><div><strong>INVOICE</strong><p>#{number || '—'}</p><p>{date}</p></div></header>
        <div className="cn-unpaid">UNPAID · DRAFT PREVIEW</div>
        <div className="cn-billto"><strong>Bill To</strong><p>{customer || 'Customer name'}</p><p>{address}</p></div>
        <table className="cn-table"><thead><tr><th>Item / Service</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{items.map((x, i) => <tr key={i}><td>{x.description}</td><td>{x.quantity}</td><td>{money(Number.isFinite(Number(x.rate)) && Number(x.rate) >= 0 ? Number(x.rate) : 0)}</td><td>{money(totals[i] || 0)}</td></tr>)}</tbody></table>
        <div className="cn-total">Total: {money(total)}</div>
        <div className="cn-terms"><strong>Service notice</strong><p>Financial documentation and factual analytics only. No personalized investment advice or Buy/Sell/Hold recommendations. This document is not a payment receipt.</p></div>
        <footer>Digitally prepared draft invoice · CredoNomics Investment Solutions</footer>
      </section>
      <style jsx global>{`
        .cn-billing .cn-controls { margin-bottom: 30px; }
        .cn-billing label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600; }
        .cn-billing input { padding: 11px; border: 1px solid #94a3b8; border-radius: 7px; background: white; color: #0f172a; width: 100%; }
        .cn-billing button { padding: 10px 16px; margin: 8px 8px 8px 0; border-radius: 7px; border: 1px solid #64748b; background: #0f2744; color: white; cursor: pointer; }
        .cn-billing button:disabled { opacity: .45; cursor: not-allowed; }
        .cn-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
        .cn-item { display: grid; grid-template-columns: 3fr 1fr 1fr auto; gap: 10px; align-items: end; margin: 12px 0; }
        .cn-sheet { background: white; color: #10223b; padding: 36px; border: 2px solid #275b90; min-height: 550px; overflow-wrap: anywhere; }
        .cn-head { display: flex; justify-content: space-between; border-bottom: 3px solid #275b90; padding-bottom: 16px; gap: 20px; }
        .cn-head strong { font-size: 20px; }
        .cn-head div:last-child { text-align: right; }
        .cn-unpaid { margin: 20px 0; padding: 8px; border: 2px solid #9b4b16; color: #9b4b16; text-align: center; font-weight: 800; letter-spacing: 2px; }
        .cn-billto { min-height: 110px; }
        .cn-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .cn-table th { background: #e7f0f9; text-align: left; }
        .cn-table th, .cn-table td { border: 1px solid #94a3b8; padding: 10px; }
        .cn-total { text-align: right; font-size: 20px; font-weight: 800; padding: 24px 0; }
        .cn-terms { border-top: 1px solid #94a3b8; padding-top: 16px; font-size: 12px; }
        .cn-sheet footer { margin-top: 40px; font-size: 11px; text-align: center; }
        @media(max-width:650px) { .cn-grid,.cn-item { grid-template-columns: 1fr; } .cn-sheet { padding: 16px; } .cn-table { font-size: 11px; } .cn-table td,.cn-table th { padding: 5px; } }
        @media print { @page { size: A4; margin: 12mm; } body * { visibility: hidden !important; } .cn-sheet, .cn-sheet * { visibility: visible !important; } .cn-sheet { position: absolute; top: 0; left: 0; width: 100%; border: 2px solid #275b90; padding: 20px; } .cn-controls { display: none !important; } .cn-invalid-print, .cn-invalid-print * { display: none !important; visibility: hidden !important; } }
      `}</style>
    </main>
  )
}
