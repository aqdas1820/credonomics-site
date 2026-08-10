import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import styles from '../v6.module.css'
import SiteFrame from './SiteFrame'
import { QUICK_REVIEW_DATE } from '../data/quick-calculators'

export default function CalculatorShell({
  category,
  title,
  description,
  children,
  equation,
  caveats,
}: {
  category: string
  title: string
  description: string
  children: React.ReactNode
  equation: string
  caveats: string[]
}) {
  return (
    <SiteFrame>
    <main className={styles.shell}>
      <div className={styles.calcWrap}>
        <div className={styles.calcHero}>
          <small>{category} · CredoNomics quick calculator</small>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <section className={styles.explainPanel}>
          <h2>How this calculation works</h2>
          <p>This is a generic research model. It does not represent the current terms of any particular bank or card unless you independently enter those current terms.</p>
          <div className={styles.equation}>{equation}</div>
          <ul className={styles.caveats}>
            {caveats.map((item) => <li key={item}><CheckCircle2 size={15}/>{item}</li>)}
          </ul>
        </section>
        <div className={styles.statusPanel}>
          <div><small>Calculation framework reviewed</small><b>{QUICK_REVIEW_DATE}</b></div>
          <Link href="/methodology">Read CredoNomics methodology →</Link>
        </div>
      </div>
    </main>
    </SiteFrame>
  )
}
