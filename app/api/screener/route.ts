import { NextResponse } from 'next/server';
import { screenerService } from '../../../src/services/research/ScreenerService';
import type { ScreenerQuery } from '../../../src/domain/screener/types';

export async function POST(request: Request) {
  try {
    const query = await request.json() as ScreenerQuery;
    
    // Add some validation here if needed
    if (!query || !Array.isArray(query.filters)) {
      return NextResponse.json({ error: 'Invalid query format' }, { status: 400 });
    }

    const result = await screenerService.screen(query);
    
    return NextResponse.json(result);
  } catch (err) {
    console.error('Screener API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
