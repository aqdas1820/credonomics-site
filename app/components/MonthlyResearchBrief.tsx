import { researchEdition, researchUpdates } from '../data/research-updates'
import { getRankingAudit } from '../data/ranking-audit'
import RankingChanges from './RankingChanges'
import styles from './research-updates.module.css'

export default function MonthlyResearchBrief() {
  return <section className={styles.section} id="monthly-research-update" aria-labelledby="monthly-research-title">
    <span className={styles.eyebrow}>Research desk · {researchEdition.label} · Checked {researchEdition.checkedAt}</span>
    <h2 id="monthly-research-title">This month: what changed, and what it means.</h2>
    <p>Issuer changes, corrected card calculations and refreshed portfolio disclosures in one place. A source check this month does not imply that the issuer changed its terms this month. Effective dates and unresolved coverage remain visible.</p>
    <div className={styles.stats}>
      <article><strong>{researchUpdates.filter(row => row.kind === 'Issuer change').length}</strong><span>October-effective issuer changes documented</span></article>
      <article><strong>634</strong><span>Numeric equity positions imported from six official September HDFC portfolios</span></article>
      <article><strong>{researchUpdates.filter(row => row.kind === 'Model correction').length}</strong><span>Calculation and normalization corrections documented</span></article>
    </div>
    <RankingChanges scenarios={getRankingAudit()} />
    <h3>Issuer notices and correction ledger</h3>
    <div className={styles.ledger}>{researchUpdates.map(update => <details key={update.id} id={update.id}>
      <summary>{update.title}<small>{update.kind} · {update.effectiveDate ? `Effective ${update.effectiveDate}` : 'Effective date not established'} · Checked {researchEdition.checkedAt}</small></summary>
      <div><p><strong>Before:</strong> {update.before}</p><p><strong>Now:</strong> {update.after}</p><p><strong>Impact:</strong> {update.impact}</p><p><a href={update.source} target="_blank" rel="noreferrer">{update.sourceLabel} ↗</a>{update.cardId && <> · <a href={`/cards/${update.cardId}`}>Open card record</a></>}</p></div>
    </details>)}</div>
    <h3>Across the website</h3>
    <div className={styles.coverage}>
      <article><strong>Mutual funds · September 2026</strong><p>Six core HDFC schemes now have official XLSX-based snapshots. Cash, debt and derivatives are outside this equity view. Sub-0.01% positions are retained as unquantified source entries. Historical coverage is partial; missing July/August and unresolved identities produce no monthly change signals. <a href="/tools/mf-portfolio-tracker">Open portfolios</a>.</p></article>
      <article><strong>IPO intelligence · automated source feed</strong><p>NSE market records and SEBI filings keep their own source timestamps. A refreshed IPO feed does not verify every field on other sections. Issue-stage records remain distinct from filings. <a href="/ipo">Open IPO intelligence</a>.</p></article>
      <article><strong>Markets and instruments</strong><p>Instrument identity and live quotes are separate datasets. Live quotes still depend on the connected provider; unavailable prices remain unavailable. Refreshing this edition does not invent a market pulse or stock target. <a href="/markets">Open markets</a>.</p></article>
      <article><strong>Research, tools and disclosures</strong><p>The August equity publication remains an August archive. Calculators retain their input assumptions and methodologies. This dated update is a new research bulletin, not a rewritten historical report. Account, payment and regulatory wording remain intact. <a href="/research">Open research</a>.</p></article>
    </div>
    <p className={styles.note}>Card history records the named fields checked in this edition. Other fee, eligibility, reward and lounge fields retain their original verification dates. FIRST Power and IndiGo reward categories with incomplete cap/value normalization are held from rupee rankings, with records retained for research.</p>
    <div className={styles.footer}><a href="/updates/2026-10">October research bulletin</a><a href="/data/research-updates/site-data-audit-2026-10.json">Section coverage and audit evidence</a><a href="/corrections">Report a correction</a></div>
  </section>
}
