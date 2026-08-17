import Link from 'next/link'
import SiteFrame from './components/SiteFrame'

export default function NotFound() {
  return (
    <SiteFrame>
      <main className="cn-system-page">
        <div className="cn-system-card">
          <span className="cn-system-code">404</span>
          <p className="cn-system-eyebrow">Page not found</p>
          <h1>The research route you requested is not available.</h1>
          <p className="cn-system-copy">
            The page may have moved, been renamed, or may no longer be part of
            the public CredoNomics research platform.
          </p>
          <div className="cn-system-actions">
            <Link className="cn-system-primary" href="/">
              Return home
            </Link>
            <Link className="cn-system-secondary" href="/research">
              Open Research Desk
            </Link>
          </div>
        </div>
      </main>
    </SiteFrame>
  )
}