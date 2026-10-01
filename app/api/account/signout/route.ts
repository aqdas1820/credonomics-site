import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../src/lib/supabase/server'
export async function POST() {
  try {
    const client = await createSupabaseServerClient()
    if (client) { const { error } = await client.auth.signOut(); if (error) throw error }
    return NextResponse.json({ data: { signedOut: true } }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: { message: 'Unable to sign out. Please try again.' } }, { status: 503 })
  }
}
