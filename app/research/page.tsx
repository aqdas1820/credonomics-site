import {
  ArrowLeft,
  BadgeIndianRupee,
  BookOpen,
  CheckCircle2,
  CreditCard,
  FileSearch,
  Fuel,
  Landmark,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import styles from '../site-v3.module.css'

const topics = [
  {
    icon: CreditCard,
    title: 'Credit card economics',
    text: 'A repeatable framework for moving from an advertised reward rate to the value that can realistically be earned.',
    points: ['Eligible vs excluded spend', 'Reward caps and accelerated categories', 'Annual fee + GST', 'Fee-waiver threshold and timing'],
  },
  {
    icon: Fuel,
    title: 'Fuel card economics',
    text: 'Reward points and surcharge waiver are separate benefits. Analyze each one before adding them into total savings.',
    points: ['Surcharge vs waiver', 'Monthly waiver ceiling', 'Reward-point rupee value', 'Outlet, transaction and app eligibility'],
  },
  {
    icon: Landmark,
    title: 'Banking & product terms',
    text: 'Compare the operational rules that can change a financial product’s usefulness even when the headline benefit looks attractive.',
    points: ['Fees and service charges', 'Eligibility conditions', 'Transaction restrictions', 'Current official terms'],
  },
]

const workflow = [
  ['01', 'Define the question', 'Start with the decision you need to make, not the product marketing headline.'],
  ['02', 'Collect primary terms', 'Use official pages, MITC/fee schedules, T&Cs and issuer documentation first.'],
  ['03', 'Build the economics', 'Calculate benefits, caps, exclusions, fees and taxes using the same time period.'],
  ['04', 'Stress-test the result', 'Check what changes when spend mix, eligibility or product terms move.'],
]

const evidence = [
  ['A', 'Official product documents', 'Issuer/brand product pages, fee schedules, MITC, terms and official notices.'],
  ['B', 'Official support material', 'FAQs, help-centre pages and product-specific operational guidance.'],
  ['C', 'Independent reporting', 'Useful for context, but verify product rules against primary documentation.'],
  ['D', 'Community reports', 'Helpful for identifying edge cases; never treat anecdotal experience as the product rule.'],
]

export default function Research() {
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
        <span className={styles.eyebrow}><BookOpen size={14} /> CredoNomics Research Desk</span>
        <h1>Research the rules before you trust the <span>headline.</span></h1>
        <p>
          Practical frameworks for checking fees, reward mechanics, surcharge rules,
          eligibility and the fine print behind financial products.
        </p>
      </section>

      <section className={styles.researchTopicGrid}>
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <article className={styles.researchTopic} key={topic.title}>
              <span className={styles.researchTopicIcon}><Icon size={22} /></span>
              <h2>{topic.title}</h2>
              <p>{topic.text}</p>
              <ul>
                {topic.points.map((point) => (
                  <li key={point}><ShieldCheck size={14} /> {point}</li>
                ))}
              </ul>
            </article>
          )
        })}
      </section>

      <section className={styles.workflow}>
        <div className={styles.workflowHeader}>
          <div>
            <span className={styles.overline}>Research workflow</span>
            <h2>A disciplined four-step check before reaching a conclusion.</h2>
          </div>
          <p>
            The same workflow can be reused across cards, cashback programmes,
            fuel products and many banking comparisons.
          </p>
        </div>

        <div className={styles.workflowGrid}>
          {workflow.map(([no, title, text]) => (
            <div key={no}>
              <span>{no}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.evidence}>
        <div>
          <span className={styles.overline}>Evidence hierarchy</span>
          <h2>Not every source deserves the same weight.</h2>
        </div>
        <div className={styles.evidenceList}>
          {evidence.map(([rank, title, text]) => (
            <div key={rank}>
              <span>{rank}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.disclosureNotice}>
        <CheckCircle2 size={24} />
        <div>
          <h2>Use the research beside the calculators.</h2>
          <p>
            A calculator result is only as good as the product terms entered into it.
            Verify current issuer or bank documentation before acting on a result.
          </p>
        </div>
      </section>

      <footer className={styles.subFooter}>
        <span>CredoNomics Research Desk · Educational and informational research.</span>
        <a href="/#solutions">Open decision tools →</a>
      </footer>
    </main>
  )
}
