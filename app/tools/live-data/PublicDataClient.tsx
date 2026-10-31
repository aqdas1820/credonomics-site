'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeftRight, ArrowUpRight, Coins, Landmark, Search, TrendingUp } from 'lucide-react'
import styles from './public-data.module.css'

type ApiResult<T> = { data: T | null; error: { message: string } | null }
type Fund = { schemeCode: number; schemeName: string }
type NavData = { schemeCode: string; schemeName: string; fundHouse: string; category: string; nav: number; date: string; source: string }
type IfscData = { ifsc: string; bank: string; branch: string; address: string; city: string; district: string; state: string; rtgs: boolean; neft: boolean; imps: boolean; source: string }
type FxData = { base: string; quote: string; rate: number; date: string; source: string }
type MetalData = { metal: 'gold' | 'silver'; perGram: number; perGram22k?: number | null; perGram18k?: number | null; timestamp: string; source: string; delayed: boolean }

const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 })
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const money = (n: number, c: string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(n)
const currencies = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'JPY', 'CAD', 'AUD']

async function queryApi<T>(params: Record<string, string>): Promise<T> {
  const res = await fetch('/api/public-data?' + new URLSearchParams(params).toString(), { cache: 'no-store' })
  const result = await res.json() as ApiResult<T>
  if (!res.ok || result.error || !result.data) throw new Error(result.error?.message || 'Source data unavailable. Please try again.')
  return result.data
}
function ErrorText({ message }: { message: string }) {
  return message ? <p className={styles.error} role="alert">{message}</p> : null
}
function SourceLine({ name, detail, url }: { name: string; detail: string; url: string }) {
  return <p className={styles.source}>Source: <a href={url} target="_blank" rel="noopener noreferrer">{name} <ArrowUpRight size={12} aria-hidden="true"/></a><span> · {detail}</span></p>
}

