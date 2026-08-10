'use client'

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  BarChart3,
  Calculator,
  CheckCircle2,
  CreditCard,
  FileSearch,
  Fuel,
  Landmark,
  LineChart,
  Mail,
  Menu,
  Moon,
  Phone,
  PieChart,
  Scale,
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
  {
    icon: CreditCard,
    kicker: 'Cards',
    title: 'Credit Card Finder',
    text: 'Match your spending pattern to the right card strategy and compare the value after fees.',
    tag: 'Live',
    href: '/tools/credit-card-finder',
  },
  {
    icon: Calculator,
    kicker: 'Calculator',
    title: 'Cashback Calculator',
    text: 'Calculate the real cashback rate after caps, excluded spends, annual fees and GST.',
    tag: 'Live',
    href: '/tools/cashback-calculator',
  },
  {
    icon: Fuel,
    kicker: 'Fuel',
    title: 'Fuel Card Optimizer',
    text: 'Measure fuel rewards, surcharge waiver, app benefits and the true annual savings.',
    tag: 'Live',
    href: '/tools/fuel-card-optimizer',
  },
  {
    icon: LineChart,
    kicker: 'Investing',
    title: 'MF Portfolio Tracker',
    text: 'Track mutual-fund portfolios, compare snapshots and surface additions, exits and weight changes.',
    tag: 'Live',
    href: '/tools/mf-portfolio-tracker',
  },
]

const principles = [
  [Scale, 'Compare the full economics', 'Fees, GST, caps, exclusions and benefits belong in one transparent calculation.'],
  [FileSearch, 'Research before conclusions', 'Use issuer documents, AMC disclosures and visible assumptions before reaching a decision.'],
  [BadgeIndianRupee, 'Built for Indian finance', '₹-based tools designed around Indian cards, banking products and investment workflows.'],
]

