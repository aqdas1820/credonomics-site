import { NextResponse } from 'next/server'
import { previewWritesBlocked } from '../../../../src/lib/supabase/mutation-safety'
export const dynamic = 'force-dynamic'
export function GET() {
  const mutationsAllowed = !previewWritesBlocked()
  // Preview operators can verify the server's destination without retrieving keys.
  // Only validated, non-secret identifiers are returned; Production keeps its contract.
  const ref = process.env.SUPABASE_STAGING_PROJECT_REF?.trim()
  let hostname: string | null = null
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    if (/^[a-z]{20}\.supabase\.co$/.test(url.hostname)) hostname = url.hostname
  } catch { /* Invalid configuration remains locked and is never echoed. */ }
  const previewIdentity = process.env.VERCEL_ENV === 'preview' ? {
    environment: 'preview',
    backend: process.env.SUPABASE_BACKEND_ENV === 'staging' ? 'staging' : 'unverified',
    projectRef: ref && /^[a-z]{20}$/.test(ref) ? ref : null,
    hostname,
  } : undefined
  return NextResponse.json({ mutationsAllowed, ...(previewIdentity ? { previewIdentity } : {}) }, { headers: { 'Cache-Control': 'no-store' } })
}