export default function PublicDataClient() {
  const [scheme, setScheme] = useState('HDFC')
  const [funds, setFunds] = useState<Fund[]>([])
  const [nav, setNav] = useState<NavData | null>(null)
  const [mfBusy, setMfBusy] = useState(false)
  const [mfError, setMfError] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [branch, setBranch] = useState<IfscData | null>(null)
  const [bankBusy, setBankBusy] = useState(false)
  const [bankError, setBankError] = useState('')
  const [base, setBase] = useState('USD')
  const [quote, setQuote] = useState('INR')
  const [amount, setAmount] = useState('100')
  const [fx, setFx] = useState<FxData | null>(null)
  const [fxBusy, setFxBusy] = useState(false)
  const [fxError, setFxError] = useState('')
  const [metal, setMetal] = useState<'gold' | 'silver'>('gold')
  const [grams, setGrams] = useState('10')
  const [metalData, setMetalData] = useState<MetalData | null>(null)
  const [metalBusy, setMetalBusy] = useState(false)
  const [metalError, setMetalError] = useState('')

  async function searchFunds(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMfBusy(true); setMfError(''); setFunds([]); setNav(null)
    try {
      const data = await queryApi<{ results: Fund[] }>({ tool: 'mf-search', q: scheme.trim() })
      setFunds(data.results)
      if (!data.results.length) setMfError('No matching scheme found. Try its AMC or a shorter fund name.')
    } catch (error) { setMfError(error instanceof Error ? error.message : 'Unable to load scheme search.') }
    finally { setMfBusy(false) }
  }
  async function getNav(code: number) {
    setMfBusy(true); setMfError(''); setNav(null)
    try { setNav(await queryApi<NavData>({ tool: 'mf-nav', code: String(code) })) }
    catch (error) { setMfError(error instanceof Error ? error.message : 'Unable to load NAV.') }
    finally { setMfBusy(false) }
  }
  async function lookupIfsc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBankBusy(true); setBankError(''); setBranch(null)
    try { setBranch(await queryApi<IfscData>({ tool: 'ifsc', code: ifsc.trim().toUpperCase() })) }
    catch (error) { setBankError(error instanceof Error ? error.message : 'Unable to find IFSC.') }
    finally { setBankBusy(false) }
  }
  async function convert(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFxBusy(true); setFxError(''); setFx(null)
    try { setFx(await queryApi<FxData>({ tool: 'fx', base, quote })) }
    catch (error) { setFxError(error instanceof Error ? error.message : 'Unable to load exchange rate.') }
    finally { setFxBusy(false) }
  }
  async function getMetal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMetalBusy(true); setMetalError(''); setMetalData(null)
    try { setMetalData(await queryApi<MetalData>({ tool: 'metal', metal })) }
    catch (error) { setMetalError(error instanceof Error ? error.message : 'Unable to load metal price.') }
    finally { setMetalBusy(false) }
  }

  const fxAmount = Number(amount)
  const weight = Number(grams)

  return <>
    <nav className={styles.jumpNav} aria-label="Financial data tools">
      <a href="#mf-nav">Mutual fund NAV</a>
      <a href="#bank-ifsc">Bank IFSC</a>
      <a href="#currency-converter">Currency converter</a>
      <a href="#metals">Gold &amp; silver</a>
    </nav>
    <div className={styles.grid}>
      <section className={styles.panel} id="mf-nav" aria-labelledby="mf-title">
        <div className={styles.panelHead}><span className={styles.icon}><TrendingUp size={21}/></span><span className={styles.tag}>INDIAN MUTUAL FUNDS</span></div>
        <h2 id="mf-title">Latest published NAV</h2>
        <p className={styles.description}>Find a mutual fund scheme and see its last published NAV. These figures are not a live trading price.</p>
        <form onSubmit={searchFunds} className={styles.form}>
          <label htmlFor="fund-query">Scheme or fund-house name</label>
          <div className={styles.inlineInputs}><input id="fund-query" value={scheme} onChange={e => setScheme(e.target.value)} minLength={3} maxLength={80} required placeholder="Example: HDFC Top 100"/><button disabled={mfBusy} type="submit"><Search size={16}/> Search</button></div>
        </form>
        {funds.length > 0 && <div className={styles.fundList} aria-label="Matching schemes">{funds.map(f => <button key={f.schemeCode} type="button" disabled={mfBusy} onClick={() => getNav(f.schemeCode)}>{f.schemeName}<span>Code {f.schemeCode}</span></button>)}</div>}
        <ErrorText message={mfError}/>
        {nav && <div className={styles.result} aria-live="polite"><span>Latest NAV · {nav.date}</span><strong>{rupees.format(nav.nav)}</strong><p>{nav.schemeName}</p><small>{nav.fundHouse}{nav.category ? ' · ' + nav.category : ''}</small></div>}
        <SourceLine name="MFapi.in" detail="Published NAV; provider rate limits apply" url="https://www.mfapi.in/docs/"/>
      </section>

      <section className={styles.panel} id="bank-ifsc" aria-labelledby="ifsc-title">
        <div className={styles.panelHead}><span className={styles.icon}><Landmark size={21}/></span><span className={styles.tag}>INDIAN BANKING</span></div>
        <h2 id="ifsc-title">IFSC branch lookup</h2>
        <p className={styles.description}>Check a bank branch by IFSC code. Confirm the details with the bank before transferring money.</p>
        <form onSubmit={lookupIfsc} className={styles.form}>
          <label htmlFor="ifsc-code">11-character IFSC code</label>
          <div className={styles.inlineInputs}><input id="ifsc-code" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} minLength={11} maxLength={11} pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}" required placeholder="HDFC0000001" autoCapitalize="characters"/><button disabled={bankBusy} type="submit"><Search size={16}/> Find</button></div>
        </form>
        <ErrorText message={bankError}/>
        {branch && <div className={styles.result} aria-live="polite"><span>{branch.ifsc}</span><strong className={styles.resultTitle}>{branch.bank}</strong><p>{branch.branch}</p><small>{[branch.address, branch.city, branch.state].filter(Boolean).join(', ')}</small><div className={styles.metadata}>{branch.rtgs && <span>RTGS listed</span>}{branch.neft && <span>NEFT listed</span>}{branch.imps && <span>IMPS listed</span>}</div></div>}
        <SourceLine name="Razorpay IFSC Toolkit" detail="Dataset may change; bank is authoritative" url="https://ifsc.razorpay.com/"/>
      </section>

      <section className={styles.panel} id="currency-converter" aria-labelledby="fx-title">
        <div className={styles.panelHead}><span className={styles.icon}><ArrowLeftRight size={21}/></span><span className={styles.tag}>REFERENCE FX DATA</span></div>
        <h2 id="fx-title">Currency converter</h2>
        <p className={styles.description}>Convert using the last published daily reference rate. Bank transfers and credit cards can use different rates.</p>
        <form onSubmit={convert} className={styles.form}>
          <div className={styles.fieldGrid}>
            <label>From<select value={base} onChange={e => { setBase(e.target.value); setFx(null) }}>{currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <label>To<select value={quote} onChange={e => { setQuote(e.target.value); setFx(null) }}>{currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
          </div>
          <label htmlFor="fx-amount">Amount</label>
          <input id="fx-amount" type="number" min="0.01" max="100000000" step="any" value={amount} onChange={e => setAmount(e.target.value)} required/>
          <button className={styles.fullButton} disabled={fxBusy || base === quote || !(fxAmount > 0 && fxAmount <= 100000000)} type="submit">Get reference exchange rate</button>
        </form>
        <ErrorText message={fxError}/>
        {fx && <div className={styles.result} aria-live="polite"><span>{fx.base} → {fx.quote} · reference date {fx.date}</span><strong>{money(fxAmount * fx.rate, fx.quote)}</strong><p>{money(fxAmount, fx.base)} at 1 {fx.base} = {number.format(fx.rate)} {fx.quote}</p></div>}
        <SourceLine name="Frankfurter" detail="Daily blended reference rate, not a card transaction quote" url="https://frankfurter.dev/"/>
      </section>

      <section className={styles.panel} id="metals" aria-labelledby="metal-title">
        <div className={styles.panelHead}><span className={styles.icon}><Coins size={21}/></span><span className={styles.tag}>DELAYED INDICATIVE SPOT</span></div>
        <h2 id="metal-title">Gold &amp; silver value</h2>
        <p className={styles.description}>Indicative INR/gram spot-derived prices, delayed at least 15 minutes. Jewellery costs, GST and dealer margins are not included.</p>
        <form onSubmit={getMetal} className={styles.form}>
          <div className={styles.fieldGrid}>
            <label>Metal<select value={metal} onChange={e => { setMetal(e.target.value as 'gold' | 'silver'); setMetalData(null) }}><option value="gold">Gold</option><option value="silver">Silver</option></select></label>
            <label>Weight (grams)<input type="number" value={grams} onChange={e => setGrams(e.target.value)} min="0.01" max="1000000" step="any" required/></label>
          </div>
          <button className={styles.fullButton} type="submit" disabled={metalBusy || !(weight > 0 && weight <= 1000000)}>Get indicative spot rate</button>
        </form>
        <ErrorText message={metalError}/>
        {metalData && <div className={styles.result} aria-live="polite"><span>{metalData.metal === 'gold' ? 'Gold 24K' : 'Silver spot'} · {metalData.timestamp.replace('T', ' ').slice(0, 16)} UTC</span><strong>{rupees.format(metalData.perGram * weight)}</strong><p>Approx. {rupees.format(metalData.perGram)} per gram × {number.format(weight)} g</p>{metalData.metal === 'gold' && <small>22K estimate: {metalData.perGram22k ? rupees.format(metalData.perGram22k * weight) : 'Unavailable'} · 18K: {metalData.perGram18k ? rupees.format(metalData.perGram18k * weight) : 'Unavailable'}</small>}</div>}
        <SourceLine name="goldprice.dev" detail="Delayed data; attribution required by provider" url="https://goldprice.dev/"/>
      </section>
    </div>
  </>
}
