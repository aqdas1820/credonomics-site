'use client'

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  CreditCard,
  FileSearch,
  Fuel,
  Instagram,
  Landmark,
  Mail,
  Menu,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from './site-v3.module.css'

const solutions = [
  {
    icon: CreditCard,
    eyebrow: 'Card selection',
    title: 'Credit Card Finder',
    text: 'Compare card fit around your actual spending pattern instead of choosing from headline reward rates.',
    href: '/tools/credit-card-finder',
    metric: 'Spend-fit analysis',
  },
  {
    icon: Calculator,
    eyebrow: 'Reward economics',
    title: 'Cashback Calculator',
    text: 'Model cashback after caps, excluded spends, annual fees and GST to see the effective return.',
    href: '/tools/cashback-calculator',
    metric: 'Net reward rate',
  },
  {
    icon: Fuel,
    eyebrow: 'Fuel economics',
    title: 'Fuel Card Optimizer',
    text: 'Separate rewards, surcharge waiver and partner benefits to estimate the real annual fuel value.',
    href: '/tools/fuel-card-optimizer',
    metric: 'True annual savings',
  },
]

const decisionPaths = [
  {
    label: 'Choose a card',
    icon: CreditCard,
    title: 'Find the card that fits your spending.',
    text: 'Start from how you spend, then compare reward structure, fees, caps and practical acceptance.',
    href: '/tools/credit-card-finder',
    cta: 'Open Card Finder',
    checks: ['Spending-pattern fit', 'Fee recovery', 'Reward caps & exclusions'],
  },
  {
    label: 'Measure cashback',
    icon: Calculator,
    title: 'Convert advertised cashback into effective value.',
    text: 'Use your own monthly spend and include the costs that marketing headlines usually leave out.',
    href: '/tools/cashback-calculator',
    cta: 'Open Cashback Calculator',
    checks: ['Eligible spend', 'Monthly/annual caps', 'Annual fee + GST'],
  },
  {
    label: 'Optimize fuel',
    icon: Fuel,
    title: 'Know what a fuel card really saves.',
    text: 'Compare surcharge waiver, reward points and fuel-app benefits without double-counting them.',
    href: '/tools/fuel-card-optimizer',
    cta: 'Open Fuel Optimizer',
    checks: ['Surcharge mechanics', 'Reward value', 'Outlet & transaction rules'],
  },
]

