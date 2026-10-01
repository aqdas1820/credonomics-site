import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { authenticatedUser } from '../../../src/lib/supabase/server'
import { rateLimit } from '../../../src/services/server/rate-limit'

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }
  // Enable only after subscription fulfillment and entitlements are deployed.
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  const price = process.env.STRIPE_PRICE_ID?.trim()
  if (process.env.STRIPE_CHECKOUT_ENABLED !== 'true' || !key || !price) {
    return NextResponse.json({ error: 'Subscriptions are temporarily unavailable.' }, { status: 503 })
  }
  try {
    const { client, user } = await authenticatedUser()
    if (!client) return NextResponse.json({ error: 'Authentication is unavailable.' }, { status: 503 })
    if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })
    if (!rateLimit(`checkout:${user.id}`, 5)) return NextResponse.json({ error: 'Please wait before trying again.' }, { status: 429 })
    const stripe = new Stripe(key, { timeout: 10_000, maxNetworkRetries: 1 })
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      line_items: [{ price, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    })
    if (!session.url) throw new Error('Missing checkout URL')
    return NextResponse.json({ url: session.url }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to start checkout. Please try again later.' }, { status: 503 })
  }
}
