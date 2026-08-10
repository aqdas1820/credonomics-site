import type { ReactNode } from 'react'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'
import styles from '../core-v4.module.css'

export default function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.siteShell}>
      <SiteHeader />
      <main id="main-content" className={styles.pageMain}>{children}</main>
      <SiteFooter />
    </div>
  )
}
