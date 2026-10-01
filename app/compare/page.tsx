import type { Metadata } from 'next';
import SiteFrame from '../components/SiteFrame';
import UniversalCompareClient from './UniversalCompareClient';

export const metadata: Metadata = {
  title: 'Compare Financial Entities',
  description: 'Compare Indian equities and mutual funds across unified factual dimensions. Head-to-head research workspace.',
  alternates: { canonical: '/compare' },
};

export default function ComparePage() {
  return (
    <SiteFrame>
      <UniversalCompareClient />
    </SiteFrame>
  );
}
