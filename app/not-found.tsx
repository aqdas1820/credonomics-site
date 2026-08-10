import { ArrowLeft } from 'lucide-react'
import styles from './site-v3.module.css'

export default function NotFound() {
  return (
    <main className={`${styles.site} ${styles.notFound}`}>
      <section className={styles.notFoundCard}>
        <span>404 / PAGE NOT FOUND</span>
        <h1>This financial path ends here.</h1>
        <p>
          The page may have moved, or the link may no longer be active.
          Return to CredoNomics and continue from the live tools or research desk.
        </p>
        <a className={styles.primaryButton} href="/">
          <ArrowLeft size={16} /> Return to CredoNomics
        </a>
      </section>
    </main>
  )
}