const method = [
  {
    icon: FileSearch,
    no: '01',
    title: 'Source',
    text: 'Start from issuer documents, fee schedules, terms, product pages and other primary material.',
  },
  {
    icon: Search,
    no: '02',
    title: 'Normalize',
    text: 'Separate the headline benefit from eligibility rules, caps, exclusions and transaction conditions.',
  },
  {
    icon: BadgeIndianRupee,
    no: '03',
    title: 'Calculate',
    text: 'Convert the rules into ₹ outcomes using transparent inputs and visible assumptions.',
  },
  {
    icon: BarChart3,
    no: '04',
    title: 'Explain',
    text: 'Show the practical result, the trade-offs and what should still be verified before a decision.',
  },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [path, setPath] = useState(0)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('credonomics-theme')
      if (saved === 'dark') setDark(true)
    } catch {}
  }, [])

  const toggleTheme = () => {
    setDark((current) => {
      const next = !current
      try {
        window.localStorage.setItem('credonomics-theme', next ? 'dark' : 'light')
      } catch {}
      return next
    })
  }

  const active = decisionPaths[path]
  const ActiveIcon = active.icon

  return (
    <main className={`${styles.site} ${dark ? styles.dark : ''}`}>
      <div className={styles.progressRail} aria-hidden="true">
        <span />
      </div>

      <header className={styles.navShell}>
        <div className={styles.nav}>
          <a className={styles.brand} href="#top" aria-label="CredoNomics home">
            <img src="/credonomics-mark.png" alt="" />
            <span>
              <strong>CREDONOMICS</strong>
              <small>Investment Solutions</small>
            </span>
          </a>

          <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <a href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</a>
            <a href="/research" onClick={() => setMenuOpen(false)}>Research</a>
            <a href="#methodology" onClick={() => setMenuOpen(false)}>Methodology</a>
            <a href="/disclosures" onClick={() => setMenuOpen(false)}>Disclosures</a>
          </nav>

          <div className={styles.navActions}>
            <a className={styles.navPhone} href="tel:02562455327">
              <Phone size={15} />
              02562 455327
            </a>
            <button className={styles.iconButton} onClick={toggleTheme} aria-label="Toggle colour theme">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className={`${styles.iconButton} ${styles.menuButton}`}
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroGlowA} />
        <div className={styles.heroGlowB} />

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <Sparkles size={14} />
              Financial research & decision tools for India
            </div>

            <h1>
              Financial decisions deserve
              <span> more than a headline number.</span>
            </h1>

            <p className={styles.heroLead}>
              CredoNomics turns product terms, fees, reward structures and eligibility rules
              into transparent calculations you can inspect before making a decision.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#solutions">
                Explore solutions <ArrowRight size={17} />
              </a>
              <a className={styles.secondaryButton} href="/research">
                Visit research desk <ArrowUpRight size={16} />
              </a>
            </div>

            <div className={styles.trustRow}>
              <span><ShieldCheck size={16} /> Independent research</span>
              <span><BadgeIndianRupee size={16} /> India-first calculations</span>
              <span><Search size={16} /> Visible assumptions</span>
            </div>
          </div>

          <div className={styles.console}>
            <div className={styles.consoleGrid} aria-hidden="true" />
            <div className={styles.consoleHeader}>
              <div>
                <span className={styles.consoleKicker}>CREDONOMICS / DECISION ENGINE</span>
                <b>Product economics workspace</b>
              </div>
              <span className={styles.systemStatus}><i /> Research mode</span>
            </div>

            <div className={styles.consoleMain}>
              <div className={styles.consoleTitleRow}>
                <div>
                  <small>Decision framework</small>
                  <h2>From product promise to net value.</h2>
                </div>
                <Activity size={21} />
              </div>

              <div className={styles.flow}>
                <div>
                  <span>01</span>
                  <p>Headline benefit</p>
                  <b>Rewards / cashback</b>
                </div>
                <i />
                <div>
                  <span>02</span>
                  <p>Rules & friction</p>
                  <b>Caps / exclusions</b>
                </div>
                <i />
                <div>
                  <span>03</span>
                  <p>Real cost</p>
                  <b>Fees / GST</b>
                </div>
              </div>

              <div className={styles.netValue}>
                <div>
                  <small>OUTPUT</small>
                  <span>Effective product value</span>
                </div>
                <b>Benefit − friction − cost</b>
              </div>
            </div>

            <div className={styles.consoleMetrics}>
              <div><WalletCards size={18} /><span><b>Cards</b><small>Fit & rewards</small></span></div>
              <div><Fuel size={18} /><span><b>Fuel</b><small>Net savings</small></span></div>
              <div><BookOpen size={18} /><span><b>Research</b><small>Primary-source first</small></span></div>
            </div>
          </div>
        </div>

        <div className={styles.heroStrip}>
          <div><strong>3</strong><span>live decision tools</span></div>
          <div><strong>₹ first</strong><span>Indian product economics</span></div>
          <div><strong>Document-led</strong><span>terms before conclusions</span></div>
          <div><strong>Independent</strong><span>research-oriented approach</span></div>
        </div>
      </section>

      <section id="solutions" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.overline}>Live solutions</span>
            <h2>Start with the financial question you actually need to answer.</h2>
          </div>
          <p>
            Each tool focuses on a practical decision and keeps the important
            assumptions visible instead of hiding them behind a single score.
          </p>
        </div>

        <div className={styles.solutionGrid}>
          {solutions.map((solution, index) => {
            const Icon = solution.icon
            return (
              <a className={styles.solutionCard} href={solution.href} key={solution.title}>
                <div className={styles.solutionCardTop}>
                  <span className={styles.solutionIcon}><Icon size={23} /></span>
                  <span className={styles.liveBadge}><i /> Live</span>
                </div>
                <span className={styles.cardNumber}>0{index + 1} / {solution.eyebrow}</span>
                <h3>{solution.title}</h3>
                <p>{solution.text}</p>
                <div className={styles.solutionFooter}>
                  <span>{solution.metric}</span>
                  <ArrowUpRight size={17} />
                </div>
              </a>
            )
          })}

          <a className={`${styles.solutionCard} ${styles.researchCard}`} href="/research">
            <div className={styles.solutionCardTop}>
              <span className={styles.solutionIcon}><BookOpen size={23} /></span>
              <span className={styles.researchBadge}>Research</span>
            </div>
            <span className={styles.cardNumber}>04 / Research desk</span>
            <h3>Research Frameworks</h3>
            <p>
              Learn how to check reward terms, surcharge mechanics, fee schedules
              and product conditions before relying on a calculation.
            </p>
            <div className={styles.solutionFooter}>
              <span>Methodology & verification</span>
              <ArrowUpRight size={17} />
            </div>
          </a>
        </div>
      </section>

      <section className={`${styles.section} ${styles.pathSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.overline}>Decision paths</span>
            <h2>Choose your goal. CredoNomics shows where to start.</h2>
          </div>
          <p>
            A product comparison becomes easier when the objective is defined first.
            Pick the result you are trying to improve.
          </p>
        </div>

        <div className={styles.pathWorkspace}>
          <div className={styles.pathTabs}>
            {decisionPaths.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => setPath(index)}
                  className={path === index ? styles.pathTabActive : ''}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <ArrowRight size={16} />
                </button>
              )
            })}
          </div>

          <div className={styles.pathDetail}>
            <div className={styles.pathDetailIcon}><ActiveIcon size={27} /></div>
            <span className={styles.overline}>Recommended workflow</span>
            <h3>{active.title}</h3>
            <p>{active.text}</p>
            <div className={styles.pathChecks}>
              {active.checks.map((check) => (
                <span key={check}><CheckCircle2 size={16} /> {check}</span>
              ))}
            </div>
            <a className={styles.primaryButton} href={active.href}>
              {active.cta} <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <section id="methodology" className={`${styles.section} ${styles.methodSection}`}>
        <div className={styles.methodIntro}>
          <span className={styles.overline}>CredoNomics methodology</span>
          <h2>A repeatable process from source document to decision.</h2>
          <p>
            Good financial analysis is not only about the final number. The path from
            product terms to that number should be understandable too.
          </p>
          <a href="/research" className={styles.textLink}>
            Read the research methodology <ArrowRight size={16} />
          </a>
        </div>

        <div className={styles.methodGrid}>
          {method.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.no} className={styles.methodCard}>
                <div><span>{item.no}</span><Icon size={20} /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.intelligenceBand}>
        <div>
          <span className={styles.bandIcon}><Target size={22} /></span>
          <div>
            <small>THE CREDONOMICS PRINCIPLE</small>
            <h2>Calculate first. Verify the fine print. Decide with context.</h2>
          </div>
        </div>
        <p>
          The goal is not to make a financial product look better or worse.
          It is to make the trade-offs easier to see.
        </p>
      </section>

      <section className={`${styles.section} ${styles.trustSection}`}>
        <div className={styles.trustPanel}>
          <div>
            <span className={styles.overline}>Trust & transparency</span>
            <h2>Research should be clear about what it is—and what it is not.</h2>
            <p>
              CredoNomics provides informational research, comparisons and calculation tools.
              It does not provide personalized investment advice.
            </p>
          </div>

          <div className={styles.trustList}>
            <span><ShieldCheck size={18} /><b>Independent methodology</b><small>Calculations are designed around disclosed rules and visible assumptions.</small></span>
            <span><FileSearch size={18} /><b>Primary-source preference</b><small>Official product documents should take priority when terms conflict.</small></span>
            <span><TrendingUp size={18} /><b>No return promises</b><small>Tools explain product economics; they do not guarantee financial outcomes.</small></span>
          </div>

          <a className={styles.secondaryButton} href="/disclosures">
            Read disclosures <ArrowUpRight size={16} />
          </a>
        </div>

        <div className={styles.contactPanel}>
          <span className={styles.overline}>Contact CredoNomics</span>
          <h3>Working through a confusing product term?</h3>
          <p>Share the official terms or the financial question you are trying to understand.</p>
          <a href="tel:02562455327"><Phone size={18} /><span><small>Call</small><b>02562 455327</b></span></a>
          <a href="mailto:hello@credonomics.in"><Mail size={18} /><span><small>Email</small><b>hello@credonomics.in</b></span></a>
          <a href="https://www.instagram.com/credonomics.in/" target="_blank" rel="noreferrer">
            <Instagram size={18} /><span><small>Instagram</small><b>@credonomics.in</b></span>
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <a className={styles.brand} href="#top">
            <img src="/credonomics-mark.png" alt="" />
            <span>
              <strong>CREDONOMICS</strong>
              <small>Investment Solutions</small>
            </span>
          </a>
          <p>Independent financial research and decision tools for India.</p>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} CredoNomics Investment Solutions</span>
          <nav>
            <a href="#solutions">Solutions</a>
            <a href="/research">Research</a>
            <a href="/disclosures">Disclosures</a>
            <a href="https://www.instagram.com/credonomics.in/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="mailto:hello@credonomics.in">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  )
}
