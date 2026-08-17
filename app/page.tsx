import Link from "next/link";
import styles from "./home-investment.module.css";

const capabilities = [
  {
    eyebrow: "EQUITY RESEARCH",
    title: "Indian Equity Opportunities",
    text: "Fundamental research built around valuation, earnings quality, balance-sheet strength, catalysts and long-term business economics.",
    href: "/research",
  },
  {
    eyebrow: "IPO INTELLIGENCE",
    title: "Primary Market Research",
    text: "Explore IPO calendars, issue details, subscription trends and structured company research from the CredoNomics IPO platform.",
    href: "/ipo",
  },
  {
    eyebrow: "MUTUAL FUNDS",
    title: "Portfolio Intelligence",
    text: "Track schemes, portfolio holdings, allocation changes and fund-level intelligence through the CredoNomics mutual-fund research workflow.",
    href: "/tools/mf-portfolio-tracker",
  },
  {
    eyebrow: "FINANCIAL TOOLS",
    title: "Decision Utilities",
    text: "Use practical calculators and comparison tools designed to turn financial product data into clearer decisions.",
    href: "/tools",
  },
];

const framework = [
  ["01", "Valuation", "We study price relative to business quality, growth, cash flows and realistic expectations."],
  ["02", "Fundamentals", "Revenue quality, profitability, capital efficiency and balance-sheet resilience come first."],
  ["03", "Catalysts", "Corporate events, earnings inflections and temporary market dislocations can create opportunity."],
  ["04", "Risk", "Downside, uncertainty, execution risk and valuation risk are part of every research view."],
];

