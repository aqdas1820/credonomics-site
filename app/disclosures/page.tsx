import {
  ArrowLeft,
  FileSearch,
  Scale,
  ShieldCheck,
  Target,
} from 'lucide-react'
import styles from '../site-v3.module.css'

const cards = [
  {
    icon: ShieldCheck,
    title: 'Regulatory status',
    text: 'CredoNomics Investment Solutions is not a SEBI-registered investment adviser and is not NISM certified. The website does not provide personalized investment advice.',
  },
  {
    icon: FileSearch,
    title: 'Information & research',
    text: 'Content and tools are educational and research-oriented. Product terms can change, so current official issuer, bank or other primary documents should be verified before a decision.',
  },
  {
    icon: Scale,
    title: 'Calculations & assumptions',
    text: 'Calculator outputs depend on the inputs and assumptions used. Caps, exclusions, taxes, fees, merchant classification and eligibility rules can materially change the real outcome.',
  },
  {
    icon: Target,
    title: 'No guarantee of outcomes',
    text: 'CredoNomics does not guarantee savings, rewards, approvals, investment returns or any other financial outcome. Tools are intended to improve comparison and understanding.',
  },
]

export default function Disclosures() {
  return (
    <main className={`${styles.site} ${styles.subPage}`}>
      <header className={styles.subNav}>
        <a className={styles.brand} href="/">
          <img src="/credonomics-mark.png" alt="" />
          <span><strong>CREDONOMICS</strong><small>Investment Solutions</small></span>
        </a>
        <a className={styles.backLink} href="/"><ArrowLeft size={15} /> Back home</a>
      </header>

      <section className={styles.subHero}>
        <span className={styles.eyebrow}><ShieldCheck size={14} /> Trust & transparency</span>
        <h1>Clear tools need equally clear <span>disclosures.</span></h1>
        <p>
          This page explains the role of CredoNomics, the limits of the tools
          and the checks users should make before relying on financial-product information.
        </p>
      </section>

      <section className={styles.disclosureGrid}>
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article className={styles.disclosureCard} key={card.title}>
              <span><Icon size={21} /></span>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          )
        })}
      </section>

      <section className={styles.disclosureNotice}>
        <ShieldCheck size={24} />
        <div>
          <h2>Final decisions belong with the user.</h2>
          <p>
            CredoNomics can help structure a comparison and make product economics
            easier to inspect. It is not a substitute for professional advice where
            regulated, personalized or situation-specific advice is required.
          </p>
        </div>
      </section>

      <footer className={styles.subFooter}>
        <span>CredoNomics Investment Solutions · Independent financial research & tools.</span>
        <a href="/research">Research methodology →</a>
      </footer>
    </main>
  )
}
