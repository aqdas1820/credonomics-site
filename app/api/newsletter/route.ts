import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { rateLimit } from '../../../src/services/server/rate-limit'

const subscription = z.object({ email: z.string().trim().email().max(254) })
export async function POST(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }
  const body = subscription.safeParse(await request.json().catch(() => null))
  if (!body.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  const key = process.env.RESEND_API_KEY?.trim()
  const segment = process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim()
  if (!key || !segment) return NextResponse.json({ error: 'Newsletter subscriptions are temporarily unavailable.' }, { status: 503 })
  if (!rateLimit('newsletter', 20) || !rateLimit(`newsletter:${body.data.email.toLowerCase()}`, 2, 3_600_000)) {
    return NextResponse.json({ error: 'Please wait before subscribing again.' }, { status: 429 })
  }
  try {
    const resend = new Resend(key)
    const { error } = await resend.contacts.create({ email: body.data.email, segments: [{ id: segment }] })
    if (error) throw new Error('Subscription failed')
    return NextResponse.json({ success: true, message: 'Subscribed successfully.' })
  } catch {
    return NextResponse.json({ error: 'Unable to subscribe. Please try again later.' }, { status: 503 })
  }
}
