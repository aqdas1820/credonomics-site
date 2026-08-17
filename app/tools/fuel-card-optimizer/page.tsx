'use client'

import { ArrowLeft, BadgeIndianRupee, ExternalLink, Fuel, Gauge, Info, RotateCcw, Sparkles, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const pct = (n: number) => `${n.toFixed(2)}%`

type Brand = 'Any' | 'IndianOil' | 'BPCL' | 'HPCL'
type FuelCard = {
  id: string
  name: string
  issuer: string
  brand: Exclude<Brand, 'Any'>
  fuelRate: number
  monthlyRewardCap: number | null
  waiverRate: number
  waiverCap: number | null
  annualFee: number
  feeWaiverSpend: number | null
  minTxn?: number
  maxTxn?: number
  appBonus?: number
  appBonusSpendCap?: number | null
  note: string
  source: string
  verified: string
}

const cards: FuelCard[] = [
  {
    id: 'rbl-xtra', name: 'IndianOil RBL Bank XTRA', issuer: 'RBL Bank', brand: 'IndianOil',
    fuelRate: 7.5, monthlyRewardCap: 1000, waiverRate: 1, waiverCap: 200, annualFee: 1500, feeWaiverSpend: 275000,
    note: '15 Fuel Points/₹100; 1 Fuel Point = ₹0.50. Fuel-point cap 2,000/month. Fee used is ₹1,500 before GST.',
    source: 'https://www.rbl.bank.in/personal-banking/cards/credit-cards/indianoil-rbl-bank-xtra-credit-card', verified: '09 Aug 2026'
  },
  {
    id: 'sbi-octane', name: 'BPCL SBI Card OCTANE', issuer: 'SBI Card', brand: 'BPCL',
    fuelRate: 6.25, monthlyRewardCap: 625, waiverRate: 1, waiverCap: 100, annualFee: 1499, feeWaiverSpend: 200000, maxTxn: 4000,
    note: '25X rewards on BPCL fuel equals 6.25% reward value plus 1% surcharge waiver. Reward cap modeled from 2,500 RP/cycle.',
    source: 'https://www.sbicard.com/en/personal/credit-cards/bpcl-sbi-card-octane.html', verified: '09 Aug 2026'
  },
  {
    id: 'idfc-power-plus', name: 'FIRST Power+', issuer: 'IDFC FIRST Bank', brand: 'HPCL',
    fuelRate: 5, monthlyRewardCap: null, waiverRate: 0, waiverCap: 0, annualFee: 499, feeWaiverSpend: 150000,
    appBonus: 1.5, appBonusSpendCap: 10000,
    note: 'Up to 6.5% at HPCL when 5% card rewards are combined with up to 1.5% HP Pay Happy Coins. No fuel-surcharge waiver.',
    source: 'https://www.idfcfirst.bank.in/credit-card/hpcl-power-fuel-credit-card', verified: '09 Aug 2026'
  },
  {
    id: 'hdfc-iocl', name: 'IndianOil HDFC Bank', issuer: 'HDFC Bank', brand: 'IndianOil',
    fuelRate: 4.8, monthlyRewardCap: 144, waiverRate: 1, waiverCap: 250, annualFee: 500, feeWaiverSpend: 50000, minTxn: 400,
    note: '5% Fuel Points modeled at ₹0.96/FP when converted to XTRAREWARDS. Post-first-6-month fuel cap: 150 FP/month.',
    source: 'https://www.hdfc.bank.in/credit-cards/indianoil-hdfc-bank-credit-card', verified: '09 Aug 2026'
  },
  {
    id: 'kotak-iocl', name: 'IndianOil Kotak', issuer: 'Kotak Mahindra Bank', brand: 'IndianOil',
    fuelRate: 4, monthlyRewardCap: 300, waiverRate: 1, waiverCap: 100, annualFee: 449, feeWaiverSpend: 50000, minTxn: 100, maxTxn: 5000,
    note: '24 RP/₹150 at IndianOil; 1 RP modeled at ₹0.25 for reward redemption. Reward cap 1,200 RP/cycle.',
    source: 'https://www.kotak.bank.in/en/personal-banking/cards/credit-cards/indian-oil-credit-card.html', verified: '09 Aug 2026'
  },
  {
    id: 'axis-iocl', name: 'IndianOil Axis Bank', issuer: 'Axis Bank', brand: 'IndianOil',
    fuelRate: 4, monthlyRewardCap: 200, waiverRate: 1, waiverCap: 50, annualFee: 500, feeWaiverSpend: 350000, minTxn: 400, maxTxn: 4000,
    note: '4% value back on up to ₹5,000 eligible IOCL fuel spend/month, plus 1% surcharge waiver capped at ₹50/cycle.',
    source: 'https://www.axis.bank.in/cards/credit-card/indianoil-axis-bank-credit-card', verified: '09 Aug 2026'
  },
  {
    id: 'bob-hpcl', name: 'HPCL ENERGIE BOBCARD', issuer: 'BOBCARD', brand: 'HPCL',
    fuelRate: 4, monthlyRewardCap: null, waiverRate: 1, waiverCap: null, annualFee: 499, feeWaiverSpend: 50000,
    note: 'Official BOBCARD positioning: up to 5% fuel savings at HPCL (4% rewards + 1% surcharge waiver).',
    source: 'https://www.bobcard.co.in/credit-card-types/hpcl-energie', verified: '09 Aug 2026'
  },
  {
    id: 'idfc-power', name: 'FIRST Power', issuer: 'IDFC FIRST Bank', brand: 'HPCL',
    fuelRate: 3.5, monthlyRewardCap: null, waiverRate: 0, waiverCap: 0, annualFee: 199, feeWaiverSpend: 50000,
    appBonus: 1.5, appBonusSpendCap: 10000,
    note: 'Up to 5% at HPCL when card rewards are combined with HP Pay Happy Coins. No fuel-surcharge waiver.',
    source: 'https://www.idfcfirst.bank.in/credit-card/hpcl-power-fuel-credit-card', verified: '09 Aug 2026'
  },
]

function calcCard(card: FuelCard, monthlyFuel: number, annualRetailSpend: number, preferred: Brand, useApp: boolean) {
  const eligibleFuel = preferred === 'Any' || preferred === card.brand ? monthlyFuel : 0
  let rewards = eligibleFuel * card.fuelRate / 100
  if (card.monthlyRewardCap !== null) rewards = Math.min(rewards, card.monthlyRewardCap)
  let waiver = eligibleFuel * card.waiverRate / 100
  if (card.waiverCap !== null) waiver = Math.min(waiver, card.waiverCap)
  let app = 0
  if (useApp && card.appBonus) {
    const appSpend = card.appBonusSpendCap ? Math.min(eligibleFuel, card.appBonusSpendCap) : eligibleFuel
    app = appSpend * card.appBonus / 100
  }
  const annualGross = (rewards + waiver + app) * 12
  const feeWaived = !!card.feeWaiverSpend && annualRetailSpend >= card.feeWaiverSpend
  const feeCost = feeWaived ? 0 : card.annualFee * 1.18
  const net = annualGross - feeCost
  const annualFuel = monthlyFuel * 12
  return { ...card, rewards, waiver, app, annualGross, feeWaived, feeCost, net, effective: annualFuel ? net / annualFuel * 100 : 0 }
}

export default function FuelOptimizer() {
  const [monthlyFuel, setMonthlyFuel] = useState(10000)
  const [annualRetailSpend, setAnnualRetailSpend] = useState(120000)
  const [preferred, setPreferred] = useState<Brand>('Any')
  const [useApp, setUseApp] = useState(true)
  const [showAll, setShowAll] = useState(true)

  const ranked = useMemo(() => cards
    .map(c => calcCard(c, monthlyFuel, annualRetailSpend, preferred, useApp))
    .filter(c => showAll || preferred === 'Any' || c.brand === preferred)
    .sort((a, b) => b.net - a.net), [monthlyFuel, annualRetailSpend, preferred, useApp, showAll])

  const best = ranked[0]
  const reset = () => { setMonthlyFuel(10000); setAnnualRetailSpend(120000); setPreferred('Any'); setUseApp(true); setShowAll(true) }

  return <main className="toolPage">
    <header className="calcNav wrap"><a className="brand" href="/"><img src="/credonomics-mark.png" alt="" className="brandMark"/><span className="brandWords"><strong>CredoNomics</strong><small>Investment Solutions</small></span></a><a className="backLink" href="/#tools"><ArrowLeft size={16}/> Back to tools</a></header>

    <section className="calcHero wrap fuelCompareHero"><div><div className="eyebrow"><Sparkles size={14}/> Indian fuel-card comparison engine</div><h1>Fuel Card <span>Comparator</span></h1><p>Enter your fuel spend once. CredoNomics ranks major IndianOil, BPCL and HPCL credit cards by estimated annual net savings after reward caps, surcharge waivers and annual fees.</p></div>{best && <div className="calcHeroBadge"><Trophy size={24}/><div><small>Current #1 match</small><b>{best.name}</b></div></div>}</section>

    <section className="fuelCompareShell wrap">
      <aside className="fuelControls calcPanel">
        <div className="calcPanelHead"><div><span className="overline">Your profile</span><h2>Tell us how you refuel</h2></div><button className="resetBtn" onClick={reset}><RotateCcw size={15}/> Reset</button></div>
        <label className="calcField"><span className="calcLabel">Monthly fuel spend</span><div className="calcInputWrap"><span>₹</span><input type="number" min="0" step="500" value={monthlyFuel} onChange={e=>setMonthlyFuel(Math.max(0,Number(e.target.value)||0))}/></div><small>Total petrol/diesel/CNG spend per month.</small></label>
        <label className="calcField"><span className="calcLabel">Annual retail spend on card</span><div className="calcInputWrap"><span>₹</span><input type="number" min="0" step="5000" value={annualRetailSpend} onChange={e=>setAnnualRetailSpend(Math.max(0,Number(e.target.value)||0))}/></div><small>Used to test annual-fee waiver thresholds.</small></label>
        <label className="calcField"><span className="calcLabel">Preferred fuel network</span><select className="selectInput" value={preferred} onChange={e=>setPreferred(e.target.value as Brand)}><option>Any</option><option>IndianOil</option><option>BPCL</option><option>HPCL</option></select><small>Choose “Any” to compare all supported networks.</small></label>
        <label className="toggleRow"><span><b>Include partner-app bonus</b><small>Example: HP Pay Happy Coins where applicable.</small></span><input type="checkbox" checked={useApp} onChange={e=>setUseApp(e.target.checked)}/></label>
        <label className="toggleRow"><span><b>Show cards from other fuel networks</b><small>Useful to see whether switching pumps can save more.</small></span><input type="checkbox" checked={showAll} onChange={e=>setShowAll(e.target.checked)}/></label>
        <div className="calcNote"><Info size={17}/><p>Results are estimates based on issuer-published benefits. Actual value can change with transaction size, MCC, reward redemption method, caps, exclusions and issuer updates.</p></div>
      </aside>

      <div className="fuelRanking">
        <div className="fuelRankingHead"><div><span className="overline">Live ranking</span><h2>{ranked.length} fuel cards compared</h2></div><div className="rankingMetric"><small>Sorted by</small><b>Net annual savings</b></div></div>
        <div className="fuelCardList">
          {ranked.map((c, i) => <article className={`fuelCompareCard ${i===0?'winner':''}`} key={c.id}>
            <div className="fuelRank"><span>#{i+1}</span>{i===0&&<Trophy size={16}/>}</div>
            <div className="fuelCardMain"><div className="fuelCardTitle"><div><span className={`fuelBrand ${c.brand.toLowerCase()}`}>{c.brand}</span><h3>{c.name}</h3><small>{c.issuer}</small></div><div className="fuelNet"><strong>{inr.format(c.net)}</strong><span>net / year</span></div></div>
              <div className="fuelStats"><div><small>Effective return</small><b>{pct(c.effective)}</b></div><div><small>Gross fuel value</small><b>{inr.format(c.annualGross)}</b></div><div><small>Annual fee</small><b>{c.feeWaived?'Waived':inr.format(c.feeCost)}</b></div><div><small>Fuel network</small><b>{c.brand}</b></div></div>
              <div className="fuelBreakdown"><span>Rewards <b>{inr.format(c.rewards)}/mo</b></span><span>Waiver <b>{inr.format(c.waiver)}/mo</b></span>{c.app>0&&<span>App bonus <b>{inr.format(c.app)}/mo</b></span>}</div>
              <p className="fuelNote">{c.note}</p>
              <div className="fuelMeta"><span>Verified {c.verified}</span>{c.feeWaiverSpend&&<span>Fee waiver at {inr.format(c.feeWaiverSpend)} annual spend</span>}<a href={c.source} target="_blank" rel="noreferrer">Official issuer source <ExternalLink size={12}/></a></div>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="calcInsights wrap"><article><span><Gauge size={18}/></span><small>Compared networks</small><b>IOCL · BPCL · HPCL</b><p>Major co-branded fuel cards from the three large public-sector fuel networks.</p></article><article><span><BadgeIndianRupee size={18}/></span><small>Ranking method</small><b>Rewards + waiver − fee</b><p>Annual fee GST is deducted unless your entered annual spend meets the issuer waiver threshold.</p></article><article><span><Fuel size={18}/></span><small>Data policy</small><b>Issuer-first</b><p>Card terms are sourced from official issuer pages and should be re-verified when banks revise benefits.</p></article></section>
    <footer className="calcFooter wrap"><p><Info size={13}/> This comparison is an informational calculator, not a recommendation to apply for credit. Eligibility and benefits are governed by the issuer.</p><a href="/">CredoNomics home →</a></footer>
  </main>
}
