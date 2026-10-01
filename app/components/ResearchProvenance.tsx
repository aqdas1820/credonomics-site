import { CalendarDays, Database, FileSearch, ShieldAlert } from 'lucide-react'
import styles from '../core-v4.module.css'

type Props = {
  updated?: string
  source?: string
  period?: string
  limitations?: string
  methodologyHref?: string
  metadata?: Partial<{ source: string; asOf: string | null; reportingPeriod: string | null; quality: string; availability: string }>
}

export default function ResearchProvenance({
  updated,
  source,
  period,
  limitations,
  methodologyHref = '/methodology',
  metadata
}: Props) {
  const finalSource = source || metadata?.source || 'CredoNomics / Exchange';
  const finalPeriod = period || metadata?.reportingPeriod || (metadata?.asOf ? new Intl.DateTimeFormat('en-IN').format(new Date(metadata.asOf)) : 'Not specified');
  const finalUpdated = updated || (metadata?.asOf ? `Data as of ${new Intl.DateTimeFormat('en-IN').format(new Date(metadata.asOf))}` : 'Review pending');
  const finalLimitations = limitations || (metadata?.availability === 'partial' ? 'Partial coverage' : 'Source freshness and coverage vary');
  return (
    <aside className={styles.provenanceBar} aria-label="Research provenance">
      <div className={styles.provenanceItem}>
        <CalendarDays size={15} />
        <span>
          <small>Updated</small>
          <strong>{finalUpdated}</strong>
        </span>
      </div>

      <div className={styles.provenanceItem}>
        <Database size={15} />
        <span>
          <small>Primary source</small>
          <strong>{finalSource}</strong>
        </span>
      </div>

      <div className={styles.provenanceItem}>
        <FileSearch size={15} />
        <span>
          <small>Data period</small>
          <strong>{finalPeriod}</strong>
        </span>
      </div>

      <div className={styles.provenanceItem}>
        <ShieldAlert size={15} />
        <span>
          <small>Limitations</small>
          <strong>{finalLimitations}</strong>
        </span>
      </div>

      <a className={styles.provenanceLink} href={methodologyHref}>
        Methodology →
      </a>
    </aside>
  )
}