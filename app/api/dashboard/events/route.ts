import { NextResponse } from 'next/server'
import { authenticatedUser } from '../../../../src/lib/supabase/server'
import { getMarketDataProvider } from '../../../../src/services/market-data/market-data-service'
import { corporateEvents, indiaDate } from '../../../../src/domain/watchlist/events'

export async function GET() {
  const { user, client: db } = await authenticatedUser()
  if (!user || !db) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  try {
    const { data: watchlists, error: listError } = await db.from('watchlists').select('id').eq('user_id', user.id)
    if (listError) throw listError
    const watchlistIds = watchlists?.map(w => w.id) || []
    
    let items: Array<{instrument_key: string, symbol: string, company_name: string}> = []
    if (watchlistIds.length > 0) {
      const { data: wItems, error: itemsError } = await db.from('watchlist_items').select('instrument_key, symbol, company_name').in('watchlist_id', watchlistIds)
      if (itemsError) throw itemsError
      if (wItems) items = wItems
    }

    // Dedup by instrument key
    const uniqueItems = new Map(items.map(i => [i.instrument_key, i]))
    const keys = Array.from(uniqueItems.keys())

    // 2. Fetch Corporate Actions for these keys
    const upcomingEvents = []
    const dividends = []
    
    const today = indiaDate(new Date())

    for (const key of keys) {
      const result = await getMarketDataProvider().getCorporateActions(key)
      if (!result.data) continue
      
      const item = uniqueItems.get(key)
      
      for (const action of corporateEvents(key, result.data)) {
        // Only include future or recent events (e.g. exDate >= today)
        if (!action.exDate || action.exDate < today) continue
        
        const eventInfo = {
          symbol: item?.symbol,
          companyName: item?.company_name,
          instrumentKey: key,
          exchange: key.startsWith('BSE_') ? 'BSE' : 'NSE',
          type: action.type,
          exDate: action.exDate,
          description: action.description,
          amount: action.amount
        }
        
        upcomingEvents.push(eventInfo)
        if (action.type === 'dividend') {
          dividends.push(eventInfo)
        }
      }
    }
    
    // Sort by date ascending
    upcomingEvents.sort((a, b) => a.exDate.localeCompare(b.exDate))
    dividends.sort((a, b) => a.exDate.localeCompare(b.exDate))

    return NextResponse.json({
      data: {
        upcomingEvents: upcomingEvents.slice(0, 10), // Limit to 10
        dividends: dividends.slice(0, 10)
      }
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (err) {
    console.error('Failed to fetch dashboard events', err)
    return NextResponse.json({ error: { message: 'Failed to fetch events' } }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
