'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRecentViews } from '../../src/services/recent-views'
import { useWorkspace } from '../../src/services/watchlist/use-workspace'
import { IndianEquityIdentity } from '../../src/domain/equity/types'
import { Clock, TrendingUp, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react'
import HomeMarketStatus from '../components/HomeMarketStatus'
import DashboardEvents from './components/DashboardEvents'

export default function DashboardOverview() {
  const { state } = useWorkspace()
  const [recentViews, setRecentViews] = useState<IndianEquityIdentity[]>([])
  
  useEffect(() => {
    setRecentViews(getRecentViews())
  }, [])

  const defaultList = state?.watchlists?.[0]
  const topWatched = defaultList?.items.slice(0, 4) || []
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Market Status Widget */}
      <section style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: 'var(--brand-color)' }} /> 
          Market Status
        </h2>
        <HomeMarketStatus />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Recently Viewed */}
        <section style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} style={{ color: 'var(--brand-color)' }} />
            Recently Viewed
          </h2>
          {recentViews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentViews.map(stock => (
                <Link 
                  key={stock.instrumentKey} 
                  href={`/stocks/${stock.exchange.toLowerCase()}/${stock.symbol}`}
                  style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--card-border)' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stock.symbol}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.companyName}</div>
                  </div>
                  <ExternalLink size={16} style={{ color: 'var(--text-tertiary)', alignSelf: 'center' }} />
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You haven&apos;t viewed any stocks recently.</p>
          )}
        </section>

        {/* Watchlist Highlights */}
        <section style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} style={{ color: 'var(--brand-color)' }} /> Watchlist Highlights</span>
          </h2>
          {topWatched.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topWatched.map(stock => (
                <Link 
                  key={stock.instrumentKey} 
                  href={`/stocks/${stock.exchange.toLowerCase()}/${stock.symbol}`}
                  style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--card-border)' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stock.symbol}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.companyName}</div>
                  </div>
                  <ExternalLink size={16} style={{ color: 'var(--text-tertiary)', alignSelf: 'center' }} />
                </Link>
              ))}
              <div style={{ marginTop: '8px' }}>
                 <span style={{ color: 'var(--brand-color)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                   View full watchlist <ArrowRight size={14} />
                 </span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Your watchlist is empty.</p>
          )}
        </section>
        
        {/* Active Alerts Summary */}
        <section style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--brand-color)' }} />
            Actionable Alerts
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Track significant price movements, volume spikes, or important events across your portfolio.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--brand-color)', fontSize: '14px', fontWeight: 500 }}>
            Manage your alerts <ArrowRight size={14} />
          </div>
        </section>

      </div>
      
      <DashboardEvents />
    </div>
  )
}
