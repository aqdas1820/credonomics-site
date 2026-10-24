import type { Metadata } from 'next'
import SiteFrame from '../../components/SiteFrame'
import MonthlyResearchBrief from '../../components/MonthlyResearchBrief'
import ResearchWatchBrief from '../../components/ResearchWatchBrief'

export const metadata: Metadata = {
  title: 'October 2026 Research Updates: Card Changes & Portfolio Disclosures',
  description: 'Official issuer changes, corrected credit-card rankings and September portfolio disclosures reviewed by CredoNomics in October 2026, with effective dates and sources.',
  alternates: { canonical: '/updates/2026-10' },
}

export default function OctoberUpdates() {
  return <SiteFrame><header style={{width:'min(1240px,calc(100% - 48px))',margin:'40px auto 0'}}><p>CredoNomics Research Desk</p><h1>October 2026 research bulletin</h1><p>Baseline checked 23 October 2026; selected Research Watch notices checked 24 October 2026.</p></header><ResearchWatchBrief/><MonthlyResearchBrief /></SiteFrame>
}
