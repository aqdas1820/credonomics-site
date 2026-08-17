import Link from "next/link";
import SiteFrame from "./components/SiteFrame";
import { publicIpos } from "./data/ipo-public";
import { researchArticles } from "./data/research-articles";
import { PUBLIC_REVIEW_DATE } from "./data/tool-registry";
import styles from "./home-investment.module.css";

const capabilities = [
  {
    eyebrow: "RESEARCH DESK",
    title: "Financial Research & Frameworks",
    text: "Source-linked research and reusable frameworks across markets, financial products, valuation and decision-making.",
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
  ["Fundamental Quality", "Business & financial strength", "Quality"],
  ["Valuation Discipline", "Price versus underlying value", "Value"],
  ["Catalyst Analysis", "Events & changing expectations", "Catalyst"],
  ["Risk Assessment", "Downside & uncertainty", "Risk"],
];

const latestArticle = researchArticles[0];
const featuredIpo =
  publicIpos.find((ipo) => ipo.status === "open") ??
  publicIpos.find((ipo) => ipo.status === "upcoming") ??
  publicIpos[0];

function displayDate(value?: string) {
  if (!value) return "Date shown on source record";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function HomePage() {
  return (
    <SiteFrame>
      <div className={styles.page}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />
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
              CredoNomics Investment Solutions combines valuation frameworks,
              IPO intelligence, mutual-fund portfolio analytics, banking-product
              economics and practical financial tools in one research-focused
              platform.
            </p>

            <div className={styles.heroActions}>
              <Link href="/research" className={styles.primaryButton}>
                Explore Research <span>→</span>
              </Link>
              <Link href="/tools" className={styles.secondaryButton}>
                Open Research Tools
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div>
                <strong>Research</strong>
                <span>Frameworks</span>
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
                      Illustrative Research Framework
                    </span>
                    <h2>Opportunity Intelligence</h2>
                  </div>
                  <span className={styles.activeBadge}>FRAMEWORK</span>
                </div>

                <p className={styles.frameworkNotice}>
                  These are research dimensions—not live security scores,
                  recommendations or price targets.
                </p>

                <div className={styles.scoreList}>
                  {terminalRows.map(([title, subtitle, factor]) => (
                    <div className={styles.scoreCard} key={String(title)}>
                      <div className={styles.scoreHeader}>
                        <div>
                          <strong>{title}</strong>
                          <span>{subtitle}</span>
                        </div>
                        <b className={styles.factorBadge}>{factor}</b>
                      </div>
                      <div className={styles.factorMeta}>
                        <span>Framework factor</span>
                        <i />
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

      <section className={styles.trustRail}>
        <div className={styles.trustRailInner}>
          <div className={styles.trustLead}>
            <span>CredoNomics standard</span>
            <strong>Research with visible context.</strong>
          </div>
          <div className={styles.trustPoints}>
            <span><i /> Source-linked</span>
            <span><i /> Date-aware</span>
            <span><i /> Methodology visible</span>
            <span><i /> Limitations stated</span>
          </div>
        </div>
      </section>

      <section className={styles.latestSection}>
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>LATEST INTELLIGENCE</span>
              <h2>What changed, what is current, and where to research next.</h2>
            </div>
            <p>
              This section is built from CredoNomicsâ€™ existing research and
              market-data records. It does not use decorative or fabricated
              market prices.
            </p>
          </div>

          <div className={styles.latestGrid}>
            <Link
              href={`/research/articles/${latestArticle.slug}`}
              className={styles.latestCard}
            >
              <span className={styles.latestType}>Latest research</span>
              <h3>{latestArticle.title}</h3>
              <p>{latestArticle.description}</p>
              <div className={styles.latestMeta}>
                <span>Reviewed {displayDate(latestArticle.reviewed)}</span>
                <b>{latestArticle.readTime}</b>
              </div>
            </Link>

            {featuredIpo ? (
              <Link
                href={`/ipo/${featuredIpo.slug}`}
                className={styles.latestCard}
              >
                <span className={styles.latestType}>
                  IPO · {featuredIpo.status}
                </span>
                <h3>{featuredIpo.companyName}</h3>
                <p>
                  Open the source-linked IPO record for issue details,
                  subscription context and the latest normalized market record.
                </p>
                <div className={styles.latestMeta}>
                  <span>Updated {displayDate(featuredIpo.lastUpdated)}</span>
                  <b>{featuredIpo.marketSegment}</b>
                </div>
              </Link>
            ) : null}

            <Link
              href="/tools/mf-portfolio-tracker"
              className={styles.latestCard}
            >
              <span className={styles.latestType}>Portfolio intelligence</span>
              <h3>Mutual Fund Portfolio Intelligence</h3>
              <p>
                Explore scheme holdings, stock concentration, sectors and
                portfolio changes with dataset period and coverage context.
              </p>
              <div className={styles.latestMeta}>
                <span>Interactive dataset</span>
                <b>MF research</b>
              </div>
            </Link>

            <Link href="/tools" className={styles.latestCard}>
              <span className={styles.latestType}>Decision tools</span>
              <h3>Transparent Financial Tools</h3>
              <p>
                Use calculators and analyzers that keep assumptions, caps, fees
                and methodology visible.
              </p>
              <div className={styles.latestMeta}>
                <span>Framework reviewed {PUBLIC_REVIEW_DATE}</span>
                <b>Tools hub</b>
              </div>
            </Link>
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
              market noise—with tools and reports that help users understand
              the context behind a financial decision.
            </p>
          </div>

          <div className={styles.capabilityGrid}>
            {capabilities.map((item, index) => (
              <Link
                href={item.href}
                className={styles.capabilityCard}
                key={item.title}
              >
                <div className={styles.cardMeta}>
                  <span className={styles.cardIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.cardStatus}>Research layer</span>
                </div>
                <span className={styles.cardEyebrow}>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className={styles.cardLink}>Explore <b>→</b></span>
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
              <span className={styles.sectionEyebrow}>
                CREDONOMICS RESEARCH REPORTS
              </span>
              <h2>Research that explains the context—not just the ticker.</h2>
              <p>
                Structured reports can bring together business analysis,
                financial trends, valuation, catalysts, risks, sources and
                limitations in one place.
              </p>
            </div>
            <Link href="/research" className={styles.secondaryButton}>
              Research Library <span>→</span>
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
              CredoNomics focuses on financial research, source-linked
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
</div>
    </SiteFrame>
  );
}