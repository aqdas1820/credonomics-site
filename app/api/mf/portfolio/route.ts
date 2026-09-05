import { NextRequest, NextResponse } from "next/server";
import type { MFPortfolioData } from "../../../../src/domain/mf/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isin = request.nextUrl.searchParams.get("isin") ?? "INF000000000";

  const mockData: MFPortfolioData = {
    identity: {
      isin,
      schemeName: "CredoNomics Alpha Equity Fund",
      amc: "CredoNomics Asset Management",
      category: "Equity: Large & MidCap"
    },
    asOfDate: new Date().toISOString(),
    concentration: {
      top5Weight: 38.5,
      top10Weight: 55.2,
      totalHoldings: 45
    },
    sectors: [
      { sector: "Financial Services", weight: 32.4, differenceToBenchmark: 2.1 },
      { sector: "Information Technology", weight: 15.8, differenceToBenchmark: -1.5 },
      { sector: "Consumer Goods", weight: 12.1, differenceToBenchmark: 0.8 },
      { sector: "Automobile", weight: 8.5, differenceToBenchmark: 3.2 },
      { sector: "Healthcare", weight: 6.2, differenceToBenchmark: -0.5 }
    ],
    holdings: [
      { instrumentName: "HDFC Bank Ltd.", instrumentType: "Equity", weight: 9.2, sector: "Financial Services" },
      { instrumentName: "Reliance Industries Ltd.", instrumentType: "Equity", weight: 8.5, sector: "Oil & Gas" },
      { instrumentName: "ICICI Bank Ltd.", instrumentType: "Equity", weight: 7.8, sector: "Financial Services" },
      { instrumentName: "Infosys Ltd.", instrumentType: "Equity", weight: 6.9, sector: "Information Technology" },
      { instrumentName: "Larsen & Toubro Ltd.", instrumentType: "Equity", weight: 6.1, sector: "Capital Goods" },
      { instrumentName: "TCS Ltd.", instrumentType: "Equity", weight: 5.5, sector: "Information Technology" },
      { instrumentName: "ITC Ltd.", instrumentType: "Equity", weight: 4.8, sector: "Consumer Goods" },
      { instrumentName: "Bharti Airtel Ltd.", instrumentType: "Equity", weight: 3.9, sector: "Telecommunication" },
      { instrumentName: "State Bank of India", instrumentType: "Equity", weight: 3.4, sector: "Financial Services" },
      { instrumentName: "Kotak Mahindra Bank Ltd.", instrumentType: "Equity", weight: 3.1, sector: "Financial Services" },
    ]
  };

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  return NextResponse.json(
    { data: mockData, metadata: { generatedAt: new Date().toISOString() }, error: null },
    { status: 200 }
  );
}