const terminalRows = [
  ["Fundamental Quality", "Business & financial strength", 92],
  ["Valuation Discipline", "Price versus underlying value", 86],
  ["Catalyst Analysis", "Events & changing expectations", 81],
  ["Risk Assessment", "Downside & uncertainty", 89],
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="CredoNomics home">
            <img
              src="/credonomics-mark.png"
              alt=""
              className={styles.brandMark}
            />
            <span className={styles.brandText}>
              <strong>CredoNomics</strong>
              <small>Investment Solutions</small>
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Primary navigation">
            <Link href="/research">Research</Link>
            <Link href="/ipo">IPO Intelligence</Link>
            <Link href="/tools/mf-portfolio-tracker">Mutual Funds</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/about">About</Link>
          </nav>

          <Link href="/research" className={styles.headerCta}>
            Explore Research <span>â†’</span>
          </Link>
        </div>
      </header>

      <div className={styles.marketStrip}>
        <div className={styles.marketStripInner}>
          <span className={styles.livePill}>
            <i />
            Research Platform
          </span>
          <span>Indian Equities</span>
          <span>IPO Intelligence</span>
          <span>Mutual Funds</span>
          <span>Valuation</span>
          <span>Market Research</span>
          <span>Decision Tools</span>
        </div>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              <span />
              Independent Market Intelligence
            </div>

            <h1>
              Research beyond
              <em>market noise.</em>
            </h1>

            <p className={styles.heroText}>
              CredoNomics Investment Solutions combines fundamental analysis,
              valuation research, IPO intelligence, mutual-fund analytics and
              practical financial tools in one research-focused platform.
            </p>

            <div className={styles.heroActions}>
              <Link href="/research" className={styles.primaryButton}>
                Explore Research <span>â†’</span>
              </Link>
              <Link href="/tools" className={styles.secondaryButton}>
                Open Research Tools
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div>
                <strong>Equity</strong>
                <span>Research</span>
              </div>
              <div>
                <strong>IPO</strong>
                <span>Intelligence</span>
              </div>
              <div>
                <strong>MF</strong>
                <span>Analytics</span>
              </div>
              <div>
                <strong>Risk</strong>
                <span>Focused</span>
              </div>
            </div>
          </div>

          <div className={styles.terminalWrap}>
            <div className={styles.terminalGlow} />
            <div className={styles.terminal}>
              <div className={styles.terminalTop}>
                <div className={styles.windowDots}>
                  <i />
                  <i />
                  <i />
                </div>
                <span>CredoNomics Research Terminal</span>
              </div>

              <div className={styles.terminalBody}>
                <div className={styles.terminalTitleRow}>
                  <div>
                    <span className={styles.terminalEyebrow}>
                      Market Research Framework
                    </span>
                    <h2>Opportunity Intelligence</h2>
                  </div>
                  <span className={styles.activeBadge}>ACTIVE</span>
                </div>

                <div className={styles.scoreList}>
                  {terminalRows.map(([title, subtitle, score]) => (
                    <div className={styles.scoreCard} key={String(title)}>
                      <div className={styles.scoreHeader}>
                        <div>
                          <strong>{title}</strong>
                          <span>{subtitle}</span>
                        </div>
                        <b>{score}</b>
                      </div>
                      <div className={styles.scoreTrack}>
                        <span style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.terminalTags}>
                  <div>
                    <b>VALUE</b>
                    <span>Price</span>
                  </div>
                  <div>
                    <b>QUALITY</b>
                    <span>Business</span>
                  </div>
                  <div>
                    <b>CATALYST</b>
                    <span>Timing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.capabilitiesSection}>
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>RESEARCH PLATFORM</span>
              <h2>One platform. Multiple layers of intelligence.</h2>
            </div>
            <p>
              CredoNomics is being built around research depth rather than
              market noise â€” with tools and reports that help users understand
              the context behind a financial decision.
            </p>
          </div>

          <div className={styles.capabilityGrid}>
            {capabilities.map((item) => (
              <Link href={item.href} className={styles.capabilityCard} key={item.title}>
                <span className={styles.cardEyebrow}>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className={styles.cardLink}>Explore <b>â†’</b></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.frameworkSection}>
        <div className={styles.sectionShell}>
          <div className={styles.frameworkGrid}>
            <div className={styles.frameworkIntro}>
              <span className={styles.sectionEyebrow}>RESEARCH FRAMEWORK</span>
              <h2>What matters before something becomes an opportunity.</h2>
              <p>
                A falling stock is not automatically undervalued. A growing
                company is not automatically attractive. Research needs context,
                discipline and a clear view of risk.
              </p>
            </div>

            <div className={styles.frameworkCards}>
              {framework.map(([number, title, text]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.reportsSection}>
        <div className={styles.sectionShell}>
          <div className={styles.reportPanel}>
            <div>
              <span className={styles.sectionEyebrow}>CREDONOMICS RESEARCH REPORTS</span>
              <h2>Research that explains the opportunity â€” not just the ticker.</h2>
              <p>
                Structured reports can bring together business analysis,
                financial trends, valuation, catalysts, risks and scenario
                thinking in one place.
              </p>
            </div>
            <Link href="/research" className={styles.secondaryButton}>
              Research Library <span>â†’</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.identitySection}>
        <div className={styles.sectionShell}>
          <div className={styles.identityGrid}>
            <div>
              <span className={styles.sectionEyebrow}>
                CREDONOMICS INVESTMENT SOLUTIONS
              </span>
              <h2>Data. Research. Perspective.</h2>
            </div>
            <p>
              CredoNomics focuses on investment research, financial
              intelligence and analytical tools designed to help users study
              markets and financial products with greater context.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.disclaimerSection}>
        <div className={styles.sectionShell}>
          <div className={styles.disclaimer}>
            <strong>Important Disclaimer</strong>
            <p>
              CredoNomics Investment Solutions is not a SEBI-registered
              Investment Adviser or Research Analyst. Content is provided for
              educational, informational and research purposes only and should
              not be treated as personalized investment advice or a
              recommendation to buy or sell any security. Investments in
              securities markets are subject to market risks. Users should
              conduct their own research and consult an appropriately qualified
              professional where required.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img src="/credonomics-mark.png" alt="" />
            <div>
              <strong>CredoNomics</strong>
              <span>Investment Solutions</span>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <Link href="/research">Research</Link>
            <Link href="/ipo">IPO</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/about">About</Link>
            <Link href="/disclosures">Disclosures</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>Â© 2026 CredoNomics Investment Solutions</span>
          <span>For educational and informational purposes only.</span>
        </div>
      </footer>
    </main>
  );
}
