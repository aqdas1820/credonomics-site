import type { Metadata } from 'next'
import SiteFrame from '../../components/SiteFrame'
import ResearchWatchBrief from '../../components/ResearchWatchBrief'
export const metadata: Metadata = {
  title: 'November 2026 Research Updates: Consumer Action Dates',
  description: 'November publications and updated consumer-finance guides, with official sources, verification dates and limits.',
  alternates: { canonical: '/updates/2026-11' },
}
export default function NovemberUpdates() {
  return <SiteFrame><header style={{width:'min(1240px,calc(100% - 48px))',margin:'40px auto 0'}}><p>CredoNomics Research Desk</p><h1>November 2026 research bulletin</h1><p>Publications and guide updates checked in November. Each guide distinguishes its publication, verification and action dates.</p><a href="/updates/2026-10">October research bulletin →</a></header><ResearchWatchBrief month="2026-11"/></SiteFrame>
}
