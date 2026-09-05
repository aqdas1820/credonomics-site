'use client'

import React, { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Subscribed successfully!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to subscribe')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--card-border, #e2e8f0)',
      padding: '24px',
      borderRadius: '12px',
      margin: '32px 0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
        Monthly Indian Equity Opportunity Report
      </h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Get data-driven insights and portfolio intelligence delivered straight to your inbox. No spam.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          required
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid var(--card-border, #e2e8f0)',
            background: 'var(--bg-color, #f8fafc)',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '14px'
          }}
        />
        <button 
          type="submit" 
          disabled={status === 'loading'}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#2563EB', /* High-contrast electric blue as requested */
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            transition: 'background 0.2s ease',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      
      {message && (
        <p style={{ 
          margin: '12px 0 0 0', 
          fontSize: '13px', 
          color: status === 'success' ? 'var(--up-color, #16a34a)' : 'var(--down-color, #dc2626)',
          fontWeight: 500
        }}>
          {message}
        </p>
      )}
    </div>
  )
}
