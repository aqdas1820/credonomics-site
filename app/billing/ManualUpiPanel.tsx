'use client'
import { useEffect,useState } from 'react'

export default function ManualUpiPanel({invoiceId,settlementEnabled}:{invoiceId:string;settlementEnabled:boolean}) {
  const [link,setLink]=useState(''),[intentId,setIntentId]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
  const [utr,setUtr]=useState(''),[amount,setAmount]=useState(''),[booked,setBooked]=useState(''),[evidence,setEvidence]=useState(''),[confirmed,setConfirmed]=useState(false)
  const endpoint='/api/billing/admin/invoices/'+encodeURIComponent(invoiceId)+'/manual-upi'
  useEffect(()=>{const abort=new AbortController();fetch(endpoint,{signal:abort.signal,cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(d?.intentId)setIntentId(d.intentId)}).catch(()=>undefined);return()=>abort.abort()},[endpoint])
  async function generate() {
    if (busy) return
    setBusy(true);setMessage('')
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:'{}'})
      const data=await response.json()
      if (!response.ok) throw Error(data?.error||'Payment instructions unavailable')
      const url=new URL(data.customerPaymentLink)
      if (url.origin!==location.origin || !url.pathname.startsWith('/pay/upi/') || url.search || url.hash || data.settlement!=='NOT_VERIFIED' || data.mode!=='MANUAL_BANK_REVIEW') throw Error('Invalid payment-link response')
      setLink(url.href);setIntentId(data.intentId);setMessage('Private 24-hour direct UPI link prepared. Invoice remains UNPAID until bank review.')
    } catch(error) {setMessage(error instanceof Error?error.message:'Payment instructions unavailable')}
    finally {setBusy(false)}
  }
  async function revoke() {
    if (busy) return
    setBusy(true)
    try {
      const response=await fetch(endpoint,{method:'DELETE',credentials:'same-origin'})
      if (!response.ok) throw Error('Revocation unavailable')
      setLink('');setMessage('Payment instructions revoked. Any late bank credit still requires independent review.')
    } catch(error){setMessage(error instanceof Error?error.message:'Revocation unavailable')}
    finally{setBusy(false)}
  }
  async function review(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !confirmed || !intentId) return
    setBusy(true);setMessage('')
    try {
      if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(amount)) throw Error('Enter exact INR amount')
      const [rupees,fraction='']=amount.split('.'),amountPaise=Number(rupees)*100+Number(fraction.padEnd(2,'0'))
      const time=new Date(booked)
      if (!Number.isSafeInteger(amountPaise) || amountPaise<=0 || !Number.isFinite(time.getTime())) throw Error('Invalid booked-credit details')
      const response=await fetch(endpoint+'/reconcile',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({intentId,utr,amountPaise,bookedAt:time.toISOString(),evidenceReference:evidence,
          confirmedOfficialBankCredit:true,confirmedBeneficiaryAccount:true,confirmedInvoiceMatch:true})})
      const data=await response.json()
      if (!response.ok) throw Error(data?.error||'Bank review rejected')
      if (data?.settlement?.status!=='PAID' || data?.verificationMode!=='MANUAL_OFFICIAL_BANK_RECORD') throw Error('Ambiguous review; inspect ledger before retry')
      setLink('');setConfirmed(false);setMessage('Manually verified bank credit recorded. Refresh the invoice to open its verified receipt.')
    } catch(error){setMessage(error instanceof Error?error.message:'Bank review unavailable')}
    finally{setBusy(false)}
  }
  return <section aria-labelledby="manual-upi-title" style={{maxWidth:700,margin:'20px auto',padding:20,border:'1px solid #94a3b8',borderRadius:8}}>
    <h2 id="manual-upi-title">Direct UPI with manual bank review</h2>
    <p>Direct transfer to the owner-verified receiving UPI ID. This is not an automated gateway.</p>
    <button disabled={busy} onClick={generate}>Prepare or recover private UPI link</button>
    {link && <p><label>Customer payment link<input readOnly value={link} onFocus={e=>e.currentTarget.select()} style={{width:'100%'}} /></label></p>}
    {intentId && <button disabled={busy} onClick={revoke}>Revoke payment instructions</button>}
    {settlementEnabled && intentId && <form onSubmit={review}>
      <h3>Official Slice bank-credit review</h3>
      <p>Use the merchant’s official booked bank record. A screenshot, customer UTR claim or app success screen is insufficient.</p>
      <p><label>Bank UTR <input required value={utr} maxLength={80} onChange={e=>setUtr(e.target.value)} /></label></p>
      <p><label>Booked amount (INR) <input required value={amount} inputMode="decimal" onChange={e=>setAmount(e.target.value)} /></label></p>
      <p><label>Bank booked date and time <input required type="datetime-local" value={booked} onChange={e=>setBooked(e.target.value)} /></label></p>
      <p><label>Official bank record reference <input required value={evidence} minLength={8} maxLength={500} onChange={e=>setEvidence(e.target.value)} /></label></p>
      <p><label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} /> I independently verified the booked credit in the official Slice record, its receiving account, exact amount, UTR and intended invoice.</label></p>
      <button disabled={busy||!confirmed} type="submit">Record verified bank credit and issue receipt</button>
    </form>}
    <p role="status">{message}</p>
  </section>
}
