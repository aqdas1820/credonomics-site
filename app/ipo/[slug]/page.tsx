import { notFound } from 'next/navigation'
import { BarChart3, Building2, ExternalLink, FileText, Gauge, Landmark, Radio, Scale, ShieldCheck, TriangleAlert, Users, WalletCards } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import { getPublicIpo, publicIpos } from '../../data/ipo-public'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import { ipoStatusLabel } from '../../../src/domain/ipo/display-status'
import { formatIpoDate, formatSubscription } from '../lib/format'

export const dynamic = 'force-dynamic'
export function generateStaticParams() { return publicIpos.map((ipo) => ({ slug: ipo.slug })) }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const ipo = getPublicIpo(params.slug)
  return ipo ? { title: `${ipo.companyName} IPO — Details, Dates, Subscription & Research`, description: `Source-backed IPO market and research page for ${ipo.companyName}.`, alternates: { canonical: `/ipo/${ipo.slug}` } } : {}
}

const defined = (value: unknown) => value !== undefined && value !== null && value !== ''
const money = (value?: number) => value === undefined ? '—' : `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
const rupees = (value?: number) => value === undefined ? '—' : `₹${value.toLocaleString('en-IN')}`
const metric = (value?: number, suffix = '') => value === undefined ? '—' : `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${suffix}`
function priceBand(low?: number, high?: number) {
  if (low === undefined && high === undefined) return '—'
  const floor = low ?? high
  return high === undefined || floor === high ? `₹${floor?.toLocaleString('en-IN')}` : `₹${floor?.toLocaleString('en-IN')}–₹${high.toLocaleString('en-IN')}`
}
function sourceLabel(type: string, label: string) {
  if (type === 'NSE' || type === 'BSE') return `${type} public-issue record`
  if (type === 'SEBI') return label.toLowerCase().includes('offer') ? 'Offer document' : 'SEBI filing'
  return label
}

export default function IpoDetailPage({ params }: { params: { slug: string } }) {
  const ipo = getPublicIpo(params.slug)
  if (!ipo) notFound()
  const issue = ipo.issue
  const normalized = ipo.researchState === 'normalized'
  const score = normalized ? calculateIpoDataScore({ ...ipo, lastVerified: ipo.lastUpdated.slice(0, 10) }) : null
  const application = [
    issue.lotSize && ['Lot size', `${issue.lotSize.toLocaleString('en-IN')} shares`, issue.priceBandHigh ? `Approx. ${rupees(issue.lotSize * issue.priceBandHigh)}` : ''],
    ipo.application?.retailMinShares && ['Retail minimum', `${ipo.application.retailMinShares.toLocaleString('en-IN')} shares`, rupees(ipo.application.retailMinAmount)],
    ipo.application?.sNiiMinShares && ['sNII minimum', `${ipo.application.sNiiMinShares.toLocaleString('en-IN')} shares`, rupees(ipo.application.sNiiMinAmount)],
    ipo.application?.bNiiMinShares && ['bNII minimum', `${ipo.application.bNiiMinShares.toLocaleString('en-IN')} shares`, rupees(ipo.application.bNiiMinAmount)],
  ].filter(Boolean) as string[][]
  const subscriptions = [['QIB', ipo.subscription?.qib], ['sNII', ipo.subscription?.sNii], ['bNII', ipo.subscription?.bNii], ['Retail', ipo.subscription?.retail], ['Employee', ipo.subscription?.employee], ['Total', ipo.subscription?.total]].filter(([, value]) => defined(value)) as [string, number][]
  const financials = ipo.financials.filter((period) => Object.entries(period).some(([key, value]) => key !== 'period' && defined(value)))
  const kpis = [['Revenue CAGR', score?.revenueCagr, '%', BarChart3], ['PAT CAGR', score?.patCagr, '%', BarChart3], ['ROE', ipo.quality?.roePercent, '%', Gauge], ['ROCE', ipo.quality?.rocePercent, '%', Gauge], ['Debt / Equity', ipo.quality?.debtEquity, '×', Scale], ['CFO / PAT', ipo.quality?.cfoPat, '×', Scale]].filter(([, value]) => defined(value)) as [string, number, string, typeof Scale][]
  const valuations = [['Market cap', ipo.valuation?.marketCapAtUpperBandCr, 'money'], ['IPO P/E', ipo.valuation?.peAtUpperBand, '×'], ['Peer median P/E', ipo.valuation?.peerMedianPe, '×'], ['IPO P/B', ipo.valuation?.pbAtUpperBand, '×']].filter(([, value]) => defined(value)) as [string, number, string][]
  const promoters = [ipo.company?.promoters?.length ? ['Promoters', ipo.company.promoters.join(', '), Users] : null, defined(issue.preIssuePromoterHoldingPercent) ? ['Pre-issue holding', metric(issue.preIssuePromoterHoldingPercent, '%'), Users] : null, defined(issue.postIssuePromoterHoldingPercent) ? ['Post-issue holding', metric(issue.postIssuePromoterHoldingPercent, '%'), Users] : null, defined(ipo.company?.employeeCount) ? ['Employees', ipo.company!.employeeCount!.toLocaleString('en-IN'), Building2] : null].filter(Boolean) as [string, string, typeof Users][]
  const timeline = [['Open', issue.openDate], ['Close', issue.closeDate], ['Allotment', issue.allotmentDate], ['Listing', issue.listingDate]].filter(([, date]) => defined(date)) as [string, string][]
  const hasAnalysis = financials.length + kpis.length + valuations.length + promoters.length > 0 || Boolean(ipo.riskFlags?.length)

  return <SiteFrame>
    <section className={`${styles.wrap} ${styles.pageHero} ${local.ipoDetailPageHero}`}>
      <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>{ipo.companyName}</span></div>
      <span className={styles.pageKicker}><Landmark size={14}/> {ipo.marketSegment === 'sme' ? 'SME' : 'Mainboard'} · {ipoStatusLabel(ipo.status)}</span>
      <h1>{ipo.companyName} <span>IPO.</span></h1>
      <p className={styles.pageHeroLead}>{ipo.summary || (normalized ? 'Source-backed offer-document research with normalized financial analysis.' : 'Official exchange issue data is live. Deeper financial analysis appears after verified offer-document normalization.')}</p>
    </section>

    <nav className={local.detailNav} aria-label={`${ipo.companyName} IPO sections`}><div>
      <a href="#overview">Overview</a>{timeline.length ? <a href="#timeline">Timeline</a> : null}<a href="#application">Application</a>{subscriptions.length ? <a href="#subscription">Subscription</a> : null}{ipo.sources.length ? <a href="#documents">Documents</a> : null}<a href="#analysis">Analysis</a>
    </div></nav>

    <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
      <div className={local.researchStateBanner} data-state={ipo.researchState}>{normalized ? <ShieldCheck size={18}/> : <Radio size={18}/>}<div><b>{normalized ? 'Normalized financial research available' : 'Exchange-live issue record'}</b><p>{normalized ? `The quantitative model has ${score?.coverage ?? 0}% weighted data coverage.` : 'Current issue terms appear first. Advanced analysis appears only after verified offer-document data is normalized.'}</p></div><span>Updated {formatIpoDate(ipo.lastUpdated)}</span></div>

      <section id="overview" className={`${local.detailHero} ${local.detailSection}`}>
        <div className={local.detailScore}><small>Status</small><strong className={local.statusWord}>{ipoStatusLabel(ipo.status)}</strong><p>{ipo.marketSegment === 'sme' ? 'SME' : 'Mainboard'} · {ipo.symbol || 'Symbol unavailable'}</p></div>
        <div className={local.detailQuick}><span><small>Open date</small><b>{formatIpoDate(issue.openDate)}</b></span><span><small>Close date</small><b>{formatIpoDate(issue.closeDate)}</b></span><span><small>Price band</small><b>{priceBand(issue.priceBandLow, issue.priceBandHigh)}</b></span><span><small>Lot size</small><b>{issue.lotSize ? `${issue.lotSize.toLocaleString('en-IN')} shares` : '—'}</b></span><span><small>{issue.issueSizeCr !== undefined ? 'Issue size' : 'Est. issue value'}</small><b>{money(issue.issueSizeCr ?? ipo.estimatedIssueValueCr)}</b></span><span><small>Subscription</small><b>{formatSubscription(ipo.subscription?.total)}</b></span>{issue.registrar ? <span><small>Registrar</small><b>{issue.registrar}</b></span> : null}{issue.exchange?.length ? <span><small>Exchange</small><b>{issue.exchange.join(' · ')}</b></span> : null}</div>
      </section>

      {timeline.length ? <section id="timeline" className={local.detailSection}><div className={local.sectionHead}><div><span>IPO Timeline</span><h2>Application to listing.</h2></div></div><div className={local.timeline}>{timeline.map(([label, date], index) => <div key={label} data-complete="true"><span>{index + 1}</span><div><small>{label}</small><b>{formatIpoDate(date)}</b></div></div>)}</div></section> : null}

      <section id="application" className={local.detailSection}><div className={local.sectionHead}><div><span>Application</span><h2>Lot and application economics.</h2></div></div>{application.length ? <div className={local.applicationGrid}>{application.map(([label, value, note]) => <article key={label}><WalletCards size={18}/><small>{label}</small><strong>{value}</strong>{note ? <span>{note}</span> : null}</article>)}</div> : <div className={local.sectionPending}><WalletCards size={20}/><div><b>Application data not yet available</b><p>Lot and application amounts will appear when verified issue terms are available.</p></div></div>}</section>

      {subscriptions.length ? <section id="subscription" className={local.detailSection}><div className={local.sectionHead}><div><span>IPO Subscription</span><h2>Reported demand by investor category.</h2></div></div><div className={local.subscriptionCards}>{subscriptions.map(([label, value]) => <article key={label}><small>{label}</small><strong>{formatSubscription(value)}</strong></article>)}</div></section> : null}

      {ipo.sources.length ? <section id="documents" className={local.detailSection}><div className={local.sectionHead}><div><span>Official Sources</span><h2>Records behind this page.</h2></div></div><div className={local.sourceList}>{ipo.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={`${source.label}-${source.url}`}><FileText size={18}/><span><small>{source.sourceType} · checked {formatIpoDate(source.checkedAt)}</small><b>{sourceLabel(source.sourceType, source.label)}</b></span><ExternalLink size={14}/></a>)}</div></section> : null}

      <details id="analysis" className={local.analysisDisclosure}><summary><span><b>More financial analysis</b><small>{hasAnalysis ? 'Verified financials, KPIs, valuation and company context' : 'Advanced research appears after offer-document normalization'}</small></span><span>Expand</span></summary><div className={local.analysisBody}>
        {financials.length ? <section><div className={local.sectionHead}><div><span>Company Financials</span><h2>Restated financial history.</h2></div></div><div className={local.financialTable}><div className={local.tableHead}><span>Period</span><span>Revenue</span><span>EBITDA</span><span>PAT</span><span>Net worth</span><span>Debt</span><span>CFO</span></div>{financials.map((period) => <div key={period.period}><b>{period.period}</b><span>{money(period.revenueCr)}</span><span>{money(period.ebitdaCr)}</span><span>{money(period.patCr)}</span><span>{money(period.netWorthCr)}</span><span>{money(period.totalDebtCr)}</span><span>{money(period.cfoCr)}</span></div>)}</div></section> : <div className={local.sectionPending}><FileText size={20}/><div><b>Financial data not yet available</b><p>Financial statements will appear when verified offer-document data has been normalized.</p></div></div>}
        {kpis.length ? <section><div className={local.sectionHead}><div><span>Business Quality</span><h2>Available performance indicators.</h2></div></div><div className={local.metricGrid}>{kpis.map(([label, value, suffix, Icon]) => <article key={label}><Icon size={18}/><small>{label}</small><strong>{metric(value, suffix)}</strong></article>)}</div></section> : null}
        {valuations.length ? <section><div className={local.sectionHead}><div><span>Valuation</span><h2>Available price-band context.</h2></div></div><div className={local.metricGrid}>{valuations.map(([label, value, suffix]) => <article key={label}><Scale size={18}/><small>{label}</small><strong>{suffix === 'money' ? money(value) : metric(value, suffix)}</strong></article>)}</div></section> : null}
        {promoters.length ? <section><div className={local.sectionHead}><div><span>Company Details</span><h2>Promoter and issuer context.</h2></div></div><div className={local.promoterLayout}>{promoters.map(([label, value, Icon]) => <article key={label}><Icon size={18}/><small>{label}</small><strong>{value}</strong></article>)}</div></section> : null}
        {normalized && ipo.riskFlags?.length ? <section><div className={local.sectionHead}><div><span>Risk Factors</span><h2>Disclosures worth reading in full.</h2></div></div><div className={local.riskGrid}>{ipo.riskFlags.map((flag) => <article key={flag}><TriangleAlert size={16}/><p>{flag}</p></article>)}</div></section> : null}
      </div></details>

      <div className={local.regulatoryNotice}><ShieldCheck size={20}/><p><b>Not a recommendation:</b> issue status and subscription data are informational. A CredoNomics Data Score appears only after normalized financial inputs exist.</p></div>
    </section>
  </SiteFrame>
}
