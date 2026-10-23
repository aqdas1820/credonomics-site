import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Compass, Layers3, ShieldCheck } from 'lucide-react'
import styles from './home-creative-hero.module.css'

export default function HomeCreativeHero() {
  return <>
    <section className={styles.stage} data-cm-hero aria-labelledby="cm-home-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.copy}>
        <div className={styles.welcomeIdentity} data-cm-welcome>
          <span className={styles.welcomeLogo} aria-hidden="true"><img src="/credonomics-mark.png" width="38" height="38" alt="" /></span>
          <span className={styles.welcomeWordmark}><strong>CREDONOMICS</strong><small>RESEARCH · TOOLS · PERSPECTIVE</small></span>
        </div>
        <div className={styles.eyebrow}>INDEPENDENT FINANCIAL INTELLIGENCE · INDIA FIRST</div>
        <h1 id="cm-home-title">Financial intelligence,<br/><span>without the noise.</span></h1>
        <p>Research that connects the dots. Practical tools that explain the math. A clearer way to study markets, financial products and risk.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/research">Explore research <ArrowUpRight size={17} aria-hidden="true" /></Link>
          <Link className={styles.secondary} href="/tools">Open financial tools <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className={styles.proof} aria-label="Research principles">
          <span><ShieldCheck size={15} aria-hidden="true"/>Source-linked</span>
          <span><Compass size={15} aria-hidden="true"/>Context first</span>
          <span><Layers3 size={15} aria-hidden="true"/>Methodology visible</span>
        </div>
      </div>
      <div className={styles.visual}>
        <div className={styles.networkLabel}><span>RESEARCH ARCHITECTURE</span><small>01 — INFORMATION INTO CONTEXT</small></div>
        <svg className={styles.network} viewBox="0 0 480 360" aria-hidden="true">
          <defs><linearGradient id="cn-network-gradient"><stop stopColor="#35d0ea"/><stop offset="1" stopColor="#6685ff"/></linearGradient></defs>
          <g className={styles.connectors} fill="none" stroke="url(#cn-network-gradient)">
            <path d="M62 80H160L240 180L340 80H422M62 280H160L240 180L340 280H422M240 30V330M30 180H450"/>
            <circle cx="240" cy="180" r="66"/><circle cx="240" cy="180" r="112" className={styles.outerRing}/>
          </g>
          <g className={styles.nodes} fill="#111d30" stroke="#35d0ea">
            {[[62,80],[422,80],[62,280],[422,280],[240,30],[240,330],[30,180],[450,180]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="5"/>)}
          </g>
          <g fill="#a6b7cd" fontSize="10" fontFamily="system-ui" textAnchor="middle">
            <text x="62" y="62">SOURCES</text><text x="422" y="62">FRAMEWORKS</text>
            <text x="62" y="305">DISCLOSURES</text><text x="422" y="305">PERSPECTIVE</text>
          </g>
          <image href="/credonomics-mark.png" x="216" y="143" width="48" height="48"/>
          <text x="240" y="211" fill="#f2f7ff" fontSize="10" letterSpacing="2" textAnchor="middle">INSIGHT</text>
        </svg>
        <div className={styles.networkLinks}>
          <Link href="/research"><small>01 / RESEARCH</small><strong>Understand the why.</strong><ArrowUpRight size={16} aria-hidden="true"/></Link>
          <Link href="/ipo"><small>02 / INTELLIGENCE</small><strong>Study the context.</strong><ArrowUpRight size={16} aria-hidden="true"/></Link>
          <Link href="/tools"><small>03 / TOOLS</small><strong>Make the math clear.</strong><ArrowUpRight size={16} aria-hidden="true"/></Link>
        </div>
        <p className={styles.visualCaption}>Conceptual research network · not a market feed</p>
      </div>
    </section>
    <nav className={styles.ribbon} aria-label="CredoNomics research areas">
      <Link href="/research">Equity research</Link><Link href="/ipo">IPO intelligence</Link><Link href="/mutual-funds">Mutual funds</Link><Link href="/cards">Card economics</Link><Link href="/tools">Financial tools</Link>
    </nav>
  </>
}
