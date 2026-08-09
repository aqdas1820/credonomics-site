"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Holding = {
  amc: string;
  scheme: string;
  month: string;
  stock: string;
  sector: string;
  weight: number;
};

type Dataset = {
  holdings: Holding[];
};

type StockSummary = {
  stock: string;
  sector: string;
  schemes: Set<string>;
  amcs: Set<string>;
  sum: number;
  count: number;
  avg: number;
  conviction: number;
};

const DEMO_URL = "/data/mf-intelligence/demo.json";
const PROD_URL = "/data/mf-intelligence/all.json";

function normaliseHolding(row: any): Holding {
  return {
    amc: String(row.amc ?? row.AMC ?? "").trim(),
    scheme: String(row.scheme ?? row.Scheme ?? "").trim(),
    month: String(row.month ?? row.Month ?? row.report_date ?? row.Report_Date ?? "").trim(),
    stock: String(row.stock ?? row.Stock ?? row.company ?? row.Company ?? "").trim(),
    sector: String(row.sector ?? row.Sector ?? row.industry ?? row.Industry ?? "Unclassified").trim(),
    weight: Number(
      row.weight ??
        row.Weight ??
        row.portfolio_weight_percent ??
        row.Portfolio_Weight_Percent ??
        0
    ),
  };
}

function monthKey(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
  return 0;
}

function pct(value: number) {
  return `${value.toFixed(2)}%`;
}

