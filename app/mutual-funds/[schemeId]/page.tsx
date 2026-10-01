import type { Metadata } from 'next'
import MFSchemeClient from './MFSchemeClient'

export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ schemeId: string }> }): Promise<Metadata> {
  const params = await paramsPromise
  return {
    title: `Mutual Fund Scheme - ${params.schemeId}`,
    description: `Detailed portfolio intelligence and scheme holdings for ${params.schemeId}.`,
    alternates: {
      canonical: `/mutual-funds/${params.schemeId}`,
    },
  }
}

export default async function MutualFundSchemePage({ params: paramsPromise }: { params: Promise<{ schemeId: string }> }) {
  const params = await paramsPromise
  return <MFSchemeClient schemeId={params.schemeId} />
}
