import { fetchJson } from '../../lib/client-json'
export type AlertNotificationView = {
  id: string; title: string; message: string; created_at: string; read_at: string | null; channel: string
  alerts?: { entity_type: string; instrument_key: string; exchange: string; symbol: string } | null
}
export async function loadNotifications(signal?: AbortSignal) {
  const result = await fetchJson<{ data: AlertNotificationView[]; unreadCount: number }>('/api/notifications', { signal })
  if (!Array.isArray(result.data) || !Number.isInteger(result.unreadCount) || result.unreadCount < 0) throw new Error('Invalid notification response.')
  return result
}
export async function persistNotificationRead(body: { markAllRead: true } | { notificationIds: string[] }) {
  const result = await fetchJson<{ success: boolean }>('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (result.success !== true) throw new Error('Could not mark notifications as read.')
  return loadNotifications()
}
export function notificationHref(n: AlertNotificationView): string | null {
  const a = n.alerts
  if (a?.entity_type === 'STOCK' && ['NSE', 'BSE'].includes(a.exchange) && a.symbol) return `/stocks/${a.exchange.toLowerCase()}/${encodeURIComponent(a.symbol)}`
  if (a?.entity_type === 'IPO' && a.instrument_key) return `/ipo/${encodeURIComponent(a.instrument_key)}`
  return null
}
