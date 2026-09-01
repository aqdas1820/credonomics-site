"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FinancialDataState } from "../../components/FinancialDataState";

type Holding = {
  amc: string;
  scheme: string;
  category?: string;
  month: string;
  securityId: string;
  slug: string;
  isin?: string | null;
  stock: string;
  sector: string;
  weight: number;
  quality?: string;
  sourcePdf?: string;
};

type MonthPayload = {
  month: string;
  schemes: string[];
  holdings: Holding[];
};

type SchemeItem = {
  scheme: string;
  category: string;
  slug: string;
};

type IndexData = {
  version?: number;
  months?: string[];
  firstMonth?: string;
  latestMonth?: string;
  schemes?: SchemeItem[];
  presentCoreSchemes?: string[];
  missingCoreSchemes?: string[];
  counts?: {
    holdings?: number;
    stocks?: number;
    schemes?: number;
    amcs?: number;
  };
  qualityAudit?: {
    repairedCompanyRows?: number;
    droppedSuspiciousFragments?: number;
    explicitCoreEquityRecoveries?: number;
    isinCoveragePct?: number;
    highSnapshots?: number;
    mediumSnapshots?: number;
    reviewSnapshotsExcluded?: number;
  };
  metadata?: {
    source: string;
    sourceFile: string;
    asOf: string;
    generatedAt: string;
    quality: "VERIFIED" | "VALIDATED_WITH_WARNINGS" | "PARTIAL" | "STALE" | "INVALID";
    availability: "available" | "partial" | "stale" | "unavailable";
  };
};

type Signal = {
  securityId: string;
  slug: string;
  stock: string;
  sector: string;
  currentSchemeCount?: number;
  previousSchemeCount?: number;
  currentWeight?: number;
  previousWeight?: number;
  change?: number;
  change3m?: number;
  increaseCount?: number;
  decreaseCount?: number;
  newSchemeCount?: number;
};

type LatestData = {
  latestMonth?: string | null;
  previousMonth?: string | null;
  summary?: Record<string, number>;
  scoreMethod?: Record<string, number>;
  topConsensus?: Array<
    Signal & {
      schemeCount?: number;
      normalizedWeight?: number;
      score?: number;
      trend3m?: number;
      persistence6m?: number;
      weights?: Record<string, number>;
    }
  >;
  signals?: {
    broadAccumulation?: Signal[];
    newConsensus?: Signal[];
    sustained3m?: Signal[];
    broadReduction?: Signal[];
    exits?: Signal[];
  };
  sectorRotation?: Array<{
    sector: string;
    current: number;
    previous: number;
    change: number;
  }>;
  ownershipMatrix?: Array<{
    securityId: string;
    slug: string;
    stock: string;
    sector: string;
    score: number;
    weights: Record<string, number>;
  }>;
};

type SecurityDetail = {
  securityId: string;
  slug: string;
  isin?: string;
  stock: string;
  sector: string;
  firstTracked: string;
  latestTracked: string;
  monthsTracked: number;
  maxSchemeCount: number;
  peakNormalizedWeight: number;
  latestSchemeWeights: Array<{
    scheme: string;
    weight: number;
    quality?: string;
  }>;
  monthlyHistory: Array<{
    month: string;
    schemeCount: number;
    totalWeight: number;
    normalizedWeight: number;
    avgHeldWeight: number;
  }>;
  schemeHistory: Array<{
    scheme: string;
    history: Array<{
      month: string;
      weight: number;
      quality?: string;
    }>;
  }>;
  sources: Array<{
    month: string;
    pdfs: string[];
  }>;
};

type Aggregate = {
  id: string;
  slug: string;
  stock: string;
  sector: string;
  schemes: Set<string>;
  weights: Map<string, number>;
  totalWeight: number;
  schemeCount: number;
  normalizedWeight: number;
  avgHeldWeight: number;
};

type Props = {
  initialIndex: IndexData;
  initialLatest: LatestData;
  initialCurrent: MonthPayload;
  initialPrevious: MonthPayload;
};

const DATA_ROOT = "/data/mf-intelligence/v2";

function humanMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function pct(value: number, digits = 2) {
  return `${Number(value || 0).toFixed(digits)}%`;
}

function delta(value: number) {
  const n = Number(value || 0);
  if (n > 0) return `+${n.toFixed(2)} pp`;
  if (n < 0) return `${n.toFixed(2)} pp`;
  return "0.00 pp";
}

function monthIndex(months: string[], month: string) {
  return months.indexOf(month);
}

function compareMonth(months: string[], current: string, period: string) {
  const idx = monthIndex(months, current);
  if (idx < 0) return current;

  const step = Number(period.replace("M", "")) || 1;
  return months[Math.max(0, idx - step)] ?? current;
}

function downloadCsv(
  filename: string,
  rows: Record<string, string | number>[]
) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function aggregate(
  rows: Holding[],
  selectedScheme: string,
  selectedSector: string
): Map<string, Aggregate> {
  const filtered = rows.filter((row) => {
    if (selectedScheme !== "All Core Schemes" && row.scheme !== selectedScheme) {
      return false;
    }
    if (selectedSector !== "All Sectors" && row.sector !== selectedSector) {
      return false;
    }
    return true;
  });

  const liveSchemeCount = Math.max(
    new Set(filtered.map((row) => row.scheme)).size,
    1
  );

  const map = new Map<
    string,
    {
      id: string;
      slug: string;
      stock: string;
      sector: string;
      schemes: Set<string>;
      weights: Map<string, number>;
      totalWeight: number;
    }
  >();

  filtered.forEach((row) => {
    const existing = map.get(row.securityId) ?? {
      id: row.securityId,
      slug: row.slug,
      stock: row.stock,
      sector: row.sector,
      schemes: new Set<string>(),
      weights: new Map<string, number>(),
      totalWeight: 0,
    };

    existing.schemes.add(row.scheme);
    existing.weights.set(row.scheme, row.weight);
    existing.totalWeight += row.weight;

    if (row.stock.length > existing.stock.length) existing.stock = row.stock;
    if (existing.sector === "Unclassified" && row.sector) {
      existing.sector = row.sector;
    }

    map.set(row.securityId, existing);
  });

  const out = new Map<string, Aggregate>();

  map.forEach((item, id) => {
    const schemeCount = item.schemes.size;
    out.set(id, {
      ...item,
      schemeCount,
      normalizedWeight: item.totalWeight / liveSchemeCount,
      avgHeldWeight: item.totalWeight / Math.max(schemeCount, 1),
    });
  });

  return out;
}

