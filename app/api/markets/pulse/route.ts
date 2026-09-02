import { NextResponse } from 'next/server'
import { getIndianMarketSession, marketOverviewCacheControl } from '../../../../src/domain/market/session'
import { getMarketPulse } from '../../../../src/services/market-data/market-pulse-service'
export const dynamic='force-dynamic'
export async function GET(){try{return NextResponse.json({data:await getMarketPulse(),metadata:{source:'Market data',availability:getIndianMarketSession()==='OPEN'?'live':'recent'}},{headers:{'Cache-Control':marketOverviewCacheControl(getIndianMarketSession())}})}catch{return NextResponse.json({data:null,error:{code:'DATA_UNAVAILABLE',message:'Market intelligence is temporarily unavailable.'}},{status:503,headers:{'Cache-Control':'no-store'}})}}
