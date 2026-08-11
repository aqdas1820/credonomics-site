from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pandas as pd


EXCLUDE_SOURCE_RE = re.compile(
    r"Index Solutions|Index Funds\s*&\s*ETFs",
    re.IGNORECASE,
)

CORE_SCHEME_RULES = [
    (
        "HDFC Flexi Cap Fund",
        re.compile(r"^HDFC\s+Flexi[\s-]*Cap\s+Fund$", re.I),
    ),
    (
        "HDFC Mid-Cap Opportunities Fund",
        re.compile(r"^HDFC\s+Mid[\s-]*Cap\s+Opportunities\s+Fund$", re.I),
    ),
    (
        "HDFC Small Cap Fund",
        re.compile(r"^HDFC\s+Small[\s-]*Cap\s+Fund$", re.I),
    ),
    (
        "HDFC Large and Mid Cap Fund",
        re.compile(r"^HDFC\s+Large\s+(?:and|&)\s+Mid[\s-]*Cap\s+Fund$", re.I),
    ),
    (
        "HDFC Multi Cap Fund",
        re.compile(r"^HDFC\s+Multi[\s-]*Cap\s+Fund$", re.I),
    ),
    (
        "HDFC Focused 30 Fund",
        re.compile(r"^HDFC\s+Focused(?:\s+30)?\s+Fund$", re.I),
    ),
]

CORE_SCHEME_ORDER = [x[0] for x in CORE_SCHEME_RULES]

SCHEME_CATEGORY = {
    "HDFC Flexi Cap Fund": "Flexi Cap",
    "HDFC Mid-Cap Opportunities Fund": "Mid Cap",
    "HDFC Small Cap Fund": "Small Cap",
    "HDFC Large and Mid Cap Fund": "Large & Mid Cap",
    "HDFC Multi Cap Fund": "Multi Cap",
    "HDFC Focused 30 Fund": "Focused",
}


def as_bool(series: pd.Series) -> pd.Series:
    if pd.api.types.is_bool_dtype(series):
        return series.fillna(False)

    return (
        series.astype(str)
        .str.strip()
        .str.lower()
        .isin({"true", "1", "yes", "y"})
    )


def clean(series: pd.Series) -> pd.Series:
    return (
        series.fillna("")
        .astype(str)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )


def canonical_core_scheme(value: object) -> str:
    s = re.sub(r"\s+", " ", str(value or "")).strip()

    # Strip obvious plan suffixes if present.
    s = re.sub(
        r"\s+[â€“â€”-]\s+(?:Direct Plan|Regular Plan|Growth|Plan S).*$",
        "",
        s,
        flags=re.I,
    ).strip()

    for canonical, pattern in CORE_SCHEME_RULES:
        if pattern.fullmatch(s):
            return canonical

    return ""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--output", required=True)
    args = ap.parse_args()

    source = Path(args.source)
    out = Path(args.output)

    if not source.exists():
        raise FileNotFoundError(source)

    d = pd.read_excel(source, sheet_name="Holdings")

    required = {
        "AMC",
        "Scheme",
        "Report_Date",
        "Company",
        "Portfolio_Weight_Percent",
        "Website_Eligible",
        "PDF_File",
    }

    missing = sorted(required - set(d.columns))
    if missing:
        raise RuntimeError(f"Missing required columns: {missing}")

    d["Report_Date"] = pd.to_datetime(d["Report_Date"], errors="coerce")
    d = d[d["Report_Date"].notna()].copy()

    # Last two years only.
    d = d[d["Report_Date"].dt.year.isin([2025, 2026])].copy()

    # Exclude dedicated index-only PDFs.
    d = d[
        ~clean(d["PDF_File"]).str.contains(
            EXCLUDE_SOURCE_RE,
            na=False,
        )
    ].copy()

    # Public-ready rows only.
    d = d[as_bool(d["Website_Eligible"])].copy()
    d = d[clean(d["Scheme"]).str.upper().ne("UNASSIGNED")].copy()

    # Keep only selected 6 schemes.
    d["scheme"] = clean(d["Scheme"]).map(canonical_core_scheme)
    d = d[d["scheme"].ne("")].copy()

    d["category"] = d["scheme"].map(SCHEME_CATEGORY).fillna("Core Equity")
    d["amc"] = clean(d["AMC"])
    d["month"] = d["Report_Date"].dt.strftime("%Y-%m")
    d["stock"] = clean(d["Company"])

    if "Industry" in d.columns:
        d["sector"] = clean(d["Industry"]).replace("", "Unclassified")
    else:
        d["sector"] = "Unclassified"

    d["weight"] = pd.to_numeric(
        d["Portfolio_Weight_Percent"],
        errors="coerce",
    )

    d = d[
        d["amc"].ne("")
        & d["stock"].ne("")
        & d["weight"].notna()
        & d["weight"].gt(0)
        & d["weight"].le(100)
    ].copy()

    # Collapse duplicate copies of same monthly source.
    site = (
        d.groupby(
            ["amc", "scheme", "category", "month", "stock", "sector"],
            as_index=False,
            dropna=False,
        )
        .agg(weight=("weight", "max"))
        .sort_values(
            ["month", "scheme", "weight", "stock"],
            ascending=[True, True, False, True],
        )
        .reset_index(drop=True)
    )

    holdings = [
        {
            "amc": str(r.amc),
            "scheme": str(r.scheme),
            "category": str(r.category),
            "month": str(r.month),
            "stock": str(r.stock),
            "sector": str(r.sector),
            "weight": round(float(r.weight), 4),
        }
        for r in site.itertuples(index=False)
    ]

    months = sorted(site["month"].unique().tolist())
    available = set(site["scheme"].unique())

    present_schemes = [
        x for x in CORE_SCHEME_ORDER if x in available
    ]

    missing_schemes = [
        x for x in CORE_SCHEME_ORDER if x not in available
    ]

    meta = {
        "dataset": "CredoNomics HDFC Core Equity Scheme Intelligence",
        "scope": "Six selected actively managed HDFC equity schemes",
        "years": [2025, 2026],
        "months": months,
        "latestMonth": months[-1] if months else None,
        "coreSchemes": CORE_SCHEME_ORDER,
        "presentCoreSchemes": present_schemes,
        "missingCoreSchemes": missing_schemes,
        "categories": [SCHEME_CATEGORY[x] for x in CORE_SCHEME_ORDER],
        "excludedSources": [
            "Index Solutions Factsheet",
            "Index Funds & ETFs Factsheet",
        ],
        "counts": {
            "holdings": len(holdings),
            "schemes": int(site["scheme"].nunique()),
            "stocks": int(site["stock"].nunique()),
            "amcs": int(site["amc"].nunique()),
        },
    }

    out.mkdir(parents=True, exist_ok=True)

    (out / "all.json").write_text(
        json.dumps(
            {"meta": meta, "holdings": holdings},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )

    (out / "status.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    site.to_csv(
        out / "all.csv",
        index=False,
        encoding="utf-8-sig",
    )

    print("=" * 72)
    print("CREDONOMICS CORE MF DATA READY")
    print("=" * 72)
    print("Holdings :", f"{len(holdings):,}")
    print("Stocks   :", f"{site['stock'].nunique():,}")
    print("Schemes  :", f"{site['scheme'].nunique():,}")
    print("Latest   :", months[-1] if months else "-")
    print()
    print("SCHEMES PUBLISHED:")
    for x in present_schemes:
        print("  [OK]", x)

    if missing_schemes:
        print()
        print("MISSING FROM PUBLIC-READY DATA:")
        for x in missing_schemes:
            print("  [MISSING]", x)

    print()
    print("Index-only PDFs excluded : YES")
    print("Review rows excluded     : YES")
    print("Plan variants collapsed  : YES")
    print("=" * 72)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