export default function Home() {
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -45px 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="premiumHome">
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
            <a href="#tools" onClick={() => setOpen(false)}>Solutions</a>
            <a href="/research" onClick={() => setOpen(false)}>Research</a>
            <a href="#about" onClick={() => setOpen(false)}>About</a>
            <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          </nav>

          <div className="navActions">
            <a className="desktopPhone" href="tel:02562455327">
              <Phone size={15} />
              02562 455327
            </a>
            <button
              className="iconBtn"
              aria-label="Toggle theme"
              onClick={() => setDark((value) => !value)}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="iconBtn mobile"
              aria-label="Toggle menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <section id="top" className="hero wrap financeHero">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="heroGrid">
          <div className="heroCopy">
            <div className="eyebrow">
              <Sparkles size={14} />
              Financial intelligence for better decisions
            </div>

            <h1>
              Research. Compare.
              <span> Decide with clarity.</span>
            </h1>

            <p className="lede">
              CredoNomics turns complex financial products, reward structures
              and mutual-fund portfolio data into transparent research,
              calculations and decision tools built for India.
            </p>

            <div className="heroCtas">
              <a className="primaryBtn" href="#tools">
                Explore solutions <ArrowRight size={17} />
              </a>
              <a className="secondaryBtn" href="/research">
                Research intelligence <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="trustRow">
              <span><ShieldCheck size={16} /> Independent research</span>
              <span><TrendingUp size={16} /> Numbers-first analysis</span>
              <span><Search size={16} /> Transparent assumptions</span>
            </div>

            <div className="heroStats">
              <div>
                <b>4</b>
                <span>Live financial tools</span>
              </div>
              <div>
                <b>India-first</b>
                <span>Cards, banking & investments</span>
              </div>
              <div>
                <b>Document-led</b>
                <span>Research before conclusions</span>
              </div>
            </div>
          </div>

          <div className="heroVisual financeTerminal" aria-label="CredoNomics financial intelligence dashboard">
            <div className="marketGrid" aria-hidden="true" />
            <div className="terminalGlow" aria-hidden="true" />

            <div className="visualTop">
              <div className="markOrb">
                <img src="/credonomics-mark.png" alt="CredoNomics logo mark" />
              </div>
              <div>
                <span className="visualLabel">CREDONOMICS INTELLIGENCE</span>
                <p>Financial research & decision analytics</p>
              </div>
              <span className="livePill"><i /> Platform live</span>
            </div>

            <div className="terminalSummary">
              <div>
                <span className="insightKicker">Research framework</span>
                <h3>Turn financial information into decisions you can audit.</h3>
              </div>
              <div className="terminalBadge">
                <Activity size={17} />
                <span>Analytics</span>
              </div>
            </div>

            <div className="marketChartCard">
              <div className="chartHeader">
                <div>
                  <small>Portfolio intelligence</small>
                  <b>Research signal view</b>
                </div>
                <span><i /> Active</span>
              </div>

              <div className="chartArea">
                <div className="chartScale">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                </div>

                <svg className="marketLine" viewBox="0 0 520 180" role="img" aria-label="Decorative rising analytics line">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(53,209,199,.34)" />
                      <stop offset="100%" stopColor="rgba(44,114,246,0)" />
                    </linearGradient>
                  </defs>
                  <path
                    className="marketArea"
                    d="M0,145 C45,137 64,112 103,118 C145,124 164,88 210,94 C251,100 276,66 315,71 C357,77 384,48 423,55 C456,61 482,30 520,24 L520,180 L0,180 Z"
                  />
                  <path
                    className="marketStroke"
                    d="M0,145 C45,137 64,112 103,118 C145,124 164,88 210,94 C251,100 276,66 315,71 C357,77 384,48 423,55 C456,61 482,30 520,24"
                  />
                  <circle className="marketDot marketDotOne" cx="210" cy="94" r="5" />
                  <circle className="marketDot marketDotTwo" cx="423" cy="55" r="5" />
                  <circle className="marketDot marketDotThree" cx="520" cy="24" r="6" />
                </svg>
              </div>
            </div>

            <div className="metricGrid premiumMetrics">
              <div className="metric">
                <WalletCards size={18} />
                <b>Cards</b>
                <span>Rewards & fees</span>
              </div>
              <div className="metric">
                <PieChart size={18} />
                <b>Funds</b>
                <span>Portfolio analysis</span>
              </div>
              <div className="metric">
                <BarChart3 size={18} />
                <b>Research</b>
                <span>Data-backed insights</span>
              </div>
            </div>

            <div className="floatChip chipOne">
              <Landmark size={15} />
              Banking research
            </div>
            <div className="floatChip chipTwo">
              <TrendingUp size={15} />
              Portfolio intelligence
            </div>
          </div>
        </div>
      </section>

      <section className="ticker wrap reveal" aria-label="CredoNomics values">
        <div>
          <b>Independent</b>
          <span>No product-pushing inside the calculations.</span>
        </div>
        <div>
          <b>India-first</b>
          <span>Built around Indian cards, banks, funds and ₹ outcomes.</span>
        </div>
        <div>
          <b>Auditable</b>
          <span>Inputs, assumptions and methodology stay visible.</span>
        </div>
      </section>

      <section id="tools" className="section wrap reveal">
        <div className="sectionHead">
          <div>
            <span className="overline">Financial solutions</span>
            <h2>Professional tools for real financial decisions.</h2>
          </div>
          <p>
            Compare products, calculate the economics and inspect the assumptions
            before acting on a financial decision.
          </p>
        </div>

        <div className="cards">
          {tools.map((tool, index) => (
            <article className="card solutionCard" key={tool.title}>
              <div className="cardTop">
                <span className="toolIcon"><tool.icon size={22} /></span>
                <span className="tag liveTag"><i />{tool.tag}</span>
              </div>
              <span className="kicker">0{index + 1} / {tool.kicker}</span>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
              <a className="ghost" href={tool.href}>
                Open solution <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap principles reveal">
        <div className="sectionHead compactHead">
          <div>
            <span className="overline">Research philosophy</span>
            <h2>Financial analysis should explain itself.</h2>
          </div>
        </div>

        <div className="principleGrid">
          {principles.map(([Icon, title, text]: any) => (
            <article key={title}>
              <span><Icon size={20} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="research" className="section wrap researchSection reveal">
        <div className="researchIntro">
          <span className="overline">Research intelligence</span>
          <h2>Go beyond the headline return or reward rate.</h2>
          <p>
            CredoNomics focuses on the details that change the real outcome:
            reward caps, exclusions, annual fees, surcharge rules, portfolio
            disclosures and changes in mutual-fund holdings.
          </p>
          <a className="secondaryBtn inlineBtn" href="/research">
            Explore research <ArrowRight size={16} />
          </a>
        </div>

        <div className="guideList">
          {[
            ['Credit-card economics', 'Cashback, reward caps, fee recovery, exclusions and effective reward rates.'],
            ['Banking & fuel', 'Surcharge waivers, co-branded benefits, banking terms and real annual savings.'],
            ['Mutual-fund intelligence', 'Portfolio changes, conviction, sector shifts and factsheet-led research workflows.'],
          ].map(([title, text], index) => (
            <a className="guide" href="/research" key={title}>
              <span className="num">0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <span className="guideArrow"><ArrowUpRight size={18} /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="statement wrap reveal">
        <div className="statementIcon"><CheckCircle2 size={25} /></div>
        <p>
          Better financial decisions start with
          <strong> transparent data, clear assumptions and disciplined comparison.</strong>
        </p>
      </section>

      <section id="about" className="section wrap about reveal">
        <div>
          <span className="overline">About CredoNomics</span>
          <h2>A financial research and decision-solutions platform.</h2>
        </div>
        <div className="aboutCopy">
          <p>
            CredoNomics Investment Solutions focuses on credit cards, cashback,
            banking and investment research. Our tools are designed to make
            product economics and portfolio data easier to understand.
          </p>
          <p>
            CredoNomics is not a SEBI-registered investment adviser and does not
            provide personalized investment advice. Information is educational
            and research-oriented; final decisions should be verified against
            current issuer, bank or AMC documents.
          </p>
        </div>
      </section>

      <section id="contact" className="contact wrap reveal">
        <div>
          <span className="overline light">Contact</span>
          <h2>Need help understanding a financial product?</h2>
          <p>
            Share the product terms, factsheet or comparison you are working on.
            CredoNomics is built around practical, document-led financial questions.
          </p>
        </div>

        <div className="contactActions">
          <a href="tel:02562455327">
            <Phone size={19} />
            <span><small>Call</small><b>02562 455327</b></span>
          </a>
          <a href="mailto:hello@credonomics.in">
            <Mail size={19} />
            <span><small>Email</small><b>hello@credonomics.in</b></span>
          </a>
        </div>
      </section>

      <footer className="footer wrap">
        <a className="footerBrand" href="#top">
          <img src="/credonomics-mark.png" alt="" />
          <span><b>CREDONOMICS</b><small>Investment Solutions</small></span>
        </a>

        <p>Independent research & financial tools. Not investment advice.</p>

        <div className="footerLinks">
          <a href="#tools">Solutions</a>
          <a href="/research">Research</a>
          <a href="mailto:hello@credonomics.in">Email</a>
        </div>
      </footer>
    </main>
  )
}
