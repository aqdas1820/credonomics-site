from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pandas as pd

EXCLUDE_SOURCE_RE = re.compile(r"Index Solutions|Index Funds\s*&\s*ETFs", re.IGNORECASE)

def as_bool(series: pd.Series) -> pd.Series:
    if pd.api.types.is_bool_dtype(series):
        return series.fillna(False)
    return series.astype(str).str.strip().str.lower().isin({"true", "1", "yes", "y"})

def clean(series: pd.Series) -> pd.Series:
    return series.fillna("").astype(str).str.replace(r"\s+", " ", regex=True).str.strip()

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default=r"D:\MF Tracking\Reports\Master_Portfolio_HDFC_V5_8_FULL.xlsx")
    ap.add_argument("--output", default=r"public\data\mf-intelligence")
    args = ap.parse_args()

    source = Path(args.source)
    out = Path(args.output)

    if not source.exists():
        raise FileNotFoundError(source)

    d = pd.read_excel(source, sheet_name="Holdings")
    d["Report_Date"] = pd.to_datetime(d["Report_Date"], errors="coerce")
    d = d[d["Report_Date"].notna()].copy()
    d = d[d["Report_Date"].dt.year.isin([2025, 2026])].copy()

    d = d[~clean(d["PDF_File"]).str.contains(EXCLUDE_SOURCE_RE, na=False)].copy()
    d = d[as_bool(d["Website_Eligible"])].copy()
    d = d[clean(d["Scheme"]).str.upper().ne("UNASSIGNED")].copy()

    d["amc"] = clean(d["AMC"])
    d["base_scheme"] = clean(d["Scheme"])
    if "Portfolio_Display_Name" in d.columns:
        display = clean(d["Portfolio_Display_Name"])
        d["scheme"] = display.where(display.ne(""), d["base_scheme"])
        d.loc[d["scheme"].str.upper().eq("UNASSIGNED"), "scheme"] = d["base_scheme"]
    else:
        d["scheme"] = d["base_scheme"]

    d["month"] = d["Report_Date"].dt.strftime("%Y-%m")
    d["stock"] = clean(d["Company"])
    d["sector"] = clean(d["Industry"]) if "Industry" in d.columns else "Unclassified"
    d["sector"] = d["sector"].replace("", "Unclassified")
    d["weight"] = pd.to_numeric(d["Portfolio_Weight_Percent"], errors="coerce")

    d = d[
        d["amc"].ne("")
        & d["scheme"].ne("")
        & d["stock"].ne("")
        & d["weight"].notna()
        & d["weight"].gt(0)
        & d["weight"].le(100)
    ].copy()

    # Remove duplicate copies of the same monthly factsheet.
    site = (
        d.groupby(["amc", "scheme", "month", "stock", "sector"], as_index=False)
        .agg(weight=("weight", "max"))
        .sort_values(["month", "scheme", "weight", "stock"], ascending=[True, True, False, True])
        .reset_index(drop=True)
    )

    holdings = [
        {
            "amc": r.amc,
            "scheme": r.scheme,
            "month": r.month,
            "stock": r.stock,
            "sector": r.sector,
            "weight": round(float(r.weight), 4),
        }
        for r in site.itertuples(index=False)
    ]

    months = sorted(site["month"].unique().tolist())
    meta = {
        "dataset": "CredoNomics HDFC MF Portfolio Intelligence",
        "years": [2025, 2026],
        "months": months,
        "latestMonth": months[-1] if months else None,
        "excludedSources": ["Index Solutions Factsheet", "Index Funds & ETFs Factsheet"],
        "counts": {
            "holdings": len(holdings),
            "schemes": int(site["scheme"].nunique()),
            "stocks": int(site["stock"].nunique()),
            "amcs": int(site["amc"].nunique()),
        },
    }

    out.mkdir(parents=True, exist_ok=True)
    (out / "all.json").write_text(
        json.dumps({"meta": meta, "holdings": holdings}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    (out / "status.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    site.to_csv(out / "all.csv", index=False, encoding="utf-8-sig")

    print("=" * 72)
    print("CREDONOMICS LAST-TWO-YEARS WEBSITE DATASET READY")
    print("=" * 72)
    print("Months   :", months[0] if months else "-", "->", months[-1] if months else "-")
    print("Holdings :", f"{len(holdings):,}")
    print("Schemes  :", f"{site['scheme'].nunique():,}")
    print("Stocks   :", f"{site['stock'].nunique():,}")
    print("AMCs     :", f"{site['amc'].nunique():,}")
    print("Index-only PDFs excluded: YES")
    print("Review rows excluded: YES")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
