import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadNotifications, notificationHref, persistNotificationRead, type AlertNotificationView } from '../../src/services/alerts/notification-client'
const fetchMock = vi.fn()
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })
describe('notification confirmation (no live services)', () => {
  it.each([401,403,429,500,502,503])('rejects HTTP %s before refreshing or claiming read state', async status => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status }))
    await expect(persistNotificationRead({ notificationIds: ['fixture'] })).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('rejects a false persistence confirmation even on HTTP 200', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: false })))
    await expect(persistNotificationRead({ markAllRead: true })).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('returns only persisted read timestamps after successful save and reload', async () => {
    const persisted = { data: [{ id: 'fixture', read_at: '2026-09-30T00:00:00Z' }], unreadCount: 0 }
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: true }))).mockResolvedValueOnce(new Response(JSON.stringify(persisted)))
    expect(await persistNotificationRead({ markAllRead: true })).toEqual(persisted)
  })
  it('malformed response never becomes a misleading empty state', async () => { fetchMock.mockResolvedValue(new Response('{')); await expect(loadNotifications()).rejects.toThrow() })
  it('network rejection never reports read success', async () => { fetchMock.mockRejectedValue(new Error('timeout')); await expect(persistNotificationRead({ markAllRead: true })).rejects.toThrow('timeout') })
  it('routes to the correct exchange/entity, encoding user-controlled paths', () => {
    expect(notificationHref({ alerts: { entity_type: 'STOCK', exchange: 'BSE', symbol: 'A/B', instrument_key: 'x' } } as AlertNotificationView)).toBe('/stocks/bse/A%2FB')
    expect(notificationHref({ alerts: { entity_type: 'IPO', instrument_key: 'example' } } as AlertNotificationView)).toBe('/ipo/example')
    expect(notificationHref({} as AlertNotificationView)).toBeNull()
  })
})
