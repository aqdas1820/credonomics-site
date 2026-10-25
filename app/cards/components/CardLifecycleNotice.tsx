import type { VerifiedRealCard } from '../../data/verified-real-cards'
import styles from '../../components/research-watch.module.css'

export default function CardLifecycleNotice({ notice }: { notice: VerifiedRealCard['holderNotice'] }) {
  if (!notice) return null
  return <aside className={styles.limit} aria-label="Card lifecycle notice"><strong>{notice.label}</strong><p>{notice.detail}</p><a href={notice.href}>Migration checklist →</a><small> · Status checked {notice.checkedAt}</small></aside>
}
