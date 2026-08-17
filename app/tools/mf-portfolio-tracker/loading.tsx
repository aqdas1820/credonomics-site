import styles from './loading.module.css'
export default function Loading() {
  return (<main className={styles.page} role="status" aria-live="polite"><section className={styles.card}>
    <span className={styles.eyebrow}>CredoNomics Mutual Fund Intelligence</span><h1>Preparing portfolio intelligence.</h1>
    <p>Loading scheme holdings, disclosed portfolio snapshots and month-to-month portfolio comparisons. Verify current holdings against the latest applicable AMC portfolio disclosure.</p>
    <div className={styles.progress} aria-hidden="true"><span /></div><div className={styles.links}><a href="/mutual-funds">Mutual Fund Intelligence overview</a><a href="/methodology">Methodology</a></div>
  </section></main>)
}