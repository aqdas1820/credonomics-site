'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <main className="cn-system-page">
          <div className="cn-system-card">
            <span className="cn-system-code">System</span>
            <p className="cn-system-eyebrow">CredoNomics</p>
            <h1>The application could not finish loading.</h1>
            <p className="cn-system-copy">
              Please retry. If the issue continues, return to the homepage and
              try the section again.
            </p>
            <div className="cn-system-actions">
              <button className="cn-system-primary" type="button" onClick={reset}>
                Retry
              </button>
              <a className="cn-system-secondary" href="/">
                Home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}