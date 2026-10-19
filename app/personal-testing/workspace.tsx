'use client'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { amountFor, inr, type TestCommand, type TestLedger, type TestRecord } from '../../src/lib/billing/personal-model'
import styles from './workspace.module.css'

type Draft={customer:string;date:string;items:{description:string;quantity:string;rate:string}[]}
const empty=():Draft=>({customer:'',date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),items:[{description:'',quantity:'1',rate:''}]})
const labels:Record<TestRecord['status'],string>={DRAFT:'Draft',ISSUED_TEST:'Issued TEST',SIMULATED_PENDING:'Simulated pending',SIMULATED_SUCCESS:'Simulated success',SIMULATED_FAILURE:'Simulated failure',SIMULATED_REFUND:'Simulated refund'}
export default function PersonalWorkspace({owner,local}:{owner:string|null;local:boolean}){
  const [code,setCode]=useState('');const [error,setError]=useState('');const [notice,setNotice]=useState('')
  const [ledger,setLedger]=useState<TestLedger|null>(null);const [draft,setDraft]=useState<Draft>(empty)
  const [selected,setSelected]=useState<string|null>(null);const [editing,setEditing]=useState<string|undefined>()
  const [busy,setBusy]=useState(false);const inFlight=useRef(false)
  const storageKey=owner?`cn-personal-TEST-v1:${owner}`:''
  const record=ledger?.records.find(x=>x.id===selected)??null
  let total=0;try{total=amountFor(draft).totalPaise}catch{}
  const run=useCallback(async(command:TestCommand)=>{
    if(!owner || inFlight.current)return
    inFlight.current=true;setBusy(true);setError('');setNotice('')
    try{
      // Serialize read-modify-write across tabs. Every response is still owner-authorized server-side.
      if(!navigator.locks)throw new Error('A browser with Web Locks support is required (current Chrome, Edge or Firefox).')
      await navigator.locks.request(storageKey,async()=>{
        const blob=localStorage.getItem(storageKey)??undefined
        const response=await fetch('/api/personal-testing',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({blob,command})})
        if(!response.ok){let message='TEST workspace unavailable';try{message=(await response.json()).error??message}catch{};throw new Error(message)}
        if(command.action==='pdf'){
          const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download='CredoNomics-TEST-invoice.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return
        }
        const value:{ledger:TestLedger;blob:string}=await response.json()
        localStorage.setItem(storageKey,value.blob);setLedger(value.ledger)
        if(command.action==='save'){setSelected(command.id??value.ledger.records[0]?.id??null);setEditing(undefined);setDraft(empty());setNotice('TEST draft saved. Nothing was issued or collected.')}
      })
    }catch(e){setError(e instanceof Error?e.message:'TEST workspace unavailable')}
    finally{inFlight.current=false;setBusy(false)}
  },[owner,storageKey])
  useEffect(()=>{if(owner)void run({action:'read'})},[owner,run])
  useEffect(()=>{const refresh=(event:StorageEvent)=>{if(event.key===storageKey)void run({action:'read'})};window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh)},[run,storageKey])
  async function unlock(e:FormEvent){
    e.preventDefault();setBusy(true);setError('')
    try{const response=await fetch('/api/personal-testing/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});if(!response.ok)throw new Error('Unlock rejected. Check the code in the local launcher terminal.');window.location.reload()}
    catch(e){setError(e instanceof Error?e.message:'Unlock unavailable');setBusy(false)}
  }
  function edit(value:TestRecord){setDraft({customer:value.customer,date:value.date,items:value.items.map(x=>({...x}))});setEditing(value.id)}
  function line(index:number,key:'description'|'quantity'|'rate',value:string){setDraft(x=>({...x,items:x.items.map((item,i)=>i===index?{...item,[key]:value}:item)}))}
  function save(e:FormEvent){e.preventDefault();void run({action:'save',id:editing,draft})}
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>CREDONOMICS / OWNER WORKSPACE</p><h1>Personal billing lab<span>TEST</span></h1><p>Try the workflow. Keep real money out of it.</p></div><div className={styles.mode}>{local?'Protected localhost':'Verified owner session'}<small>₹0 collected · Banking disconnected</small></div></header>
    <div className={styles.warning} role="note"><strong>TEST records only.</strong> No real invoice, tax document or payment receipt is created. Simulated success is never a bank settlement. Use fictitious customer details.</div>
    {!owner?<section className={styles.unlock}><h2>Unlock your local workspace</h2><p>Paste the session code shown in the terminal running <code>npm run billing:personal</code>. The code never goes in a URL.</p><form onSubmit={unlock}><label>Local session code<input type="password" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} required/></label><button disabled={busy}>Unlock TEST workspace</button></form></section>:<>
      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.controls}`} aria-labelledby="draft-title"><div className={styles.sectionHeading}><h2 id="draft-title">{editing?'Edit TEST draft':'New TEST draft'}</h2><span>INR</span></div>
          <form onSubmit={save}><div className={styles.fields}><label>Test customer<input value={draft.customer} maxLength={120} onChange={e=>setDraft({...draft,customer:e.target.value})} required placeholder="Example: Sample Studio"/></label><label>Invoice date<input type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})} required/></label></div>
            <div className={styles.items}>{draft.items.map((item,i)=><fieldset key={i}><legend>Line item {i+1}</legend><label>Description<input value={item.description} maxLength={300} onChange={e=>line(i,'description',e.target.value)} required/></label><div className={styles.itemFields}><label>Quantity<input inputMode="numeric" value={item.quantity} onChange={e=>line(i,'quantity',e.target.value)} required/></label><label>Rate (₹)<input inputMode="decimal" value={item.rate} onChange={e=>line(i,'rate',e.target.value)} required placeholder="0.00"/></label><button type="button" className={styles.secondary} disabled={draft.items.length===1 || busy} onClick={()=>setDraft({...draft,items:draft.items.filter((_,index)=>index!==i)})} aria-label={`Remove line item ${i+1}`}>Remove</button></div></fieldset>)}</div>
            <button type="button" className={styles.secondary} disabled={draft.items.length>=20||busy} onClick={()=>setDraft({...draft,items:[...draft.items,{description:'',quantity:'1',rate:''}]})}>+ Add line item</button>
            <div className={styles.total}><span>TEST total</span><strong>{inr(total)}</strong></div><div className={styles.actions}><button disabled={busy||!ledger}>Save TEST draft</button>{editing&&<button type="button" className={styles.secondary} onClick={()=>{setEditing(undefined);setDraft(empty())}}>Cancel edit</button>}</div>
          </form>
        </section>
        <section className={styles.card} aria-labelledby="history-title"><div className={styles.sectionHeading}><h2 id="history-title">TEST history</h2><span>{ledger?.records.length??0} / 50</span></div><p className={styles.hint}>Encrypted in this browser. Separate from the real invoice ledger.</p>
          {!ledger?<p>Opening private workspace…</p>:ledger.records.length===0?<div className={styles.empty}>Your first TEST draft starts here.<small>Save a draft, issue a TEST copy, then simulate a payment.</small></div>:<ul className={styles.history}>{ledger.records.map(value=><li key={value.id}><button className={styles.historyButton} aria-pressed={selected===value.id} onClick={()=>setSelected(value.id)}><span><strong>{value.customer}</strong><small>{value.number} · {value.date}</small></span><span><strong>{inr(value.totalPaise)}</strong><small>{labels[value.status]}</small></span></button></li>)}</ul>}
        </section>
      </div>
      {record&&<section className={`${styles.card} ${styles.document}`} aria-labelledby="selected-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SIMULATION / NOT VALID FOR PAYMENT</p><h2 id="selected-title">{record.number}</h2></div><span>{labels[record.status]}</span></div><p><strong>{record.customer}</strong> · {record.date}</p>
        <div className={styles.tableWrap}><table><caption>TEST invoice line items</caption><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>{record.items.map((value,i)=><tr key={i}><td>{value.description}</td><td>{value.quantity}</td><td>{value.rate}</td><td>{inr(amountFor(record).linePaise[i])}</td></tr>)}</tbody></table></div><div className={styles.total}><span>TEST total</span><strong>{inr(record.totalPaise)}</strong></div><p className={styles.testFooter}>No bank credit verified. No payment is due. No paid receipt issued.</p>
        <div className={`${styles.actions} ${styles.controls}`}>
          {record.status==='DRAFT'&&<><button disabled={busy} onClick={()=>void run({action:'transition',id:record.id,status:'ISSUED_TEST'})}>Issue TEST invoice</button><button className={styles.secondary} onClick={()=>edit(record)}>Edit draft</button></>}
          {(record.status==='ISSUED_TEST'||record.status==='SIMULATED_FAILURE')&&<button disabled={busy} onClick={()=>void run({action:'transition',id:record.id,status:'SIMULATED_PENDING'})}>Simulate pending</button>}
          {record.status==='SIMULATED_PENDING'&&<><button disabled={busy} onClick={()=>void run({action:'transition',id:record.id,status:'SIMULATED_SUCCESS'})}>Simulate success</button><button className={styles.secondary} disabled={busy} onClick={()=>void run({action:'transition',id:record.id,status:'SIMULATED_FAILURE'})}>Simulate failure</button></>}
          {record.status==='SIMULATED_SUCCESS'&&<button disabled={busy} onClick={()=>void run({action:'transition',id:record.id,status:'SIMULATED_REFUND'})}>Simulate refund</button>}
          <button className={styles.secondary} disabled={busy} onClick={()=>void run({action:'pdf',id:record.id})}>Download TEST PDF</button><button className={styles.secondary} onClick={()=>window.print()}>Print TEST invoice</button>
        </div><details className={styles.controls}><summary>Simulation timeline</summary><ol>{record.events.map((value,i)=><li key={i}>{labels[value.status]} · {new Date(value.at).toLocaleString('en-IN')}</li>)}</ol></details>
      </section>}
      <p className={`${styles.hint} ${styles.controls}`}>This is a personal practice ledger, not an accounting archive. Browser data clearing or losing the encryption key makes this history unavailable. TEST drafts remain editable until issued.</p>
    </>}
    <div role="status" aria-live="polite" className={styles.message}>{notice}</div>{error&&<p role="alert" className={styles.error}>{error}</p>}
  </main>
}
