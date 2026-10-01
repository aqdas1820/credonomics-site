import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser } from '../../../src/lib/supabase/server'
import { assertSupabaseWritesAllowed } from '../../../src/lib/supabase/mutation-safety'

export async function GET() {
  const { user, client: db } = await authenticatedUser()
  if (!user || !db) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  try {
    const { data, error } = await db
      .from('notifications')
      .select('id,title,message,created_at,read_at,channel,alerts(instrument_key,symbol,exchange,entity_type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(50)

    if (error) throw error
    const { count, error: countError } = await db.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null)
    if (countError || count === null) throw countError ?? new Error('Count unavailable')
    return NextResponse.json({ data, unreadCount: count }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: { message: 'Failed to fetch notifications' } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { user, client: db } = await authenticatedUser()
  if (!user || !db) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  try {
    assertSupabaseWritesAllowed()
    
    const body = await request.json()
    const { notificationIds, markAllRead } = body

    if (markAllRead === true) {
      const { error } = await db
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)
      if (error) throw error
    } else if (Array.isArray(notificationIds) && notificationIds.length > 0 && notificationIds.length <= 50 && notificationIds.every(id => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id))) {
      const { error } = await db
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('id', notificationIds)
      if (error) throw error
    } else return NextResponse.json({ error: { message: 'Invalid notification update' } }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: { message: 'Failed to update notifications' } }, { status: 500 })
  }
}
