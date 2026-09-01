"use client";

import { useMemo, useState } from "react";
type NormalizedIPO = {
  id: string;
  company: string;
  type: string;
  status: string;
  exchange: string | null;
  issueType: string | null;
  priceLow: number | null;
  priceHigh: number | null;
  lotSize: number | null;
  issueSizeCr: number | null;
  freshIssueCr: number | null;
  ofsCr: number | null;
  openDate: string | null;
  closeDate: string | null;
  allotmentDate: string | null;
  listingDate: string | null;
  listingPrice: number | null;
  subscription: number | null;
  gmp: number | null;
  gain: number | null;
  registrar: string | null;
  leadManager: string | null;
  sourceFile: string | null;
  sourceUrl: string | null;
  rhpUrl: string | null;
  drhpUrl: string | null;
};

type Props = {
  initialIPOs: NormalizedIPO[];
  sourceFiles: string[];
  generatedAt: string;
};

type Segment = "All" | "Mainboard" | "SME";
type StatusFilter = "All" | "Open" | "Upcoming" | "Closed" | "Listed";

function money(value: number | null, suffix = "") {
  if (value === null || !Number.isFinite(value)) return "—";
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}${suffix}`;
}

function dateLabel(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function shortDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function priceBand(ipo: NormalizedIPO) {
  if (ipo.priceLow === null && ipo.priceHigh === null) return "—";
  if (ipo.priceLow === ipo.priceHigh || ipo.priceLow === null) {
    return money(ipo.priceHigh ?? ipo.priceLow);
  }
  return `${money(ipo.priceLow)} – ${money(ipo.priceHigh)}`;
}

function minInvestment(ipo: NormalizedIPO) {
  if (!ipo.priceHigh || !ipo.lotSize) return null;
  return ipo.priceHigh * ipo.lotSize;
}

function listingGain(ipo: NormalizedIPO) {
  if (!ipo.priceHigh || !ipo.listingPrice) return null;
  return ((ipo.listingPrice - ipo.priceHigh) / ipo.priceHigh) * 100;
}

function statusTone(status: string) {
  if (status === "Open") return "good";
  if (status === "Upcoming") return "info";
  if (status === "Listed") return "neutral";
  if (status === "Closed") return "warn";
  return "muted";
}

export default function IPOHubClient({
  initialIPOs,
  sourceFiles,
  generatedAt,
}: Props) {
  const [segment, setSegment] = useState<Segment>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date");
  const [selected, setSelected] = useState<NormalizedIPO | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const rows = initialIPOs.filter((ipo) => {
      if (segment !== "All" && ipo.type !== segment) return false;
      if (status !== "All" && ipo.status !== status) return false;
      if (
        q &&
        !ipo.company.toLowerCase().includes(q) &&
        !(ipo.exchange ?? "").toLowerCase().includes(q) &&
        !(ipo.registrar ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    rows.sort((a, b) => {
      if (sort === "subscription") {
        return (b.subscription ?? -1) - (a.subscription ?? -1);
      }
      if (sort === "issue-size") {
        return (b.issueSizeCr ?? -1) - (a.issueSizeCr ?? -1);
      }
      if (sort === "gmp") {
        return (b.gmp ?? -99999) - (a.gmp ?? -99999);
      }

      const ad = a.openDate ?? a.listingDate ?? "0000-00-00";
      const bd = b.openDate ?? b.listingDate ?? "0000-00-00";
      return bd.localeCompare(ad);
    });

    return rows;
  }, [initialIPOs, segment, status, query, sort]);

  const stats = useMemo(() => {
    const rows = segment === "All"
      ? initialIPOs
      : initialIPOs.filter((ipo) => ipo.type === segment);

    return {
      open: rows.filter((x) => x.status === "Open").length,
      upcoming: rows.filter((x) => x.status === "Upcoming").length,
      mainboard: initialIPOs.filter((x) => x.type === "Mainboard").length,
      sme: initialIPOs.filter((x) => x.type === "SME").length,
      listed: rows.filter((x) => x.status === "Listed").length,
    };
  }, [initialIPOs, segment]);

  const openIssues = useMemo(
    () =>
      initialIPOs
        .filter((x) => x.status === "Open")
        .sort((a, b) => (b.subscription ?? -1) - (a.subscription ?? -1)),
    [initialIPOs]
  );

  const upcoming = useMemo(
    () =>
      initialIPOs
        .filter((x) => x.status === "Upcoming")
        .sort((a, b) => (a.openDate ?? "").localeCompare(b.openDate ?? "")),
    [initialIPOs]
  );

  const listedPerformance = useMemo(
    () =>
      initialIPOs
        .filter(
          (x) =>
            x.status === "Listed" &&
            x.priceHigh !== null &&
            x.listingPrice !== null
        )
        .map((x) => ({ ...x, gain: listingGain(x) ?? 0 }))
        .sort((a, b) => b.gain - a.gain),
    [initialIPOs]
  );

  const calendar = useMemo(
    () =>
      initialIPOs
        .filter(
          (x) =>
            x.openDate ||
            x.closeDate ||
            x.allotmentDate ||
            x.listingDate
        )
        .sort((a, b) =>
          (b.openDate ?? b.closeDate ?? b.listingDate ?? "").localeCompare(
            a.openDate ?? a.closeDate ?? a.listingDate ?? ""
          )
        )
        .slice(0, 16),
    [initialIPOs]
  );

  const hasData = initialIPOs.length > 0;

  return (
    <main className="ipoPage">
      <div className="ipoShell">
        <section className="hero">
          <div className="heroMain">
            <div className="eyebrow">
              <span className="pulse" />
              PRIMARY MARKET INTELLIGENCE
            </div>
            <h1>
              IPO research without the
              <span> information overload.</span>
            </h1>
            <p>
              Current and upcoming IPOs, issue economics, subscription demand,
              allotment and listing timelines, Mainboard/SME separation and
              post-listing performance — structured for fast research.
            </p>

            <div className="quickNav">
              <a href="#dashboard">Dashboard</a>
              <a href="#current">Current IPOs</a>
              <a href="#calendar">Calendar</a>
              <a href="#subscription">Subscription</a>
              <a href="#allotment">Allotment</a>
              <a href="#performance">Performance</a>
            </div>
          </div>

          <aside className="trustCard">
            <span>DATA & SOURCE POLICY</span>
            <strong>Source-linked</strong>
            <p>
              CredoNomics does not fabricate IPO fields. Missing source data is
              shown as unavailable instead of estimated.
            </p>
            <div className="sourceLinks">
              <a
                href="https://www.nseindia.com/market-data/all-upcoming-issues-ipo"
                target="_blank"
                rel="noreferrer"
              >
                NSE IPO data ↗
              </a>
              <a
                href="https://www.bseindia.com/markets/PublicIssues/IPOIssues_new.aspx?id=1&Type=p"
                target="_blank"
                rel="noreferrer"
              >
                BSE Public Issues ↗
              </a>
              <a
                href="https://www.sebi.gov.in/Curation_Links_for_Securities_Market_Data.html"
                target="_blank"
                rel="noreferrer"
              >
                SEBI source directory ↗
              </a>
            </div>
          </aside>
        </section>

        <section id="dashboard" className="statGrid">
          <article>
            <span>OPEN NOW</span>
            <strong>{stats.open}</strong>
            <small>currently accepting bids</small>
          </article>
          <article>
            <span>UPCOMING</span>
            <strong>{stats.upcoming}</strong>
            <small>scheduled issues</small>
          </article>
          <article>
            <span>MAINBOARD</span>
            <strong>{stats.mainboard}</strong>
            <small>records in local dataset</small>
          </article>
          <article>
            <span>SME</span>
            <strong>{stats.sme}</strong>
            <small>kept separate by default</small>
          </article>
          <article>
            <span>LISTED</span>
            <strong>{stats.listed}</strong>
            <small>available for tracking</small>
          </article>
        </section>

        <section className="radar">
          <div className="sectionHead">
            <div>
              <span className="sectionLabel">IPO RADAR</span>
              <h2>What needs attention now</h2>
            </div>
            <small>
              Data build:{" "}
              {new Date(generatedAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </small>
          </div>

          <div className="radarGrid">
            <article className="radarCard accent">
              <span>HIGHEST OPEN DEMAND</span>
              {openIssues[0] ? (
                <>
                  <strong>{openIssues[0].company}</strong>
                  <b>
                    {openIssues[0].subscription !== null
                      ? `${openIssues[0].subscription.toFixed(2)}x`
                      : "Subscription unavailable"}
                  </b>
                  <small>
                    Closes {dateLabel(openIssues[0].closeDate)}
                  </small>
                </>
              ) : (
                <p>No open issue with subscription data.</p>
              )}
            </article>

            <article className="radarCard">
              <span>NEXT TO OPEN</span>
              {upcoming[0] ? (
                <>
                  <strong>{upcoming[0].company}</strong>
                  <b>{dateLabel(upcoming[0].openDate)}</b>
                  <small>{upcoming[0].type}</small>
                </>
              ) : (
                <p>No upcoming issue in the connected dataset.</p>
              )}
            </article>

            <article className="radarCard">
              <span>OPEN MAINBOARD</span>
              {openIssues.find((x) => x.type === "Mainboard") ? (
                <>
                  <strong>
                    {openIssues.find((x) => x.type === "Mainboard")!.company}
                  </strong>
                  <b>
                    {priceBand(
                      openIssues.find((x) => x.type === "Mainboard")!
                    )}
                  </b>
                  <small>Mainboard issue</small>
                </>
              ) : (
                <p>No open Mainboard issue in the dataset.</p>
              )}
            </article>

            <article className="radarCard">
              <span>DATA COVERAGE</span>
              <strong>{initialIPOs.length} normalized IPO records</strong>
              <b>{sourceFiles.length} source files</b>
              <small>
                Missing fields remain blank — never inferred.
              </small>
            </article>
          </div>
        </section>

        {!hasData && (
          <section className="emptyState">
            <span className="sectionLabel">DATA CONNECTION REQUIRED</span>
            <h2>The new IPO terminal is installed, but no compatible IPO JSON was found.</h2>
            <p>
              Add or retain your IPO JSON inside <code>public/</code> with
              “ipo” in its file/folder name. This page automatically normalizes
              common fields such as company name, dates, price band, lot size,
              issue size, subscription, GMP, allotment and listing date.
            </p>
          </section>
        )}

        <section id="current" className="panel">
          <div className="sectionHead">
            <div>
              <span className="sectionLabel">IPO DASHBOARD</span>
              <h2>Current, upcoming and listed issues</h2>
              <p>
                Chittorgarh-style information depth, redesigned as a cleaner
                decision terminal.
              </p>
            </div>
          </div>

          <div className="filters">
            <div className="segmented">
              {(["All", "Mainboard", "SME"] as Segment[]).map((value) => (
                <button
                  key={value}
                  className={segment === value ? "active" : ""}
                  onClick={() => setSegment(value)}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="segmented status">
              {(
                ["All", "Open", "Upcoming", "Closed", "Listed"] as StatusFilter[]
              ).map((value) => (
                <button
                  key={value}
                  className={status === value ? "active" : ""}
                  onClick={() => setStatus(value)}
                >
                  {value}
                </button>
              ))}
            </div>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, exchange, registrar…"
            />

            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="date">Sort: latest</option>
              <option value="subscription">Sort: subscription</option>
              <option value="issue-size">Sort: issue size</option>
              <option value="gmp">Sort: GMP</option>
            </select>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Open / Close</th>
                  <th>Price band</th>
                  <th>Lot</th>
                  <th>Min. investment</th>
                  <th>Issue size</th>
                  <th>Subscription</th>
                  <th>GMP*</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ipo) => (
                  <tr key={ipo.id} onClick={() => setSelected(ipo)}>
                    <td>
                      <strong>{ipo.company}</strong>
                      <span className={`type ${ipo.type.toLowerCase()}`}>
                        {ipo.type}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${statusTone(ipo.status)}`}>
                        {ipo.status}
                      </span>
                    </td>
                    <td className="dates">
                      <b>{shortDate(ipo.openDate)}</b>
                      <span>→</span>
                      <b>{shortDate(ipo.closeDate)}</b>
                    </td>
                    <td>{priceBand(ipo)}</td>
                    <td>{ipo.lotSize?.toLocaleString("en-IN") ?? "—"}</td>
                    <td>
                      {minInvestment(ipo) !== null
                        ? money(minInvestment(ipo))
                        : "—"}
                    </td>
                    <td>
                      {ipo.issueSizeCr !== null
                        ? money(ipo.issueSizeCr, " Cr")
                        : "—"}
                    </td>
                    <td>
                      {ipo.subscription !== null ? (
                        <b className="sub">{ipo.subscription.toFixed(2)}x</b>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {ipo.gmp !== null ? (
                        <span className="gmp">{money(ipo.gmp)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}

                {!filtered.length && (
                  <tr>
                    <td colSpan={9} className="noRows">
                      No IPO records match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="micro">
            * Grey Market Premium (GMP), when present in your connected source
            data, is unofficial and not exchange-regulated. CredoNomics does not
            treat GMP as an investment recommendation.
          </p>
        </section>

        <div className="twoCol">
          <section id="subscription" className="panel">
            <div className="sectionHead compact">
              <div>
                <span className="sectionLabel">LIVE DEMAND LENS</span>
                <h2>Subscription board</h2>
                <p>Demand ranked only where subscription data exists.</p>
              </div>
            </div>

            <div className="rankList">
              {[...initialIPOs]
                .filter((x) => x.subscription !== null)
                .sort(
                  (a, b) => (b.subscription ?? 0) - (a.subscription ?? 0)
                )
                .slice(0, 12)
                .map((ipo, index) => (
                  <button key={ipo.id} onClick={() => setSelected(ipo)}>
                    <span className="rank">{index + 1}</span>
                    <div>
                      <strong>{ipo.company}</strong>
                      <small>
                        {ipo.type} · {ipo.status}
                      </small>
                    </div>
                    <b>{ipo.subscription!.toFixed(2)}x</b>
                  </button>
                ))}

              {!initialIPOs.some((x) => x.subscription !== null) && (
                <p className="emptyMini">No subscription data connected.</p>
              )}
            </div>
          </section>

          <section id="allotment" className="panel">
            <div className="sectionHead compact">
              <div>
                <span className="sectionLabel">POST-CLOSE TRACKER</span>
                <h2>Allotment & listing watch</h2>
                <p>Key dates in one place.</p>
              </div>
            </div>

            <div className="eventList">
              {initialIPOs
                .filter((x) => x.allotmentDate || x.listingDate)
                .sort((a, b) =>
                  (b.allotmentDate ?? b.listingDate ?? "").localeCompare(
                    a.allotmentDate ?? a.listingDate ?? ""
                  )
                )
                .slice(0, 12)
                .map((ipo) => (
                  <button key={ipo.id} onClick={() => setSelected(ipo)}>
                    <div>
                      <strong>{ipo.company}</strong>
                      <small>{ipo.type}</small>
                    </div>
                    <div className="eventDates">
                      <span>
                        Allotment <b>{shortDate(ipo.allotmentDate)}</b>
                      </span>
                      <span>
                        Listing <b>{shortDate(ipo.listingDate)}</b>
                      </span>
                    </div>
                  </button>
                ))}

              {!initialIPOs.some((x) => x.allotmentDate || x.listingDate) && (
                <p className="emptyMini">No allotment/listing dates connected.</p>
              )}
            </div>
          </section>
        </div>

        <section id="calendar" className="panel">
          <div className="sectionHead">
            <div>
              <span className="sectionLabel">IPO CALENDAR</span>
              <h2>Issue timetable</h2>
              <p>
                Open, close, allotment and listing milestones aligned in one row.
              </p>
            </div>
          </div>

          <div className="calendarGrid">
            {calendar.map((ipo) => (
              <button
                key={`${ipo.id}-calendar`}
                className="calendarCard"
                onClick={() => setSelected(ipo)}
              >
                <div className="calendarTop">
                  <span className={`status ${statusTone(ipo.status)}`}>
                    {ipo.status}
                  </span>
                  <span>{ipo.type}</span>
                </div>
                <strong>{ipo.company}</strong>
                <div className="timeline">
                  <div>
                    <small>OPEN</small>
                    <b>{shortDate(ipo.openDate)}</b>
                  </div>
                  <i />
                  <div>
                    <small>CLOSE</small>
                    <b>{shortDate(ipo.closeDate)}</b>
                  </div>
                  <i />
                  <div>
                    <small>ALLOT</small>
                    <b>{shortDate(ipo.allotmentDate)}</b>
                  </div>
                  <i />
                  <div>
                    <small>LIST</small>
                    <b>{shortDate(ipo.listingDate)}</b>
                  </div>
                </div>
              </button>
            ))}

            {!calendar.length && (
              <p className="emptyMini">No calendar fields are available yet.</p>
            )}
          </div>
        </section>

        <section id="performance" className="panel">
          <div className="sectionHead">
            <div>
              <span className="sectionLabel">PERFORMANCE TRACKER</span>
              <h2>Listing-day performance</h2>
              <p>
                Calculated only when both final issue price and listing price
                exist in the connected dataset.
              </p>
            </div>
          </div>

          <div className="performanceGrid">
            {listedPerformance.slice(0, 12).map((ipo) => (
              <button
                key={`${ipo.id}-perf`}
                onClick={() => setSelected(ipo)}
                className="performanceCard"
              >
                <div>
                  <strong>{ipo.company}</strong>
                  <span>{ipo.type}</span>
                </div>
                <div>
                  <small>Issue</small>
                  <b>{money(ipo.priceHigh)}</b>
                </div>
                <div>
                  <small>Listing</small>
                  <b>{money(ipo.listingPrice)}</b>
                </div>
                <em className={ipo.gain >= 0 ? "positive" : "negative"}>
                  {ipo.gain >= 0 ? "+" : ""}
                  {ipo.gain.toFixed(1)}%
                </em>
              </button>
            ))}

            {!listedPerformance.length && (
              <p className="emptyMini">
                Listing-price data is not available in the connected source
                files.
              </p>
            )}
          </div>
        </section>

        <section className="researchGrid">
          <article>
            <span className="sectionLabel">RESEARCH CHECKLIST</span>
            <h2>Before you apply</h2>
            <div className="checkList">
              <span>01</span><p>Fresh issue vs OFS and where the money goes</p>
              <span>02</span><p>Valuation versus listed peers</p>
              <span>03</span><p>Revenue, PAT, margins, ROE/ROCE and debt trend</p>
              <span>04</span><p>Promoter holding and dilution</p>
              <span>05</span><p>Customer concentration and key risks</p>
              <span>06</span><p>Subscription demand by investor category</p>
            </div>
          </article>

          <article className="sourcePanel">
            <span className="sectionLabel">PRIMARY SOURCES FIRST</span>
            <h2>Documents over opinions.</h2>
            <p>
              The strongest IPO research workflow starts with exchange issue
              information and offer documents. Reviews and GMP are secondary
              context, not substitutes for filings.
            </p>

            <div className="sourceMeta">
              <div>
                <strong>{sourceFiles.length}</strong>
                <span>IPO JSON source files detected</span>
              </div>
              <div>
                <strong>{initialIPOs.length}</strong>
                <span>normalized issue records</span>
              </div>
            </div>
          </article>
        </section>

        <footer className="disclaimer">
          <div>
            <strong>Educational research, not an IPO recommendation.</strong>
            <p>
              CredoNomics is not registered with SEBI as an Investment Adviser
              or Research Analyst. IPO data can change during the issue period.
              Verify dates, price bands, subscription and allotment information
              from NSE/BSE/SEBI and the issuer’s official offer documents before
              acting.
            </p>
          </div>
        </footer>
      </div>

      {selected && (
        <div className="drawerBackdrop" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              Ã—
            </button>

            <div className="drawerHero">
              <div>
                <span className={`status ${statusTone(selected.status)}`}>
                  {selected.status}
                </span>
                <span className={`type ${selected.type.toLowerCase()}`}>
                  {selected.type}
                </span>
              </div>
              <h2>{selected.company}</h2>
              <p>{selected.exchange ?? "Exchange not available"}</p>
            </div>

            <div className="drawerStats">
              <div>
                <span>PRICE BAND</span>
                <strong>{priceBand(selected)}</strong>
              </div>
              <div>
                <span>LOT SIZE</span>
                <strong>
                  {selected.lotSize?.toLocaleString("en-IN") ?? "—"}
                </strong>
              </div>
              <div>
                <span>MIN. INVESTMENT</span>
                <strong>
                  {minInvestment(selected) !== null
                    ? money(minInvestment(selected))
                    : "—"}
                </strong>
              </div>
              <div>
                <span>ISSUE SIZE</span>
                <strong>
                  {selected.issueSizeCr !== null
                    ? money(selected.issueSizeCr, " Cr")
                    : "—"}
                </strong>
              </div>
              <div>
                <span>SUBSCRIPTION</span>
                <strong>
                  {selected.subscription !== null
                    ? `${selected.subscription.toFixed(2)}x`
                    : "—"}
                </strong>
              </div>
              <div>
                <span>GMP*</span>
                <strong>
                  {selected.gmp !== null ? money(selected.gmp) : "—"}
                </strong>
              </div>
            </div>

            <div className="drawerSection">
              <h3>Issue timeline</h3>
              <div className="detailRows">
                <div><span>Open date</span><strong>{dateLabel(selected.openDate)}</strong></div>
                <div><span>Close date</span><strong>{dateLabel(selected.closeDate)}</strong></div>
                <div><span>Allotment</span><strong>{dateLabel(selected.allotmentDate)}</strong></div>
                <div><span>Listing</span><strong>{dateLabel(selected.listingDate)}</strong></div>
              </div>
            </div>

            <div className="drawerSection">
              <h3>Issue structure</h3>
              <div className="detailRows">
                <div><span>Issue type</span><strong>{selected.issueType ?? "—"}</strong></div>
                <div><span>Fresh issue</span><strong>{selected.freshIssueCr !== null ? money(selected.freshIssueCr, " Cr") : "—"}</strong></div>
                <div><span>Offer for sale</span><strong>{selected.ofsCr !== null ? money(selected.ofsCr, " Cr") : "—"}</strong></div>
                <div><span>Lead manager</span><strong>{selected.leadManager ?? "—"}</strong></div>
                <div><span>Registrar</span><strong>{selected.registrar ?? "—"}</strong></div>
              </div>
            </div>

            <div className="drawerSection">
              <h3>Documents & evidence</h3>
              <div className="docLinks">
                {selected.sourceUrl && (
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                    Official / source page ↗
                  </a>
                )}
                {selected.rhpUrl && (
                  <a href={selected.rhpUrl} target="_blank" rel="noreferrer">
                    RHP ↗
                  </a>
                )}
                {selected.drhpUrl && (
                  <a href={selected.drhpUrl} target="_blank" rel="noreferrer">
                    DRHP ↗
                  </a>
                )}
                {!selected.sourceUrl &&
                  !selected.rhpUrl &&
                  !selected.drhpUrl && (
                    <p>No source-document links were present in this record.</p>
                  )}
              </div>
              <small className="sourceFile">
                Local source: {selected.sourceFile}
              </small>
            </div>
          </aside>
        </div>
      )}

      <style jsx>{`
        :global(body) {
          margin: 0;
          background: #f5f7fa;
        }

        .ipoPage {
          min-height: 100vh;
          color: #07172a;
          background:
            radial-gradient(circle at 88% 2%, rgba(45, 117, 255, .12), transparent 30rem),
            radial-gradient(circle at 12% 4%, rgba(0, 171, 151, .10), transparent 28rem),
            #f5f7fa;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ipoShell {
          width: min(1480px, calc(100% - 36px));
          margin: 0 auto;
          padding: 30px 0 62px;
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(310px, .62fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .heroMain,
        .trustCard,
        .panel,
        .radar,
        .researchGrid > article,
        .emptyState,
        .disclaimer {
          border: 1px solid rgba(10, 35, 60, .09);
          border-radius: 24px;
          background: rgba(255,255,255,.96);
          box-shadow: 0 18px 58px rgba(24, 55, 83, .07);
        }

        .heroMain {
          padding: 42px;
        }

        .eyebrow,
        .sectionLabel {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #008f83;
          letter-spacing: .13em;
          font-size: 10px;
          font-weight: 850;
        }

        .pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00b79d;
          box-shadow: 0 0 0 6px rgba(0,183,157,.1);
        }

        .hero h1 {
          max-width: 950px;
          margin: 18px 0 15px;
          font-size: clamp(48px, 5.2vw, 80px);
          line-height: .98;
          letter-spacing: -.055em;
        }

        .hero h1 span {
          background: linear-gradient(90deg, #00a58f, #1976ef);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero p,
        .sectionHead p,
        .sourcePanel p,
        .emptyState p {
          color: #607184;
          line-height: 1.65;
        }

        .heroMain > p {
          max-width: 850px;
          margin: 0;
          font-size: 15px;
        }

        .quickNav {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 25px;
        }

        .quickNav a {
          padding: 8px 11px;
          border: 1px solid #dce5ec;
          border-radius: 999px;
          color: #385066;
          background: #f9fbfc;
          text-decoration: none;
          font-size: 10px;
          font-weight: 750;
        }

        .trustCard {
          padding: 28px;
          color: white;
          background: linear-gradient(145deg, #06172b, #092f53);
        }

        .trustCard > span {
          color: #8de5da;
          letter-spacing: .12em;
          font-size: 9px;
          font-weight: 850;
        }

        .trustCard > strong {
          display: block;
          margin: 12px 0 8px;
          font-size: 33px;
          letter-spacing: -.04em;
        }

        .trustCard > p {
          color: #a2b3c5;
          font-size: 11px;
          line-height: 1.55;
        }

        .sourceLinks {
          display: grid;
          gap: 8px;
          margin-top: 20px;
        }

        .sourceLinks a {
          padding: 11px 12px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 11px;
          background: rgba(255,255,255,.04);
          color: #d9e7f4;
          text-decoration: none;
          font-size: 10px;
        }

        .statGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          overflow: hidden;
          margin-bottom: 16px;
          border-radius: 20px;
          background: #071a30;
          color: white;
          box-shadow: 0 18px 50px rgba(7,26,48,.13);
        }

        .statGrid article {
          padding: 21px 23px;
          border-right: 1px solid rgba(255,255,255,.08);
        }

        .statGrid article:last-child {
          border-right: 0;
        }

        .statGrid span,
        .statGrid strong,
        .statGrid small {
          display: block;
        }

        .statGrid span {
          color: #91a6bb;
          letter-spacing: .09em;
          font-size: 9px;
          font-weight: 850;
        }

        .statGrid strong {
          margin: 10px 0 4px;
          font-size: 30px;
          letter-spacing: -.04em;
        }

        .statGrid small {
          color: #748ba3;
          font-size: 9px;
        }

        .radar,
        .panel,
        .emptyState {
          padding: 23px;
          margin-bottom: 16px;
        }

        .sectionHead {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 17px;
        }

        .sectionHead.compact {
          margin-bottom: 10px;
        }

        .sectionHead h2,
        .researchGrid h2,
        .emptyState h2 {
          margin: 6px 0 5px;
          font-size: 25px;
          letter-spacing: -.035em;
        }

        .sectionHead p {
          max-width: 760px;
          margin: 0;
          font-size: 11px;
        }

        .sectionHead > small {
          color: #82909e;
          font-size: 9px;
        }

        .radarGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .radarCard {
          min-height: 136px;
          padding: 16px;
          border: 1px solid #e0e7ed;
          border-radius: 15px;
          background: #fbfcfd;
        }

        .radarCard.accent {
          background: linear-gradient(145deg, #f0fffb, #f3f7ff);
        }

        .radarCard > span,
        .radarCard > strong,
        .radarCard > b,
        .radarCard > small {
          display: block;
        }

        .radarCard > span {
          color: #718194;
          letter-spacing: .09em;
          font-size: 8px;
          font-weight: 850;
        }

        .radarCard > strong {
          margin-top: 17px;
          font-size: 13px;
        }

        .radarCard > b {
          margin-top: 7px;
          color: #008a79;
          font-size: 20px;
        }

        .radarCard > small,
        .radarCard > p {
          margin-top: 7px;
          color: #81909e;
          font-size: 9px;
          line-height: 1.45;
        }

        .filters {
          display: grid;
          grid-template-columns: auto auto minmax(220px, 1fr) 180px;
          gap: 9px;
          margin-bottom: 14px;
        }

        .segmented {
          display: flex;
          overflow: hidden;
          border: 1px solid #dce4eb;
          border-radius: 11px;
          background: #f7f9fb;
        }

        .segmented button {
          padding: 0 12px;
          border: 0;
          border-right: 1px solid #e0e6ec;
          background: transparent;
          color: #617286;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
        }

        .segmented button:last-child {
          border-right: 0;
        }

        .segmented button.active {
          background: #071a30;
          color: white;
        }

        .filters input,
        .filters select {
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid #dce4eb;
          border-radius: 11px;
          outline: 0;
          background: #fbfcfd;
          color: #0b2137;
          font-size: 10px;
        }

        .tableWrap {
          overflow: auto;
          border: 1px solid #e0e7ed;
          border-radius: 14px;
        }

        table {
          width: 100%;
          min-width: 1120px;
          border-collapse: collapse;
        }

        thead {
          background: #f4f7f9;
        }

        th {
          padding: 11px;
          color: #66798c;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: .07em;
          font-size: 8px;
        }

        td {
          padding: 12px 11px;
          border-top: 1px solid #edf1f4;
          font-size: 10px;
        }

        tbody tr {
          cursor: pointer;
        }

        tbody tr:hover {
          background: #fbfdfd;
        }

        td:first-child strong {
          display: block;
          max-width: 280px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .type {
          display: inline-flex;
          margin-top: 5px;
          padding: 4px 6px;
          border-radius: 999px;
          background: #eef3f7;
          color: #617487;
          font-size: 7px;
          font-weight: 850;
        }

        .type.mainboard {
          background: #eaf3ff;
          color: #2c6fb6;
        }

        .type.sme {
          background: #f4efff;
          color: #7053a6;
        }

        .status {
          display: inline-flex;
          padding: 5px 7px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 850;
        }

        .status.good {
          background: #e7f8f1;
          color: #087d60;
        }

        .status.info {
          background: #eaf3ff;
          color: #2f6eac;
        }

        .status.warn {
          background: #fff3e5;
          color: #a36818;
        }

        .status.neutral {
          background: #f0f2f5;
          color: #586b7e;
        }

        .status.muted {
          background: #f3f4f6;
          color: #8794a1;
        }

        .dates {
          display: flex;
          gap: 6px;
          align-items: center;
          color: #647689;
        }

        .dates b {
          color: #1c344b;
        }

        .sub {
          color: #008b79;
        }

        .gmp {
          color: #7756a6;
          font-weight: 800;
        }

        .noRows,
        .emptyMini {
          padding: 28px;
          color: #81909e;
          text-align: center;
          font-size: 10px;
        }

        .micro {
          margin: 10px 2px 0;
          color: #8593a1;
          font-size: 8px;
          line-height: 1.45;
        }

        .twoCol {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .rankList,
        .eventList {
          display: flex;
          flex-direction: column;
        }

        .rankList button,
        .eventList button {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border: 0;
          border-bottom: 1px solid #edf1f4;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .rankList button:last-child,
        .eventList button:last-child {
          border-bottom: 0;
        }

        .rankList .rank {
          display: inline-flex;
          width: 26px;
          height: 26px;
          flex: 0 0 26px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #f1f5f7;
          color: #708091;
          font-size: 9px;
          font-weight: 850;
        }

        .rankList button > div,
        .eventList button > div:first-child {
          flex: 1;
          min-width: 0;
        }

        .rankList strong,
        .eventList strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 10px;
        }

        .rankList small,
        .eventList small {
          display: block;
          margin-top: 4px;
          color: #8794a2;
          font-size: 8px;
        }

        .rankList button > b {
          color: #008a79;
          font-size: 12px;
        }

        .eventDates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          flex: 0 0 auto !important;
        }

        .eventDates span {
          display: block;
          color: #8794a2;
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .eventDates b {
          display: block;
          margin-top: 3px;
          color: #254058;
          font-size: 9px;
        }

        .calendarGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .calendarCard {
          padding: 15px;
          border: 1px solid #e0e7ed;
          border-radius: 14px;
          background: #fbfcfd;
          text-align: left;
          cursor: pointer;
        }

        .calendarTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #82909f;
          font-size: 8px;
        }

        .calendarCard > strong {
          display: block;
          margin: 12px 0 14px;
          font-size: 11px;
        }

        .timeline {
          display: grid;
          grid-template-columns: 1fr 20px 1fr 20px 1fr 20px 1fr;
          align-items: center;
        }

        .timeline div {
          text-align: center;
        }

        .timeline small,
        .timeline b {
          display: block;
        }

        .timeline small {
          color: #8a97a4;
          font-size: 7px;
        }

        .timeline b {
          margin-top: 3px;
          font-size: 9px;
        }

        .timeline i {
          height: 1px;
          background: #dbe3e9;
        }

        .performanceGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .performanceCard {
          display: grid;
          grid-template-columns: 1.5fr .55fr .55fr .5fr;
          gap: 10px;
          align-items: center;
          padding: 14px;
          border: 1px solid #e0e7ed;
          border-radius: 13px;
          background: #fbfcfd;
          text-align: left;
          cursor: pointer;
        }

        .performanceCard strong,
        .performanceCard span,
        .performanceCard small,
        .performanceCard b {
          display: block;
        }

        .performanceCard strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 10px;
        }

        .performanceCard span,
        .performanceCard small {
          margin-top: 3px;
          color: #8895a2;
          font-size: 7px;
        }

        .performanceCard b {
          margin-top: 3px;
          font-size: 9px;
        }

        .performanceCard em {
          justify-self: end;
          font-size: 11px;
          font-style: normal;
          font-weight: 850;
        }

        .positive {
          color: #087f64;
        }

        .negative {
          color: #c34d49;
        }

        .researchGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .researchGrid > article {
          padding: 23px;
        }

        .checkList {
          display: grid;
          grid-template-columns: 35px 1fr;
          gap: 0;
          margin-top: 16px;
        }

        .checkList span,
        .checkList p {
          padding: 10px 0;
          border-bottom: 1px solid #edf1f4;
        }

        .checkList span {
          color: #008b7d;
          font-size: 10px;
          font-weight: 850;
        }

        .checkList p {
          margin: 0;
          color: #52677c;
          font-size: 10px;
        }

        .sourcePanel {
          background: linear-gradient(145deg, white, #f0f8fa) !important;
        }

        .sourcePanel > p {
          font-size: 11px;
        }

        .sourceMeta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }

        .sourceMeta div {
          padding: 15px;
          border: 1px solid #dfe7ec;
          border-radius: 13px;
          background: white;
        }

        .sourceMeta strong,
        .sourceMeta span {
          display: block;
        }

        .sourceMeta strong {
          font-size: 22px;
        }

        .sourceMeta span {
          margin-top: 5px;
          color: #8492a0;
          font-size: 8px;
        }

        .emptyState code {
          padding: 2px 5px;
          border-radius: 5px;
          background: #edf2f6;
          color: #28445d;
        }

        .disclaimer {
          padding: 19px 22px;
          color: white;
          background: #071a30;
        }

        .disclaimer strong {
          font-size: 10px;
        }

        .disclaimer p {
          max-width: 1100px;
          margin: 5px 0 0;
          color: #91a7bc;
          font-size: 8px;
          line-height: 1.5;
        }

        .drawerBackdrop {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          justify-content: flex-end;
          background: rgba(3,15,28,.5);
          backdrop-filter: blur(5px);
        }

        .drawer {
          position: relative;
          width: min(610px, 94vw);
          height: 100%;
          overflow-y: auto;
          padding: 28px;
          background: #f8fafc;
          box-shadow: -24px 0 70px rgba(3,15,28,.2);
        }

        .close {
          position: absolute;
          top: 16px;
          right: 17px;
          width: 34px;
          height: 34px;
          border: 1px solid #dbe3e9;
          border-radius: 50%;
          background: white;
          color: #1c344b;
          cursor: pointer;
          font-size: 20px;
        }

        .drawerHero > div {
          display: flex;
          gap: 7px;
        }

        .drawerHero h2 {
          padding-right: 40px;
          margin: 12px 0 5px;
          font-size: 31px;
          letter-spacing: -.04em;
        }

        .drawerHero p {
          margin: 0;
          color: #83909e;
          font-size: 9px;
        }

        .drawerStats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 18px;
        }

        .drawerStats div,
        .drawerSection {
          padding: 14px;
          border: 1px solid #e0e7ed;
          border-radius: 13px;
          background: white;
        }

        .drawerStats span,
        .drawerStats strong {
          display: block;
        }

        .drawerStats span {
          color: #7e8d9c;
          letter-spacing: .07em;
          font-size: 7px;
          font-weight: 850;
        }

        .drawerStats strong {
          margin-top: 5px;
          font-size: 14px;
        }

        .drawerSection {
          margin-top: 10px;
        }

        .drawerSection h3 {
          margin: 0 0 8px;
          font-size: 11px;
        }

        .detailRows > div {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 9px 0;
          border-bottom: 1px solid #edf1f4;
          font-size: 9px;
        }

        .detailRows > div:last-child {
          border-bottom: 0;
        }

        .detailRows span {
          color: #788897;
        }

        .detailRows strong {
          max-width: 58%;
          text-align: right;
        }

        .docLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .docLinks a {
          padding: 8px 10px;
          border: 1px solid #dce4ea;
          border-radius: 9px;
          color: #216aab;
          background: #f8fbfd;
          text-decoration: none;
          font-size: 9px;
          font-weight: 750;
        }

        .docLinks p {
          color: #7f8d9a;
          font-size: 9px;
        }

        .sourceFile {
          display: block;
          margin-top: 10px;
          color: #8b98a5;
          overflow-wrap: anywhere;
          font-size: 7px;
        }

        @media (max-width: 1180px) {
          .hero,
          .twoCol,
          .researchGrid {
            grid-template-columns: 1fr;
          }

          .statGrid {
            grid-template-columns: repeat(3, 1fr);
          }

          .radarGrid,
          .performanceGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 720px) {
          .ipoShell {
            width: calc(100% - 20px);
            padding-top: 18px;
          }

          .heroMain {
            padding: 27px 20px;
          }

          .hero h1 {
            font-size: 44px;
          }

          .statGrid,
          .radarGrid,
          .calendarGrid,
          .performanceGrid,
          .filters {
            grid-template-columns: 1fr;
          }

          .statGrid article {
            border-right: 0;
            border-bottom: 1px solid rgba(255,255,255,.08);
          }

          .segmented {
            min-height: 43px;
          }

          .segmented button {
            flex: 1;
          }

          .sectionHead {
            flex-direction: column;
          }

          .drawer {
            width: 100%;
            padding: 22px;
          }
        }
      `}</style>
    </main>
  );
}
