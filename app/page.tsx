'use client'

import {
  ArrowRight, ArrowUpRight, Calculator, CreditCard, Fuel, LineChart, Mail, Menu,
  Moon, Phone, Search, ShieldCheck, Sparkles, Sun, TrendingUp, WalletCards, X,
  BadgeIndianRupee, FileSearch, Scale, CheckCircle2
} from 'lucide-react'
import { useEffect, useState } from 'react'

const tools = [
  { icon: CreditCard, kicker: 'Cards', title: 'Credit Card Finder', text: 'Match your spending pattern to the right card strategy and compare the value after fees.', tag: 'Live', href: '/tools/credit-card-finder' },
  { icon: Calculator, kicker: 'Calculator', title: 'Cashback Calculator', text: 'Calculate the real cashback rate after caps, excluded spends, annual fees and GST.', tag: 'Live', href: '/tools/cashback-calculator' },
  { icon: Fuel, kicker: 'Fuel', title: 'Fuel Card Optimizer', text: 'Measure fuel rewards, surcharge waiver, app benefits and the true annual savings.', tag: 'Live', href: '/tools/fuel-card-optimizer' },
  { icon: LineChart, kicker: 'Investing', title: 'MF Portfolio Tracker', text: 'Compare two mutual-fund portfolio snapshots and surface additions, exits and weight changes.', tag: 'Live', href: '/tools/mf-portfolio-tracker' },
]

const principles = [
  [Scale, 'Compare the full cost', 'Fees, GST, caps and exclusions belong in the same calculation as rewards.'],
  [FileSearch, 'Show the assumptions', 'Every tool tells you what it assumes so the result can be checked against official terms.'],
  [BadgeIndianRupee, 'Built for Indian finance', '₹-based calculators designed around Indian cards, banking and investment workflows.'],
]

