import type { Metadata } from "next";
import StockSearchClient from "./StockSearchClient";

export const metadata: Metadata = {
  title: "Indian Stock Search",
  description: "Search verified Indian listed-company records by company, NSE symbol, BSE code or ISIN when a market-data provider is connected.",
  alternates: { canonical: "/stocks/search" },
  openGraph: { title: "Indian Stock Search | CredoNomics", description: "Provider-ready Indian equity search with explicit data availability.", url: "/stocks/search" },
};

export default function StockSearchPage() {
  return <StockSearchClient />;
}
