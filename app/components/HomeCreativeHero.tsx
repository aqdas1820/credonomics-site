'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BarChart3, Compass, Layers3, ShieldCheck, Sparkles } from 'lucide-react'
import type { PointerEvent } from 'react'
import styles from './home-creative-hero.module.css'

const areas=['EQUITY RESEARCH','IPO INTELLIGENCE','MUTUAL FUNDS','CARD ECONOMICS','FINANCIAL TOOLS']

function moveScene(event:PointerEvent<HTMLDivElement>){
  if(event.pointerType==='touch'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
  const el=event.currentTarget,r=el.getBoundingClientRect()
  el.style.setProperty('--mx',(((event.clientX-r.left)/r.width-.5)*18).toFixed(1)+'px')
  el.style.setProperty('--my',(((event.clientY-r.top)/r.height-.5)*15).toFixed(1)+'px')
}
function resetScene(event:PointerEvent<HTMLDivElement>){
  event.currentTarget.style.setProperty('--mx','0px')
  event.currentTarget.style.setProperty('--my','0px')
}
export default function HomeCreativeHero(){
  return <>
    <section className={styles.stage} data-cm-hero aria-labelledby="cm-home-title">
      <div className={styles.grid} aria-hidden="true"/>
      <div className={styles.welcomeLight} aria-hidden="true"/>
      <div className={styles.copy}>
        <div className={styles.welcomeIdentity} data-cm-welcome>
          <span className={styles.welcomeLogo} aria-hidden="true">
            <img src="/credonomics-mark.png" width="38" height="38" alt=""/>
            <span className={styles.welcomeLogoHalo}/>
          </span>
          <span className={styles.welcomeWordmark}>
            <strong>CREDONOMICS</strong>
            <small>RESEARCH · TOOLS · PERSPECTIVE</small>
          </span>
          <span className={styles.welcomeIdentityLine} aria-hidden="true"/>
        </div>
        <div className={styles.eyebrow}><i/>INDEPENDENT FINANCIAL INTELLIGENCE · INDIA FIRST</div>
        <h1 id="cm-home-title">Financial intelligence,<br/><span>without the noise.</span></h1>
        <p>Research that connects the dots. Practical tools that explain the math. A clearer way to study markets, financial products and risk.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/research">Explore research <ArrowUpRight size={17}/></Link>
          <Link className={styles.secondary} href="/tools">Open financial tools <ArrowRight size={17}/></Link>
        </div>
        <div className={styles.proof} aria-label="Research principles">
          <span><ShieldCheck size={15}/>Source-linked</span>
          <span><Compass size={15}/>Context first</span>
          <span><Layers3 size={15}/>Methodology visible</span>
        </div>
      </div>
      <div className={styles.visual} onPointerMove={moveScene} onPointerLeave={resetScene}>
        <div className={styles.visualInner}>
          <div className={styles.orbitOuter} aria-hidden="true"/>
          <div className={styles.orbitMiddle} aria-hidden="true"/>
          <div className={styles.orbitInner} aria-hidden="true"/>
          <div className={styles.orbitSpark} aria-hidden="true"/>
          <div className={styles.core} aria-hidden="true"><img src="/credonomics-mark.png" width="70" height="70" alt=""/><span>CREDONOMICS</span></div>
          <Link href="/research" className={`${styles.glassCard} ${styles.researchCard}`}>
            <span className={styles.tileIcon}><Sparkles size={16}/></span>
            <span className={styles.tileCopy}><small>01 / RESEARCH</small><strong>Understand the why.</strong><em>Explore frameworks ↗</em></span>
          </Link>
          <Link href="/ipo" className={`${styles.glassCard} ${styles.ipoCard}`}>
            <span className={styles.tileIcon}><BarChart3 size={16}/></span>
            <span className={styles.tileCopy}><small>02 / INTELLIGENCE</small><strong>Study the context.</strong><em>Explore IPOs ↗</em></span>
          </Link>
          <Link href="/tools" className={`${styles.glassCard} ${styles.toolsCard}`}>
            <span className={styles.tileIcon}><Layers3 size={16}/></span>
            <span className={styles.tileCopy}><small>03 / TOOLS</small><strong>Make the math clear.</strong><em>Use free tools ↗</em></span>
          </Link>
          <span className={styles.visualCaption}>ANALYSE · VERIFY · UNDERSTAND</span>
        </div>
      </div>
    </section>
    <div className={styles.ribbon} aria-label="CredoNomics research areas">
      <div className={styles.ribbonTrack} aria-hidden="true">
        {[0,1].map(copy=><div className={styles.ribbonSet} key={copy}>
          {areas.map(area=><span key={area}><i/>{area}</span>)}
        </div>)}
      </div>
    </div>
  </>
}
