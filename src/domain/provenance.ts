import type { FinancialDataMetadata } from './financial-data';
import { availabilityFromDate } from './freshness';

export type DeliveryProvenance = { fetchedAt: string | null; cachedAt: string | null; delivery: 'provider' | 'cache' | 'unknown' };
export type FinancialProvenance = DeliveryProvenance & {
  observationTimestamp: string | null;
  status: 'LIVE' | 'RECENT' | 'DELAYED' | 'CACHED' | 'STALE' | 'UNAVAILABLE' | 'UNKNOWN';
  isStale: boolean;
  staleReason: string | null;
};
export const unknownDelivery: DeliveryProvenance = { fetchedAt: null, cachedAt: null, delivery: 'unknown' };
export function observationDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) || !Number.isFinite(Date.parse(value))) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const calendar = new Date(Date.UTC(year!, month! - 1, day!));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() + 1 !== month || calendar.getUTCDate() !== day) return null;
  return new Date(value).toISOString();
}
export function withProvenance<const T extends { asOf: string | null; availability: string }>(
  metadata: T, delivery: DeliveryProvenance = unknownDelivery, hasData = true, now = new Date(),
): T & FinancialProvenance {
  const parsed = observationDate(metadata.asOf);
  const observationTimestamp = parsed && Date.parse(parsed) <= now.getTime() + 60_000 ? parsed : null;
  const isStale = metadata.availability === 'stale' || (observationTimestamp !== null && availabilityFromDate(observationTimestamp, now) === 'stale');
  const agedLive = metadata.availability === 'live' && observationTimestamp !== null && now.getTime() - Date.parse(observationTimestamp) > 120_000;
  const status: FinancialProvenance['status'] = !hasData ? 'UNAVAILABLE' : isStale ? 'STALE' : delivery.delivery === 'cache' ? 'CACHED' : !observationTimestamp ? 'UNKNOWN' : agedLive ? 'DELAYED' : metadata.availability === 'live' ? 'LIVE' : metadata.availability === 'delayed' ? 'DELAYED' : 'RECENT';
  return { ...metadata, ...delivery, fetchedAt: observationDate(delivery.fetchedAt), cachedAt: observationDate(delivery.cachedAt), asOf: observationTimestamp, observationTimestamp, status, isStale,
    availability: isStale ? 'stale' : !observationTimestamp ? 'unavailable' : agedLive ? 'delayed' : status === 'CACHED' && metadata.availability === 'live' ? 'recent' : metadata.availability,
    staleReason: isStale ? 'Last verified observation may be outdated.' : null };
}
export function aggregateProvenance(items: FinancialDataMetadata[], source: string): FinancialDataMetadata {
  const dates = items.map(item => observationDate(item.observationTimestamp ?? item.asOf));
  // An aggregate cannot claim a timestamp when any constituent is undated.
  const asOf = dates.length && dates.every(Boolean) ? dates.sort()[0]! : null;
  const oldest = (values: Array<string | null | undefined>) => values.length && values.every(Boolean) ? [...values as string[]].sort()[0]! : null;
  const delivery: DeliveryProvenance = { delivery: items.some(x => x.delivery === 'cache') ? 'cache' : items.every(x => x.delivery === 'provider') ? 'provider' : 'unknown', fetchedAt: oldest(items.map(x => x.fetchedAt)), cachedAt: oldest(items.filter(x => x.delivery === 'cache').map(x => x.cachedAt)) };
  const availability = items.some(x => x.isStale || x.availability === 'stale') ? 'stale' : items.every(x => x.availability === 'live') ? 'live' : asOf ? availabilityFromDate(asOf) === 'live' ? 'recent' : availabilityFromDate(asOf) : 'unavailable';
  return withProvenance({ source, asOf, availability, generatedAt: new Date().toISOString(), quality: 'unknown' }, delivery, items.length > 0) as FinancialDataMetadata;
}
