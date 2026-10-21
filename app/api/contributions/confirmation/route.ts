import { createContributionHandlers } from '../../../../src/lib/server/youpi-contributions'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const GET = createContributionHandlers().confirmation
