export type TrackedInstrument = { instrumentKey: string; symbol: string; exchange: 'NSE' | 'BSE'; companyName: string }
export type Watchlist = { id: string; ownerId: string; name: string; items: Array<TrackedInstrument & { addedAt: string }>; createdAt: string; order: number }
export type AlertType = 'price_above' | 'price_below' | 'percent_rise' | 'percent_fall' | '52_week_high' | '52_week_low' | 'volume_spike'
export type AlertStatus = 'active' | 'paused' | 'triggered'
export type PriceAlert = TrackedInstrument & { id: string; ownerId: string; type: AlertType; threshold: number | null; status: AlertStatus; createdAt: string; triggeredAt: string | null }
export type AlertNotification = { id: string; ownerId: string; alertId: string; title: string; message: string; createdAt: string; readAt: string | null }
export type WatchlistState = { version: 1; ownerId: string; watchlists: Watchlist[]; alerts: PriceAlert[]; notifications: AlertNotification[] }
