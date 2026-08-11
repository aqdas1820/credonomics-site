'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Calculator, Database, ShieldCheck } from 'lucide-react'
import { calculateIpoDataScore } from '../../data/ipo-engine'
import type { VerifiedIpoRecord } from '../../data/ipo-types'
import styles from './analyzer.module.css'

type FormState = Record<string, string>

const initial: FormState = {
  companyName: '',
  revenue1: '',
  revenue2: '',
  revenue3: '',
  pat1: '',
  pat2: '',
  pat3: '',
  roe: '',
  roce: '',
  cfoPat: '',
  debtEquity: '',
  pe: '',
  peerPe: '',
  pb: '',
  peerPb: '',
  issueSize: '',
  freshIssue: '',
  ofs: '',
  customerConcentration: '',
}

function num(value: string) {
  if (value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export default function IpoAnalyzer() {
  const [form, setForm] = useState<FormState>(initial)

  const record = useMemo<VerifiedIpoRecord>(() => ({
    slug: 'analysis-sandbox',
    companyName: form.companyName || 'IPO analysis sandbox',
    marketSegment: 'unknown',
    status: 'unknown',
    issue: {
      issueSizeCr: num(form.issueSize),
      freshIssueCr: num(form.freshIssue),
      ofsCr: num(form.ofs),
    },
    financials: [
      { period: 'Period 1', revenueCr: num(form.revenue1), patCr: num(form.pat1) },
      { period: 'Period 2', revenueCr: num(form.revenue2), patCr: num(form.pat2) },
      { period: 'Period 3', revenueCr: num(form.revenue3), patCr: num(form.pat3) },
    ],
    valuation: {
      peAtUpperBand: num(form.pe),
      peerMedianPe: num(form.peerPe),
      pbAtUpperBand: num(form.pb),
      peerMedianPb: num(form.peerPb),
    },
    quality: {
      roePercent: num(form.roe),
      rocePercent: num(form.roce),
      cfoPat: num(form.cfoPat),
      debtEquity: num(form.debtEquity),
      topCustomerRevenuePercent: num(form.customerConcentration),
    },
    sources: [],
    lastVerified: '',
  }), [form])

  const score = useMemo(() => calculateIpoDataScore(record), [record])

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  const field = (key: string, label: string, suffix?: string, placeholder = '—') => (
    <label className={styles.field}>
      <span>{label}</span>
      <div>
        <input
          inputMode="decimal"
          value={form[key]}
          onChange={(event) => update(key, event.target.value)}
          placeholder={placeholder}
        />
        {suffix && <i>{suffix}</i>}
      </div>
    </label>
  )

  return (
    <div className={styles.workspace}>
      <section className={styles.inputPanel}>
        <div className={styles.panelHead}>
          <div><span>Quantitative sandbox</span><h2>Enter normalized offer-document data.</h2></div>
          <Calculator size={22}/>
        </div>

        <label className={styles.companyField}>
          <span>Company / IPO</span>
          <input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Company name"/>
        </label>

        <div className={styles.group}>
          <div className={styles.groupHead}><b>Growth history</b><small>₹ crore</small></div>
          <div className={styles.grid3}>
            {field('revenue1', 'Revenue — Period 1', 'Cr')}
            {field('revenue2', 'Revenue — Period 2', 'Cr')}
            {field('revenue3', 'Revenue — Period 3', 'Cr')}
            {field('pat1', 'PAT — Period 1', 'Cr')}
            {field('pat2', 'PAT — Period 2', 'Cr')}
            {field('pat3', 'PAT — Period 3', 'Cr')}
          </div>
        </div>

        <div className={styles.group}>
          <div className={styles.groupHead}><b>Quality & balance sheet</b><small>Latest normalized values</small></div>
          <div className={styles.grid4}>
            {field('roe', 'ROE', '%')}
            {field('roce', 'ROCE', '%')}
            {field('cfoPat', 'CFO / PAT', '×')}
            {field('debtEquity', 'Debt / Equity', '×')}
          </div>
        </div>

        <div className={styles.group}>
          <div className={styles.groupHead}><b>Valuation</b><small>At upper price band</small></div>
          <div className={styles.grid4}>
            {field('pe', 'IPO P/E', '×')}
            {field('peerPe', 'Peer median P/E', '×')}
            {field('pb', 'IPO P/B', '×')}
            {field('peerPb', 'Peer median P/B', '×')}
          </div>
        </div>

        <div className={styles.group}>
          <div className={styles.groupHead}><b>Issue structure</b><small>₹ crore unless noted</small></div>
          <div className={styles.grid4}>
            {field('issueSize', 'Total issue size', 'Cr')}
            {field('freshIssue', 'Fresh issue', 'Cr')}
            {field('ofs', 'Offer for sale', 'Cr')}
            {field('customerConcentration', 'Top customer share', '%')}
          </div>
        </div>
      </section>

      <aside className={styles.resultPanel}>
        <div className={styles.resultKicker}><BarChart3 size={15}/> CredoNomics IPO Data Score</div>
        <div className={styles.scoreValue}>
          <strong>{score.score === null ? '—' : score.score}</strong>
          <span>/100</span>
        </div>
        <h3>{score.label}</h3>
        <p>Data coverage: <b>{score.coverage}%</b> of the fixed scoring framework.</p>

        <div className={styles.componentList}>
          {score.components.map((item) => (
            <div key={item.key} data-available={item.available}>
              <span><b>{item.label}</b><small>{item.available ? `${item.earned.toFixed(1)} / ${item.weight}` : 'Missing input'}</small></span>
              <div><i style={{ width: `${item.available ? (item.earned / item.weight) * 100 : 0}%` }}/></div>
            </div>
          ))}
        </div>

        <div className={styles.resultNotice}>
          <ShieldCheck size={16}/>
          <p>
            This is a fixed quantitative comparison of supplied financial data. It is not a
            subscribe/avoid recommendation, price target or prediction of listing performance.
          </p>
        </div>

        <div className={styles.warning}>
          <AlertTriangle size={16}/>
          <p>Do not use unverified numbers. Use the current RHP/prospectus and exchange documents before relying on the output.</p>
        </div>
      </aside>
    </div>
  )
}
