'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('CredoNomics route error', error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: '48px 20px',
        background: '#061321',
        color: '#edf7ff',
      }}
    >
      <section
        style={{
          width: 'min(680px, 100%)',
          border: '1px solid #20394f',
          borderRadius: 18,
          padding: 32,
          background: '#0b1d2f',
        }}
      >
        <div
          style={{
            color: '#45d2c8',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
          }}
        >
          CredoNomics Investment Solutions
        </div>

        <h1 style={{ margin: '14px 0 0', fontSize: 34 }}>
          This section could not load.
        </h1>

        <p style={{ color: '#9eb2c5', lineHeight: 1.7 }}>
          You can retry this section or return to the homepage.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: 0,
              borderRadius: 10,
              padding: '12px 18px',
              background: '#45d2c8',
              color: '#061321',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>

          <Link
            href="/"
            style={{
              borderRadius: 10,
              padding: '12px 18px',
              border: '1px solid #20394f',
              color: '#edf7ff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  )
}