function deltaText(value: number) {
  if (value > 0) return `+${value.toFixed(2)} pp`;
  if (value < 0) return `${value.toFixed(2)} pp`;
  return "0.00 pp";
}

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
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
  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState<"production" | "demo">("demo");
  const [amc, setAmc] = useState("All AMCs");
  const [scheme, setScheme] = useState("All Schemes");
  const [currentMonth, setCurrentMonth] = useState("");
  const [previousMonth, setPreviousMonth] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        let response = await fetch(PROD_URL, { cache: "no-store" });
        let mode: "production" | "demo" = "production";

        if (!response.ok) {
          response = await fetch(DEMO_URL, { cache: "no-store" });
          mode = "demo";
        }

        if (!response.ok) throw new Error("Unable to load MF intelligence dataset.");

        const json: Dataset | Holding[] = await response.json();
        const raw = Array.isArray(json) ? json : json.holdings ?? [];
        const clean = raw
          .map(normaliseHolding)
          .filter((x) => x.amc && x.scheme && x.month && x.stock);

        setRows(clean);
        setDataMode(mode);

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

  const amcs = useMemo(
    () => Array.from(new Set(rows.map((x) => x.amc))).sort(),
    [rows]
  );

  const schemes = useMemo(() => {
    const filtered = amc === "All AMCs" ? rows : rows.filter((x) => x.amc === amc);
    return Array.from(new Set(filtered.map((x) => x.scheme))).sort();
  }, [rows, amc]);

  const months = useMemo(
    () =>
      Array.from(new Set(rows.map((x) => x.month))).sort(
        (a, b) => monthKey(b) - monthKey(a)
      ),
    [rows]
  );

  useEffect(() => {
    if (scheme !== "All Schemes" && !schemes.includes(scheme)) {
      setScheme("All Schemes");
    }
  }, [schemes, scheme]);

  const filteredRows = useMemo(() => {
    return rows.filter((x) => {
      if (amc !== "All AMCs" && x.amc !== amc) return false;
      if (scheme !== "All Schemes" && x.scheme !== scheme) return false;
      return true;
    });
  }, [rows, amc, scheme]);

  const currentRows = useMemo(
    () => filteredRows.filter((x) => x.month === currentMonth),
    [filteredRows, currentMonth]
  );

  const previousRows = useMemo(
    () => filteredRows.filter((x) => x.month === previousMonth),
    [filteredRows, previousMonth]
  );

  const stockIntelligence = useMemo<StockSummary[]>(() => {
    const map = new Map<
      string,
      {
        stock: string;
        sector: string;
        schemes: Set<string>;
        amcs: Set<string>;
        sum: number;
        count: number;
      }
    >();

    currentRows.forEach((r) => {
      const key = r.stock.toLowerCase();
      const existing = map.get(key) ?? {
        stock: r.stock,
        sector: r.sector,
        schemes: new Set<string>(),
        amcs: new Set<string>(),
        sum: 0,
        count: 0,
      };

      existing.schemes.add(r.scheme);
      existing.amcs.add(r.amc);
      existing.sum += r.weight;
      existing.count += 1;
      map.set(key, existing);
    });

    return Array.from(map.values())
      .map((x) => {
        const avg = x.count > 0 ? x.sum / x.count : 0;

        return {
          ...x,
          avg,
          conviction: x.amcs.size * 12 + x.schemes.size * 4 + avg,
        };
      })
      .sort((a, b) => b.conviction - a.conviction);
  }, [currentRows]);

  const movements = useMemo(() => {
    const current = new Map(currentRows.map((x) => [x.stock.toLowerCase(), x]));
    const previous = new Map(previousRows.map((x) => [x.stock.toLowerCase(), x]));
    const keys = Array.from(new Set([...current.keys(), ...previous.keys()]));

    return keys
      .map((key) => {
        const curr = current.get(key);
        const prev = previous.get(key);
        const currentWeight = curr?.weight ?? 0;
        const previousWeight = prev?.weight ?? 0;
        const change = currentWeight - previousWeight;

        let status: "New" | "Exit" | "Increased" | "Reduced" | "Unchanged";
        if (curr && !prev) status = "New";
        else if (!curr && prev) status = "Exit";
        else if (change > 0.001) status = "Increased";
        else if (change < -0.001) status = "Reduced";
        else status = "Unchanged";

        return {
          stock: curr?.stock ?? prev?.stock ?? key,
          sector: curr?.sector ?? prev?.sector ?? "Unclassified",
          currentWeight,
          previousWeight,
          change,
          status,
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [currentRows, previousRows]);

  const sectorData = useMemo(() => {
    const current = new Map<string, number>();
    const previous = new Map<string, number>();

    currentRows.forEach((x) =>
      current.set(x.sector, (current.get(x.sector) ?? 0) + x.weight)
    );
    previousRows.forEach((x) =>
      previous.set(x.sector, (previous.get(x.sector) ?? 0) + x.weight)
    );

    const sectors = Array.from(new Set([...current.keys(), ...previous.keys()]));

    return sectors
      .map((sector) => {
        const curr = current.get(sector) ?? 0;
        const prev = previous.get(sector) ?? 0;
        return { sector, current: curr, previous: prev, change: curr - prev };
      })
      .sort((a, b) => b.current - a.current);
  }, [currentRows, previousRows]);

  const visibleStocks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stockIntelligence;
    return stockIntelligence.filter(
      (x) =>
        x.stock.toLowerCase().includes(q) ||
        x.sector.toLowerCase().includes(q)
    );
  }, [stockIntelligence, search]);

  const stats = useMemo(() => {
    const uniqueStocks = new Set(currentRows.map((x) => x.stock.toLowerCase())).size;
    const uniqueSchemes = new Set(currentRows.map((x) => x.scheme)).size;
    const uniqueAmcs = new Set(currentRows.map((x) => x.amc)).size;
    const increased = movements.filter((x) => x.status === "Increased").length;
    const newStocks = movements.filter((x) => x.status === "New").length;

    return { uniqueStocks, uniqueSchemes, uniqueAmcs, increased, newStocks };
  }, [currentRows, movements]);

  if (loading) {
    return (
      <main className="mfProPage">
        <div className="mfShell">
          <p className="mfEyebrow">CredoNomics Intelligence</p>
          <h1>Loading MF Portfolio Intelligence…</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="mfProPage">
      <div className="mfShell">
        <header className="mfTopbar">
          <Link href="/" className="mfBrand">
            <span className="mfBrandMark">C</span>
            <span>CredoNomics</span>
          </Link>

          <nav className="mfNav">
            <Link href="/">Home</Link>
            <Link href="/research">Research</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </nav>
        </header>

        <section className="mfHero">
          <div>
            <p className="mfEyebrow">Mutual Fund Intelligence</p>
            <h1>
              See what India&apos;s mutual funds are
              <span> actually buying.</span>
            </h1>
            <p className="mfLead">
              Compare monthly AMC and scheme portfolios, discover favourite
              stocks, identify accumulation and exits, study sector allocation
              and track portfolio changes across historical factsheets.
            </p>
          </div>

          <div className="mfModeCard">
            <span className={`mfModeDot ${dataMode}`} />
            <div>
              <strong>
                {dataMode === "production" ? "Production dataset" : "Demo dataset"}
              </strong>
              <p>
                {dataMode === "production"
                  ? "Using public/data/mf-intelligence/all.json"
                  : "Add all.json to automatically switch to your full dataset."}
              </p>
            </div>
          </div>
        </section>

        <section className="mfFilters">
          <label>
            AMC
            <select value={amc} onChange={(e) => setAmc(e.target.value)}>
              <option>All AMCs</option>
              {amcs.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            Scheme
            <select value={scheme} onChange={(e) => setScheme(e.target.value)}>
              <option>All Schemes</option>
              {schemes.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            Current month
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
            >
              {months.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            Compare with
            <select
              value={previousMonth}
              onChange={(e) => setPreviousMonth(e.target.value)}
            >
              {months.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="mfStats">
          <article>
            <span>Stocks tracked</span>
            <strong>{stats.uniqueStocks}</strong>
          </article>
          <article>
            <span>Schemes</span>
            <strong>{stats.uniqueSchemes}</strong>
          </article>
          <article>
            <span>AMCs</span>
            <strong>{stats.uniqueAmcs}</strong>
          </article>
          <article>
            <span>Holdings increased</span>
            <strong>{stats.increased}</strong>
          </article>
          <article>
            <span>New entries</span>
            <strong>{stats.newStocks}</strong>
          </article>
        </section>

        <section className="mfGrid">
          <article className="mfPanel mfPanelWide">
            <div className="mfPanelHead">
              <div>
                <p className="mfEyebrow">Smart Money</p>
                <h2>Mutual fund favourite stocks</h2>
                <p>
                  Ranked using AMC ownership, scheme ownership and average
                  portfolio weight.
                </p>
              </div>

              <button
                onClick={() =>
                  downloadCsv(
                    "credonomics-mf-favourite-stocks.csv",
                    visibleStocks.map((x) => ({
                      Stock: x.stock,
                      Sector: x.sector,
                      AMCs: x.amcs.size,
                      Schemes: x.schemes.size,
                      "Average Weight": x.avg.toFixed(2),
                      "Conviction Score": x.conviction.toFixed(2),
                    }))
                  )
                }
              >
                Export CSV
              </button>
            </div>

            <input
              className="mfSearch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stock or sector…"
            />

            <div className="mfTableWrap">
              <table className="mfTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Stock</th>
                    <th>Sector</th>
                    <th>AMCs</th>
                    <th>Schemes</th>
                    <th>Avg. weight</th>
                    <th>Conviction</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStocks.slice(0, 50).map((x, index) => (
                    <tr key={`${x.stock}-${index}`}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{x.stock}</strong>
                      </td>
                      <td>{x.sector}</td>
                      <td>{x.amcs.size}</td>
                      <td>{x.schemes.size}</td>
                      <td>{pct(x.avg)}</td>
                      <td>
                        <span className="mfScore">{x.conviction.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="mfPanel">
            <div className="mfPanelHead">
              <div>
                <p className="mfEyebrow">Portfolio Activity</p>
                <h2>Recent holding changes</h2>
              </div>
            </div>

            <div className="mfMovementList">
              {movements.slice(0, 18).map((x) => (
                <div className="mfMovement" key={`${x.stock}-${x.status}`}>
                  <div>
                    <strong>{x.stock}</strong>
                    <span>{x.sector}</span>
                  </div>
                  <div className="mfMovementRight">
                    <span className={`mfStatus ${x.status.toLowerCase()}`}>
                      {x.status}
                    </span>
                    <small>{deltaText(x.change)}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mfPanel">
            <div className="mfPanelHead">
              <div>
                <p className="mfEyebrow">Sector Intelligence</p>
                <h2>Sector allocation & shifts</h2>
              </div>
            </div>

            <div className="mfSectorList">
              {sectorData.slice(0, 15).map((x) => {
                const max = Math.max(...sectorData.map((s) => s.current), 1);
                const width = Math.max(3, (x.current / max) * 100);

                return (
                  <div className="mfSector" key={x.sector}>
                    <div className="mfSectorTop">
                      <strong>{x.sector}</strong>
                      <span>{pct(x.current)}</span>
                    </div>
                    <div className="mfSectorBar">
                      <span style={{ width: `${width}%` }} />
                    </div>
                    <small>{deltaText(x.change)} vs comparison month</small>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="mfMethod">
          <div>
            <p className="mfEyebrow">How to read the dashboard</p>
            <h2>Portfolio evidence, not predictions.</h2>
          </div>
          <div className="mfMethodGrid">
            <p>
              <strong>Favourite stocks</strong>
              Stocks appearing across more AMCs and schemes receive a higher
              ownership component in the conviction score.
            </p>
            <p>
              <strong>Holding changes</strong>
              Current and previous factsheet snapshots are compared to identify
              new entries, exits, increases and reductions.
            </p>
            <p>
              <strong>Sector shifts</strong>
              Portfolio weights are aggregated by sector to show where selected
              funds have increased or reduced exposure.
            </p>
          </div>
        </section>

        <aside className="mfDisclaimer">
          <strong>Important disclaimer</strong>
          <p>
            CredoNomics Investment Solutions is not registered with SEBI as an
            Investment Adviser or Research Analyst and is not NISM-certified.
            This dashboard, its rankings, calculations, portfolio information and
            research are provided only for educational and informational
            purposes. They are not investment advice or a recommendation to buy,
            sell or hold any security or mutual fund. Mutual fund and securities
            investments are subject to market risks. Verify important information
            with official AMC/regulatory sources and consult an appropriately
            qualified professional where personalised advice is required.
          </p>
          <Link href="/disclaimer">Read full disclaimer →</Link>
        </aside>

        <footer className="mfFooter">
          <span>© {new Date().getFullYear()} CredoNomics Investment Solutions</span>
          <div>
            <Link href="/">Home</Link>
            <Link href="/research">Research</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}