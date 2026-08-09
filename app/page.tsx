'use client'
import { ArrowUpRight, Calculator, CreditCard, Fuel, LineChart, Mail, Menu, Moon, Phone, ShieldCheck, Sparkles, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const tools = [
  {icon: CreditCard, kicker:'Cards', title:'Credit Card Finder', text:'Compare cards by cashback, rewards, annual fee and your actual spending pattern.', tag:'Coming soon'},
  {icon: Calculator, kicker:'Calculator', title:'Cashback Calculator', text:'See your effective reward rate after caps, exclusions and annual fees.', tag:'Build 01'},
  {icon: Fuel, kicker:'Fuel', title:'Fuel Card Optimizer', text:'Compare surcharge waiver, reward points and fuel-app benefits in one view.', tag:'Build 02'},
  {icon: LineChart, kicker:'Investing', title:'MF Portfolio Tracker', text:'Track portfolio changes across mutual-fund factsheets month by month.', tag:'Build 03'}
]

const guides = [
  ['Credit Cards','Pick the right card for each spend category, understand caps and avoid reward leakage.'],
  ['Banking','Practical escalation paths, complaint drafting and documentation for Indian banks.'],
  ['Investing','Research workflows for mutual funds, portfolio changes and long-term compounding.']
]

export default function Home(){
  const [dark,setDark]=useState(false)
  const [open,setOpen]=useState(false)
  useEffect(()=>{ document.documentElement.dataset.theme = dark ? 'dark':'light' },[dark])
  return <main>
    <header className="nav wrap">
      <a className="brand brandLogo" href="#top" aria-label="CredoNomics home">
        <img src="/credonomics-logo.png" alt="CredoNomics Investment Solutions" />
      </a>
      <nav className={open?'links show':'links'}>
        <a href="#tools" onClick={()=>setOpen(false)}>Tools</a><a href="#research" onClick={()=>setOpen(false)}>Research</a><a href="#about" onClick={()=>setOpen(false)}>About</a>
        <a className="phoneLink" href="tel:02562455327"><Phone size={15}/> 02562 455327</a>
        <a className="pill small" href="mailto:hello@credonomics.in">Contact <ArrowUpRight size={15}/></a>
      </nav>
      <div className="navActions">
        <button className="iconBtn" aria-label="Toggle theme" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
        <button className="iconBtn mobile" aria-label="Toggle menu" onClick={()=>setOpen(v=>!v)}>{open?<X size={19}/>:<Menu size={19}/>}</button>
      </div>
    </header>

    <section id="top" className="hero wrap">
      <div className="heroLayout">
        <div className="heroCopy">
          <div className="eyebrow"><Sparkles size={15}/> Independent finance tools & research</div>
          <h1>Make smarter decisions<br/>with your money.</h1>
          <p className="lede">CredoNomics breaks down credit cards, cashback, banking and investing into clear, usable decisions — without the noise.</p>
          <div className="heroCtas"><a className="pill" href="#tools">Explore tools <ArrowUpRight size={17}/></a><a className="textLink" href="#research">Read the research <ArrowUpRight size={16}/></a></div>
        </div>
        <div className="heroBrand" aria-label="CredoNomics Investment Solutions">
          <div className="logoGlow"></div>
          <img src="/credonomics-logo.png" alt="CredoNomics Investment Solutions — Learn, Invest, Grow" />
          <div className="brandNote">Learn <span>•</span> Invest <span>•</span> Grow</div>
        </div>
      </div>
      <div className="miniGrid">
        <div><b>India-first</b><span>Built around Indian cards, banks and offers.</span></div>
        <div><b>Numbers-first</b><span>Effective returns, caps, fees and real outcomes.</span></div>
        <div><b>Practical</b><span>Research you can use before you spend or invest.</span></div>
      </div>
    </section>

    <section id="tools" className="section wrap">
      <div className="sectionHead"><div><span className="overline">Products</span><h2>Tools I’m building</h2></div><p>Simple utilities for decisions that are usually buried in terms, PDFs and reward tables.</p></div>
      <div className="cards">{tools.map((t)=><article className="card" key={t.title}>
        <div className="cardTop"><span className="toolIcon"><t.icon size={21}/></span><span className="tag">{t.tag}</span></div>
        <span className="kicker">{t.kicker}</span><h3>{t.title}</h3><p>{t.text}</p><button className="ghost">View project <ArrowUpRight size={16}/></button>
      </article>)}</div>
    </section>

    <section id="research" className="section wrap splitSection">
      <div className="stickyIntro"><span className="overline">Research</span><h2>Finance, explained without filler.</h2><p>Deep dives, comparison frameworks and practical guides built for people who want the details before making a decision.</p><a className="textLink" href="#">Browse all notes <ArrowUpRight size={16}/></a></div>
      <div className="guideList">{guides.map(([a,b],i)=><a className="guide" href="#" key={a}><span className="num">0{i+1}</span><div><h3>{a}</h3><p>{b}</p></div><ArrowUpRight size={19}/></a>)}</div>
    </section>

    <section className="section wrap manifesto">
      <ShieldCheck size={28}/><p>Good financial decisions shouldn’t require reading 40 pages of fine print. <strong>CredoNomics turns the fine print into the decision.</strong></p>
    </section>

    <section id="about" className="section wrap about">
      <div><span className="overline">About</span><h2>Built from curiosity about how money products actually work.</h2></div>
      <div><p>CredoNomics is an independent project focused on credit cards, banking, cashback systems and investing. The goal is to make complex financial products easier to compare, verify and use.</p><p>Expect calculators, data-backed comparisons, portfolio research and practical documentation guides.</p></div>
    </section>

    <section className="wrap newsletter">
      <div><span className="overline">Stay in the loop</span><h2>New tools. Better comparisons. Less guesswork.</h2><a className="newsletterPhone" href="tel:02562455327"><Phone size={17}/> 02562 455327</a></div>
      <a className="pill inverted" href="mailto:hello@credonomics.in?subject=CredoNomics updates"><Mail size={17}/> Get updates</a>
    </section>

    <footer className="footer wrap"><div className="footerBrand"><img src="/credonomics-logo.png" alt="CredoNomics"/></div><p>Independent research. Not financial advice.</p><div><a href="tel:02562455327">02562 455327</a><a href="#">YouTube</a><a href="#">X / Twitter</a><a href="mailto:hello@credonomics.in">Email</a></div></footer>
  </main>
}
