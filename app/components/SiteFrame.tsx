import type { ReactNode } from 'react'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'
import SiteScrollProgress from './SiteScrollProgress'
import styles from '../core-v4.module.css'
import SiteExperience from './SiteExperience'

export default function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.siteShell} cn-experience`}>
      <SiteScrollProgress />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.pageMain}><SiteExperience />{children}</main>
      <SiteFooter />
    </div>
  )
}
