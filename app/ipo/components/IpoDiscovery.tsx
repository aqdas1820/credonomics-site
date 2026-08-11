'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, FileText, Search, SlidersHorizontal } from 'lucide-react'
import type { IpoDiscoveryRecord, IpoDocumentStage } from '../../data/ipo-types'
import styles from '../ipo.module.css'

const stageLabels: Record<IpoDocumentStage, string> = {
  drhp: 'DRHP',
  rhp: 'RHP',
  prospectus: 'Prospectus',
  addendum: 'Addendum',
  corrigendum: 'Corrigendum',
  other: 'Other',
}

export default function IpoDiscovery({ records }: { records: IpoDiscoveryRecord[] }) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter((record) => {
      const qOk =
        !q ||
        record.companyName.toLowerCase().includes(q) ||
        record.filingTitle.toLowerCase().includes(q)
      const stageOk = stage === 'all' || record.documentStage === stage
      return qOk && stageOk
    })
  }, [query, stage, records])

  return (
    <div className={styles.discoveryShell}>
      <div className={styles.discoveryControls}>
        <label>
          <Search size={16}/>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company or filing…"
            aria-label="Search IPO filings"
          />
        </label>

        <label>
          <SlidersHorizontal size={15}/>
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="all">All filing stages</option>
            <option value="drhp">DRHP</option>
            <option value="rhp">RHP</option>
            <option value="prospectus">Prospectus</option>
            <option value="addendum">Addendum</option>
            <option value="corrigendum">Corrigendum</option>
          </select>
        </label>
      </div>

      <div className={styles.discoveryCount}>
        <b>{filtered.length}</b> filing record{filtered.length === 1 ? '' : 's'} shown
      </div>

      <div className={styles.discoveryGrid}>
        {filtered.map((record) => (
          <article className={styles.discoveryCard} key={record.id}>
            <div className={styles.discoveryTop}>
              <span>{stageLabels[record.documentStage]}</span>
              <small>{record.filingDate || 'Date not parsed'}</small>
            </div>
            <FileText size={21}/>
            <h3>{record.companyName}</h3>
            <p>{record.filingTitle}</p>
            <div className={styles.discoveryFoot}>
              <span>SEBI filing discovery</span>
              <a href={record.documentUrl || record.sourceUrl} target="_blank" rel="noreferrer">
                Official source <ExternalLink size={12}/>
              </a>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && <div className={styles.emptyState}>No filing matches the current filters.</div>}
    </div>
  )
}
