'use client'
import type { AlertNotification, PriceAlert, TrackedInstrument, WatchlistState } from '../../domain/watchlist/types'

const KEY = 'credonomics-watchlists-v1'
export const WATCHLIST_EVENT = 'credonomics-watchlists-change'
const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
const initial = (): WatchlistState => { const now = new Date().toISOString(); return { version: 1, ownerId: `anonymous:${id()}`, watchlists: [{ id: id(), ownerId: 'anonymous', name: 'My Watchlist', items: [], createdAt: now, order: 0 }], alerts: [], notifications: [] } }

export function loadWatchlistState(): WatchlistState {
  try { const parsed = JSON.parse(localStorage.getItem(KEY) ?? '') as WatchlistState; if (parsed?.version === 1 && typeof parsed.ownerId === 'string' && Array.isArray(parsed.watchlists) && parsed.watchlists.length > 0 && parsed.watchlists.every(list => list && typeof list.id === 'string' && typeof list.name === 'string' && Array.isArray(list.items)) && Array.isArray(parsed.alerts) && Array.isArray(parsed.notifications)) return parsed } catch {}
  const state = initial(); state.watchlists[0]!.ownerId = state.ownerId; saveWatchlistState(state); return state
}
export function saveWatchlistState(state: WatchlistState) { localStorage.setItem(KEY, JSON.stringify(state)); window.dispatchEvent(new Event(WATCHLIST_EVENT)) }
export function createList(state: WatchlistState, name: string) { const clean = name.trim().slice(0, 40); if (!clean) return state; return { ...state, watchlists: [...state.watchlists, { id: id(), ownerId: state.ownerId, name: clean, items: [], createdAt: new Date().toISOString(), order: state.watchlists.length }] } }
export function addItem(state: WatchlistState, listId: string, stock: TrackedInstrument) { return { ...state, watchlists: state.watchlists.map((list) => list.id !== listId || list.items.some((item) => item.instrumentKey === stock.instrumentKey) ? list : { ...list, items: [...list.items, { ...stock, addedAt: new Date().toISOString() }] }) } }
export function removeItem(state: WatchlistState, listId: string, key: string) { return { ...state, watchlists: state.watchlists.map((list) => list.id === listId ? { ...list, items: list.items.filter((item) => item.instrumentKey !== key) } : list) } }
export function createAlert(state: WatchlistState, input: Omit<PriceAlert, 'id' | 'ownerId' | 'createdAt' | 'triggeredAt' | 'status'>) { const alert: PriceAlert = { ...input, id: id(), ownerId: state.ownerId, createdAt: new Date().toISOString(), triggeredAt: null, status: 'active' }; return { ...state, alerts: [...state.alerts, alert] } }
export function notificationFor(alert: PriceAlert, message: string): AlertNotification { return { id: id(), ownerId: alert.ownerId, alertId: alert.id, title: `${alert.symbol} alert triggered`, message, createdAt: new Date().toISOString(), readAt: null } }
