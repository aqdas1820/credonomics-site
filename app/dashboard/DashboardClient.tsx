'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Settings, Eye, Bell, CreditCard, TrendingUp } from 'lucide-react'
import WatchlistClient from '../watchlist/WatchlistClient'
import AlertsClient from '../alerts/AlertsClient'
import DashboardOverview from './DashboardOverview'
import NotificationCenter from './NotificationCenter'

export default function DashboardClient({ userEmail, checkoutAvailable = false }: { userEmail: string; checkoutAvailable?: boolean }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'alerts' | 'notifications' | 'settings'>('overview')

  return (
    <main style={{ minHeight: '80vh', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>My Dashboard</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px' }}>Welcome back, {userEmail}</p>
      </header>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--card-border)', marginBottom: '32px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'overview' ? '2px solid var(--brand-color)' : '2px solid transparent', color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'overview' ? 600 : 400, whiteSpace: 'nowrap' }}
        >
          <TrendingUp size={18} /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('watchlist')}
          style={{ background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'watchlist' ? '2px solid var(--brand-color)' : '2px solid transparent', color: activeTab === 'watchlist' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'watchlist' ? 600 : 400, whiteSpace: 'nowrap' }}
        >
          <Eye size={18} /> My Watchlist
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          style={{ background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'alerts' ? '2px solid var(--brand-color)' : '2px solid transparent', color: activeTab === 'alerts' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'alerts' ? 600 : 400, whiteSpace: 'nowrap' }}
        >
          <Bell size={18} /> Active Alerts
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'settings' ? '2px solid var(--brand-color)' : '2px solid transparent', color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'settings' ? 600 : 400, whiteSpace: 'nowrap' }}
        >
          <Settings size={18} /> Account Settings
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          style={{ background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'notifications' ? '2px solid var(--brand-color)' : '2px solid transparent', color: activeTab === 'notifications' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'notifications' ? 600 : 400, whiteSpace: 'nowrap' }}
        >
          <Bell size={18} /> Notifications
        </button>
      </div>

      <div style={{ background: 'var(--bg-color)' }}>
        {activeTab === 'overview' && (
          <div>
            <DashboardOverview />
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div>
            <WatchlistClient />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <AlertsClient />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <NotificationCenter />
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Account Information</h2>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</span>
                <span style={{ fontSize: '16px', fontWeight: 500 }}>{userEmail}</span>
              </div>
            </div>

            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Subscription</h2>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}><CreditCard size={18} /> Free Tier</span>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>You are currently on the free tier.</p>
              </div>
              {checkoutAvailable && <Link href="/pricing" style={{ background: 'var(--brand-color)', color: 'white', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                Upgrade to Pro
              </Link>}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
