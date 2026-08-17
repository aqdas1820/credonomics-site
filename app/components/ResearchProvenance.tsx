import { CalendarDays, Database, FileSearch, ShieldAlert } from 'lucide-react'
import styles from '../core-v4.module.css'

type Props = {
  updated: string
  source: string
  period: string
  limitations: string
  methodologyHref?: string
}

export default function ResearchProvenance({
  updated,
  source,
  period,
  limitations,
  methodologyHref = '/methodology',
}: Props) {
  return (
    <aside className={styles.provenanceBar} aria-label="Research provenance">
      <div className={styles.provenanceItem}>
        <CalendarDays size={15} />
        <span>
          <small>Updated</small>
          <strong>{updated}</strong>
        </span>
      </div>

      <div className={styles.provenanceItem}>
        <Database size={15} />
        <span>
          <small>Primary source</small>
          <strong>{source}</strong>
        </span>
      </div>

      <div className={styles.provenanceItem}>
        <FileSearch size={15} />
        <span>
          <small>Data period</small>
          <strong>{period}</strong>
        </span>
      </div>

      <div className={styles.provenanceItem}>
        <ShieldAlert size={15} />
        <span>
          <small>Limitations</small>
          <strong>{limitations}</strong>
        </span>
      </div>

      <a className={styles.provenanceLink} href={methodologyHref}>
        Methodology →
      </a>
    </aside>
  )
}