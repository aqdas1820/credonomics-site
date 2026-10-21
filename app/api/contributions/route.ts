import { createContributionHandlers } from '../../../src/lib/server/youpi-contributions'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const handlers = createContributionHandlers()
export const GET = handlers.GET
export const POST = handlers.POST
