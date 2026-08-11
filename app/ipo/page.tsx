import {
  ArrowRight,
  BarChart3,
  Database,
  ExternalLink,
  FileSearch,
  FileText,
  Gauge,
  RefreshCw,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { calculateIpoDataScore } from '../data/ipo-engine'
import { ipoDiscovery, ipoDiscoveryMeta } from '../data/ipo-discovery.generated'
import { verifiedIpos } from '../data/verified-ipos.generated'
import styles from '../core-v4.module.css'
import local from './ipo.module.css'
import IpoDiscovery from './components/IpoDiscovery'

export const metadata = {
  title: 'IPO Intelligence India',
  description:
    'Track recent SEBI IPO filings, compare normalized IPO financial data and inspect a transparent quantitative data score without subscribe/avoid calls.',
  alternates: { canonical: '/ipo' },
}

export default function IpoPage() {
  const ranked = verifiedIpos
    .map((ipo) => ({ ipo, dataScore: calculateIpoDataScore(ipo) }))
    .filter((item) => item.dataScore.score !== null && item.dataScore.coverage >= 50)
    .sort((a, b) => (b.dataScore.score || 0) - (a.dataScore.score || 0))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CredoNomics IPO Intelligence',
    url: 'https://www.credonomics.in/ipo',
    description: 'Source-linked statistical IPO research and public-issue filing discovery for India.',
  }

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>IPO Intelligence</span></div>
        <span className={styles.pageKicker}><TrendingUp size={14}/> Public-offer data intelligence</span>
        <h1>Investigate an IPO from the <span>offer document outward.</span></h1>
        <p className={styles.pageHeroLead}>
          Discover recent SEBI public-issue filings, normalize financial and valuation data,
          and compare a fixed quantitative Data Score with every input visible.
        </p>
        <div className={local.heroActions}>
          <a className={styles.primaryButton} href="/ipo/analyzer">Open IPO analyzer <ArrowRight size={15}/></a>
          <a className={styles.secondaryButton} href="/ipo/methodology">Scoring methodology</a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><FileText size={19}/><small>SEBI discovery records</small><strong>{ipoDiscovery.length}</strong><p>Recent public-issue filings retained by the automated discovery layer.</p></article>
          <article><Database size={19}/><small>Normalized IPO records</small><strong>{verifiedIpos.length}</strong><p>Offer-document records sufficiently structured for public comparison.</p></article>
          <article><Gauge size={19}/><small>Quantitative framework</small><strong>100</strong><p>Fixed weighted points with visible data coverage and no hidden analyst override.</p></article>
          <article><RefreshCw size={19}/><small>Discovery refreshed</small><strong>{ipoDiscoveryMeta.generatedAt ? new Date(ipoDiscoveryMeta.generatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : '—'}</strong><p>Official SEBI filing discovery is refreshed by the repository workflow.</p></article>
        </div>

        <section className={local.intelligenceBand}>
          <div>
            <span>CredoNomics IPO boundary</span>
            <h2>Quantitative comparison — not a subscription call.</h2>
            <p>
              The public framework reports normalized financial data and a mechanical Data Score.
              It does not publish “Subscribe”, “Avoid”, “Buy”, price targets or listing-gain predictions.
            </p>
          </div>
          <ShieldCheck size={34}/>
        </section>

        <section className={local.featureSection}>
          <div className={local.sectionHead}>
            <div><span>IPO research stack</span><h2>From filing discovery to a comparable statistical record.</h2></div>
          </div>
          <div className={local.featureGrid}>
            <article><FileSearch size={20}/><span>01</span><h3>Official filing discovery</h3><p>Recent DRHP, RHP, prospectus, addendum and corrigendum records are detected from SEBI's public-issues filing surface.</p></article>
            <article><BarChart3 size={20}/><span>02</span><h3>Normalized financials</h3><p>Revenue, PAT, cash flow, leverage, return ratios, price-band valuation and issue structure fit one documented schema.</p></article>
            <article><Scale size={20}/><span>03</span><h3>Peer-relative valuation</h3><p>P/E and P/B can be compared with normalized peer medians rather than interpreted in isolation.</p></article>
            <article><Gauge size={20}/><span>04</span><h3>Data Score + coverage</h3><p>A score is published only when enough weighted inputs exist. Missing data is shown rather than silently assumed.</p></article>
          </div>
        </section>

        <section className={local.featureSection}>
          <div className={local.sectionHead}>
            <div><span>Quantitative Data Rank</span><h2>Normalized IPOs sorted by the same fixed model.</h2></div>
            <p>Sorting by score is a statistical comparison only. It is not a ranking of expected returns or a recommendation to subscribe.</p>
          </div>

          {ranked.length > 0 ? (
            <div className={local.rankingList}>
              {ranked.map((item, index) => (
                <a href={`/ipo/${item.ipo.slug}`} key={item.ipo.slug}>
                  <div className={local.rankNo}>#{index + 1}</div>
                  <div className={local.rankIdentity}>
                    <small>{item.ipo.marketSegment} · {item.ipo.status}</small>
                    <h3>{item.ipo.companyName}</h3>
                    <span>{item.ipo.sector || item.ipo.industry || 'Sector not normalized'}</span>
                  </div>
                  <div className={local.rankScore}>
                    <b>{item.dataScore.score}</b><small>/100 DATA SCORE</small>
                    <span>{item.dataScore.coverage}% data coverage</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className={local.emptyRanking}>
              <Database size={26}/>
              <div>
                <h3>No public quantitative ranking yet.</h3>
                <p>
                  CredoNomics will not fabricate IPO scores. A company enters this list only after enough
                  current offer-document fields are normalized and source-linked.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className={local.featureSection}>
          <div className={local.sectionHead}>
            <div><span>Latest source discovery</span><h2>Recent public-issue filings found on SEBI.</h2></div>
            <p>The discovery layer is a research queue. A filing appearing here does not mean the IPO has been scored or is currently open.</p>
          </div>
          <IpoDiscovery records={ipoDiscovery}/>
        </section>

        <section className={local.sourcePanel}>
          <div>
            <small>Primary official sources</small>
            <h2>Verify the live public-issue record before relying on a number.</h2>
          </div>
          <div>
            <a href="https://www.sebi.gov.in/filings/public-issues.html" target="_blank" rel="noreferrer">SEBI Public Issues <ExternalLink size={12}/></a>
            <a href="https://www.nseindia.com/market-data/all-upcoming-issues-ipo" target="_blank" rel="noreferrer">NSE IPO / Issue Status <ExternalLink size={12}/></a>
            <a href="https://www.nseindia.com/ipo-tracker?type=ipo_year" target="_blank" rel="noreferrer">NSE IPO Tracker <ExternalLink size={12}/></a>
          </div>
        </section>

        <div className={local.regulatoryNotice}>
          <ShieldCheck size={20}/>
          <p>
            <b>Regulatory boundary:</b> CredoNomics is not SEBI-registered and is not NISM-certified.
            IPO Intelligence is designed as general statistical/educational information. It does not provide
            personalized advice, subscribe/avoid calls, price targets or assurances of listing performance.
          </p>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
      </section>
    </SiteFrame>
  )
}
