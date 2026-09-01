import { NextRequest, NextResponse } from "next/server";
import { getMarketDataProvider } from "../../../../src/services/market-data/market-data-service";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) { const key = request.nextUrl.searchParams.get("instrumentKey")?.trim(); if (!key) return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST", message: "Instrument key is required." } }, { status: 400 }); const result = await getMarketDataProvider().getCorporateActions(key); return NextResponse.json(result, { status: result.error ? 502 : 200, headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } }); }
