import type { Metadata } from 'next'
import MFSchemeClient from './MFSchemeClient'

export function generateMetadata({ params }: { params: { schemeId: string } }): Metadata {
  return {
    title: `Mutual Fund Scheme - ${params.schemeId}`,
    description: `Detailed portfolio intelligence and scheme holdings for ${params.schemeId}.`,
    alternates: {
      canonical: `/mutual-funds/${params.schemeId}`,
    },
  }
}

export default function MutualFundSchemePage({ params }: { params: { schemeId: string } }) {
  return <MFSchemeClient schemeId={params.schemeId} />
}
