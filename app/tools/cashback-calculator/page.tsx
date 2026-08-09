'use client'

import { ArrowLeft, Calculator, Info, RotateCcw, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

type NumSetter = (n: number) => void

function MoneyInput({ label, value, onChange, prefix = '₹', helper }: { label: string; value: number; onChange: NumSetter; prefix?: string; helper?: string }) {
  return (
    <label className="calcField">
      <span className="calcLabel">{label}</span>
      <div className="calcInputWrap"><span>{prefix}</span><input type="number" min="0" step="100" value={value} onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}/></div>
      {helper && <small>{helper}</small>}
    </label>
  )
}

function PercentInput({ label, value, onChange, helper }: { label: string; value: number; onChange: NumSetter; helper?: string }) {
  return (
    <label className="calcField">
      <span className="calcLabel">{label}</span>
      <div className="calcInputWrap"><input type="number" min="0" max="100" step="0.1" value={value} onChange={e => onChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}/><span>%</span></div>
      {helper && <small>{helper}</small>}
    </label>
  )
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const pct = (n:number) => `${n.toFixed(2)}%`

export default function CashbackCalculatorPage() {
  const defaults = { spend: 30000, rate: 5, cap: 1000, excluded: 20, fee: 1000, waiver: 100000, gst: 18 }
  const [spend, setSpend] = useState(defaults.spend)
  const [rate, setRate] = useState(defaults.rate)
  const [cap, setCap] = useState(defaults.cap)
  const [excluded, setExcluded] = useState(defaults.excluded)
  const [fee, setFee] = useState(defaults.fee)
  const [waiver, setWaiver] = useState(defaults.waiver)
  const [gst, setGst] = useState(defaults.gst)

  const r = useMemo(() => {
    const eligibleMonthly = spend * (1 - excluded / 100)
    const uncappedMonthly = eligibleMonthly * rate / 100
    const monthlyCashback = cap > 0 ? Math.min(uncappedMonthly, cap) : uncappedMonthly
    const annualSpend = spend * 12
    const annualEligible = eligibleMonthly * 12
    const annualGross = monthlyCashback * 12
    const feeWaived = waiver > 0 && annualSpend >= waiver
    const annualFeeWithGst = feeWaived ? 0 : fee * (1 + gst / 100)
    const annualNet = annualGross - annualFeeWithGst
    const effectiveRate = annualSpend > 0 ? annualNet / annualSpend * 100 : 0
    const grossRate = annualSpend > 0 ? annualGross / annualSpend * 100 : 0
    const capUtilization = cap > 0 ? Math.min(100, uncappedMonthly / cap * 100) : 0
    const spendToHitCap = rate > 0 && excluded < 100 && cap > 0 ? cap / (rate / 100) / (1 - excluded / 100) : 0
    const breakEvenMonthly = rate > 0 && excluded < 100 ? (annualFeeWithGst / 12) / (rate / 100) / (1 - excluded / 100) : 0
    return { eligibleMonthly, uncappedMonthly, monthlyCashback, annualSpend, annualEligible, annualGross, annualFeeWithGst, annualNet, effectiveRate, grossRate, capUtilization, spendToHitCap, breakEvenMonthly, feeWaived }
  }, [spend, rate, cap, excluded, fee, waiver, gst])

  const reset = () => { setSpend(defaults.spend); setRate(defaults.rate); setCap(defaults.cap); setExcluded(defaults.excluded); setFee(defaults.fee); setWaiver(defaults.waiver); setGst(defaults.gst) }

  return (
    <main className="calcPage">
      <header className="calcNav wrap">
        <a className="brand" href="/"><img src="/credonomics-mark.png" alt="" className="brandMark"/><span className="brandWords"><strong>CREDONOMICS</strong><small>Investment Solutions</small></span></a>
        <a className="backLink" href="/#tools"><ArrowLeft size={16}/> Back to tools</a>
      </header>

      <section className="calcHero wrap">
        <div>
          <div className="eyebrow"><Sparkles size={14}/> Live tool</div>
          <h1>Cashback <span>Calculator</span></h1>
          <p>Calculate the real value of a cashback card after monthly caps, excluded spends and annual fees.</p>
        </div>
        <div className="calcHeroBadge"><Calculator size={24}/><div><small>Built for India</small><b>₹-based card math</b></div></div>
      </section>

      <section className="calcShell wrap">
        <div className="calcPanel">
          <div className="calcPanelHead"><div><span className="overline">Your card & spending</span><h2>Enter the numbers</h2></div><button onClick={reset} className="resetBtn"><RotateCcw size={15}/> Reset</button></div>
          <div className="calcFields">
            <MoneyInput label="Monthly card spend" value={spend} onChange={setSpend} helper="Your total monthly spend on this card."/>
            <PercentInput label="Cashback rate" value={rate} onChange={setRate} helper="Use the rate for the spend you are evaluating."/>
            <MoneyInput label="Monthly cashback cap" value={cap} onChange={setCap} helper="Enter 0 if the card has no monthly cap."/>
            <PercentInput label="Excluded / non-reward spend" value={excluded} onChange={setExcluded} helper="Fuel, rent, wallet loads or other excluded spends."/>
            <MoneyInput label="Annual card fee" value={fee} onChange={setFee} helper="Enter 0 for a lifetime-free card."/>
            <MoneyInput label="Annual spend for fee waiver" value={waiver} onChange={setWaiver} helper="Enter 0 if the fee is never waived."/>
            <PercentInput label="GST on annual fee" value={gst} onChange={setGst} helper="18% is commonly applicable to card fees in India."/>
          </div>

          <div className="calcNote"><Info size={17}/><p>This calculator assumes the same spending pattern every month. It does not include milestone rewards, joining benefits or merchant-specific rates beyond the cashback rate entered above.</p></div>
        </div>

        <aside className="resultPanel">
          <span className="overline light">Your result</span>
          <div className="bigResult"><small>Effective cashback rate</small><strong>{pct(r.effectiveRate)}</strong><span>after annual fee</span></div>
          <div className="resultGrid">
            <div><small>Net annual value</small><b className={r.annualNet >= 0 ? 'positive' : 'negative'}>{inr.format(r.annualNet)}</b></div>
            <div><small>Gross cashback / year</small><b>{inr.format(r.annualGross)}</b></div>
            <div><small>Cashback / month</small><b>{inr.format(r.monthlyCashback)}</b></div>
            <div><small>Fee incl. GST</small><b>{r.feeWaived ? 'Waived' : inr.format(r.annualFeeWithGst)}</b></div>
          </div>
          <div className="rateBar"><div className="rateBarTop"><span>Monthly cap usage</span><b>{cap > 0 ? pct(r.capUtilization) : 'No cap'}</b></div><div className="barTrack"><i style={{width: `${cap > 0 ? r.capUtilization : 100}%`}}/></div></div>
        </aside>
      </section>

      <section className="calcInsights wrap">
        <article><span><TrendingUp size={18}/></span><small>Spend to hit monthly cap</small><b>{r.spendToHitCap > 0 ? inr.format(r.spendToHitCap) : 'Not applicable'}</b><p>Approximate monthly spend needed, after accounting for your excluded-spend percentage.</p></article>
        <article><span><ShieldCheck size={18}/></span><small>Break-even monthly spend</small><b>{r.breakEvenMonthly > 0 ? inr.format(r.breakEvenMonthly) : '₹0'}</b><p>Approximate monthly spend required for cashback to recover the annual fee including GST.</p></article>
        <article><span><Calculator size={18}/></span><small>Eligible annual spend</small><b>{inr.format(r.annualEligible)}</b><p>Annual spending that actually earns cashback under the assumptions entered above.</p></article>
      </section>

      <section className="calcExplain wrap">
        <div><span className="overline">How it works</span><h2>Why “5% cashback” is rarely really 5%.</h2></div>
        <div className="calcSteps"><p><b>01</b> We remove the percentage of spend that earns no rewards.</p><p><b>02</b> We calculate cashback on eligible spend and apply the monthly cap.</p><p><b>03</b> We subtract the annual fee plus GST and divide the net value by your total annual spend.</p></div>
      </section>

      <footer className="calcFooter wrap"><p>CredoNomics calculators are informational tools. Verify current card terms before making a financial decision.</p><a href="/">CredoNomics home →</a></footer>
    </main>
  )
}
