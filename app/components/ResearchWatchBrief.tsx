import { researchWatch, WATCH_CHECKED_AT, watchStatus, type WatchItem } from '../data/research-watch'
import styles from './research-watch.module.css'

export default function ResearchWatchBrief({ cardId, category }: { cardId?: string; category?: WatchItem['category'] | WatchItem['category'][] }) {
  const items = cardId ? researchWatch.filter(item => item.cardIds?.includes(cardId)) : researchWatch.filter(item => !category || (Array.isArray(category) ? category.includes(item.category) : item.category === category))
  if (!items.length) return null
  return <section className={styles.brief} aria-labelledby={cardId ? 'card-watch-title' : 'research-watch-title'}>
    <div className={styles.heading}><div><span>RESEARCH WATCH · LATEST CHECK {WATCH_CHECKED_AT}</span><h2 id={cardId ? 'card-watch-title' : 'research-watch-title'}>{cardId ? 'Research updates for this card' : 'Changes worth acting on.'}</h2></div><a href="/research/watch">Open Research Watch →</a></div>
    <p>Source-checked updates with clear dates and practical next steps. Status is a snapshot at the check date; upcoming notices are not applied to current card rankings.</p>
    <div className={styles.grid}>{items.map(item => <a className={styles.card} key={item.slug} href={`/research/watch/${item.slug}`}>
      <small>{item.category} · {watchStatus(item)} · Checked {item.checkedAt}</small><h3>{item.title}</h3><p>{item.summary}</p><b>{item.dateLabel}: {item.eventDate}</b><span>Read the action guide →</span>
    </a>)}</div>
  </section>
}
