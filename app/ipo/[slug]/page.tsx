import { notFound } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  Gauge,
  Landmark,
  Scale,
  ShieldCheck,
  TriangleAlert,
  Users,
  WalletCards,
} from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import { verifiedIpos } from '../../data/verified-ipos.generated'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoSubnav from '../components/IpoSubnav'

export function generateStaticParams() {
  return verifiedIpos.map((ipo) => ({ slug: ipo.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const ipo = verifiedIpos.find((item) => item.slug === params.slug)
  if (!ipo) return {}
  return {
    title: `${ipo.companyName} IPO — Details, Financials, Valuation & Data Score`,
    description: `Source-backed IPO research for ${ipo.companyName}: dates, price band, lot size, issue structure, financials, KPIs, valuation, promoter holding, subscription and offer documents.`,
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
  const ipo = verifiedIpos.find((item) => item.slug === params.slug)
  if (!ipo) notFound()

  const score = calculateIpoDataScore(ipo)
  const issue = ipo.issue
  const subscription = ipo.subscription

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.ipoDetailPageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>{ipo.companyName}</span></div>
        <span className={styles.pageKicker}><Landmark size={14}/> {ipo.marketSegment} · {ipo.status}</span>
        <h1>{ipo.companyName} <span>IPO.</span></h1>
        <p className={styles.pageHeroLead}>{ipo.summary || 'Source-backed offer-document research with all normalized data organized in one place.'}</p>
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
        <section id="overview" className={local.detailHero}>
          <div className={local.detailScore}>
            <small>CredoNomics IPO Data Score</small>
            <strong>{score.score ?? '—'}</strong><span>/100</span>
            <p>{score.label} · {score.coverage}% weighted data coverage</p>
          </div>
          <div className={local.detailQuick}>
            <span><small>Issue size</small><b>{money(issue.issueSizeCr)}</b></span>
            <span><small>Price band</small><b>{issue.priceBandHigh !== undefined ? `₹${issue.priceBandLow ?? issue.priceBandHigh}–₹${issue.priceBandHigh}` : '—'}</b></span>
            <span><small>Lot size</small><b>{issue.lotSize?.toLocaleString('en-IN') || '—'} shares</b></span>
            <span><small>Listing</small><b>{issue.listingDate || '—'}</b></span>
          </div>
        </section>

        <section id="details" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>IPO Details</span><h2>The issue at a glance.</h2></div></div>
          <div className={local.ipoFactsGrid}>
            <article><small>Open date</small><strong>{issue.openDate || '—'}</strong></article>
            <article><small>Close date</small><strong>{issue.closeDate || '—'}</strong></article>
            <article><small>Face value</small><strong>{issue.faceValue !== undefined ? `₹${issue.faceValue}` : '—'}</strong></article>
            <article><small>Price band</small><strong>{issue.priceBandHigh !== undefined ? `₹${issue.priceBandLow ?? issue.priceBandHigh}–₹${issue.priceBandHigh}` : '—'}</strong></article>
            <article><small>Total issue</small><strong>{money(issue.issueSizeCr)}</strong></article>
            <article><small>Fresh issue</small><strong>{money(issue.freshIssueCr)}</strong></article>
            <article><small>Offer for sale</small><strong>{money(issue.ofsCr)}</strong></article>
            <article><small>Listing at</small><strong>{issue.exchange?.join(' · ') || '—'}</strong></article>
            <article><small>Registrar</small><strong>{issue.registrar || '—'}</strong></article>
            <article><small>Lead managers</small><strong>{issue.leadManagers?.join(', ') || '—'}</strong></article>
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
                <div><small>{label}</small><b>{date || 'Not normalized'}</b></div>
              </div>
            ))}
          </div>
        </section>

        <section id="application" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Application & Lot Size</span><h2>Minimum application economics.</h2></div></div>
          <div className={local.applicationGrid}>
            <article><WalletCards size={18}/><small>Retail minimum</small><strong>{ipo.application?.retailMinShares ? `${ipo.application.retailMinShares.toLocaleString('en-IN')} shares` : issue.lotSize ? `${issue.lotSize.toLocaleString('en-IN')} shares` : '—'}</strong><span>{rupees(ipo.application?.retailMinAmount)}</span></article>
            <article><WalletCards size={18}/><small>Retail maximum</small><strong>{ipo.application?.retailMaxShares ? `${ipo.application.retailMaxShares.toLocaleString('en-IN')} shares` : '—'}</strong><span>{rupees(ipo.application?.retailMaxAmount)}</span></article>
            <article><WalletCards size={18}/><small>sNII minimum</small><strong>{ipo.application?.sNiiMinShares ? `${ipo.application.sNiiMinShares.toLocaleString('en-IN')} shares` : '—'}</strong><span>{rupees(ipo.application?.sNiiMinAmount)}</span></article>
            <article><WalletCards size={18}/><small>bNII minimum</small><strong>{ipo.application?.bNiiMinShares ? `${ipo.application.bNiiMinShares.toLocaleString('en-IN')} shares` : '—'}</strong><span>{rupees(ipo.application?.bNiiMinAmount)}</span></article>
          </div>
        </section>

        {ipo.reservation && (
          <section className={local.detailSection}>
            <div className={local.sectionHead}><div><span>IPO Reservation</span><h2>Investor-category allocation.</h2></div></div>
            <div className={local.reservationGrid}>
              {[
                ['QIB', ipo.reservation.qibPercent],
                ['Anchor', ipo.reservation.anchorPercent],
                ['NII', ipo.reservation.niiPercent],
                ['Retail', ipo.reservation.retailPercent],
                ['Employee', ipo.reservation.employeePercent],
                ['Shareholder', ipo.reservation.shareholderPercent],
              ].map(([label, value]) => (
                <article key={String(label)}><small>{label}</small><strong>{value === undefined ? '—' : `${value}%`}</strong></article>
              ))}
            </div>
          </section>
        )}

        {ipo.anchor && (
          <section className={local.detailSection}>
            <div className={local.sectionHead}><div><span>Anchor Investors</span><h2>Normalized anchor allocation details.</h2></div></div>
            <div className={local.ipoFactsGrid}>
              <article><small>Anchor bid date</small><strong>{ipo.anchor.bidDate || '—'}</strong></article>
              <article><small>Anchor portion</small><strong>{money(ipo.anchor.amountCr)}</strong></article>
              <article><small>Shares</small><strong>{ipo.anchor.shares?.toLocaleString('en-IN') || '—'}</strong></article>
              <article><small>50% lock-in end</small><strong>{ipo.anchor.lockIn50PercentEndDate || '—'}</strong></article>
              <article><small>Remaining lock-in end</small><strong>{ipo.anchor.lockInRemainingEndDate || '—'}</strong></article>
            </div>
          </section>
        )}

        <section id="financials" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Company Financials</span><h2>Restated financial history.</h2></div></div>
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
        </section>

        <section id="kpis" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Key Performance Indicators</span><h2>Business quality metrics.</h2></div></div>
          <div className={local.metricGrid}>
            <article><BarChart3 size={18}/><small>Revenue CAGR</small><strong>{metric(score.revenueCagr, '%')}</strong></article>
            <article><BarChart3 size={18}/><small>PAT CAGR</small><strong>{metric(score.patCagr, '%')}</strong></article>
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
            <article><Scale size={18}/><small>Peer median P/B</small><strong>{metric(ipo.valuation?.peerMedianPb, '×')}</strong></article>
          </div>
        </section>

        <section className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Objects of the Issue</span><h2>Where the issue proceeds are intended to go.</h2></div></div>
          {issue.useOfProceeds?.length ? (
            <div className={local.proceeds}><ol>{issue.useOfProceeds.map((item) => <li key={item}>{item}</li>)}</ol></div>
          ) : <div className={local.sectionEmpty}>Objects of the issue have not been normalized yet.</div>}
        </section>

        <section id="promoters" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Promoter & Company Information</span><h2>Ownership and issuer context.</h2></div></div>
          <div className={local.promoterLayout}>
            <article><Users size={18}/><small>Promoters</small><strong>{ipo.company?.promoters?.join(', ') || '—'}</strong></article>
            <article><Users size={18}/><small>Pre-issue promoter holding</small><strong>{metric(issue.preIssuePromoterHoldingPercent, '%')}</strong></article>
            <article><Users size={18}/><small>Post-issue promoter holding</small><strong>{metric(issue.postIssuePromoterHoldingPercent, '%')}</strong></article>
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
          ) : <div className={local.sectionEmpty}>No source-backed subscription data has been normalized for this IPO yet.</div>}
        </section>

        {ipo.riskFlags?.length ? (
          <section className={local.detailSection}>
            <div className={local.sectionHead}><div><span>Risk Factors</span><h2>Disclosed issues worth reading in full.</h2></div></div>
            <div className={local.riskGrid}>
              {ipo.riskFlags.map((flag) => <article key={flag}><TriangleAlert size={16}/><p>{flag}</p></article>)}
            </div>
          </section>
        ) : null}

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

        <section id="documents" className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Prospectus & Documents</span><h2>The source documents behind this page.</h2></div></div>
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

        {ipo.listing && (
          <section className={local.detailSection}>
            <div className={local.sectionHead}><div><span>Listing Information</span><h2>Post-issue listing record.</h2></div></div>
            <div className={local.ipoFactsGrid}>
              <article><small>Final issue price</small><strong>{rupees(ipo.listing.finalIssuePrice)}</strong></article>
              <article><small>NSE symbol</small><strong>{ipo.listing.nseSymbol || '—'}</strong></article>
              <article><small>BSE code</small><strong>{ipo.listing.bseCode || '—'}</strong></article>
              <article><small>ISIN</small><strong>{ipo.listing.isin || '—'}</strong></article>
              <article><small>Open</small><strong>{rupees(ipo.listing.openPrice)}</strong></article>
              <article><small>High</small><strong>{rupees(ipo.listing.highPrice)}</strong></article>
              <article><small>Low</small><strong>{rupees(ipo.listing.lowPrice)}</strong></article>
              <article><small>Close</small><strong>{rupees(ipo.listing.closePrice)}</strong></article>
            </div>
          </section>
        )}

        <section className={local.detailSection}>
          <div className={local.sectionHead}><div><span>IPO FAQs</span><h2>Quick factual answers.</h2></div></div>
          <div className={local.faqList}>
            <details><summary>When does {ipo.companyName} IPO open and close?</summary><p>Current normalized dates: open {issue.openDate || 'not yet normalized'} and close {issue.closeDate || 'not yet normalized'}.</p></details>
            <details><summary>What is the {ipo.companyName} IPO price band?</summary><p>{issue.priceBandHigh !== undefined ? `The normalized price band is ₹${issue.priceBandLow ?? issue.priceBandHigh} to ₹${issue.priceBandHigh} per share.` : 'The price band has not been normalized yet.'}</p></details>
            <details><summary>What is the minimum lot size?</summary><p>{issue.lotSize ? `The normalized lot size is ${issue.lotSize.toLocaleString('en-IN')} shares.` : 'The lot size has not been normalized yet.'}</p></details>
            <details><summary>When is the IPO expected to list?</summary><p>{issue.listingDate ? `The normalized listing date is ${issue.listingDate}.` : 'The listing date has not been normalized yet.'}</p></details>
          </div>
        </section>

        <div className={local.regulatoryNotice}>
          <ShieldCheck size={20}/>
          <p><b>Not a recommendation:</b> this page organizes source-backed public-offer data and a mechanical quantitative score. It does not tell you to Subscribe, Avoid, Buy or Sell and does not predict listing gains or future returns.</p>
        </div>
      </section>
    </SiteFrame>
  )
}
