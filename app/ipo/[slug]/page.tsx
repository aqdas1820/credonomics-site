import { notFound } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  Gauge,
  Landmark,
  Radio,
  Scale,
  ShieldCheck,
  TriangleAlert,
  Users,
  WalletCards,
} from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import { getPublicIpo, publicIpos } from '../../data/ipo-public'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoSubnav from '../components/IpoSubnav'

export function generateStaticParams() {
  return publicIpos.map((ipo) => ({ slug: ipo.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const ipo = getPublicIpo(params.slug)
  if (!ipo) return {}
  return {
    title: `${ipo.companyName} IPO — Details, Dates, Subscription & Research`,
    description: `Source-backed IPO market and research page for ${ipo.companyName}: issue dates, price band, subscription and normalized financial analysis when available.`,
    alternates: { canonical: `/ipo/${ipo.slug}` },
  }
}

function money(value?: number) {
  return value === undefined ? '—' : `₹${value.toLocaleString('en-IN')} Cr`
}
function rupees(value?: number) {
  return value === undefined ? '—' : `₹${value.toLocaleString('en-IN')}`
}
function metric(value?: number, suffix = '') {
  return value === undefined ? '—' : `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${suffix}`
}

export default function IpoDetailPage({ params }: { params: { slug: string } }) {
  const ipo = getPublicIpo(params.slug)
  if (!ipo) notFound()

  const normalized = ipo.researchState === 'normalized'
  const score = normalized
    ? calculateIpoDataScore({
        ...ipo,
        lastVerified: ipo.lastUpdated.slice(0, 10),
      })
    : null
  const issue = ipo.issue
  const subscription = ipo.subscription

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.ipoDetailPageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>{ipo.companyName}</span></div>
        <span className={styles.pageKicker}><Landmark size={14}/> {ipo.marketSegment} · {ipo.status}</span>
        <h1>{ipo.companyName} <span>IPO.</span></h1>
        <p className={styles.pageHeroLead}>
          {ipo.summary || (normalized
            ? 'Source-backed offer-document research with normalized financial analysis.'
            : 'Official exchange issue data is live. Deeper offer-document financial analysis has not yet been normalized.')}
        </p>
      </section>

      <IpoSubnav/>

      <nav className={local.detailNav} aria-label={`${ipo.companyName} IPO sections`}>
        <div>
          <a href="#overview">Overview</a>
          <a href="#details">IPO Details</a>
          <a href="#timeline">Timeline</a>
          <a href="#application">Lot Size</a>
          <a href="#financials">Financials</a>
          <a href="#kpis">KPIs</a>
          <a href="#valuation">Valuation</a>
          <a href="#promoters">Promoters</a>
          <a href="#subscription">Subscription</a>
          <a href="#documents">Documents</a>
        </div>
      </nav>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.researchStateBanner} data-state={ipo.researchState}>
          {normalized ? <ShieldCheck size={18}/> : <Radio size={18}/>}
          <div>
            <b>{normalized ? 'Normalized financial research available' : 'Exchange-live issue record'}</b>
            <p>
              {normalized
                ? `The quantitative model has ${score?.coverage ?? 0}% weighted data coverage.`
                : 'Dates, issue status, price/subscription fields can be shown immediately from the exchange layer. The Data Score stays pending until financial and valuation inputs are normalized.'}
            </p>
          </div>
          <span>Updated {ipo.lastUpdated.slice(0, 10)}</span>
        </div>

        <section id="overview" className={local.detailHero}>
          <div className={local.detailScore}>
            <small>{normalized ? 'CredoNomics IPO Data Score' : 'CredoNomics Research Status'}</small>
            <strong>{score?.score ?? 'LIVE'}</strong><span>{score ? '/100' : ''}</span>
            <p>{score ? `${score.label} · ${score.coverage}% weighted data coverage` : 'Exchange market data · quantitative score pending'}</p>
          </div>
          <div className={local.detailQuick}>
            <span><small>{issue.issueSizeCr !== undefined ? 'Issue size' : 'Est. issue value'}</small><b>{issue.issueSizeCr !== undefined ? money(issue.issueSizeCr) : money(ipo.estimatedIssueValueCr)}</b></span>
            <span><small>Price band</small><b>{issue.priceBandHigh !== undefined ? `₹${issue.priceBandLow ?? issue.priceBandHigh}${issue.priceBandLow && issue.priceBandLow !== issue.priceBandHigh ? `–₹${issue.priceBandHigh}` : ''}` : '—'}</b></span>
            <span><small>Lot size</small><b>{issue.lotSize ? `${issue.lotSize.toLocaleString('en-IN')} shares` : '—'}</b></span>
            <span><small>Subscription</small><b>{subscription?.total !== undefined ? `${subscription.total}×` : '—'}</b></span>
          </div>
        </section>

        <section id="details" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>IPO Details</span><h2>The issue at a glance.</h2></div></div>
          <div className={local.ipoFactsGrid}>
            <article><small>Status</small><strong>{ipo.status}</strong></article>
            <article><small>Segment</small><strong>{ipo.marketSegment}</strong></article>
            <article><small>Symbol</small><strong>{ipo.symbol || '—'}</strong></article>
            <article><small>Open date</small><strong>{issue.openDate || '—'}</strong></article>
            <article><small>Close date</small><strong>{issue.closeDate || '—'}</strong></article>
            <article><small>Face value</small><strong>{issue.faceValue !== undefined ? `₹${issue.faceValue}` : '—'}</strong></article>
            <article><small>Price band</small><strong>{issue.priceBandHigh !== undefined ? `₹${issue.priceBandLow ?? issue.priceBandHigh}–₹${issue.priceBandHigh}` : '—'}</strong></article>
            <article><small>Shares offered</small><strong>{ipo.sharesOffered?.toLocaleString('en-IN') || '—'}</strong></article>
            <article><small>Exchange</small><strong>{issue.exchange?.join(' · ') || '—'}</strong></article>
            <article><small>Registrar</small><strong>{issue.registrar || '—'}</strong></article>
          </div>
        </section>

        <section id="timeline" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>IPO Timeline</span><h2>Application to listing.</h2></div></div>
          <div className={local.timeline}>
            {[
              ['Open', issue.openDate],
              ['Close', issue.closeDate],
              ['Allotment', issue.allotmentDate],
              ['Listing', issue.listingDate],
            ].map(([label, date], index) => (
              <div key={label} data-complete={Boolean(date)}>
                <span>{index + 1}</span>
                <div><small>{label}</small><b>{date || 'Pending normalization'}</b></div>
              </div>
            ))}
          </div>
        </section>

        <section id="application" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Application & Lot Size</span><h2>Application economics.</h2></div></div>
          <div className={local.applicationGrid}>
            <article><WalletCards size={18}/><small>Lot size</small><strong>{issue.lotSize ? `${issue.lotSize.toLocaleString('en-IN')} shares` : '—'}</strong><span>{issue.lotSize && issue.priceBandHigh ? `Approx. ₹${(issue.lotSize * issue.priceBandHigh).toLocaleString('en-IN')}` : 'Amount pending'}</span></article>
            <article><WalletCards size={18}/><small>Retail minimum</small><strong>{ipo.application?.retailMinShares ? `${ipo.application.retailMinShares.toLocaleString('en-IN')} shares` : '—'}</strong><span>{rupees(ipo.application?.retailMinAmount)}</span></article>
            <article><WalletCards size={18}/><small>sNII minimum</small><strong>{ipo.application?.sNiiMinShares ? `${ipo.application.sNiiMinShares.toLocaleString('en-IN')} shares` : '—'}</strong><span>{rupees(ipo.application?.sNiiMinAmount)}</span></article>
            <article><WalletCards size={18}/><small>bNII minimum</small><strong>{ipo.application?.bNiiMinShares ? `${ipo.application.bNiiMinShares.toLocaleString('en-IN')} shares` : '—'}</strong><span>{rupees(ipo.application?.bNiiMinAmount)}</span></article>
          </div>
        </section>

        <section id="financials" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Company Financials</span><h2>Restated financial history.</h2></div></div>
          {ipo.financials.length ? (
            <div className={local.financialTable}>
              <div className={local.tableHead}><span>Period</span><span>Revenue</span><span>EBITDA</span><span>PAT</span><span>Net worth</span><span>Debt</span><span>CFO</span></div>
              {ipo.financials.map((period) => (
                <div key={period.period}>
                  <b>{period.period}</b>
                  <span>{money(period.revenueCr)}</span>
                  <span>{money(period.ebitdaCr)}</span>
                  <span>{money(period.patCr)}</span>
                  <span>{money(period.netWorthCr)}</span>
                  <span>{money(period.totalDebtCr)}</span>
                  <span>{money(period.cfoCr)}</span>
                </div>
              ))}
            </div>
          ) : <div className={local.sectionPending}><FileText size={20}/><div><b>Financial normalization pending</b><p>The exchange layer does not manufacture financial ratios. Revenue, PAT, cash flow and balance-sheet fields will appear after offer-document normalization.</p></div></div>}
        </section>

        <section id="kpis" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Key Performance Indicators</span><h2>Business quality metrics.</h2></div></div>
          <div className={local.metricGrid}>
            <article><BarChart3 size={18}/><small>Revenue CAGR</small><strong>{metric(score?.revenueCagr, '%')}</strong></article>
            <article><BarChart3 size={18}/><small>PAT CAGR</small><strong>{metric(score?.patCagr, '%')}</strong></article>
            <article><Gauge size={18}/><small>ROE</small><strong>{metric(ipo.quality?.roePercent, '%')}</strong></article>
            <article><Gauge size={18}/><small>ROCE</small><strong>{metric(ipo.quality?.rocePercent, '%')}</strong></article>
            <article><Scale size={18}/><small>Debt / Equity</small><strong>{metric(ipo.quality?.debtEquity, '×')}</strong></article>
            <article><Scale size={18}/><small>CFO / PAT</small><strong>{metric(ipo.quality?.cfoPat, '×')}</strong></article>
          </div>
        </section>

        <section id="valuation" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Valuation & Peer Context</span><h2>Price-band multiples in context.</h2></div></div>
          <div className={local.metricGrid}>
            <article><Scale size={18}/><small>Market cap</small><strong>{money(ipo.valuation?.marketCapAtUpperBandCr)}</strong></article>
            <article><Scale size={18}/><small>IPO P/E</small><strong>{metric(ipo.valuation?.peAtUpperBand, '×')}</strong></article>
            <article><Scale size={18}/><small>Peer median P/E</small><strong>{metric(ipo.valuation?.peerMedianPe, '×')}</strong></article>
            <article><Scale size={18}/><small>IPO P/B</small><strong>{metric(ipo.valuation?.pbAtUpperBand, '×')}</strong></article>
          </div>
        </section>

        <section id="promoters" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Promoter & Company Information</span><h2>Ownership and issuer context.</h2></div></div>
          <div className={local.promoterLayout}>
            <article><Users size={18}/><small>Promoters</small><strong>{ipo.company?.promoters?.join(', ') || '—'}</strong></article>
            <article><Users size={18}/><small>Pre-issue holding</small><strong>{metric(issue.preIssuePromoterHoldingPercent, '%')}</strong></article>
            <article><Users size={18}/><small>Post-issue holding</small><strong>{metric(issue.postIssuePromoterHoldingPercent, '%')}</strong></article>
            <article><Building2 size={18}/><small>Employees</small><strong>{ipo.company?.employeeCount?.toLocaleString('en-IN') || '—'}</strong></article>
          </div>
        </section>

        <section id="subscription" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>IPO Subscription</span><h2>Demand data stays separate from fundamentals.</h2></div></div>
          {subscription ? (
            <div className={local.subscriptionCards}>
              <article><small>QIB</small><strong>{metric(subscription.qib, '×')}</strong></article>
              <article><small>sNII</small><strong>{metric(subscription.sNii, '×')}</strong></article>
              <article><small>bNII</small><strong>{metric(subscription.bNii, '×')}</strong></article>
              <article><small>Retail</small><strong>{metric(subscription.retail, '×')}</strong></article>
              <article><small>Total</small><strong>{metric(subscription.total, '×')}</strong></article>
            </div>
          ) : <div className={local.sectionEmpty}>No source-backed subscription value is available for this record yet.</div>}
        </section>

        {normalized && ipo.riskFlags?.length ? (
          <section className={local.detailSection}>
            <div className={local.sectionHead}><div><span>Risk Factors</span><h2>Disclosed issues worth reading in full.</h2></div></div>
            <div className={local.riskGrid}>
              {ipo.riskFlags.map((flag) => <article key={flag}><TriangleAlert size={16}/><p>{flag}</p></article>)}
            </div>
          </section>
        ) : null}

        {score && (
          <section className={local.detailSection}>
            <div className={local.sectionHead}><div><span>Data Score Breakdown</span><h2>Every weighted input remains auditable.</h2></div></div>
            <div className={local.scoreBreakdown}>
              {score.components.map((item) => (
                <div key={item.key} data-available={item.available}>
                  <span><b>{item.label}</b><small>{item.note}</small></span>
                  <strong>{item.available ? `${item.earned.toFixed(1)} / ${item.weight}` : 'Missing'}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="documents" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Official Sources</span><h2>The source records behind this page.</h2></div></div>
          <div className={local.sourceList}>
            {ipo.sources.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={`${source.label}-${source.url}`}>
                <FileText size={18}/>
                <span><small>{source.sourceType} · checked {source.checkedAt}</small><b>{source.label}</b></span>
                <ExternalLink size={14}/>
              </a>
            ))}
          </div>
        </section>

        <div className={local.regulatoryNotice}>
          <ShieldCheck size={20}/>
          <p><b>Not a recommendation:</b> exchange-live status and subscription data are informational. A CredoNomics Data Score appears only after normalized financial inputs exist, and neither layer is a Subscribe/Avoid/Buy call or a listing-gain forecast.</p>
        </div>
      </section>
    </SiteFrame>
  )
}
