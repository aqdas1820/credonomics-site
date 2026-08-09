'use client'

import { ArrowLeft, CreditCard, Info, RotateCcw, Sparkles, Trophy, WalletCards, CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'

const inr = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 })

type CardDraft = { name:string; baseRate:number; bonusRate:number; bonusShare:number; monthlyCap:number; annualFee:number; feeWaiver:number }
const defaults: CardDraft[] = [
  { name:'Card A', baseRate:1, bonusRate:5, bonusShare:35, monthlyCap:1000, annualFee:1000, feeWaiver:100000 },
  { name:'Card B', baseRate:1.5, bonusRate:3, bonusShare:50, monthlyCap:1500, annualFee:500, feeWaiver:200000 },
  { name:'Card C', baseRate:2, bonusRate:2, bonusShare:0, monthlyCap:0, annualFee:0, feeWaiver:0 },
]

function Num({value,onChange,prefix,suffix,step=1}:{value:number,onChange:(n:number)=>void,prefix?:string,suffix?:string,step?:number}){
  return <div className="miniInput">{prefix&&<span>{prefix}</span>}<input type="number" min="0" step={step} value={value} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))}/>{suffix&&<span>{suffix}</span>}</div>
}

export default function CreditCardFinder(){
  const [monthlySpend,setMonthlySpend]=useState(40000)
  const [cards,setCards]=useState<CardDraft[]>(defaults)
  const update=(i:number,k:keyof CardDraft,v:string|number)=>setCards(c=>c.map((x,j)=>j===i?{...x,[k]:v}:x))
  const rows=useMemo(()=>cards.map((c)=>{
    const annualSpend=monthlySpend*12
    const bonusSpend=monthlySpend*Math.min(100,c.bonusShare)/100
    const baseSpend=monthlySpend-bonusSpend
    const rawMonthly=baseSpend*c.baseRate/100+bonusSpend*c.bonusRate/100
    const monthlyReward=c.monthlyCap>0?Math.min(rawMonthly,c.monthlyCap):rawMonthly
    const gross=monthlyReward*12
    const feeWaived=c.feeWaiver>0&&annualSpend>=c.feeWaiver
    const fee=feeWaived?0:c.annualFee*1.18
    const net=gross-fee
    const effective=annualSpend>0?net/annualSpend*100:0
    return {...c,gross,fee,net,effective,feeWaived}
  }).sort((a,b)=>b.net-a.net),[cards,monthlySpend])
  return <main className="toolPage">
    <header className="calcNav wrap"><a className="brand" href="/"><img src="/credonomics-mark.png" alt="" className="brandMark"/><span className="brandWords"><strong>CREDONOMICS</strong><small>Investment Solutions</small></span></a><a className="backLink" href="/#tools"><ArrowLeft size={16}/> Back to tools</a></header>
    <section className="calcHero wrap"><div><div className="eyebrow"><Sparkles size={14}/> Live comparison tool</div><h1>Credit Card <span>Finder</span></h1><p>Compare up to three cards using your own reward rates, caps, fee waiver and spending pattern. No hidden product assumptions.</p></div><div className="calcHeroBadge"><CreditCard size={24}/><div><small>Comparison engine</small><b>Net annual value</b></div></div></section>
    <section className="finderShell wrap">
      <div className="calcPanel">
        <div className="calcPanelHead"><div><span className="overline">Your spending</span><h2>Set one monthly spend</h2></div><button className="resetBtn" onClick={()=>{setMonthlySpend(40000);setCards(defaults)}}><RotateCcw size={15}/> Reset</button></div>
        <label className="calcField standaloneField"><span className="calcLabel">Monthly card spend</span><div className="calcInputWrap"><span>₹</span><input type="number" min="0" step="1000" value={monthlySpend} onChange={e=>setMonthlySpend(Math.max(0,Number(e.target.value)||0))}/></div><small>The same spend is applied to each card so the comparison stays fair.</small></label>
        <div className="cardEditorGrid">{cards.map((c,i)=><article className="cardEditor" key={i}><div className="cardEditorHead"><span className="toolIcon"><WalletCards size={18}/></span><input className="nameInput" value={c.name} onChange={e=>update(i,'name',e.target.value)}/></div>
          <label>Base reward rate <Num value={c.baseRate} onChange={n=>update(i,'baseRate',n)} suffix="%" step={0.1}/></label>
          <label>Bonus reward rate <Num value={c.bonusRate} onChange={n=>update(i,'bonusRate',n)} suffix="%" step={0.1}/></label>
          <label>Spend earning bonus <Num value={c.bonusShare} onChange={n=>update(i,'bonusShare',Math.min(100,n))} suffix="%"/></label>
          <label>Monthly reward cap <Num value={c.monthlyCap} onChange={n=>update(i,'monthlyCap',n)} prefix="₹" step={100}/></label>
          <label>Annual fee <Num value={c.annualFee} onChange={n=>update(i,'annualFee',n)} prefix="₹" step={100}/></label>
          <label>Fee waiver spend <Num value={c.feeWaiver} onChange={n=>update(i,'feeWaiver',n)} prefix="₹" step={10000}/></label>
        </article>)}</div>
        <div className="calcNote"><Info size={17}/><p>Enter rates from the current issuer terms. “Spend earning bonus” is the share of your monthly spend that qualifies for the bonus rate. Fee GST is calculated at 18% when the fee is not waived.</p></div>
      </div>
      <aside className="rankingPanel"><span className="overline light">Ranking</span><h2>Best net value</h2>{rows.map((r,i)=><div className={i===0?'rankRow winner':'rankRow'} key={r.name}><span className="rankNum">{i===0?<Trophy size={17}/>:i+1}</span><div><b>{r.name||`Card ${i+1}`}</b><small>{r.feeWaived?'Annual fee waived':`Fee incl. GST ${inr.format(r.fee)}`}</small></div><div className="rankValue"><strong>{inr.format(r.net)}</strong><small>{r.effective.toFixed(2)}% effective</small></div></div>)}</aside>
    </section>
    <section className="toolExplain wrap"><div><span className="overline">What the ranking means</span><h2>Compare the value you keep, not the headline reward rate.</h2></div><div className="calcSteps"><p><b>01</b> Your spend is split between base-rate and bonus-rate transactions.</p><p><b>02</b> The monthly reward cap is applied before annualising the rewards.</p><p><b>03</b> The annual fee plus GST is deducted unless your spend crosses the waiver threshold.</p><p><b>04</b> Cards are ranked by net annual value, then shown with the effective return on your total spend.</p></div></section>
    <footer className="calcFooter wrap"><p><CheckCircle2 size={14}/> Use current issuer terms. Reward rules and exclusions can change.</p><a href="/">CredoNomics home →</a></footer>
  </main>
}
