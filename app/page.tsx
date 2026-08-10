import {
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  Calculator,
  CheckCircle2,
  CreditCard,
  FileSearch,
  Fuel,
  Instagram,
  Landmark,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  BarChart3,
  Gauge,
  Layers3,
} from 'lucide-react'
import SiteFrame from './components/SiteFrame'
import styles from './core-v4.module.css'

const tools = [
  {
    icon: CreditCard,
    label: '01 / Card selection',
    title: 'Credit Card Finder',
    text: 'Start from how you spend, then compare the value after fees, reward caps and practical restrictions.',
    href: '/tools/credit-card-finder',
    output: 'Spend-fit comparison',
  },
  {
    icon: Calculator,
    label: '02 / Reward economics',
    title: 'Cashback Calculator',
    text: 'Turn an advertised cashback rate into a net figure after caps, exclusions, annual fee and GST.',
    href: '/tools/cashback-calculator',
    output: 'Effective cashback rate',
  },
  {
    icon: Fuel,
    label: '03 / Fuel economics',
    title: 'Fuel Card Optimizer',
    text: 'Separate reward value, surcharge waiver and transaction rules to estimate true fuel savings.',
    href: '/tools/fuel-card-optimizer',
    output: 'Net annual fuel value',
  },
]

const method = [
  [FileSearch, '01', 'Source', 'Begin with official product pages, fee schedules, terms and issuer documentation.'],
  [Search, '02', 'Normalize', 'Separate headline benefits from eligibility rules, exclusions, caps and timing conditions.'],
  [BadgeIndianRupee, '03', 'Calculate', 'Convert the rules into comparable ₹ outcomes using visible assumptions.'],
  [Target, '04', 'Stress-test', 'Check what changes when spending mix, fees or product conditions move.'],
]

