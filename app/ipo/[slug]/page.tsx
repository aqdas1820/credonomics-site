import { notFound } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ExternalLink,
  FileText,
  Gauge,
  Landmark,
  Scale,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import { verifiedIpos } from '../../data/verified-ipos.generated'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'

export function generateStaticParams() {
  return verifiedIpos.map((ipo) => ({ slug: ipo.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const ipo = verifiedIpos.find((item) => item.slug === params.slug)
  if (!ipo) return {}
  return {
    title: `${ipo.companyName} IPO — Financials, Valuation & Data Score`,
    description: `Source-backed statistical IPO research for ${ipo.companyName}, including financial history, issue structure, valuation and the CredoNomics quantitative Data Score.`,
    alternates: { canonical: `/ipo/${ipo.slug}` },
  }
}

function money(value?: number) {
  return value === undefined ? '—' : `₹${value.toLocaleString('en-IN')} Cr`
}

function metric(value?: number, suffix = '') {
  return value === undefined ? '—' : `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${suffix}`
}

export default function IpoDetailPage({ params }: { params: { slug: string } }) {
  const ipo = verifiedIpos.find((item) => item.slug === params.slug)
  if (!ipo) notFound()

  const score = calculateIpoDataScore(ipo)

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>{ipo.companyName}</span></div>
        <span className={styles.pageKicker}><Landmark size={14}/> {ipo.marketSegment} · {ipo.status}</span>
        <h1>{ipo.companyName} <span>IPO data research.</span></h1>
        <p className={styles.pageHeroLead}>{ipo.summary || 'Source-backed statistical research record compiled from normalized offer-document fields.'}</p>
        <div className={local.heroActions}>
          <a className={styles.secondaryButton} href="/ipo/analyzer">Open score analyzer</a>
          <a className={styles.secondaryButton} href="/ipo/methodology">Methodology</a>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.detailHero}>
          <div>
            <small>CredoNomics IPO Data Score</small>
            <strong>{score.score ?? '—'}</strong><span>/100</span>
            <p>{score.label} · {score.coverage}% scoring-data coverage</p>
          </div>
          <div className={local.detailQuick}>
            <span><small>Issue size</small><b>{money(ipo.issue.issueSizeCr)}</b></span>
            <span><small>Upper price band</small><b>{ipo.issue.priceBandHigh !== undefined ? `₹${ipo.issue.priceBandHigh}` : '—'}</b></span>
            <span><small>IPO P/E</small><b>{metric(ipo.valuation?.peAtUpperBand, '×')}</b></span>
            <span><small>Last verified</small><b>{ipo.lastVerified}</b></span>
          </div>
        </div>

        <section className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Financial history</span><h2>Revenue, profitability and balance-sheet context.</h2></div></div>
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

        <section className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Quality & valuation</span><h2>Normalized metrics used by the quantitative model.</h2></div></div>
          <div className={local.metricGrid}>
            <article><BarChart3 size={18}/><small>Revenue CAGR</small><strong>{metric(score.revenueCagr, '%')}</strong></article>
            <article><BarChart3 size={18}/><small>PAT CAGR</small><strong>{metric(score.patCagr, '%')}</strong></article>
            <article><Gauge size={18}/><small>ROE</small><strong>{metric(ipo.quality?.roePercent, '%')}</strong></article>
            <article><Gauge size={18}/><small>ROCE</small><strong>{metric(ipo.quality?.rocePercent, '%')}</strong></article>
            <article><Scale size={18}/><small>Debt / Equity</small><strong>{metric(ipo.quality?.debtEquity, '×')}</strong></article>
            <article><Scale size={18}/><small>CFO / PAT</small><strong>{metric(ipo.quality?.cfoPat, '×')}</strong></article>
            <article><Scale size={18}/><small>IPO P/E</small><strong>{metric(ipo.valuation?.peAtUpperBand, '×')}</strong></article>
            <article><Scale size={18}/><small>Peer median P/E</small><strong>{metric(ipo.valuation?.peerMedianPe, '×')}</strong></article>
          </div>
        </section>

        <section className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Issue structure</span><h2>Fresh capital, OFS and timetable.</h2></div></div>
          <div className={local.metricGrid}>
            <article><Landmark size={18}/><small>Total issue</small><strong>{money(ipo.issue.issueSizeCr)}</strong></article>
            <article><Landmark size={18}/><small>Fresh issue</small><strong>{money(ipo.issue.freshIssueCr)}</strong></article>
            <article><Landmark size={18}/><small>Offer for sale</small><strong>{money(ipo.issue.ofsCr)}</strong></article>
            <article><CalendarDays size={18}/><small>Open</small><strong>{ipo.issue.openDate || '—'}</strong></article>
            <article><CalendarDays size={18}/><small>Close</small><strong>{ipo.issue.closeDate || '—'}</strong></article>
            <article><CalendarDays size={18}/><small>Listing</small><strong>{ipo.issue.listingDate || '—'}</strong></article>
          </div>

          {ipo.issue.useOfProceeds?.length ? (
            <div className={local.proceeds}>
              <b>Objects / use of proceeds</b>
              <ul>{ipo.issue.useOfProceeds.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ) : null}
        </section>

        {ipo.riskFlags?.length ? (
          <section className={local.detailSection}>
            <div className={local.sectionHead}><div><span>Disclosed risk flags</span><h2>Raw issues to inspect in the offer document.</h2></div></div>
            <div className={local.riskGrid}>
              {ipo.riskFlags.map((flag) => <article key={flag}><TriangleAlert size={16}/><p>{flag}</p></article>)}
            </div>
          </section>
        ) : null}

        <section className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Score decomposition</span><h2>Every weighted input remains visible.</h2></div></div>
          <div className={local.scoreBreakdown}>
            {score.components.map((item) => (
              <div key={item.key} data-available={item.available}>
                <span><b>{item.label}</b><small>{item.note}</small></span>
                <strong>{item.available ? `${item.earned.toFixed(1)} / ${item.weight}` : 'Missing'}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={local.detailSection}>
          <div className={local.sectionHead}><div><span>Primary sources</span><h2>Documents behind the normalized record.</h2></div></div>
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
          <p><b>Not a recommendation:</b> this page is a statistical summary and mechanical comparison of normalized public data. It is not a subscribe/avoid call, price target, personalized investment advice or prediction of IPO/listing returns.</p>
        </div>
      </section>
    </SiteFrame>
  )
}
