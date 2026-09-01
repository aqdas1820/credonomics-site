import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import MFPortfolioClient from "./MFPortfolioClient";
import { parseFinancialData } from "../../../src/schemas/financial";
import { mutualFundIndexSchema } from "../../../src/schemas/mutual-fund";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Mutual Fund Portfolio Intelligence | CredoNomics",
  description:
    "Track selected HDFC active-equity fund holdings, consensus ownership, accumulation, exits, sector rotation and monthly portfolio changes.",
  alternates: { canonical: "/tools/mf-portfolio-tracker" },
};

type JsonValue = Record<string, unknown>;

function readJson(relativePath: string, fallback: JsonValue): JsonValue {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "mf-intelligence",
      "v2",
      relativePath
    );
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

export default function MFPortfolioTrackerPage() {
  const rawIndex = readJson("index.json", {
    version: 2,
    months: [],
    schemes: [],
    presentCoreSchemes: [],
    missingCoreSchemes: [],
    counts: {},
    qualityAudit: {},
  });
  const index = parseFinancialData(mutualFundIndexSchema, rawIndex, "mutual-fund production index");

  const latest = readJson("latest.json", {
    latestMonth: null,
    previousMonth: null,
    summary: {},
    topConsensus: [],
    signals: {},
    sectorRotation: [],
    ownershipMatrix: [],
  });

  const latestMonth = String(latest.latestMonth ?? index.latestMonth ?? "");
  const previousMonth = String(latest.previousMonth ?? "");

  const currentPayload = latestMonth
    ? readJson(`by-month/${latestMonth}.json`, {
        month: latestMonth,
        schemes: [],
        holdings: [],
      })
    : { month: "", schemes: [], holdings: [] };

  const previousPayload = previousMonth
    ? readJson(`by-month/${previousMonth}.json`, {
        month: previousMonth,
        schemes: [],
        holdings: [],
      })
    : { month: "", schemes: [], holdings: [] };

  return (
    <MFPortfolioClient
      initialIndex={index}
      initialLatest={latest}
      initialCurrent={
        currentPayload as Parameters<typeof MFPortfolioClient>[0]["initialCurrent"]
      }
      initialPrevious={
        previousPayload as Parameters<typeof MFPortfolioClient>[0]["initialPrevious"]
      }
    />
  );
}
