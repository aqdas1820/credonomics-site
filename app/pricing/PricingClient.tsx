'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PricingClient({ isAuth, checkoutAvailable }: { isAuth: boolean, checkoutAvailable: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCheckout = async () => {
    if (!isAuth) {
      router.push('/login?next=/pricing')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize checkout')
      }

      if (typeof data.url !== 'string' || new URL(data.url).origin !== 'https://checkout.stripe.com') throw new Error('Checkout is unavailable. Please try again later.')
      window.location.assign(data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout is unavailable. Please try again later.')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Free Tier */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '40px 32px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Basic</h2>
        <div style={{ fontSize: '40px', fontWeight: 700, marginBottom: '24px' }}>₹0<span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Perfect for tracking your personal portfolio and staying updated.</p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Latest available stock quotes</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Device and cloud watchlists</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Price alerts</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Monthly research newsletter</li>
        </ul>

        <button 
          disabled
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', cursor: 'default' }}
        >
          {isAuth ? 'Current Plan' : 'Free Forever'}
        </button>
      </div>

      {/* Pro Tier */}
      <div style={{ background: 'var(--card-bg)', border: '2px solid var(--brand-color)', borderRadius: '16px', padding: '40px 32px', position: 'relative', boxShadow: '0 10px 40px rgba(2, 132, 199, 0.15)' }}>
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-color)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Planned
        </div>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--brand-color)' }}>Pro</h2>
        <div style={{ fontSize: '40px', fontWeight: 700, marginBottom: '24px' }}>₹999<span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Advanced tools and insights for the serious investor.</p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> <strong>Everything in Basic</strong></li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Unlimited Watchlists & Alerts</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Full Mutual Fund Overlaps</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Monthly Indian Equity Report</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--up-color)" /> Proprietary Valuation Models</li>
        </ul>

        <button 
          onClick={handleCheckout}
          disabled={loading || !checkoutAvailable}
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--brand-color)', color: 'white', fontWeight: 600, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.2s ease', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
        >
          {!checkoutAvailable ? 'Subscriptions unavailable' : loading ? 'Processing...' : (isAuth ? 'Upgrade to Pro' : 'Sign In to Upgrade')}
        </button>
        {error && <p role="alert" style={{ color: 'var(--down-color)', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>{error}</p>}
      </div>
      
    </div>
  )
}
