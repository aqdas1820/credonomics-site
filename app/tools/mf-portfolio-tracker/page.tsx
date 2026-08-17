"use client";

import Link from "next/link";
import ThemeModeToggle from "../../components/ThemeModeToggle";
import { useEffect, useMemo, useState } from "react";

type Holding = {
  amc: string;
  scheme: string;
  category?: string;
  month: string;
  securityId?: string;
  isin?: string;
  stock: string;
  sector: string;
  weight: number;
  quality?: string;
  nameSource?: string;
};

type Meta = {
  latestMonth?: string | null;
  presentCoreSchemes?: string[];
  missingCoreSchemes?: string[];
  counts?: {
    holdings?: number;
    schemes?: number;
    stocks?: number;
    amcs?: number;
  };
  qualityAudit?: {
    repairedCompanyNames?: number;
    droppedSuspiciousCompanyFragments?: number;
    explicitCoreEquityRecoveries?: number;
    isinCoveragePct?: number;
  };
};

type Dataset = {
  meta?: Meta;
  holdings: Holding[];
};

type SecuritySummary = {
  id: string;
  stock: string;
  sector: string;
  schemes: Set<string>;
  sum: number;
  count: number;
  avg: number;
  previousAvg: number;
  change: number;
  consensus: number;
};

const PROD_URL = "/data/mf-intelligence/all.json";

