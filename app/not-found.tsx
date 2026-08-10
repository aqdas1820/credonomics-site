import { ArrowLeft } from 'lucide-react'
import SiteFrame from './components/SiteFrame'
import styles from './core-v4.module.css'

export default function NotFound() {
  return (
    <SiteFrame>
      <section className={styles.notFound}>
        <div className={styles.notFoundCard}>
          <small>404 / PAGE NOT FOUND</small>
          <h1>This financial path ends here.</h1>
          <p>The page may have moved or the link may no longer be active. Return to CredoNomics and continue from the public tools or research desk.</p>
          <a className={styles.primaryButton} href="/"><ArrowLeft size={15}/> Return home</a>
        </div>
      </section>
    </SiteFrame>
  )
}