function Sparkline({
  values,
}: {
  values: number[];
}) {
  if (!values.length) return null;

  const width = 360;
  const height = 92;
  const padding = 8;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 0.01);

  const points = values.map((value, index) => {
    const x =
      padding +
      (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <svg
      className="mfChart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Portfolio weight history"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MFPortfolioClient({
  initialIndex,
  initialLatest,
  initialCurrent,
  initialPrevious,
}: Props) {
  const months = useMemo(
    () => [...(initialIndex.months ?? [])],
    [initialIndex.months]
  );

  const schemes = useMemo(
    () => initialIndex.schemes ?? [],
    [initialIndex.schemes]
  );

  const initialMonth = String(
    initialLatest.latestMonth ??
      initialIndex.latestMonth ??
      initialCurrent.month ??
      months[months.length - 1] ??
      ""
  );

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [comparePeriod, setComparePeriod] = useState("1M");
  const [selectedScheme, setSelectedScheme] = useState("All Core Schemes");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [search, setSearch] = useState("");
  const [signalTab, setSignalTab] = useState("Broad accumulation");

  const [monthCache, setMonthCache] = useState<Record<string, MonthPayload>>(() => {
    const cache: Record<string, MonthPayload> = {};
    if (initialCurrent.month) cache[initialCurrent.month] = initialCurrent;
    if (initialPrevious.month) cache[initialPrevious.month] = initialPrevious;
    return cache;
  });

  const [drawerSlug, setDrawerSlug] = useState<string | null>(null);
  const [drawerData, setDrawerData] = useState<SecurityDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const previousMonth = useMemo(
    () => compareMonth(months, currentMonth, comparePeriod),
    [months, currentMonth, comparePeriod]
  );

  useEffect(() => {
    async function loadMonth(month: string) {
      if (!month || monthCache[month]) return;

      try {
        const response = await fetch(`${DATA_ROOT}/by-month/${month}.json`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload: MonthPayload = await response.json();
        setMonthCache((current) => ({
          ...current,
          [month]: payload,
        }));
      } catch (error) {
        console.error(error);
      }
    }

    loadMonth(currentMonth);
    loadMonth(previousMonth);
  }, [currentMonth, previousMonth, monthCache]);

  useEffect(() => {
    if (!drawerSlug) {
      setDrawerData(null);
      return;
    }

    let cancelled = false;

    async function loadSecurity() {
      setDrawerLoading(true);
      try {
        const response = await fetch(
          `${DATA_ROOT}/securities/${drawerSlug}.json`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Unable to load security detail.");
        const detail: SecurityDetail = await response.json();
        if (!cancelled) setDrawerData(detail);
      } catch (error) {
        console.error(error);
        if (!cancelled) setDrawerData(null);
      } finally {
        if (!cancelled) setDrawerLoading(false);
      }
    }

    loadSecurity();

    return () => {
      cancelled = true;
    };
  }, [drawerSlug]);

  const currentRows = useMemo(
    () => monthCache[currentMonth]?.holdings ?? [],
    [currentMonth, monthCache],
  );
  const previousRows = useMemo(
    () => monthCache[previousMonth]?.holdings ?? [],
    [monthCache, previousMonth],
  );

  const sectors = useMemo(() => {
    const source =
      selectedScheme === "All Core Schemes"
        ? currentRows
        : currentRows.filter((row) => row.scheme === selectedScheme);
    return Array.from(new Set(source.map((row) => row.sector))).sort();
  }, [currentRows, selectedScheme]);

  useEffect(() => {
    if (selectedSector !== "All Sectors" && !sectors.includes(selectedSector)) {
      setSelectedSector("All Sectors");
    }
  }, [sectors, selectedSector]);

  const currentMap = useMemo(
    () => aggregate(currentRows, selectedScheme, selectedSector),
    [currentRows, selectedScheme, selectedSector]
  );

  const previousMap = useMemo(
    () => aggregate(previousRows, selectedScheme, selectedSector),
    [previousRows, selectedScheme, selectedSector]
  );

  const liveSchemeCount = useMemo(() => {
    if (selectedScheme !== "All Core Schemes") return 1;
    return Math.max(
      new Set(
        currentRows
          .filter(
            (row) =>
              selectedSector === "All Sectors" ||
              row.sector === selectedSector
          )
          .map((row) => row.scheme)
      ).size,
      1
    );
  }, [currentRows, selectedScheme, selectedSector]);

  const securities = useMemo(() => {
    return Array.from(currentMap.values())
      .map((item) => {
        const prev = previousMap.get(item.id);
        const prevWeight = prev?.normalizedWeight ?? 0;
        const change = item.normalizedWeight - prevWeight;
        const breadth = item.schemeCount / liveSchemeCount;

        const latestMatch =
          currentMonth === initialLatest.latestMonth &&
          selectedScheme === "All Core Schemes" &&
          selectedSector === "All Sectors"
            ? initialLatest.topConsensus?.find(
                (x) => x.securityId === item.id
              )
            : undefined;

        const score =
          latestMatch?.score ??
          (selectedScheme === "All Core Schemes"
            ? breadth * 70 + Math.min(item.normalizedWeight / 3, 1) * 30
            : Math.min(item.normalizedWeight / 8, 1) * 100);

        return {
          ...item,
          previousWeight: prevWeight,
          change,
          score,
        };
      })
      .sort((a, b) => b.score - a.score || b.normalizedWeight - a.normalizedWeight);
  }, [
    currentMap,
    previousMap,
    liveSchemeCount,
    currentMonth,
    initialLatest,
    selectedScheme,
    selectedSector,
  ]);

  const visibleSecurities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return securities;

    return securities.filter(
      (item) =>
        item.stock.toLowerCase().includes(query) ||
        item.sector.toLowerCase().includes(query)
    );
  }, [securities, search]);

  const movements = useMemo(() => {
    const ids = Array.from(
      new Set([...Array.from(currentMap.keys()), ...Array.from(previousMap.keys())])
    );

    return ids
      .map((id) => {
        const current = currentMap.get(id);
        const previous = previousMap.get(id);
        const currentWeight = current?.normalizedWeight ?? 0;
        const previousWeight = previous?.normalizedWeight ?? 0;
        const change = currentWeight - previousWeight;

        let status = "Unchanged";
        if (current && !previous) status = "New";
        else if (!current && previous) status = "Exit";
        else if (change > 0.05) status = "Increased";
        else if (change < -0.05) status = "Reduced";

        return {
          id,
          slug: current?.slug ?? previous?.slug ?? "",
          stock: current?.stock ?? previous?.stock ?? id,
          sector: current?.sector ?? previous?.sector ?? "Unclassified",
          currentWeight,
          previousWeight,
          change,
          status,
        };
      })
      .filter((item) => item.status !== "Unchanged")
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [currentMap, previousMap]);

  const sectorRotation = useMemo(() => {
    function sectorMap(rows: Holding[]) {
      const filtered = rows.filter((row) => {
        if (
          selectedScheme !== "All Core Schemes" &&
          row.scheme !== selectedScheme
        ) {
          return false;
        }
        return true;
      });

      const divisor =
        selectedScheme === "All Core Schemes"
          ? Math.max(new Set(filtered.map((row) => row.scheme)).size, 1)
          : 1;

      const map = new Map<string, number>();
      filtered.forEach((row) => {
        map.set(row.sector, (map.get(row.sector) ?? 0) + row.weight);
      });

      return { map, divisor };
    }

    const current = sectorMap(currentRows);
    const previous = sectorMap(previousRows);

    const names = Array.from(
      new Set([
        ...Array.from(current.map.keys()),
        ...Array.from(previous.map.keys()),
      ])
    );

    return names
      .map((sector) => {
        const now = (current.map.get(sector) ?? 0) / current.divisor;
        const before = (previous.map.get(sector) ?? 0) / previous.divisor;
        return {
          sector,
          current: now,
          previous: before,
          change: now - before,
        };
      })
      .sort((a, b) => b.current - a.current);
  }, [currentRows, previousRows, selectedScheme]);

  const matrixRows = useMemo(() => {
    if (selectedScheme !== "All Core Schemes") return [];

    return securities.slice(0, 28).map((item) => ({
      ...item,
      matrix: schemes.reduce<Record<string, number>>((acc, scheme) => {
        acc[scheme.scheme] = item.weights.get(scheme.scheme) ?? 0;
        return acc;
      }, {}),
    }));
  }, [securities, schemes, selectedScheme]);

  const stats = useMemo(() => {
    const heldBy3 = Array.from(currentMap.values()).filter(
      (item) => item.schemeCount >= 3
    ).length;

    return {
      securities: currentMap.size,
      schemes:
        selectedScheme === "All Core Schemes"
          ? new Set(currentRows.map((row) => row.scheme)).size
          : currentRows.some((row) => row.scheme === selectedScheme)
          ? 1
          : 0,
      heldBy3,
      increased: movements.filter((item) => item.status === "Increased").length,
      fresh: movements.filter((item) => item.status === "New").length,
      exits: movements.filter((item) => item.status === "Exit").length,
    };
  }, [currentMap, currentRows, movements, selectedScheme]);

  const signalGroups = useMemo(
    () => ({
      "Broad accumulation": initialLatest.signals?.broadAccumulation ?? [],
      "New consensus": initialLatest.signals?.newConsensus ?? [],
      "3M accumulation": initialLatest.signals?.sustained3m ?? [],
      "Broad reduction": initialLatest.signals?.broadReduction ?? [],
      "Full exits": initialLatest.signals?.exits ?? [],
    }),
    [initialLatest.signals]
  );

  const activeSignals =
    signalGroups[signalTab as keyof typeof signalGroups] ?? [];

  const quality = initialIndex.qualityAudit ?? {};

  function openSecurity(slug: string) {
    if (!slug) return;
    setDrawerSlug(slug);
  }

  return (
    <main className="mfTermPage">
      <div className="mfTermShell">
        <nav className="mfBreadcrumb">
          <Link href="/">CredoNomics</Link>
          <span>›</span>
          <Link href="/tools">Tools</Link>
          <span>›</span>
          <strong>MF Intelligence</strong>
        </nav>

        <section className="mfHero">
          <div>
            <div className="mfKicker">
              <i />
              MUTUAL FUND INTELLIGENCE TERMINAL
            </div>
            <h1>
              See where professional capital is
              <span> quietly moving.</span>
            </h1>
            <p>
              Selected HDFC active-equity portfolios, cleaned to stable security
              identities and compared across monthly AMC factsheets. Built for
              ownership breadth, accumulation, exits and sector rotation — not
              return chasing.
            </p>
            <div className="mfChips">
              <span>{humanMonth(initialIndex.firstMonth ?? "")} onward</span>
              <span>{initialIndex.counts?.schemes ?? schemes.length} core schemes</span>
              <span>{initialIndex.counts?.stocks ?? 0} clean securities</span>
              <span>Latest: {humanMonth(initialIndex.latestMonth ?? "")}</span>
            </div>
          </div>

          <aside className="mfQuality">
            <div className="mfQualityTop">
              <span>DATA TRUST LAYER</span>
              <strong>{quality.isinCoveragePct ?? 0}%</strong>
              <small>ISIN coverage</small>
            </div>
            <div className="mfQualityStats">
              <div>
                <strong>{quality.repairedCompanyRows ?? 0}</strong>
                <span>company rows repaired</span>
              </div>
              <div>
                <strong>{quality.reviewSnapshotsExcluded ?? 0}</strong>
                <span>weak snapshots excluded</span>
              </div>
              <div>
                <strong>{quality.highSnapshots ?? 0}</strong>
                <span>high-quality snapshots</span>
              </div>
              <div>
                <strong>{quality.droppedSuspiciousFragments ?? 0}</strong>
                <span>bad fragments removed</span>
              </div>
            </div>
          </aside>
        </section>

        <FinancialDataState
          availability={initialIndex.metadata?.availability === "available" ? "recent" : initialIndex.metadata?.availability === "partial" ? "stale" : initialIndex.metadata?.availability ?? "unavailable"}
          asOf={initialIndex.metadata?.asOf}
          message={
            initialIndex.metadata?.availability === "partial"
              ? `Partial historical coverage. ${initialIndex.metadata.asOf ? `Data as of ${new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(initialIndex.metadata.asOf))}.` : ""}`
              : initialIndex.metadata?.availability === "stale"
              ? `Historical dataset — update pending. ${initialIndex.metadata.asOf ? `Data as of ${new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(initialIndex.metadata.asOf))}.` : ""}`
              : undefined
          }
        />

        <section className="mfSignalPanel">
          <div className="mfPanelIntro">
            <div>
              <span className="mfSectionLabel">SMART MONEY OVERVIEW</span>
              <h2>Latest institutional portfolio signals</h2>
            </div>
            <small>
              Latest snapshot: {humanMonth(initialLatest.latestMonth ?? "")}
            </small>
          </div>

          <div className="mfSignalTabs">
            {Object.entries(signalGroups).map(([label, values]) => (
              <button
                key={label}
                onClick={() => setSignalTab(label)}
                className={signalTab === label ? "active" : ""}
              >
                {label}
                <b>{values.length}</b>
              </button>
            ))}
          </div>

          <div className="mfSignalCards">
            {activeSignals.slice(0, 6).map((item) => (
              <button
                className="mfSignalCard"
                key={`${signalTab}-${item.securityId}`}
                onClick={() => openSecurity(item.slug)}
              >
                <div>
                  <strong>{item.stock}</strong>
                  <span>{item.sector}</span>
                </div>
                <div className="mfSignalMetric">
                  <em>
                    {signalTab === "3M accumulation"
                      ? delta(item.change3m ?? 0)
                      : delta(item.change ?? 0)}
                  </em>
                  <small>
                    {item.currentSchemeCount ?? 0} schemes
                  </small>
                </div>
              </button>
            ))}

            {!activeSignals.length && (
              <div className="mfEmptySignal">
                No securities meet this strict signal definition in the latest
                clean snapshot.
              </div>
            )}
          </div>
        </section>

        <section className="mfControls">
          <label className="wide">
            <span>FUND UNIVERSE</span>
            <select
              value={selectedScheme}
              onChange={(event) => setSelectedScheme(event.target.value)}
            >
              <option>All Core Schemes</option>
              {schemes.map((item) => (
                <option key={item.scheme} value={item.scheme}>
                  {item.scheme}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>CURRENT MONTH</span>
            <select
              value={currentMonth}
              onChange={(event) => setCurrentMonth(event.target.value)}
            >
              {[...months].reverse().map((month) => (
                <option key={month} value={month}>
                  {humanMonth(month)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>COMPARE PERIOD</span>
            <select
              value={comparePeriod}
              onChange={(event) => setComparePeriod(event.target.value)}
            >
              <option value="1M">1 month</option>
              <option value="3M">3 months</option>
              <option value="6M">6 months</option>
              <option value="12M">12 months</option>
            </select>
          </label>

          <label>
            <span>SECTOR</span>
            <select
              value={selectedSector}
              onChange={(event) => setSelectedSector(event.target.value)}
            >
              <option>All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector}>{sector}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="mfStats">
          <article>
            <span>CLEAN SECURITIES</span>
            <strong>{stats.securities}</strong>
            <small>{humanMonth(currentMonth)}</small>
          </article>
          <article>
            <span>CORE SCHEMES</span>
            <strong>{stats.schemes}</strong>
            <small>selected universe</small>
          </article>
          <article>
            <span>HELD BY 3+ FUNDS</span>
            <strong>{stats.heldBy3}</strong>
            <small>ownership breadth</small>
          </article>
          <article>
            <span>INCREASED</span>
            <strong>{stats.increased}</strong>
            <small>vs {humanMonth(previousMonth)}</small>
          </article>
          <article>
            <span>NEW / EXITS</span>
            <strong>
              {stats.fresh} / {stats.exits}
            </strong>
            <small>stable security IDs</small>
          </article>
        </section>

        <section className="mfGrid">
          <article className="mfPanel main">
            <div className="mfPanelHead">
              <div>
                <span className="mfSectionLabel">CORE FUND CONSENSUS</span>
                <h2>Favourite stocks</h2>
                <p>
                  Breadth and portfolio weight are separated from price
                  performance. The score measures portfolio consensus, not a buy
                  recommendation.
                </p>
              </div>
              <button
                className="mfExport"
                onClick={() =>
                  downloadCsv(
                    "credonomics-core-fund-consensus.csv",
                    visibleSecurities.map((item) => ({
                      Security: item.stock,
                      Sector: item.sector,
                      Schemes: item.schemeCount,
                      "Normalized Weight": item.normalizedWeight.toFixed(2),
                      "Period Change": item.change.toFixed(2),
                      "Consensus Score": item.score.toFixed(1),
                    }))
                  )
                }
              >
                Export clean CSV
              </button>
            </div>

            <div className="mfSearch">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company or sector…"
              />
              <span>{visibleSecurities.length} results</span>
            </div>

            <div className="mfTableWrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Security</th>
                    <th>Sector</th>
                    <th>Schemes</th>
                    <th>Norm. weight</th>
                    <th>{comparePeriod} change</th>
                    <th>Consensus</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSecurities.slice(0, 60).map((item, index) => (
                    <tr
                      key={item.id}
                      tabIndex={0}
                      onClick={() => openSecurity(item.slug)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openSecurity(item.slug);
                        }
                      }}
                    >
                      <td className="rank">{index + 1}</td>
                      <td>
                        <strong>{item.stock}</strong>
                      </td>
                      <td className="muted">{item.sector}</td>
                      <td>{item.schemeCount}</td>
                      <td>{pct(item.normalizedWeight)}</td>
                      <td>
                        <span
                          className={
                            item.change > 0.05
                              ? "change up"
                              : item.change < -0.05
                              ? "change down"
                              : "change flat"
                          }
                        >
                          {delta(item.change)}
                        </span>
                      </td>
                      <td>
                        <span className="score">{item.score.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="mfPanel side">
            <div className="mfPanelHead compact">
              <div>
                <span className="mfSectionLabel">PORTFOLIO ACTIVITY</span>
                <h2>Largest changes</h2>
                <p>
                  {humanMonth(currentMonth)} vs {humanMonth(previousMonth)}
                </p>
              </div>
            </div>

            <div className="mfMoves">
              {movements.slice(0, 18).map((item) => (
                <button
                  key={`${item.id}-${item.status}`}
                  onClick={() => openSecurity(item.slug)}
                >
                  <div>
                    <strong>{item.stock}</strong>
                    <span>{item.sector}</span>
                  </div>
                  <div>
                    <em className={item.status.toLowerCase()}>
                      {item.status}
                    </em>
                    <small>{delta(item.change)}</small>
                  </div>
                </button>
              ))}

              {!movements.length && (
                <p className="mfEmpty">
                  No material security-level changes for this comparison.
                </p>
              )}
            </div>
          </article>
        </section>

        {selectedScheme === "All Core Schemes" && (
          <section className="mfPanel matrixPanel">
            <div className="mfPanelHead">
              <div>
                <span className="mfSectionLabel">OWNERSHIP MATRIX</span>
                <h2>Who owns what?</h2>
                <p>
                  Portfolio weight by scheme for the highest-consensus
                  securities in {humanMonth(currentMonth)}.
                </p>
              </div>
            </div>

            <div className="mfMatrixWrap">
              <table className="mfMatrix">
                <thead>
                  <tr>
                    <th>Security</th>
                    {schemes.map((item) => (
                      <th key={item.scheme}>
                        <span>{item.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixRows.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => openSecurity(item.slug)}
                    >
                      <td>
                        <strong>{item.stock}</strong>
                        <small>{item.sector}</small>
                      </td>
                      {schemes.map((schemeItem) => {
                        const value = item.matrix[schemeItem.scheme] ?? 0;
                        const opacity = Math.min(value / 8, 0.92);
                        return (
                          <td key={schemeItem.scheme}>
                            <span
                              className="matrixCell"
                              style={{
                                background:
                                  value > 0
                                    ? `rgba(0, 154, 139, ${0.08 + opacity * 0.55})`
                                    : "transparent",
                              }}
                            >
                              {value > 0 ? pct(value) : "—"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mfLower">
          <article className="mfPanel">
            <div className="mfPanelHead compact">
              <div>
                <span className="mfSectionLabel">SECTOR ROTATION</span>
                <h2>Where exposure is moving</h2>
                <p>Average exposure per selected scheme.</p>
              </div>
            </div>

            <div className="mfSectors">
              {sectorRotation.slice(0, 16).map((item) => {
                const max = Math.max(
                  ...sectorRotation.map((row) => row.current),
                  1
                );
                const width = Math.max(2, (item.current / max) * 100);

                return (
                  <div className="sectorRow" key={item.sector}>
                    <div>
                      <strong>{item.sector}</strong>
                      <span>{pct(item.current)}</span>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${width}%` }} />
                    </div>
                    <small className={item.change >= 0 ? "upText" : "downText"}>
                      {delta(item.change)} vs {humanMonth(previousMonth)}
                    </small>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="mfPanel method">
            <span className="mfSectionLabel">TRANSPARENT METHODOLOGY</span>
            <h2>Signals you can audit.</h2>

            <div className="methodRow">
              <strong>50%</strong>
              <div>
                <b>Scheme breadth</b>
                <p>How widely the security is owned across the core universe.</p>
              </div>
            </div>
            <div className="methodRow">
              <strong>25%</strong>
              <div>
                <b>Normalized portfolio weight</b>
                <p>Total selected-fund weight divided by live core schemes.</p>
              </div>
            </div>
            <div className="methodRow">
              <strong>15%</strong>
              <div>
                <b>Positive 3-month trend</b>
                <p>Rewards sustained accumulation, not one-month noise.</p>
              </div>
            </div>
            <div className="methodRow">
              <strong>10%</strong>
              <div>
                <b>Six-month persistence</b>
                <p>Rewards securities that remain in the selected portfolios.</p>
              </div>
            </div>

            <Link href="/methodology">Read full methodology →</Link>
          </article>
        </section>

        {!!initialIndex.missingCoreSchemes?.length && (
          <aside className="mfCoverage">
            <strong>Coverage note</strong>
            <span>
              {initialIndex.missingCoreSchemes.join(", ")} currently fail the
              strict snapshot quality gate. They will appear automatically once
              enough clean holdings are recovered.
            </span>
          </aside>
        )}

        <footer className="mfFooter">
          <div>
            <strong>Portfolio evidence, not predictions.</strong>
            <p>
              CredoNomics is not registered with SEBI as an Investment Adviser
              or Research Analyst. This tool is educational and informational,
              based on historical AMC factsheets. Verify material information
              with official AMC sources.
            </p>
          </div>
          <Link href="/disclosures">Disclosures →</Link>
        </footer>
      </div>

      {drawerSlug && (
        <div className="drawerBackdrop" onClick={() => setDrawerSlug(null)}>
          <aside
            className="drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="drawerClose"
              onClick={() => setDrawerSlug(null)}
              aria-label="Close security detail"
            >
              ×
            </button>

            {drawerLoading && (
              <div className="drawerLoading">Loading security history…</div>
            )}

            {!drawerLoading && drawerData && (
              <>
                <div className="drawerHead">
                  <span>{drawerData.sector}</span>
                  <h2>{drawerData.stock}</h2>
                  <p>
                    {drawerData.isin
                      ? `ISIN ${drawerData.isin}`
                      : "Name-matched security"}
                  </p>
                </div>

                <div className="drawerStats">
                  <div>
                    <span>FIRST TRACKED</span>
                    <strong>{humanMonth(drawerData.firstTracked)}</strong>
                  </div>
                  <div>
                    <span>MONTHS TRACKED</span>
                    <strong>{drawerData.monthsTracked}</strong>
                  </div>
                  <div>
                    <span>MAX SCHEMES</span>
                    <strong>{drawerData.maxSchemeCount}</strong>
                  </div>
                  <div>
                    <span>PEAK NORM. WEIGHT</span>
                    <strong>{pct(drawerData.peakNormalizedWeight)}</strong>
                  </div>
                </div>

                <div className="drawerChart">
                  <div>
                    <strong>Portfolio ownership history</strong>
                    <span>Normalized across the live core universe</span>
                  </div>
                  <Sparkline
                    values={drawerData.monthlyHistory.map(
                      (row) => row.normalizedWeight
                    )}
                  />
                  <div className="chartAxis">
                    <span>
                      {humanMonth(drawerData.monthlyHistory[0]?.month ?? "")}
                    </span>
                    <span>{humanMonth(drawerData.latestTracked)}</span>
                  </div>
                </div>

                <div className="drawerSection">
                  <h3>Latest scheme weights</h3>
                  {drawerData.latestSchemeWeights.map((row) => (
                    <div className="drawerWeight" key={row.scheme}>
                      <span>{row.scheme}</span>
                      <strong>{pct(row.weight)}</strong>
                    </div>
                  ))}
                </div>

                <div className="drawerSection">
                  <h3>Monthly history</h3>
                  <div className="drawerHistory">
                    {[...drawerData.monthlyHistory]
                      .reverse()
                      .slice(0, 18)
                      .map((row) => (
                        <div key={row.month}>
                          <span>{humanMonth(row.month)}</span>
                          <span>{row.schemeCount} schemes</span>
                          <strong>{pct(row.normalizedWeight)}</strong>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="drawerSection sources">
                  <h3>Factsheet evidence</h3>
                  {[...drawerData.sources]
                    .reverse()
                    .slice(0, 8)
                    .map((row) => (
                      <div key={row.month}>
                        <strong>{humanMonth(row.month)}</strong>
                        {row.pdfs.slice(0, 3).map((pdf) => (
                          <span key={pdf}>{pdf}</span>
                        ))}
                      </div>
                    ))}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  :global(body) {
    margin: 0;
  }

  .mfTermPage {
    --mf-table-name: #10283d;
    --mf-table-text: #526579;
    --mf-table-head: #53677c;
    --mf-table-head-bg: #f2f5f8;
    --mf-table-row-hover: #edf5f3;
    --mf-table-focus: #087f61;
    min-height: 100vh;
    color: #07172a;
    background:
      radial-gradient(circle at 80% 0%, rgba(32, 139, 255, .11), transparent 30rem),
      radial-gradient(circle at 16% 3%, rgba(0, 174, 154, .10), transparent 26rem),
      #f5f7fa;
    font-family: Arial, Helvetica, sans-serif;
  }

  :global(html[data-theme='dark']) .mfTermPage {
    --mf-table-name: #edf4f8;
    --mf-table-text: #aab9c7;
    --mf-table-head: #a6b5c3;
    --mf-table-head-bg: #0b1119;
    --mf-table-row-hover: #121e29;
    --mf-table-focus: #43e3ae;
  }

  .mfTermShell {
    width: min(1500px, calc(100% - 36px));
    margin: 0 auto;
    padding: 30px 0 60px;
  }

  .mfBreadcrumb {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 18px;
    color: #6d7c8e;
    font-size: 11px;
  }

  .mfBreadcrumb a {
    color: inherit;
    text-decoration: none;
  }

  .mfHero {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(310px, .65fr);
    gap: 18px;
    align-items: stretch;
    margin-bottom: 18px;
  }

  .mfHero > div,
  .mfQuality,
  .mfSignalPanel,
  .mfControls,
  .mfPanel,
  .mfCoverage,
  .mfFooter {
    border: 1px solid rgba(10, 34, 58, .09);
    background: rgba(255, 255, 255, .94);
    box-shadow: 0 18px 60px rgba(31, 56, 82, .07);
  }

  .mfHero > div {
    padding: 40px;
    border-radius: 27px;
  }

  .mfKicker,
  .mfSectionLabel {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #008f84;
    letter-spacing: .13em;
    font-size: 10px;
    font-weight: 850;
  }

  .mfKicker i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #00b99e;
    box-shadow: 0 0 0 6px rgba(0,185,158,.10);
  }

  .mfHero h1 {
    max-width: 940px;
    margin: 17px 0 15px;
    font-size: clamp(44px, 5.3vw, 78px);
    line-height: .98;
    letter-spacing: -.055em;
  }

  .mfHero h1 span {
    background: linear-gradient(90deg, #00a991, #147af3);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .mfHero p {
    max-width: 850px;
    margin: 0;
    color: #5e6e81;
    font-size: 15px;
    line-height: 1.7;
  }

  .mfChips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 25px;
  }

  .mfChips span {
    padding: 7px 10px;
    border: 1px solid #dbe4ec;
    border-radius: 999px;
    background: #f8fafb;
    color: #53667a;
    font-size: 10px;
    font-weight: 750;
  }

  .mfQuality {
    padding: 27px;
    border-radius: 27px;
    color: white;
    background: linear-gradient(145deg, #06172b, #092b4d);
  }

  .mfQualityTop span,
  .mfQualityTop strong,
  .mfQualityTop small {
    display: block;
  }

  .mfQualityTop span {
    color: #8de7dc;
    letter-spacing: .14em;
    font-size: 9px;
    font-weight: 850;
  }

  .mfQualityTop strong {
    margin-top: 13px;
    font-size: 46px;
    letter-spacing: -.05em;
  }

  .mfQualityTop small {
    color: #9db0c3;
    font-size: 10px;
  }

  .mfQualityStats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-top: 23px;
  }

  .mfQualityStats div {
    padding: 13px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 14px;
    background: rgba(255,255,255,.04);
  }

  .mfQualityStats strong,
  .mfQualityStats span {
    display: block;
  }

  .mfQualityStats strong {
    font-size: 19px;
  }

  .mfQualityStats span {
    margin-top: 4px;
    color: #92a8bd;
    font-size: 9px;
    line-height: 1.35;
  }

  .mfSignalPanel {
    padding: 22px;
    margin-bottom: 15px;
    border-radius: 22px;
  }

  .mfPanelIntro {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }

  .mfPanelIntro h2,
  .mfPanelHead h2,
  .method h2 {
    margin: 6px 0 5px;
    font-size: 24px;
    letter-spacing: -.035em;
  }

  .mfPanelIntro small {
    color: #758597;
    font-size: 10px;
  }

  .mfSignalTabs {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    margin: 17px 0 14px;
  }

  .mfSignalTabs button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 10px;
    border: 1px solid #dce4eb;
    border-radius: 999px;
    background: #f8fafb;
    color: #53667b;
    cursor: pointer;
    font-size: 10px;
    font-weight: 750;
  }

  .mfSignalTabs button.active {
    border-color: #09233f;
    background: #071a30;
    color: white;
  }

  .mfSignalTabs b {
    display: inline-flex;
    min-width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 169, 145, .12);
    color: #008f80;
    font-size: 9px;
  }

  .mfSignalTabs button.active b {
    background: rgba(255,255,255,.12);
    color: #8de7dc;
  }

  .mfSignalCards {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 9px;
  }

  .mfSignalCard {
    display: flex;
    min-width: 0;
    min-height: 92px;
    flex-direction: column;
    justify-content: space-between;
    padding: 13px;
    border: 1px solid #e1e7ed;
    border-radius: 14px;
    background: white;
    text-align: left;
    cursor: pointer;
  }

  .mfSignalCard:hover {
    border-color: #b9d9d6;
    box-shadow: 0 10px 28px rgba(27, 66, 89, .07);
  }

  .mfSignalCard strong,
  .mfSignalCard span {
    display: block;
  }

  .mfSignalCard strong {
    overflow: hidden;
    color: #08192c;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mfSignalCard span {
    margin-top: 4px;
    color: #8795a4;
    font-size: 9px;
  }

  .mfSignalMetric {
    display: flex;
    justify-content: space-between;
    gap: 7px;
    align-items: end;
  }

  .mfSignalMetric em {
    color: #008872;
    font-size: 11px;
    font-style: normal;
    font-weight: 850;
  }

  .mfSignalMetric small {
    color: #8291a0;
    font-size: 8px;
  }

  .mfEmptySignal {
    grid-column: 1 / -1;
    padding: 22px;
    border: 1px dashed #d6dfe7;
    border-radius: 14px;
    color: #7e8d9c;
    font-size: 11px;
  }

  .mfControls {
    display: grid;
    grid-template-columns: 1.4fr .8fr .7fr .8fr;
    gap: 10px;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 20px;
  }

  .mfControls label {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .mfControls label > span {
    padding-left: 3px;
    color: #5a6c7f;
    letter-spacing: .10em;
    font-size: 9px;
    font-weight: 850;
  }

  .mfControls select {
    min-height: 47px;
    width: 100%;
    padding: 0 12px;
    border: 1px solid #d9e2e9;
    border-radius: 12px;
    outline: none;
    background: #fafcfd;
    color: #07182a;
    font-weight: 750;
  }

  .mfStats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    overflow: hidden;
    margin-bottom: 18px;
    border-radius: 21px;
    background: #071a30;
    color: white;
    box-shadow: 0 18px 48px rgba(7, 26, 48, .13);
  }

  .mfStats article {
    padding: 20px 22px;
    border-right: 1px solid rgba(255,255,255,.08);
  }

  .mfStats article:last-child {
    border-right: 0;
  }

  .mfStats span,
  .mfStats strong,
  .mfStats small {
    display: block;
  }

  .mfStats span {
    color: #90a6bd;
    letter-spacing: .08em;
    font-size: 9px;
    font-weight: 850;
  }

  .mfStats strong {
    margin: 10px 0 4px;
    font-size: 29px;
    letter-spacing: -.04em;
  }

  .mfStats small {
    color: #7289a2;
    font-size: 9px;
  }

  .mfGrid {
    display: grid;
    grid-template-columns: minmax(0, 1.82fr) minmax(320px, .68fr);
    gap: 16px;
    align-items: start;
  }

  .mfLower {
    display: grid;
    grid-template-columns: 1.2fr .8fr;
    gap: 16px;
    margin-top: 16px;
  }

  .mfPanel {
    overflow: hidden;
    padding: 22px;
    border-radius: 22px;
  }

  .mfPanelHead {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .mfPanelHead.compact {
    margin-bottom: 12px;
  }

  .mfPanelHead p,
  .method p {
    max-width: 700px;
    margin: 0;
    color: #66778a;
    font-size: 11px;
    line-height: 1.5;
  }

  .mfExport {
    flex: 0 0 auto;
    padding: 11px 13px;
    border: 0;
    border-radius: 11px;
    background: #071a30;
    color: white;
    cursor: pointer;
    font-size: 10px;
    font-weight: 800;
  }

  .mfSearch {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding-right: 12px;
    border: 1px solid #dde5ec;
    border-radius: 12px;
    background: #f9fbfc;
  }

  .mfSearch input {
    flex: 1;
    min-width: 0;
    padding: 12px 13px;
    border: 0;
    outline: 0;
    background: transparent;
  }

  .mfSearch span {
    color: #8794a2;
    font-size: 9px;
  }

  .mfTableWrap,
  .mfMatrixWrap {
    overflow: auto;
    border: 1px solid #e0e7ed;
    border-radius: 14px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 780px;
  }

  thead {
    background: var(--mf-table-head-bg);
  }

  th {
    padding: 11px;
    color: var(--mf-table-head);
    text-align: left;
    text-transform: uppercase;
    letter-spacing: .07em;
    font-size: 8px;
  }

  td {
    padding: 12px 11px;
    border-top: 1px solid #edf1f4;
    font-size: 11px;
  }

  .mfTableWrap td,
  .mfMatrixWrap td {
    color: var(--mf-table-text);
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background: var(--mf-table-row-hover);
  }

  tbody tr:focus-visible {
    outline: 2px solid var(--mf-table-focus);
    outline-offset: -2px;
    background: var(--mf-table-row-hover);
  }

  .mfTableWrap td strong,
  .mfMatrixWrap td strong {
    color: var(--mf-table-name);
  }

  .rank,
  .muted {
    color: var(--mf-table-text);
  }

  .change {
    font-size: 10px;
    font-weight: 800;
  }

  .change.up,
  .upText {
    color: #058368;
  }

  .change.down,
  .downText {
    color: #cc4f4b;
  }

  .change.flat {
    color: #7c8b99;
  }

  .score {
    display: inline-flex;
    min-width: 42px;
    justify-content: center;
    padding: 6px 8px;
    border-radius: 999px;
    background: #e8faf7;
    color: #008a7d;
    font-weight: 850;
  }

  .mfMoves {
    display: flex;
    flex-direction: column;
  }

  .mfMoves button {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border: 0;
    border-bottom: 1px solid #edf1f4;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .mfMoves button:last-child {
    border-bottom: 0;
  }

  .mfMoves button > div:first-child {
    min-width: 0;
  }

  .mfMoves strong,
  .mfMoves span {
    display: block;
  }

  .mfMoves strong {
    overflow: visible;
    max-width: none;
    color: #07182a;
    font-size: 12px;
    line-height: 1.35;
    white-space: normal;
  }

  .mfMoves span {
    margin-top: 4px;
    color: #8593a2;
    font-size: 10px;
  }

  .mfMoves button > div:last-child {
    flex: 0 0 auto;
    text-align: right;
  }

  .mfMoves em {
    display: inline-flex;
    padding: 4px 6px;
    border-radius: 999px;
    font-size: 8px;
    font-style: normal;
    font-weight: 850;
  }

  .mfMoves em.new,
  .mfMoves em.increased {
    background: #e7f8f2;
    color: #087f61;
  }

  .mfMoves em.exit,
  .mfMoves em.reduced {
    background: #fff0ee;
    color: #c54c47;
  }

  .mfMoves small {
    display: block;
    margin-top: 4px;
    color: #607286;
    font-size: 10px;
  }

  .mfEmpty {
    padding: 24px 0;
    color: #81909f;
    font-size: 10px;
  }

  .matrixPanel {
    margin-top: 16px;
  }

  .mfMatrix {
    min-width: 1120px;
  }

  .mfMatrix th:not(:first-child),
  .mfMatrix td:not(:first-child) {
    text-align: center;
  }

  .mfMatrix th span {
    display: inline-block;
    max-width: 105px;
    white-space: normal;
  }

  .mfMatrix td:first-child strong,
  .mfMatrix td:first-child small {
    display: block;
  }

  .mfMatrix td:first-child small {
    margin-top: 3px;
    color: #83919f;
    font-size: 8px;
  }

  .matrixCell {
    display: inline-flex;
    min-width: 55px;
    justify-content: center;
    padding: 7px 6px;
    border-radius: 8px;
    color: #0a584f;
    font-size: 9px;
    font-weight: 800;
  }

  .mfSectors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 18px;
  }

  .sectorRow > div:first-child {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 10px;
  }

  .bar {
    overflow: hidden;
    height: 5px;
    margin: 7px 0 5px;
    border-radius: 999px;
    background: #edf2f5;
  }

  .bar i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #00aa97, #177ef4);
  }

  .sectorRow small {
    font-size: 8px;
  }

  .method {
    background: linear-gradient(145deg, rgba(255,255,255,.98), rgba(241,248,251,.97));
  }

  .methodRow {
    display: grid;
    grid-template-columns: 58px 1fr;
    gap: 12px;
    padding: 13px 0;
    border-bottom: 1px solid #e6ebef;
  }

  .methodRow > strong {
    color: #008d81;
    font-size: 21px;
  }

  .methodRow b {
    font-size: 10px;
  }

  .methodRow p {
    margin-top: 4px;
    font-size: 9px;
  }

  .method > a {
    display: inline-block;
    margin-top: 16px;
    color: #1377df;
    text-decoration: none;
    font-size: 10px;
    font-weight: 800;
  }

  .mfCoverage,
  .mfFooter {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: center;
    margin-top: 16px;
    padding: 17px 20px;
    border-radius: 17px;
  }

  .mfCoverage {
    border-color: #f0dda9;
    background: #fffaf0;
    box-shadow: none;
  }

  .mfCoverage strong {
    color: #7c5b0e;
    font-size: 10px;
  }

  .mfCoverage span {
    flex: 1;
    color: #786a47;
    font-size: 9px;
    line-height: 1.45;
  }

  .mfFooter {
    background: #071a30;
    color: white;
  }

  .mfFooter strong {
    font-size: 10px;
  }

  .mfFooter p {
    max-width: 1050px;
    margin: 4px 0 0;
    color: #91a6bb;
    font-size: 8px;
    line-height: 1.5;
  }

  .mfFooter a {
    flex: 0 0 auto;
    color: #8de7dc;
    text-decoration: none;
    font-size: 10px;
    font-weight: 800;
  }

  .drawerBackdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
    background: rgba(3, 15, 28, .48);
    backdrop-filter: blur(5px);
  }

  .drawer {
    position: relative;
    width: min(620px, 92vw);
    height: 100%;
    overflow-y: auto;
    padding: 28px;
    background: #f8fafc;
    box-shadow: -24px 0 70px rgba(3, 15, 28, .20);
  }

  .drawerClose {
    position: absolute;
    top: 16px;
    right: 17px;
    width: 34px;
    height: 34px;
    border: 1px solid #dbe3ea;
    border-radius: 50%;
    background: white;
    color: #16304a;
    cursor: pointer;
    font-size: 20px;
  }

  .drawerLoading {
    padding: 80px 0;
    color: #66788b;
    text-align: center;
    font-size: 11px;
  }

  .drawerHead {
    padding-right: 40px;
    margin-bottom: 18px;
  }

  .drawerHead span {
    color: #008d81;
    letter-spacing: .08em;
    font-size: 9px;
    font-weight: 800;
  }

  .drawerHead h2 {
    margin: 6px 0;
    font-size: 31px;
    letter-spacing: -.04em;
  }

  .drawerHead p {
    margin: 0;
    color: #788797;
    font-size: 9px;
  }

  .drawerStats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .drawerStats div {
    padding: 13px;
    border: 1px solid #e0e6eb;
    border-radius: 13px;
    background: white;
  }

  .drawerStats span,
  .drawerStats strong {
    display: block;
  }

  .drawerStats span {
    color: #7b8997;
    letter-spacing: .07em;
    font-size: 8px;
    font-weight: 800;
  }

  .drawerStats strong {
    margin-top: 6px;
    font-size: 14px;
  }

  .drawerChart,
  .drawerSection {
    margin-top: 13px;
    padding: 17px;
    border: 1px solid #e0e6eb;
    border-radius: 15px;
    background: white;
  }

  .drawerChart > div:first-child strong,
  .drawerChart > div:first-child span {
    display: block;
  }

  .drawerChart > div:first-child strong,
  .drawerSection h3 {
    margin: 0;
    font-size: 11px;
  }

  .drawerChart > div:first-child span {
    margin-top: 3px;
    color: #81909e;
    font-size: 8px;
  }

  .mfChart {
    width: 100%;
    height: 110px;
    margin-top: 12px;
    color: #008f84;
  }

  .chartAxis {
    display: flex;
    justify-content: space-between;
    color: #8794a1;
    font-size: 8px;
  }

  .drawerWeight,
  .drawerHistory > div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 0;
    border-bottom: 1px solid #edf1f4;
    font-size: 9px;
  }

  .drawerWeight:last-child,
  .drawerHistory > div:last-child {
    border-bottom: 0;
  }

  .drawerWeight span {
    color: #52667b;
  }

  .drawerHistory > div span {
    color: #6f7f8f;
  }

  .sources > div {
    padding: 9px 0;
    border-bottom: 1px solid #edf1f4;
  }

  .sources > div:last-child {
    border-bottom: 0;
  }

  .sources strong,
  .sources span {
    display: block;
  }

  .sources strong {
    margin-bottom: 4px;
    font-size: 9px;
  }

  .sources span {
    overflow-wrap: anywhere;
    color: #788797;
    font-size: 8px;
    line-height: 1.4;
  }

  @media (max-width: 1180px) {
    .mfSignalCards {
      grid-template-columns: repeat(3, 1fr);
    }

    .mfHero,
    .mfGrid,
    .mfLower {
      grid-template-columns: 1fr;
    }

    .mfStats {
      grid-template-columns: repeat(3, 1fr);
    }

    .mfControls {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 720px) {
    .mfTermShell {
      width: calc(100% - 20px);
      padding-top: 18px;
    }

    .mfHero > div {
      padding: 26px 20px;
    }

    .mfHero h1 {
      font-size: 43px;
    }

    .mfSignalCards,
    .mfStats,
    .mfControls,
    .mfSectors {
      grid-template-columns: 1fr;
    }

    .mfPanelIntro,
    .mfPanelHead,
    .mfCoverage,
    .mfFooter {
      align-items: flex-start;
      flex-direction: column;
    }

    .mfPanel {
      padding: 17px;
    }

    .drawer {
      width: 100%;
      padding: 22px;
    }
  }
`;