export default function Home() {
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])

  return (
    <main>
      <header className="navShell">
        <div className="nav wrap">
          <a className="brand" href="#top" aria-label="CredoNomics home">
            <img src="/credonomics-mark.png" alt="" className="brandMark" />
            <span className="brandWords"><strong>CREDONOMICS</strong><small>Investment Solutions</small></span>
          </a>
          <nav className={open ? 'links show' : 'links'}>
            <a href="#tools" onClick={() => setOpen(false)}>Tools</a>
            <a href="/research" onClick={() => setOpen(false)}>Research</a>
            <a href="#about" onClick={() => setOpen(false)}>About</a>
            <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          </nav>
          <div className="navActions">
            <a className="desktopPhone" href="tel:02562455327"><Phone size={15}/>02562 455327</a>
            <button className="iconBtn" aria-label="Toggle theme" onClick={() => setDark(v => !v)}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button>
            <button className="iconBtn mobile" aria-label="Toggle menu" onClick={() => setOpen(v => !v)}>{open ? <X size={18}/> : <Menu size={18}/>}</button>
          </div>
        </div>
      </header>

      <section id="top" className="hero wrap">
        <div className="heroGrid">
          <div className="heroCopy">
            <div className="eyebrow"><Sparkles size={14}/> Independent finance tools & research</div>
            <h1>Make financial decisions with <span>better math.</span></h1>
            <p className="lede">CredoNomics converts complex card terms, reward structures and portfolio data into clear calculations you can inspect, compare and use.</p>
            <div className="heroCtas">
              <a className="primaryBtn" href="#tools">Use the tools <ArrowRight size={17}/></a>
              <a className="secondaryBtn" href="/research">Research hub <ArrowUpRight size={16}/></a>
            </div>
            <div className="trustRow">
              <span><ShieldCheck size={16}/> Independent</span>
              <span><TrendingUp size={16}/> Numbers-first</span>
              <span><Search size={16}/> Transparent assumptions</span>
            </div>
          </div>

          <div className="heroVisual" aria-label="CredoNomics decision dashboard">
            <div className="visualTop">
              <div className="markOrb"><img src="/credonomics-mark.png" alt="CredoNomics logo mark"/></div>
              <div><span className="visualLabel">CREDONOMICS</span><p>Decision tools for real money.</p></div>
              <span className="livePill"><i></i> 4 tools live</span>
            </div>
            <div className="insightCard featured">
              <span className="insightKicker">Decision framework</span>
              <h3>Benefit − fees − exclusions = the value that actually matters.</h3>
              <div className="decisionStrip"><span>Rewards</span><i>−</i><span>Costs</span><i>=</i><b>Net value</b></div>
            </div>
            <div className="metricGrid">
              <div className="metric"><WalletCards size={18}/><b>Cards</b><span>Match & compare</span></div>
              <div className="metric"><Fuel size={18}/><b>Fuel</b><span>True savings</span></div>
              <div className="metric"><LineChart size={18}/><b>Funds</b><span>Portfolio changes</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="ticker wrap" aria-label="CredoNomics values">
        <div><b>Independent</b><span>No product-pushing in the calculations.</span></div>
        <div><b>India-first</b><span>Built around Indian cards, banks and ₹ outcomes.</span></div>
        <div><b>Auditable</b><span>Inputs and assumptions stay visible.</span></div>
      </section>

      <section id="tools" className="section wrap">
        <div className="sectionHead">
          <div><span className="overline">Decision tools</span><h2>Four tools. All live.</h2></div>
          <p>Start with your own numbers. Each tool calculates a practical outcome without hiding the assumptions.</p>
        </div>
        <div className="cards">
          {tools.map((t, i) => (
            <article className="card" key={t.title}>
              <div className="cardTop"><span className="toolIcon"><t.icon size={22}/></span><span className="tag liveTag"><i></i>{t.tag}</span></div>
              <span className="kicker">0{i + 1} / {t.kicker}</span>
              <h3>{t.title}</h3><p>{t.text}</p>
              <a className="ghost" href={t.href}>Open tool <ArrowUpRight size={16}/></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap principles">
        <div className="sectionHead compactHead"><div><span className="overline">How we work</span><h2>Financial tools should explain themselves.</h2></div></div>
        <div className="principleGrid">
          {principles.map(([Icon, title, text]: any) => <article key={title}><span><Icon size={20}/></span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section id="research" className="section wrap researchSection">
        <div className="researchIntro"><span className="overline">Research</span><h2>Use the calculator. Then verify the terms.</h2><p>The research hub is structured around the documents and questions that usually decide the real outcome: reward caps, exclusions, fee waivers, surcharge rules and portfolio disclosures.</p><a className="secondaryBtn inlineBtn" href="/research">Explore research <ArrowRight size={16}/></a></div>
        <div className="guideList">
          {[
            ['Credit cards', 'Frameworks for cashback, reward caps, annual-fee recovery and card selection.'],
            ['Fuel economics', 'Surcharge waivers, reward value, co-branded benefits and effective savings.'],
            ['Mutual funds', 'Portfolio snapshot comparison and a workflow for month-to-month factsheet analysis.'],
          ].map(([a,b], i) => <a className="guide" href="/research" key={a}><span className="num">0{i+1}</span><div><h3>{a}</h3><p>{b}</p></div><span className="guideArrow"><ArrowUpRight size={18}/></span></a>)}
        </div>
      </section>

      <section className="statement wrap"><div className="statementIcon"><CheckCircle2 size={25}/></div><p>CredoNomics is designed to help you <strong>calculate first, verify the fine print, and decide with context.</strong></p></section>

      <section id="about" className="section wrap about">
        <div><span className="overline">About</span><h2>A practical financial solutions and research platform.</h2></div>
        <div className="aboutCopy"><p>CredoNomics Investment Solutions focuses on credit cards, cashback, banking and investment research. The tools are designed to make product economics easier to understand before you make a decision.</p><p>Results are informational, not personalized investment advice. Product terms change, so final decisions should always be checked against current issuer or AMC documents.</p></div>
      </section>

      <section id="contact" className="contact wrap">
        <div><span className="overline light">Contact</span><h2>Need help understanding a financial product?</h2><p>Share the product terms or the decision you are comparing. CredoNomics is built around practical, document-led questions.</p></div>
        <div className="contactActions">
          <a href="tel:02562455327"><Phone size={19}/><span><small>Call</small><b>02562 455327</b></span></a>
          <a href="mailto:hello@credonomics.in"><Mail size={19}/><span><small>Email</small><b>hello@credonomics.in</b></span></a>
        </div>
      </section>

      <footer className="footer wrap">
        <a className="footerBrand" href="#top"><img src="/credonomics-mark.png" alt=""/><span><b>CREDONOMICS</b><small>Investment Solutions</small></span></a>
        <p>Independent tools & research. Not financial advice.</p>
        <div className="footerLinks"><a href="#tools">Tools</a><a href="/research">Research</a><a href="mailto:hello@credonomics.in">Email</a></div>
      </footer>
    </main>
  )
}
