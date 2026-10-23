'use client'

import { useId, useState } from 'react'
import type { getRankingAudit } from '../data/ranking-audit'
import styles from './research-updates.module.css'

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function RankingChanges({ scenarios }: { scenarios: ReturnType<typeof getRankingAudit> }) {
  const [category, setCategory] = useState('utilities')
  const [spend, setSpend] = useState(10000)
  const id = useId()
  const scenario = scenarios.find(row => row.category === category && row.monthlySpend === spend) ?? scenarios[0]
  if (!scenario) return null
  const categories = scenarios.filter(row => row.monthlySpend === 10000)
  return <section aria-labelledby={`${id}-title`} className={styles.rankings}>
    <h3 id={`${id}-title`}>Which rankings changed after this audit?</h3>
    <div className={styles.controls}>
      <label htmlFor={`${id}-category`}>Category<select id={`${id}-category`} value={category} onChange={e => setCategory(e.target.value)}>{categories.map(row => <option key={row.category} value={row.category}>{row.label}</option>)}</select></label>
      <label htmlFor={`${id}-spend`}>Eligible monthly spend<select id={`${id}-spend`} value={spend} onChange={e => setSpend(Number(e.target.value))}>{[10000, 30000, 50000].map(value => <option key={value} value={value}>{money(value)}</option>)}</select></label>
    </div>
    <p>Same assumptions before and after: annual eligible retail spend {money(scenario.annualRetailSpend)}; other qualifying base spend {money(scenario.monthlyBaseSpend)}/month for Airtel utility eligibility. Annual fee tax remains 18%. Rankings depend on this scenario.</p>
    <p className={styles.note}>“Before” is the published CredoNomics model at commit f2f4154, not last month’s issuer ranking. New means newly modeled in that category. Held means a required cap or rupee valuation is unverified. Shared caps assume no use in other categories; monthly spending is even.</p>
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Ranking changes table; scroll horizontally on small screens">
      <table><caption>{scenario.label}: annual modeled net value before and after the October audit</caption><thead><tr><th scope="col">Card</th><th scope="col">Before rank</th><th scope="col">After rank</th><th scope="col">Before / year</th><th scope="col">After / year</th></tr></thead>
        <tbody>{scenario.rows.map(row => <tr key={row.id}><th scope="row"><a href={`/cards/${row.id}`}>{row.name}</a></th><td>{row.beforeRank ? `#${row.beforeRank}` : 'New'}</td><td>{row.afterRank === null ? 'Held' : `#${row.afterRank}`}</td><td>{row.beforeRank ? money(row.beforeValue) : 'Not modeled'}</td><td>{row.afterValue === null ? 'Not ranked' : money(row.afterValue)}</td></tr>)}</tbody></table>
    </div>
    {!scenario.rows.length && <p role="status">No modeled value or rank changes in this scenario.</p>}
    <p>Relative ranks can change when another card is corrected. Read the source ledger below for each direct correction. <a href="/data/research-updates/2026-10-ranking-baseline.json">Download the preserved baseline</a>.</p>
  </section>
}
