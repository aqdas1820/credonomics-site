"use client";
import { useEffect, useState } from 'react';
import type { FinancialProvenance } from '../../src/domain/provenance';
import { withProvenance, unknownDelivery } from '../../src/domain/provenance';
type Props = { metadata: Partial<FinancialProvenance> & { source?: string; asOf?: string | null; availability?: string; reportingPeriod?: string | null }; hasData?: boolean };
export default function DataFreshness({ metadata, hasData = true }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(timer); }, []);
  const value = withProvenance({ ...metadata, asOf: metadata.observationTimestamp !== undefined ? metadata.observationTimestamp : metadata.asOf ?? null, availability: metadata.availability ?? 'unavailable' }, { ...unknownDelivery, fetchedAt: metadata.fetchedAt ?? null, cachedAt: metadata.cachedAt ?? null, delivery: metadata.delivery ?? 'unknown' }, hasData, now);
  const labels = { LIVE: 'Live', RECENT: 'Recent', DELAYED: 'Delayed', CACHED: 'Cached', STALE: 'Stale', UNAVAILABLE: 'Temporarily unavailable', UNKNOWN: 'Observation time unknown' };
  const date = (value: string) => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return <small data-freshness={value.status.toLowerCase()}>
    {metadata.reportingPeriod ? `Reporting Period: ${metadata.reportingPeriod}` : labels[value.status]}
    {value.observationTimestamp ? <> | Data as of <time dateTime={value.observationTimestamp}>{date(value.observationTimestamp)} IST</time></> : hasData && value.status === 'CACHED' && !metadata.reportingPeriod ? ' | Observation time unknown' : null}
    {value.delivery === 'cache' && value.cachedAt ? <> | Cached {date(value.cachedAt)} IST</> : null}
    {value.isStale ? ' | Data may be outdated' : null}
    {metadata.source ? <> | Source: {metadata.source}</> : null}
  </small>;
}
