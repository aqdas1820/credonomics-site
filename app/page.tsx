'use client'

import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CreditCard,
  Fuel,
  LineChart,
  Mail,
  Menu,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const tools = [
  { icon: CreditCard, kicker: 'Cards', title: 'Credit Card Finder', text: 'Compare cards by cashback, rewards, annual fee and your actual spending pattern.', tag: 'Coming soon', href: '#' },
  { icon: Calculator, kicker: 'Calculator', title: 'Cashback Calculator', text: 'See your effective reward rate after caps, exclusions and annual fees.', tag: 'Live', href: '/tools/cashback-calculator' },
  { icon: Fuel, kicker: 'Fuel', title: 'Fuel Card Optimizer', text: 'Compare surcharge waiver, reward points and fuel-app benefits in one view.', tag: 'Build 02', href: '#' },
  { icon: LineChart, kicker: 'Investing', title: 'MF Portfolio Tracker', text: 'Track portfolio changes across mutual-fund factsheets month by month.', tag: 'Build 03', href: '#' },
]

const guides = [
  ['Credit Cards', 'Pick the right card for each spend category, understand caps and avoid reward leakage.'],
  ['Banking', 'Practical escalation paths, complaint drafting and documentation for Indian banks.'],
  ['Investing', 'Research workflows for mutual funds, portfolio changes and long-term compounding.'],
]

export default function Home() {
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  return (
    <main>
      <header className="navShell">
        <div className="nav wrap">
          <a className="brand" href="#top" aria-label="CredoNomics home">
            <img src="/credonomics-mark.png" alt="" className="brandMark" />
            <span className="brandWords">
              <strong>CREDONOMICS</strong>
              <small>Investment Solutions</small>
            </span>
          </a>

          <nav className={open ? 'links show' : 'links'}>
            <a href="#tools" onClick={() => setOpen(false)}>Tools</a>
            <a href="#research" onClick={() => setOpen(false)}>Research</a>
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
            <h1>Clearer money decisions.<br/><span>Built on the numbers.</span></h1>
            <p className="lede">CredoNomics turns confusing reward tables, banking terms and investment data into practical decisions you can actually use.</p>
            <div className="heroCtas">
              <a className="primaryBtn" href="#tools">Explore tools <ArrowRight size={17}/></a>
              <a className="secondaryBtn" href="#research">Read research <ArrowUpRight size={16}/></a>
            </div>
            <div className="trustRow">
              <span><ShieldCheck size={16}/> India-first</span>
              <span><TrendingUp size={16}/> Numbers-first</span>
              <span><Search size={16}/> Practical research</span>
            </div>
          </div>

          <div className="heroVisual" aria-label="CredoNomics financial insights">
            <div className="visualTop">
              <div className="markOrb"><img src="/credonomics-mark.png" alt="CredoNomics logo mark"/></div>
              <div>
                <span className="visualLabel">CREDONOMICS</span>
                <p>Finance, decoded.</p>
              </div>
              <span className="livePill"><i></i> Independent</span>
            </div>

            <div className="insightCard featured">
              <span className="insightKicker">What we focus on</span>
              <h3>Better outcomes, not louder recommendations.</h3>
              <div className="focusBars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
            </div>

            <div className="metricGrid">
              <div className="metric"><WalletCards size={18}/><b>Cards</b><span>Rewards, caps & fees</span></div>
              <div className="metric"><LineChart size={18}/><b>Investing</b><span>Funds & portfolios</span></div>
              <div className="metric"><Calculator size={18}/><b>Tools</b><span>Decision calculators</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="ticker wrap" aria-label="CredoNomics values">
        <div><b>Independent</b><span>No product-pushing.</span></div>
        <div><b>India-first</b><span>Built around Indian cards, banks and offers.</span></div>
        <div><b>Transparent</b><span>Fees, caps and assumptions shown clearly.</span></div>
      </section>

      <section id="tools" className="section wrap">
        <div className="sectionHead">
          <div><span className="overline">Products</span><h2>Tools I’m building</h2></div>
          <p>Simple utilities for decisions that are usually buried in terms, PDFs and reward tables.</p>
        </div>
        <div className="cards">
          {tools.map((t, i) => (
            <article className="card" key={t.title}>
              <div className="cardTop">
                <span className="toolIcon"><t.icon size={22}/></span>
                <span className="tag">{t.tag}</span>
              </div>
              <span className="kicker">0{i + 1} / {t.kicker}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <a className="ghost" href={t.href}>View project <ArrowUpRight size={16}/></a>
            </article>
          ))}
        </div>
      </section>

      <section id="research" className="section wrap researchSection">
        <div className="researchIntro">
          <span className="overline">Research</span>
          <h2>Finance, explained without filler.</h2>
          <p>Deep dives, comparison frameworks and practical guides for people who want the details before making a decision.</p>
        </div>
        <div className="guideList">
          {guides.map(([a,b], i) => (
            <a className="guide" href="#" key={a}>
              <span className="num">0{i+1}</span>
              <div><h3>{a}</h3><p>{b}</p></div>
              <span className="guideArrow"><ArrowUpRight size={18}/></span>
            </a>
          ))}
        </div>
      </section>

      <section className="statement wrap">
        <div className="statementIcon"><ShieldCheck size={25}/></div>
        <p>Good financial decisions shouldn’t require reading 40 pages of fine print. <strong>CredoNomics turns the fine print into the decision.</strong></p>
      </section>

      <section id="about" className="section wrap about">
        <div>
          <span className="overline">About</span>
          <h2>Built to make financial products easier to understand.</h2>
        </div>
        <div className="aboutCopy">
          <p>CredoNomics is an independent project focused on credit cards, banking, cashback systems and investing.</p>
          <p>The goal is simple: compare clearly, verify the details and show the real-world outcome before you spend or invest.</p>
        </div>
      </section>

      <section id="contact" className="contact wrap">
        <div>
          <span className="overline light">Contact</span>
          <h2>Have a finance question or a tool idea?</h2>
          <p>Reach out directly. Practical questions are exactly what CredoNomics is built around.</p>
        </div>
        <div className="contactActions">
          <a href="tel:02562455327"><Phone size={19}/><span><small>Call</small><b>02562 455327</b></span></a>
          <a href="mailto:hello@credonomics.in"><Mail size={19}/><span><small>Email</small><b>hello@credonomics.in</b></span></a>
        </div>
      </section>

      <footer className="footer wrap">
        <a className="footerBrand" href="#top">
          <img src="/credonomics-mark.png" alt=""/>
          <span><b>CREDONOMICS</b><small>Investment Solutions</small></span>
        </a>
        <p>Independent research. Not financial advice.</p>
        <div className="footerLinks"><a href="#tools">Tools</a><a href="#research">Research</a><a href="mailto:hello@credonomics.in">Email</a></div>
      </footer>
    </main>
  )
}