function normalise(row: any): Holding {
  const stock = String(row.stock ?? row.Stock ?? row.company ?? row.Company ?? "").trim();
  const isin = String(row.isin ?? row.ISIN ?? "").trim();
  const securityId = String(
    row.securityId ??
      row.security_id ??
      isin ??
      `NAME:${stock.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  ).trim();

  return {
    amc: String(row.amc ?? row.AMC ?? "").trim(),
    scheme: String(row.scheme ?? row.Scheme ?? "").trim(),
    category: String(row.category ?? "").trim(),
    month: String(row.month ?? row.Month ?? row.Report_Date ?? "").trim(),
    securityId,
    isin,
    stock,
    sector: String(row.sector ?? row.Sector ?? row.Industry ?? "Unclassified").trim(),
    weight: Number(row.weight ?? row.Weight ?? row.Portfolio_Weight_Percent ?? 0),
    quality: String(row.quality ?? "").trim(),
    nameSource: String(row.nameSource ?? "").trim(),
  };
}

function monthKey(value: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (m) return Number(m[1]) * 12 + Number(m[2]);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function pct(value: number) {
  return `${value.toFixed(2)}%`;
}

function pp(value: number) {
  if (value > 0) return `+${value.toFixed(2)} pp`;
  if (value < 0) return `${value.toFixed(2)} pp`;
  return "0.00 pp";
}

function csvDownload(filename: string, rows: Record<string, string | number>[]) {
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
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MFPortfolioTracker() {
  const [rows, setRows] = useState<Holding[]>([]);
  const [meta, setMeta] = useState<Meta>({});
  const [loading, setLoading] = useState(true);
  const [scheme, setScheme] = useState("All Core Schemes");
  const [currentMonth, setCurrentMonth] = useState("");
  const [previousMonth, setPreviousMonth] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await fetch(PROD_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("MF dataset is unavailable.");

        const json: Dataset | Holding[] = await response.json();
        const raw = Array.isArray(json) ? json : json.holdings ?? [];
        const clean = raw
          .map(normalise)
          .filter(
            (x) =>
              x.scheme &&
              x.month &&
              x.stock &&
              x.securityId &&
              Number.isFinite(x.weight) &&
              x.weight > 0
          );

        setRows(clean);
        if (!Array.isArray(json)) setMeta(json.meta ?? {});

        const months = Array.from(new Set(clean.map((x) => x.month))).sort(
          (a, b) => monthKey(b) - monthKey(a)
        );

        if (months.length) {
          setCurrentMonth(months[0]);
          setPreviousMonth(months[1] ?? months[0]);
        }
      } catch (error) {
        console.error(error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const schemes = useMemo(
    () => Array.from(new Set(rows.map((x) => x.scheme))).sort(),
    [rows]
  );

  const months = useMemo(
    () =>
      Array.from(new Set(rows.map((x) => x.month))).sort(
        (a, b) => monthKey(b) - monthKey(a)
      ),
    [rows]
  );

  const selectedRows = useMemo(
    () =>
      scheme === "All Core Schemes"
        ? rows
        : rows.filter((x) => x.scheme === scheme),
    [rows, scheme]
  );

  const currentRows = useMemo(
    () => selectedRows.filter((x) => x.month === currentMonth),
    [selectedRows, currentMonth]
  );

  const previousRows = useMemo(
    () => selectedRows.filter((x) => x.month === previousMonth),
    [selectedRows, previousMonth]
  );

  const currentSchemeCount = useMemo(
    () => Math.max(new Set(currentRows.map((x) => x.scheme)).size, 1),
    [currentRows]
  );

  function aggregateBySecurity(source: Holding[]) {
    const map = new Map<
      string,
      {
        id: string;
        stock: string;
        sector: string;
        schemes: Set<string>;
        sum: number;
        count: number;
      }
    >();

    source.forEach((r) => {
      const id = r.securityId || r.isin || r.stock.toLowerCase();
      const existing = map.get(id) ?? {
        id,
        stock: r.stock,
        sector: r.sector,
        schemes: new Set<string>(),
        sum: 0,
        count: 0,
      };

      existing.schemes.add(r.scheme);
      existing.sum += r.weight;
      existing.count += 1;

      if (r.stock.length > existing.stock.length) existing.stock = r.stock;
      if (existing.sector === "Unclassified" && r.sector) existing.sector = r.sector;

      map.set(id, existing);
    });

    return map;
  }

  const currentMap = useMemo(() => aggregateBySecurity(currentRows), [currentRows]);
  const previousMap = useMemo(() => aggregateBySecurity(previousRows), [previousRows]);

  const securityIntelligence = useMemo<SecuritySummary[]>(() => {
    return Array.from(currentMap.values())
      .map((x) => {
        const avg = x.count ? x.sum / x.count : 0;
        const prev = previousMap.get(x.id);
        const previousAvg = prev && prev.count ? prev.sum / prev.count : 0;
        const change = avg - previousAvg;
        const breadth = x.schemes.size / currentSchemeCount;

        // 70 points = scheme breadth, 30 points = meaningful portfolio weight.
        const weightComponent = Math.min(avg / 5, 1);
        const consensus =
          scheme === "All Core Schemes"
            ? breadth * 70 + weightComponent * 30
            : Math.min(avg / 8, 1) * 100;

        return {
          ...x,
          avg,
          previousAvg,
          change,
          consensus,
        };
      })
      .sort((a, b) => b.consensus - a.consensus || b.avg - a.avg);
  }, [currentMap, previousMap, currentSchemeCount, scheme]);

  const movements = useMemo(() => {
    const ids = Array.from(
      new Set([...Array.from(currentMap.keys()), ...Array.from(previousMap.keys())])
    );

    return ids
      .map((id) => {
        const curr = currentMap.get(id);
        const prev = previousMap.get(id);

        const currentAvg = curr && curr.count ? curr.sum / curr.count : 0;
        const previousAvg = prev && prev.count ? prev.sum / prev.count : 0;
        const change = currentAvg - previousAvg;

        let status: "New" | "Exit" | "Increased" | "Reduced" | "Unchanged";

        if (curr && !prev) status = "New";
        else if (!curr && prev) status = "Exit";
        else if (change > 0.01) status = "Increased";
        else if (change < -0.01) status = "Reduced";
        else status = "Unchanged";

        return {
          id,
          stock: curr?.stock ?? prev?.stock ?? id,
          sector: curr?.sector ?? prev?.sector ?? "Unclassified",
          currentAvg,
          previousAvg,
          change,
          status,
        };
      })
      .filter((x) => x.status !== "Unchanged")
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [currentMap, previousMap]);

  const sectorData = useMemo(() => {
    const make = (source: Holding[]) => {
      const sector = new Map<string, number>();
      const schemesInMonth = Math.max(new Set(source.map((x) => x.scheme)).size, 1);

      source.forEach((x) =>
        sector.set(x.sector, (sector.get(x.sector) ?? 0) + x.weight)
      );

      return {
        sector,
        divisor: schemesInMonth,
      };
    };

    const curr = make(currentRows);
    const prev = make(previousRows);

    const names = Array.from(
      new Set([...Array.from(curr.sector.keys()), ...Array.from(prev.sector.keys())])
    );

    return names
      .map((sector) => {
        const current = (curr.sector.get(sector) ?? 0) / curr.divisor;
        const previous = (prev.sector.get(sector) ?? 0) / prev.divisor;

        return {
          sector,
          current,
          previous,
          change: current - previous,
        };
      })
      .sort((a, b) => b.current - a.current);
  }, [currentRows, previousRows]);

  const visibleStocks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return securityIntelligence;

    return securityIntelligence.filter(
      (x) =>
        x.stock.toLowerCase().includes(q) ||
        x.sector.toLowerCase().includes(q)
    );
  }, [securityIntelligence, search]);

  const stats = useMemo(() => {
    const securities = currentMap.size;
    const coreSchemes = new Set(currentRows.map((x) => x.scheme)).size;
    const increased = movements.filter((x) => x.status === "Increased").length;
    const fresh = movements.filter((x) => x.status === "New").length;
    const exits = movements.filter((x) => x.status === "Exit").length;

    return { securities, coreSchemes, increased, fresh, exits };
  }, [currentMap, currentRows, movements]);

  const quality = meta.qualityAudit ?? {};

  if (loading) {
    return (
      <div className="mfV2Page">
        <div className="mfV2Loading">
          <div className="mfV2Pulse" />
          <strong>Loading CredoNomics Mutual Fund Intelligence</strong>
          <span>Building the clean security-level view…</span>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="mfV2Page">
      <div className="mfV2Shell">
        <div className="mfV2Breadcrumbs">
          <Link href="/">CredoNomics</Link>
          <span>/</span>
          <Link href="/tools">Tools</Link>
          <span>/</span>
          <strong>MF Intelligence</strong>
            <span className="mfV2ThemeSlot">
              <ThemeModeToggle />
            </span>
        </div>

        <section className="mfV2Hero">
          <div className="mfV2HeroCopy">
            <div className="mfV2Kicker">
              <span className="mfV2LiveDot" />
              CORE EQUITY PORTFOLIO INTELLIGENCE
            </div>
            <h1>
              Follow the funds that
              <span> actually matter.</span>
            </h1>
            <p>
              A precision-first view of selected HDFC active equity schemes.
              Company identities are reconciled by ISIN across monthly factsheets
              before accumulation, exits and consensus are calculated.
            </p>
            <div className="mfV2HeroMeta">
              <span>2025–2026 history</span>
              <span>{schemes.length} core schemes live</span>
              <span>Latest: {meta.latestMonth ?? currentMonth}</span>
            </div>
          </div>

          <aside className="mfV2QualityCard">
            <div className="mfV2QualityHead">
              <span>DATA QUALITY</span>
              <strong>{quality.isinCoveragePct ?? 0}% ISIN coverage</strong>
            </div>
            <div className="mfV2QualityGrid">
              <div>
                <strong>{quality.repairedCompanyNames ?? 0}</strong>
                <span>names repaired</span>
              </div>
              <div>
                <strong>{quality.droppedSuspiciousCompanyFragments ?? 0}</strong>
                <span>bad fragments removed</span>
              </div>
            </div>
            <small>
              Stable security IDs are used for month-on-month comparisons to
              reduce false New and Exit signals.
            </small>
          </aside>
        </section>

        <section className="mfV2Controls">
          <label className="mfV2ControlWide">
            <span>SCHEME UNIVERSE</span>
            <select value={scheme} onChange={(e) => setScheme(e.target.value)}>
              <option>All Core Schemes</option>
              {schemes.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            <span>CURRENT MONTH</span>
            <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)}>
              {months.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            <span>COMPARE WITH</span>
            <select value={previousMonth} onChange={(e) => setPreviousMonth(e.target.value)}>
              {months.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="mfV2Stats">
          <article>
            <span>CLEAN SECURITIES</span>
            <strong>{stats.securities}</strong>
            <small>stable identities this month</small>
          </article>
          <article>
            <span>CORE SCHEMES</span>
            <strong>{stats.coreSchemes}</strong>
            <small>in selected view</small>
          </article>
          <article>
            <span>INCREASED</span>
            <strong>{stats.increased}</strong>
            <small>meaningful weight additions</small>
          </article>
          <article>
            <span>NEW</span>
            <strong>{stats.fresh}</strong>
            <small>new security identities</small>
          </article>
          <article>
            <span>EXITS</span>
            <strong>{stats.exits}</strong>
            <small>not present this month</small>
          </article>
        </section>

        <section className="mfV2MainGrid">
          <article className="mfV2Panel mfV2PanelWide">
            <div className="mfV2PanelHead">
              <div>
                <span className="mfV2SectionTag">CONSENSUS OWNERSHIP</span>
                <h2>Core fund favourite stocks</h2>
                <p>
                  {scheme === "All Core Schemes"
                    ? "Consensus rewards breadth across core schemes plus meaningful average portfolio weight."
                    : "For a single scheme, ranking is driven by portfolio weight; month-on-month change is shown separately."}
                </p>
              </div>
              <button
                onClick={() =>
                  csvDownload(
                    "credonomics-core-mf-stocks.csv",
                    visibleStocks.map((x) => ({
                      Stock: x.stock,
                      Sector: x.sector,
                      Schemes: x.schemes.size,
                      "Average Weight": x.avg.toFixed(2),
                      "MoM Change": x.change.toFixed(2),
                      Score: x.consensus.toFixed(1),
                    }))
                  )
                }
              >
                Export clean CSV
              </button>
            </div>

            <div className="mfV2SearchWrap">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search a company or sector…"
              />
              <span>{visibleStocks.length} securities</span>
            </div>

            <div className="mfV2TableWrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Security</th>
                    <th>Sector</th>
                    <th>Schemes</th>
                    <th>Avg. weight</th>
                    <th>MoM</th>
                    <th>Consensus</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStocks.slice(0, 60).map((x, index) => (
                    <tr key={x.id}>
                      <td className="mfV2Rank">{index + 1}</td>
                      <td>
                        <strong className="mfV2Stock">{x.stock}</strong>
                      </td>
                      <td className="mfV2Muted">{x.sector}</td>
                      <td>{x.schemes.size}</td>
                      <td>{pct(x.avg)}</td>
                      <td>
                        <span
                          className={
                            x.change > 0.01
                              ? "mfV2Delta up"
                              : x.change < -0.01
                              ? "mfV2Delta down"
                              : "mfV2Delta flat"
                          }
                        >
                          {pp(x.change)}
                        </span>
                      </td>
                      <td>
                        <span className="mfV2Score">{x.consensus.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="mfV2Panel">
            <div className="mfV2PanelHead compact">
              <div>
                <span className="mfV2SectionTag">MONTHLY ACTIVITY</span>
                <h2>Largest portfolio moves</h2>
              </div>
            </div>

            <div className="mfV2MovementList">
              {movements.slice(0, 18).map((x) => (
                <div className="mfV2Movement" key={`${x.id}-${x.status}`}>
                  <div>
                    <strong>{x.stock}</strong>
                    <span>{x.sector}</span>
                  </div>
                  <div className="mfV2MoveRight">
                    <em className={`mfV2Badge ${x.status.toLowerCase()}`}>
                      {x.status}
                    </em>
                    <small>{pp(x.change)}</small>
                  </div>
                </div>
              ))}

              {!movements.length && (
                <div className="mfV2Empty">No material changes for this comparison.</div>
              )}
            </div>
          </article>
        </section>

        <section className="mfV2LowerGrid">
          <article className="mfV2Panel">
            <div className="mfV2PanelHead compact">
              <div>
                <span className="mfV2SectionTag">SECTOR POSITIONING</span>
                <h2>Average sector exposure</h2>
                <p>Normalised per selected scheme, so multi-scheme totals remain comparable.</p>
              </div>
            </div>

            <div className="mfV2SectorList">
              {sectorData.slice(0, 14).map((x) => {
                const max = Math.max(...sectorData.map((s) => s.current), 1);
                const width = Math.max(2, (x.current / max) * 100);

                return (
                  <div className="mfV2Sector" key={x.sector}>
                    <div>
                      <strong>{x.sector}</strong>
                      <span>{pct(x.current)}</span>
                    </div>
                    <div className="mfV2Bar">
                      <i style={{ width: `${width}%` }} />
                    </div>
                    <small className={x.change >= 0 ? "upText" : "downText"}>
                      {pp(x.change)} vs {previousMonth}
                    </small>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="mfV2Panel mfV2Method">
            <span className="mfV2SectionTag">METHODOLOGY</span>
            <h2>Cleaner identity. Better signals.</h2>

            <div className="mfV2MethodItem">
              <strong>01 · Security identity</strong>
              <p>
                ISIN is the primary key where available, instead of raw PDF company
                text. This prevents spelling fragments from becoming fake stocks.
              </p>
            </div>

            <div className="mfV2MethodItem">
              <strong>02 · Company repair</strong>
              <p>
                The best complete company name observed for the same ISIN across
                selected months is reused consistently.
              </p>
            </div>

            <div className="mfV2MethodItem">
              <strong>03 · Precision-first filtering</strong>
              <p>
                Dedicated index-only factsheets and unrecoverable company fragments
                are excluded from the public ranking.
              </p>
            </div>

            <Link href="/methodology" className="mfV2MethodLink">
              Read CredoNomics methodology →
            </Link>
          </article>
        </section>

        {meta.missingCoreSchemes && meta.missingCoreSchemes.length > 0 && (
          <aside className="mfV2Notice">
            <strong>Coverage note</strong>
            <span>
              {meta.missingCoreSchemes.join(", ")} currently do not have enough
              clean public-ready observations to be included. They will appear
              automatically when the source data meets the quality rules.
            </span>
          </aside>
        )}

        <aside className="mfV2Disclaimer">
          <div>
            <strong>Research tool — not investment advice</strong>
            <p>
              CredoNomics is not SEBI-registered as an Investment Adviser or
              Research Analyst and is not NISM-certified. Portfolio data is
              extracted from historical AMC factsheets and may contain source or
              extraction limitations. Verify material information with the AMC.
            </p>
          </div>
          <Link href="/disclosures">Disclosures →</Link>
        </aside>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
.mfV2Page {
    min-height: 72vh;
    background:
      radial-gradient(circle at 82% 4%, rgba(24, 174, 255, .10), transparent 28rem),
      radial-gradient(circle at 18% 0%, rgba(0, 193, 163, .08), transparent 24rem),
      #f5f7fa;
    color: #071629;
    font-family: Arial, Helvetica, sans-serif;
  }

  .mfV2Shell {
    width: min(1320px, calc(100% - 40px));
    margin: 0 auto;
    padding: 46px 0 78px;
  }

  .mfV2Breadcrumbs {
    display: flex;
    gap: 9px;
    align-items: center;
    margin: 0 0 22px;
    font-size: 12px;
    color: #68778a;
  }

  .mfV2Breadcrumbs a {
    color: inherit;
    text-decoration: none;
  }

  .mfV2Hero {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(300px, .65fr);
    gap: 22px;
    align-items: stretch;
    margin-bottom: 22px;
  }

  .mfV2HeroCopy,
  .mfV2QualityCard,
  .mfV2Controls,
  .mfV2Panel,
  .mfV2Notice,
  .mfV2Disclaimer {
    border: 1px solid rgba(10, 37, 64, .09);
    background: rgba(255, 255, 255, .92);
    box-shadow: 0 18px 60px rgba(31, 56, 82, .07);
  }

  .mfV2HeroCopy {
    border-radius: 26px;
    padding: 42px;
  }

  .mfV2Kicker,
  .mfV2SectionTag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #008e87;
    letter-spacing: .13em;
    font-weight: 800;
    font-size: 11px;
  }

  .mfV2LiveDot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00b99e;
    box-shadow: 0 0 0 6px rgba(0, 185, 158, .10);
  }

  .mfV2Hero h1 {
    max-width: 820px;
    margin: 18px 0 15px;
    font-size: clamp(42px, 5vw, 74px);
    line-height: .98;
    letter-spacing: -.055em;
  }

  .mfV2Hero h1 span {
    background: linear-gradient(90deg, #00a795, #1478ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .mfV2HeroCopy > p {
    max-width: 820px;
    margin: 0;
    color: #58697d;
    line-height: 1.7;
    font-size: 16px;
  }

  .mfV2HeroMeta {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 26px;
  }

  .mfV2HeroMeta span {
    padding: 8px 11px;
    border: 1px solid #dce5ee;
    border-radius: 999px;
    background: #f8fafc;
    font-size: 11px;
    font-weight: 700;
    color: #496074;
  }

  .mfV2QualityCard {
    border-radius: 26px;
    padding: 28px;
    background:
      linear-gradient(155deg, rgba(5, 25, 48, .99), rgba(8, 40, 70, .97));
    color: white;
  }

  .mfV2QualityHead {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mfV2QualityHead span {
    color: #8de8de;
    font-size: 10px;
    letter-spacing: .15em;
    font-weight: 800;
  }

  .mfV2QualityHead strong {
    font-size: 25px;
    letter-spacing: -.03em;
  }

  .mfV2QualityGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 26px 0 18px;
  }

  .mfV2QualityGrid div {
    padding: 16px;
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 16px;
    background: rgba(255,255,255,.04);
  }

  .mfV2QualityGrid strong,
  .mfV2QualityGrid span {
    display: block;
  }

  .mfV2QualityGrid strong {
    font-size: 23px;
  }

  .mfV2QualityGrid span,
  .mfV2QualityCard small {
    color: #9fb2c6;
    line-height: 1.5;
    font-size: 11px;
  }

  .mfV2Controls {
    display: grid;
    grid-template-columns: 1.4fr .8fr .8fr;
    gap: 12px;
    padding: 16px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .mfV2Controls label {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mfV2Controls label > span {
    padding-left: 3px;
    font-size: 10px;
    letter-spacing: .12em;
    font-weight: 800;
    color: #516479;
  }

  .mfV2Controls select {
    min-height: 49px;
    width: 100%;
    border: 1px solid #d8e1ea;
    border-radius: 13px;
    background: #f9fbfc;
    color: #08192d;
    padding: 0 14px;
    font-weight: 700;
    outline: none;
  }

  .mfV2Stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    overflow: hidden;
    margin-bottom: 22px;
    border-radius: 22px;
    background: #071a30;
    color: white;
    box-shadow: 0 18px 50px rgba(7, 26, 48, .13);
  }

  .mfV2Stats article {
    padding: 22px 24px;
    border-right: 1px solid rgba(255,255,255,.09);
  }

  .mfV2Stats article:last-child {
    border-right: 0;
  }

  .mfV2Stats span,
  .mfV2Stats strong,
  .mfV2Stats small {
    display: block;
  }

  .mfV2Stats span {
    color: #91a8c0;
    font-size: 10px;
    letter-spacing: .09em;
    font-weight: 800;
  }

  .mfV2Stats strong {
    margin: 11px 0 5px;
    font-size: 30px;
    letter-spacing: -.04em;
  }

  .mfV2Stats small {
    color: #738ba5;
    font-size: 10px;
  }

  .mfV2MainGrid {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(320px, .72fr);
    gap: 18px;
    align-items: start;
  }

  .mfV2LowerGrid {
    display: grid;
    grid-template-columns: 1.2fr .8fr;
    gap: 18px;
    margin-top: 18px;
  }

  .mfV2Panel {
    border-radius: 23px;
    padding: 24px;
    overflow: hidden;
  }

  .mfV2PanelHead {
    display: flex;
    justify-content: space-between;
    gap: 22px;
    align-items: flex-start;
    margin-bottom: 18px;
  }

  .mfV2PanelHead.compact {
    margin-bottom: 14px;
  }

  .mfV2PanelHead h2,
  .mfV2Method h2 {
    margin: 7px 0 6px;
    font-size: 25px;
    letter-spacing: -.035em;
  }

  .mfV2PanelHead p,
  .mfV2Method p {
    margin: 0;
    color: #65758a;
    line-height: 1.55;
    font-size: 12px;
  }

  .mfV2PanelHead button {
    flex: 0 0 auto;
    border: 0;
    border-radius: 12px;
    background: #071a30;
    color: white;
    padding: 12px 15px;
    cursor: pointer;
    font-weight: 750;
  }

  .mfV2SearchWrap {
    display: flex;
    align-items: center;
    border: 1px solid #dce4ec;
    background: #f8fafc;
    border-radius: 13px;
    padding-right: 14px;
    margin-bottom: 14px;
  }

  .mfV2SearchWrap input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 13px 14px;
    color: #0a1b2d;
  }

  .mfV2SearchWrap span {
    color: #8391a0;
    font-size: 10px;
    font-weight: 700;
  }

  .mfV2TableWrap {
    overflow-x: auto;
    border: 1px solid #e1e7ed;
    border-radius: 15px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
  }

  thead {
    background: #f5f8fa;
  }

  th {
    padding: 12px;
    text-align: left;
    color: #66778b;
    font-size: 9px;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  td {
    padding: 13px 12px;
    border-top: 1px solid #edf1f4;
    font-size: 12px;
    vertical-align: middle;
  }

  tbody tr:hover {
    background: #fbfdfd;
  }

  .mfV2Rank,
  .mfV2Muted {
    color: #718196;
  }

  .mfV2Stock {
    color: #07172a;
  }

  .mfV2Score {
    display: inline-flex;
    min-width: 45px;
    justify-content: center;
    padding: 7px 9px;
    border-radius: 999px;
    background: #e8faf7;
    color: #008b7d;
    font-weight: 850;
  }

  .mfV2Delta {
    font-weight: 750;
    font-size: 11px;
  }

  .mfV2Delta.up,
  .upText {
    color: #048a6d;
  }

  .mfV2Delta.down,
  .downText {
    color: #cf4e4e;
  }

  .mfV2Delta.flat {
    color: #7b8998;
  }

  .mfV2MovementList {
    display: flex;
    flex-direction: column;
  }

  .mfV2Movement {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 0;
    border-bottom: 1px solid #edf1f4;
  }

  .mfV2Movement:last-child {
    border-bottom: 0;
  }

  .mfV2Movement > div:first-child {
    min-width: 0;
  }

  .mfV2Movement strong,
  .mfV2Movement span {
    display: block;
  }

  .mfV2Movement strong {
    overflow: hidden;
    text-overflow: ellipsis;
    color: #07172a;
    font-size: 12px;
    white-space: nowrap;
  }

  .mfV2Movement span {
    margin-top: 4px;
    color: #8391a0;
    font-size: 10px;
  }

  .mfV2MoveRight {
    flex: 0 0 auto;
    text-align: right;
  }

  .mfV2MoveRight small {
    display: block;
    margin-top: 5px;
    color: #657589;
    font-size: 9px;
  }

  .mfV2Badge {
    display: inline-flex;
    padding: 5px 7px;
    border-radius: 999px;
    font-style: normal;
    font-size: 9px;
    font-weight: 850;
  }

  .mfV2Badge.new,
  .mfV2Badge.increased {
    background: #e7f8f2;
    color: #078060;
  }

  .mfV2Badge.exit,
  .mfV2Badge.reduced {
    background: #fff0ee;
    color: #c54b46;
  }

  .mfV2Empty {
    padding: 32px 0;
    color: #8493a1;
    font-size: 12px;
  }

  .mfV2SectorList {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px 18px;
  }

  .mfV2Sector > div:first-child {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 11px;
  }

  .mfV2Bar {
    overflow: hidden;
    height: 5px;
    margin: 8px 0 6px;
    border-radius: 999px;
    background: #edf2f5;
  }

  .mfV2Bar i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #00aa98, #1782ff);
  }

  .mfV2Sector small {
    font-size: 9px;
  }

  .mfV2Method {
    background:
      linear-gradient(145deg, rgba(255,255,255,.97), rgba(241,248,251,.96));
  }

  .mfV2MethodItem {
    padding: 15px 0;
    border-bottom: 1px solid #e4eaef;
  }

  .mfV2MethodItem strong {
    display: block;
    margin-bottom: 5px;
    font-size: 11px;
  }

  .mfV2MethodLink {
    display: inline-flex;
    margin-top: 18px;
    color: #087eec;
    text-decoration: none;
    font-size: 11px;
    font-weight: 800;
  }

  .mfV2Notice,
  .mfV2Disclaimer {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: center;
    margin-top: 18px;
    border-radius: 18px;
    padding: 18px 21px;
  }

  .mfV2Notice {
    border-color: #f2dfaf;
    background: #fffaf0;
    box-shadow: none;
  }

  .mfV2Notice strong {
    color: #825d05;
  }

  .mfV2Notice span {
    flex: 1;
    color: #7d6c42;
    font-size: 11px;
  }

  .mfV2Disclaimer {
    background: #071a30;
    color: white;
  }

  .mfV2Disclaimer strong {
    font-size: 12px;
  }

  .mfV2Disclaimer p {
    max-width: 1050px;
    margin: 5px 0 0;
    color: #95a9bd;
    line-height: 1.5;
    font-size: 10px;
  }

  .mfV2Disclaimer a {
    flex: 0 0 auto;
    color: #8de8de;
    text-decoration: none;
    font-size: 11px;
    font-weight: 800;
  }

  .mfV2Loading {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    color: #16304c;
  }

  .mfV2Loading span {
    color: #718196;
    font-size: 11px;
  }

  .mfV2Pulse {
    width: 12px;
    height: 12px;
    margin-bottom: 8px;
    border-radius: 50%;
    background: #00aa98;
    box-shadow: 0 0 0 0 rgba(0,170,152,.35);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    70% { box-shadow: 0 0 0 14px rgba(0,170,152,0); }
    100% { box-shadow: 0 0 0 0 rgba(0,170,152,0); }
  }

  @media (max-width: 1050px) {
    .mfV2Hero,
    .mfV2MainGrid,
    .mfV2LowerGrid {
      grid-template-columns: 1fr;
    }

    .mfV2Stats {
      grid-template-columns: repeat(3, 1fr);
    }

    .mfV2Stats article:nth-child(3) {
      border-right: 0;
    }
  }

  @media (max-width: 760px) {
    .mfV2Shell {
      width: min(100% - 22px, 1480px);
      padding-top: 20px;
    }

    .mfV2HeroCopy {
      padding: 28px 22px;
    }

    .mfV2Hero h1 {
      font-size: 43px;
    }

    .mfV2Controls {
      grid-template-columns: 1fr;
    }

    .mfV2Stats {
      grid-template-columns: 1fr 1fr;
    }

    .mfV2Stats article {
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    .mfV2SectorList {
      grid-template-columns: 1fr;
    }

    .mfV2Panel {
      padding: 18px;
    }

    .mfV2PanelHead {
      flex-direction: column;
    }

    .mfV2Notice,
    .mfV2Disclaimer {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`;
