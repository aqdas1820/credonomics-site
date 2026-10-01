'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import Link from 'next/link'
import { loadNotifications, persistNotificationRead, notificationHref, type AlertNotificationView } from '../../src/services/alerts/notification-client'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AlertNotificationView[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    loadNotifications(controller.signal).then(result => {
      if (!controller.signal.aborted) { setNotifications(result.data); setUnreadCount(result.unreadCount) }
    }).catch(() => { if (!controller.signal.aborted) setError('Notifications could not be loaded. Please reload to retry.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const markRead = async (id?: string) => {
    if (saving) return
    setSaving(true); setError('')
    try {
      const result = await persistNotificationRead(id ? { notificationIds: [id] } : { markAllRead: true })
      setNotifications(result.data); setUnreadCount(result.unreadCount)
    } catch { setError('Could not confirm the notification update. Please reload and try again.') }
    finally { setSaving(false) }
  }

  if (loading) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading notifications...</div>
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <p role="alert">{error}</p>}
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={24} style={{ color: 'var(--brand-color)' }} />
            Notifications
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            disabled={saving} onClick={() => void markRead()}
            style={{ padding: '8px 16px', background: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </header>

      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div 
              key={n.id} 
              style={{ 
                padding: '16px', 
                background: 'var(--card-bg)', 
                borderRadius: '8px', 
                border: `1px solid ${n.read_at ? 'var(--card-border)' : 'var(--brand-color)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                opacity: n.read_at ? 0.7 : 1
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{notificationHref(n) ? <Link href={notificationHref(n)!}>{n.title}</Link> : n.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>{n.message}</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  {new Date(n.created_at).toLocaleString()} • {n.channel}
                </div>
              </div>
              {!n.read_at && (
                <button 
                  disabled={saving} onClick={() => void markRead(n.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-color)', cursor: 'pointer', alignSelf: 'flex-start' }}
                  title="Mark as read"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : error ? null : (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
          <Bell size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>You&apos;re all caught up!</h3>
          <p>No new notifications at the moment.</p>
        </div>
      )}
    </div>
  )
}
