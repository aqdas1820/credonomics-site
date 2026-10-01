'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, Info } from 'lucide-react'
import Link from 'next/link'
import { fetchJson } from '../../../src/lib/client-json'
import { formatINR } from '../../../src/lib/financial-format'

type EventType = {
  exchange: string
  symbol: string
  companyName: string
  instrumentKey: string
  type: string
  exDate: string
  description: string
  amount: number | null
}

export default function DashboardEvents() {
  const [events, setEvents] = useState<EventType[]>([])
  const [dividends, setDividends] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    fetchJson<{ data: { upcomingEvents: EventType[]; dividends: EventType[] } }>('/api/dashboard/events', { signal: controller.signal })
      .then(data => {
        if (!controller.signal.aborted && data?.data && Array.isArray(data.data.upcomingEvents) && Array.isArray(data.data.dividends)) {
          setEvents(data.data.upcomingEvents)
          setDividends(data.data.dividends)
        } else if (!controller.signal.aborted) throw new Error()
      })
      .catch(() => { if (!controller.signal.aborted) setError('Personalized events could not be loaded. Please reload to retry.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  if (loading) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading personalized events...</div>
  }

  if (error) return <p role="alert">{error}</p>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
      
      {/* Upcoming Events Module */}
      <section style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: 'var(--brand-color)' }} />
          Upcoming Events
        </h2>
        {events.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((ev, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Link href={`/stocks/${ev.exchange.toLowerCase()}/${encodeURIComponent(ev.symbol)}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                    {ev.symbol}
                  </Link>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ex: {ev.exDate}</span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{ev.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <Info size={16} />
            <p>No upcoming events for the companies in your watchlists.</p>
          </div>
        )}
      </section>

      {/* Dividend Calendar */}
      <section style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: 'var(--brand-color)' }} />
          Dividend Calendar
        </h2>
        {dividends.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dividends.map((ev, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Link href={`/stocks/${ev.exchange.toLowerCase()}/${encodeURIComponent(ev.symbol)}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'block' }}>
                    {ev.symbol}
                  </Link>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ex-Date: {ev.exDate}</span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--brand-color)' }}>
                  {formatINR(ev.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <Info size={16} />
            <p>No upcoming dividends for the companies in your watchlists.</p>
          </div>
        )}
      </section>

    </div>
  )
}
