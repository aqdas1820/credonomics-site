import type { NextRequest } from 'next/server'
import { handleArchivedDocument } from '../../../../../../../../src/lib/billing/document-handler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string; kind: string }> }) => handleArchivedDocument(request, await params)
export const POST = GET