export default function Home() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.hero}`}>
        <div className={styles.heroGlowA} />
        <div className={styles.heroGlowB} />

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={13} /> Built for Indian financial decisions</span>
            <h1>
              Understand the fine print.
              <span> Quantify the real value.</span>
            </h1>
            <p className={styles.heroLead}>
              Independent, India-focused research tools for credit cards, cashback, fuel and banking — built to turn product fine print into numbers you can inspect before deciding.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="/tools">Explore live tools <ArrowRight size={16} /></a>
              <a className={styles.secondaryButton} href="/research">Visit research desk <ArrowUpRight size={15} /></a>
            </div>
            <div className={styles.trustRow}>
              <span><ShieldCheck size={15} /> Independent educational research</span>
              <span><BadgeIndianRupee size={15} /> India-first calculations</span>
              <span><Search size={15} /> Assumptions stay visible</span>
            </div>
          </div>

          <div className={styles.engine} aria-label="CredoNomics decision model">
            <div className={styles.engineGrid} />
            <div className={styles.engineHeader}>
              <div>
                <small>CREDONOMICS / DECISION MODEL</small>
                <b>Product economics workspace</b>
              </div>
              <span className={styles.engineStatus}><i /> Research mode</span>
            </div>

            <div className={styles.engineBody}>
              <small>Decision framework</small>
              <h2>Move from a product promise to a number you can audit.</h2>
              <div className={styles.engineEquation}>
                <div className={styles.engineCell}>
                  <small>01</small><p>Benefits</p><b>Rewards · cashback · waivers</b>
                </div>
                <span className={styles.operator}>−</span>
                <div className={styles.engineCell}>
                  <small>02</small><p>Friction</p><b>Caps · exclusions · eligibility</b>
                </div>
                <span className={styles.operator}>−</span>
                <div className={styles.engineCell}>
                  <small>03</small><p>Costs</p><b>Fees · GST · opportunity cost</b>
                </div>
              </div>
              <div className={styles.engineOutput}>
                <span>OUTPUT / decision-ready comparison</span>
                <b>Effective product value</b>
              </div>
            </div>

            <div className={styles.engineFooter}>
              <div><CreditCard size={17} /><span><b>Cards</b><small>Fit & reward economics</small></span></div>
              <div><Fuel size={17} /><span><b>Fuel</b><small>Waiver & reward value</small></span></div>
              <div><FileSearch size={17} /><span><b>Research</b><small>Primary-source first</small></span></div>
            </div>
          </div>
        </div>

        <div className={styles.proofStrip}>
          <div><strong>3 live tools</strong><span>Finished public calculators</span></div>
          <div><strong>₹-first</strong><span>Indian product economics</span></div>
          <div><strong>Document-led</strong><span>Terms before conclusions</span></div>
          <div><strong>No promises</strong><span>Compare trade-offs, not guaranteed outcomes</span></div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.overline}>V7 / Credit Card Intelligence</span>
            <h2>Model a card around your spending — then inspect every deduction.</h2>
          </div>
          <p>
            Compare up to four card structures using category-wise spending, reward caps,
            annual fees and fee-waiver thresholds. No unexplained ranking.
          </p>
        </div>

        <div className={styles.researchGrid}>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Layers3 size={21}/></span>
            <h3>Spend-profile engine</h3>
            <p>Your spending mix drives the result rather than a generic “best card” label.</p>
            <a className={styles.textLink} href="/cards/analyzer">Open analyzer <ArrowRight size={14}/></a>
          </article>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Gauge size={21}/></span>
            <h3>Transparent Fit Score</h3>
            <p>Reward potential, fee efficiency, cap efficiency, base-rate resilience and spend fit.</p>
            <a className={styles.textLink} href="/research/card-scoring">See scoring method <ArrowRight size={14}/></a>
          </article>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><BarChart3 size={21}/></span>
            <h3>Source-backed database</h3>
            <p>The public registry only accepts card records carrying official sources and a verification date.</p>
            <a className={styles.textLink} href="/cards">Visit card intelligence <ArrowRight size={14}/></a>
          </article>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.overline}>Live decision tools</span>
            <h2>Start with the financial question you actually need to answer.</h2>
          </div>
          <p>
            Each tool is designed around a practical decision and keeps the
            important inputs visible rather than hiding them behind a single score.
          </p>
        </div>

        <div className={styles.toolGrid}>
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <a className={styles.toolCard} href={tool.href} key={tool.title}>
                <div className={styles.cardTop}>
                  <span className={styles.iconTile}><Icon size={22} /></span>
                  <span className={styles.statusPill}><i className={styles.liveDot} /> Live</span>
                </div>
                <span className={styles.cardLabel}>{tool.label}</span>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                <div className={styles.cardFooter}><span>{tool.output}</span><ArrowUpRight size={16} /></div>
              </a>
            )
          })}
          <a className={`${styles.toolCard} ${styles.researchCard}`} href="/research">
            <div className={styles.cardTop}>
              <span className={styles.iconTile}><FileSearch size={22} /></span>
              <span className={styles.statusPill}>Research</span>
            </div>
            <span className={styles.cardLabel}>04 / Research desk</span>
            <h3>Research Frameworks</h3>
            <p>Learn how to verify fees, reward rules, surcharge mechanics and product conditions before trusting a calculation.</p>
            <div className={styles.cardFooter}><span>Methodology & verification</span><ArrowUpRight size={16} /></div>
          </a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div><span className={styles.overline}>Quick research calculators</span><h2>Answer the smaller questions that can change a card decision.</h2></div>
          <p>Use focused calculators for annual-fee break-even, cashback caps, fuel surcharge waivers and reward-point value.</p>
        </div>
        <div className={styles.toolGrid}>
          <a className={styles.toolCard} href="/tools/annual-fee-break-even"><span className={styles.cardLabel}>Card economics</span><h3>Annual Fee Break-Even</h3><p>Estimate how much spending is needed for a paid card’s extra rewards to recover its annual cost.</p><div className={styles.cardFooter}><span>Calculate break-even</span><ArrowUpRight size={16}/></div></a>
          <a className={styles.toolCard} href="/tools/cashback-cap"><span className={styles.cardLabel}>Cashback</span><h3>Cashback Cap</h3><p>See how a monthly reward ceiling changes your effective cashback rate.</p><div className={styles.cardFooter}><span>Model the cap</span><ArrowUpRight size={16}/></div></a>
          <a className={styles.toolCard} href="/tools/fuel-surcharge-waiver"><span className={styles.cardLabel}>Fuel economics</span><h3>Fuel Surcharge Waiver</h3><p>Estimate monthly and annual waiver value without mixing it with fuel reward points.</p><div className={styles.cardFooter}><span>Estimate waiver</span><ArrowUpRight size={16}/></div></a>
          <a className={styles.toolCard} href="/tools/reward-point-value"><span className={styles.cardLabel}>Reward economics</span><h3>Reward Point Value</h3><p>Convert points to rupees using the redemption path you actually plan to use.</p><div className={styles.cardFooter}><span>Value points</span><ArrowUpRight size={16}/></div></a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section} ${styles.splitSection}`}>
        <div className={styles.splitIntro}>
          <span className={styles.overline}>CredoNomics methodology</span>
          <h2>The conclusion matters. So does the path to it.</h2>
          <p>
            Professional financial research should make it possible to see where
            the inputs came from, how the calculation works and what could change the result.
          </p>
          <a className={styles.textLink} href="/methodology">Read full methodology <ArrowRight size={15} /></a>
        </div>

        <div className={styles.stepGrid}>
          {method.map(([Icon, no, title, text]: any) => (
            <article className={styles.stepCard} key={no}>
              <div className={styles.stepCardTop}><span>{no}</span><Icon size={19} /></div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.principleBand}`}>
        <div>
          <span className={styles.bandIcon}><Target size={21} /></span>
          <div>
            <small>THE CREDONOMICS PRINCIPLE</small>
            <h2>Calculate first. Verify the fine print. Decide with context.</h2>
          </div>
        </div>
        <p>The objective is not to make a product look good or bad. It is to make the trade-offs easier to see.</p>
      </section>

      <section className={`${styles.wrap} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.overline}>Research desk</span>
            <h2>Research the rule that changes the outcome.</h2>
          </div>
          <p>Evergreen frameworks focused on the parts of financial products most likely to be misunderstood or double-counted.</p>
        </div>

        <div className={styles.researchGrid}>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><CreditCard size={21} /></span>
            <h3>Credit-card economics</h3>
            <p>Move from an advertised reward rate to a realistic net value.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Eligible vs excluded spend</li>
              <li><CheckCircle2 size={14}/> Reward caps and fee recovery</li>
              <li><CheckCircle2 size={14}/> Annual fee + GST</li>
            </ul>
          </article>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Fuel size={21} /></span>
            <h3>Fuel-card economics</h3>
            <p>Keep surcharge waiver and reward earnings separate before combining them.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Waiver ceiling and transaction range</li>
              <li><CheckCircle2 size={14}/> Reward-point rupee value</li>
              <li><CheckCircle2 size={14}/> Outlet and app eligibility</li>
            </ul>
          </article>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Landmark size={21} /></span>
            <h3>Banking product terms</h3>
            <p>Operational rules can matter as much as the headline feature.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Fees and service charges</li>
              <li><CheckCircle2 size={14}/> Eligibility and restrictions</li>
              <li><CheckCircle2 size={14}/> Current official documentation</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section} ${styles.disclosureGrid}`}>
        <div className={styles.disclosurePanel}>
          <span className={styles.overline}>Trust & transparency</span>
          <h2>Clear tools need clear boundaries.</h2>
          <p>
            CredoNomics publishes general educational research and calculators.
            It does not provide personalized investment advice or guarantee financial outcomes.
          </p>
          <div className={styles.disclosurePoints}>
            <div><ShieldCheck size={17}/><b>Regulatory status disclosed</b><small>CredoNomics is not SEBI-registered and is not NISM-certified.</small></div>
            <div><FileSearch size={17}/><b>Primary-source preference</b><small>Current official terms should take priority when information conflicts.</small></div>
            <div><Target size={17}/><b>No guaranteed outcomes</b><small>Tools help structure comparisons; actual eligibility and benefits can differ.</small></div>
          </div>
          <a className={styles.secondaryButton} href="/disclosures">Read disclosures <ArrowUpRight size={15}/></a>
        </div>

        <div className={styles.contactPanel}>
          <span className={styles.overline}>Official channels</span>
          <h3>Follow or contact CredoNomics.</h3>
          <p>Use official channels for research questions, corrections and website feedback.</p>
          <a className={styles.contactItem} href="https://www.instagram.com/credonomics.in/" target="_blank" rel="noreferrer">
            <Instagram size={17}/><span><small>Instagram</small><b>@credonomics.in</b></span>
          </a>
          <a className={styles.contactItem} href="mailto:hello@credonomics.in">
            <Mail size={17}/><span><small>Email</small><b>hello@credonomics.in</b></span>
          </a>
        </div>
      </section>
    </SiteFrame>
  )
}
