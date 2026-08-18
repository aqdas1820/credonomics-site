import { NextResponse } from 'next/server'
import {
  getIpoDetailIndex,
} from '../../ipo/lib/ipo-detail-normalizer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const issues = getIpoDetailIndex()

  return NextResponse.json(
    {
      count: issues.length,
      issues,
    },
    {
      headers: {
        'Cache-Control':
          'no-store, max-age=0',
      },
    },
  )
}