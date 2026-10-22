import { NextRequest, NextResponse } from "next/server";
import { getMarketDataProvider } from "../../../../src/services/market-data/market-data-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length > 100 || /[\u0000-\u001f\u007f]/.test(query)) {
    return NextResponse.json({ results: [], error: { code: "INVALID_QUERY", message: "Search must be at most 100 characters." } }, {
      status: 400, headers: { "Cache-Control": "no-store" },
    });
  }
  if (query.length < 2) {
    return NextResponse.json({ results: [], error: null }, { status: 200 });
  }

  const result = await getMarketDataProvider().searchStocks(query);
  return NextResponse.json(
    { results: result.data ?? [], metadata: result.metadata, error: result.error ?? null },
    {
      status: result.error?.code === "PROVIDER_NOT_CONFIGURED" ? 503 : 200,
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    },
  );
}
