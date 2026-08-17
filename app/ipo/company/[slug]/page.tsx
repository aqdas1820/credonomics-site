import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Database,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import SiteFrame from '../../../components/SiteFrame'
import ipoData from '../../../../public/data/ipo-intelligence/index.json'
import styles from './ipo-company.module.css'

type FinancialMetric = {
  label: string
  values: string[]
  source: string
  confidence: string
}

type Issue = {
  slug: string
  company: string
  board: string
  status: string
  openDate: string
  closeDate: string
  allotmentDate: string
  listingDate: string
  priceBand: string
  issuePrice: string
  lotSize: string
  faceValue: string
  issueSize: string
  freshIssue: string
  offerForSale: string
  exchange: string
  subscription: string
  subscriptionRetail: string
  subscriptionQib: string
  subscriptionNii: string
  listingDayClose: string
  listingGain: string
  ltp: string
  returnSinceIssue: string
  sebiFilingDate: string
  sebiFilingType: string
  sebiPageUrl: string
  prospectusUrl: string
  financialPeriods: string[]
  financials: FinancialMetric[]
  financialExtractionStatus: string
  sourceLabels: string[]
  sourceUrls: string[]
  sourceUpdatedAt: string
  warnings: string[]
}

const issues = (ipoData.issues ?? []) as Issue[]

function getIssue(slug: string) {
  return issues.find((issue) => issue.slug === slug)
}

function value(input?: string, fallback = 'Not available') {
  return input?.trim() || fallback
}

export function generateStaticParams() {
  return issues.map((issue) => ({ slug: issue.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const issue = getIssue(params.slug)

  if (!issue) {
    return {
      title: 'IPO not found',
      robots: { index: false, follow: true },
    }
  }

  return {
    title: `${issue.company} IPO`,
    description:
      `${issue.company} IPO dates, price band, lot size, subscription, ` +
      'prospectus links, financial snapshot and listing information.',
    alternates: {
      canonical: `/ipo/company/${issue.slug}`,
    },
  }
}

export default function IPOCompanyPage({
  params,
}: {
  params: { slug: string }
}) {
  const issue = getIssue(params.slug)

  if (!issue) notFound()

  const overview = [
    ['Status', issue.status],
    ['Board', issue.board],
    ['Price band', issue.priceBand || issue.issuePrice],
    ['Lot size', issue.lotSize],
    ['Issue size', issue.issueSize],
    ['Face value', issue.faceValue],
    ['Open date', issue.openDate],
    ['Close date', issue.closeDate],
    ['Allotment', issue.allotmentDate],
    ['Listing date', issue.listingDate],
    ['Exchange', issue.exchange],
    ['Subscription', issue.subscription],
  ]

  const issueStructure = [
    ['Fresh issue', issue.freshIssue],
    ['Offer for sale', issue.offerForSale],
    ['Issue price', issue.issuePrice],
    ['Listing-day close', issue.listingDayClose],
    ['Listing gain/loss', issue.listingGain],
    ['Latest tracked price', issue.ltp],
    ['Return since issue', issue.returnSinceIssue],
  ].filter(([, metricValue]) => metricValue?.trim())

  const financialPeriods = issue.financialPeriods ?? []
  const financials = issue.financials ?? []

  return (
    <SiteFrame>
      <main className={styles.page}>
        <nav className={styles.breadcrumb}>
          <a href="/ipo">IPO Intelligence</a>
          <span>/</span>
          <span>{issue.company}</span>
        </nav>

        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              <Database size={15} />
              {issue.board} Â· {issue.status}
            </span>

            <h1>{issue.company} IPO</h1>

            <p>
              Automated public-issue intelligence compiled from exchange and
              regulatory source layers. Missing values remain unavailable
              rather than being estimated.
            </p>

            <div className={styles.actions}>
              {issue.prospectusUrl ? (
                <a
                  className={styles.primary}
                  href={issue.prospectusUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Prospectus <ArrowUpRight size={14} />
                </a>
              ) : null}

              {issue.sebiPageUrl ? (
                <a
                  className={styles.secondary}
                  href={issue.sebiPageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  SEBI filing
                </a>
              ) : null}
            </div>
          </div>

          <aside className={styles.sourceCard}>
            <ShieldCheck size={20} />
            <div>
              <strong>Source-aware record</strong>
              <p>
                Last pipeline refresh:{' '}
                {new Date(ipoData.generatedAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'Asia/Kolkata',
                })}
              </p>
              <span>
                {issue.sourceLabels?.length
                  ? issue.sourceLabels.join(' Â· ')
                  : 'Official public sources'}
              </span>
            </div>
          </aside>
        </section>

        <section className={styles.overviewSection}>
          <div className={styles.sectionHead}>
            <div>
              <span>Issue overview</span>
              <h2>Offer terms and important dates.</h2>
            </div>
          </div>

          <div className={styles.overviewGrid}>
            {overview.map(([label, metricValue]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value(metricValue)}</strong>
              </div>
            ))}
          </div>
        </section>

        {issueStructure.length ? (
          <section className={styles.splitSection}>
            <div className={styles.sectionTitle}>
              <BarChart3 size={19} />
              <div>
                <span>Issue structure</span>
                <h2>Offer and listing snapshot.</h2>
              </div>
            </div>

            <dl className={styles.definitionList}>
              {issueStructure.map(([label, metricValue]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{metricValue}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className={styles.financialSection}>
          <div className={styles.sectionHead}>
            <div>
              <span>Prospectus financials</span>
              <h2>Key financial snapshot.</h2>
            </div>

            <p>
              Values in this section are automatically extracted from
              prospectus text when a sufficiently clear table row is found.
              Always verify them against the linked prospectus before use.
            </p>
          </div>

          {financials.length ? (
            <div className={styles.financialTableWrap}>
              <table className={styles.financialTable}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    {Array.from({
                      length: Math.max(
                        ...financials.map((item) => item.values.length),
                      ),
                    }).map((_, index) => (
                      <th key={index}>
                        {financialPeriods[index] || `Period ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {financials.map((metric) => (
                    <tr key={metric.label}>
                      <th>{metric.label}</th>
                      {metric.values.map((metricValue, index) => (
                        <td key={index}>{metricValue}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noFinancials}>
              <FileText size={20} />
              <strong>Structured financial extraction is not available yet.</strong>
              <p>
                Use the linked SEBI filing/prospectus for the complete audited
                and restated financial information.
              </p>
            </div>
          )}

          <div className={styles.verificationNotice}>
            <ShieldCheck size={17} />
            <p>
              Extraction status:{' '}
              <strong>{issue.financialExtractionStatus}</strong>. Auto-extracted
              financial rows are research aids, not substitutes for the
              prospectus.
            </p>
          </div>
        </section>

        <section className={styles.sourcesSection}>
          <div className={styles.sectionTitle}>
            <FileText size={19} />
            <div>
              <span>Primary sources</span>
              <h2>Verify the market record.</h2>
            </div>
          </div>

          <div className={styles.sourceLinks}>
            {(issue.sourceUrls ?? []).map((url, index) => (
              <a
                href={url}
                key={url}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  {issue.sourceLabels?.[index] || `Official source ${index + 1}`}
                </span>
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        </section>

        <section className={styles.disclosure}>
          <CalendarDays size={18} />
          <p>
            IPO schedules, subscription figures and issue terms can change.
            CredoNomics is not a SEBI-registered Investment Adviser or Research
            Analyst. This page is informational research infrastructure and
            does not constitute an IPO recommendation.
          </p>
        </section>
      </main>
    </SiteFrame>
  )
}