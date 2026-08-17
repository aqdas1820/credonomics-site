'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('CredoNomics route error:', error)
  }, [error])

  return (
    <main className="cn-system-page">
      <div className="cn-system-card">
        <span className="cn-system-code">Error</span>
        <p className="cn-system-eyebrow">Something did not load correctly</p>
        <h1>The page hit a temporary problem.</h1>
        <p className="cn-system-copy">
          Your data has not been changed. You can retry the page or return to
          the CredoNomics homepage.
        </p>

        {error.digest ? (
          <p className="cn-system-digest">Reference: {error.digest}</p>
        ) : null}

        <div className="cn-system-actions">
          <button className="cn-system-primary" type="button" onClick={reset}>
            Try again
          </button>
          <a className="cn-system-secondary" href="/">
            Return home
          </a>
        </div>
      </div>
    </main>
  )
}