import {
  NextRequest,
  NextResponse,
} from 'next/server'
import {
  getIpoDetailBySlug,
} from '../../../ipo/lib/ipo-detail-normalizer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { slug } = await context.params
  const detail = getIpoDetailBySlug(slug)

  if (!detail) {
    return NextResponse.json(
      {
        error: 'IPO not found',
        slug,
      },
      {
        status: 404,
        headers: {
          'Cache-Control':
            'no-store, max-age=0',
        },
      },
    )
  }

  return NextResponse.json(
    detail,
    {
      headers: {
        'Cache-Control':
          'no-store, max-age=0',
      },
    },
  )
}