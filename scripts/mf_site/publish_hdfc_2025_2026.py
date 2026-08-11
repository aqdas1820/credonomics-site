from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter
from pathlib import Path

import pandas as pd


EXCLUDE_SOURCE_RE = re.compile(
    r"Index Solutions|Index Funds\s*&\s*ETFs",
    re.IGNORECASE,
)

CORE_SCHEMES = [
    (
        "HDFC Flexi Cap Fund",
        "Flexi Cap",
        re.compile(r"\bHDFC\s+Flexi[\s-]*Cap\s+Fund\b", re.I),
    ),
    (
        "HDFC Mid-Cap Opportunities Fund",
        "Mid Cap",
        re.compile(r"\bHDFC\s+Mid[\s-]*Cap\s+Opportunities\s+Fund\b", re.I),
    ),
    (
        "HDFC Small Cap Fund",
        "Small Cap",
        re.compile(r"\bHDFC\s+Small[\s-]*Cap\s+Fund\b", re.I),
    ),
    (
        "HDFC Large and Mid Cap Fund",
        "Large & Mid Cap",
        re.compile(r"\bHDFC\s+Large\s+(?:and|&)\s+Mid[\s-]*Cap\s+Fund\b", re.I),
    ),
    (
        "HDFC Multi Cap Fund",
        "Multi Cap",
        re.compile(r"\bHDFC\s+Multi[\s-]*Cap\s+Fund\b", re.I),
    ),
    (
        "HDFC Focused 30 Fund",
        "Focused",
        re.compile(r"\bHDFC\s+Focused(?:\s+30)?\s+Fund\b", re.I),
    ),
]

CORE_ORDER = [x[0] for x in CORE_SCHEMES]
CATEGORY_MAP = {name: cat for name, cat, _ in CORE_SCHEMES}

BAD_EXACT = {
    "ltd",
    "ltd.",
    "limited",
    "company ltd",
    "company ltd.",
    "company limited",
    "india ltd",
    "india ltd.",
    "india limited",
    "of india ltd",
    "of india ltd.",
    "of india limited",
    "bank ltd",
    "bank ltd.",
    "bank limited",
    "products ltd",
    "products ltd.",
    "products limited",
    "industries ltd",
    "industries ltd.",
    "industries limited",
    "corporation ltd",
    "corporation ltd.",
    "corporation limited",
    "services ltd",
    "services ltd.",
    "services limited",
}

BAD_PHRASES = re.compile(
    r"\b(?:category of scheme|portfolio|top holdings|fund manager|"
    r"riskometer|benchmark|expense ratio|exit load|net current assets|"
    r"cash equivalents|treps|repo|government securities)\b",
    re.I,
)

LEADING_WEIGHT_RE = re.compile(
    r"^\s*(?:â‚¹\s*)?\d{1,3}(?:\.\d{1,4})?\s+(?=[A-Za-z])"
)

VALID_ISIN_RE = re.compile(r"^INE[A-Z0-9]{9}$", re.I)


def clean_series(s: pd.Series) -> pd.Series:
    return (
        s.fillna("")
        .astype(str)
        .str.replace("\xa0", " ", regex=False)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )


def bool_series(s: pd.Series) -> pd.Series:
    if pd.api.types.is_bool_dtype(s):
        return s.fillna(False)
    return (
        s.astype(str)
        .str.strip()
        .str.lower()
        .isin({"true", "1", "yes", "y"})
    )


def txt(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    return re.sub(r"\s+", " ", str(value).replace("\xa0", " ")).strip()


def clean_company_name(value: object) -> str:
    s = txt(value)
    if not s:
        return ""

    s = s.replace("â€“", "-").replace("â€”", "-")
    s = re.sub(r"^[â€¢|:;,.\-]+\s*", "", s)
    s = LEADING_WEIGHT_RE.sub("", s)

    # Remove obvious trailing PDF column leakage.
    s = re.sub(r"\s+(?:IT|Auto|Finance|Banks?|Power|Software)\s*-\s*$", "", s, flags=re.I)

    # Normalize punctuation around legal suffixes.
    s = re.sub(r"\bLtd\s*\.\s*", "Ltd. ", s, flags=re.I)
    s = re.sub(r"\bLimited\s+", "Limited ", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip(" |,;:-")

    # Remove a second leading percentage/weight if a PDF duplicated it.
    s = LEADING_WEIGHT_RE.sub("", s).strip()

    return s


def suspicious_company_name(value: object) -> bool:
    s = clean_company_name(value)
    if not s:
        return True

    low = s.lower().strip(" .,-")

    if low in BAD_EXACT:
        return True

    if BAD_PHRASES.search(s):
        return True

    if re.match(r"^(?:ltd\.?|limited|of\s+|company\s+|bank\s+)", low):
        return True

    if re.search(r"\s-\s*$", s):
        return True

    letters = sum(ch.isalpha() for ch in s)
    if letters < 4:
        return True

    # Generic two-word fragments are not valid company identities.
    tokens = re.findall(r"[A-Za-z0-9&.'()-]+", s)
    if len(tokens) <= 2 and tokens:
        first = tokens[0].lower().strip(".")
        if first in {
            "company", "india", "bank", "products", "industries",
            "corporation", "services", "limited", "ltd", "of"
        }:
            return True

    return False


def company_name_score(value: object) -> float:
    s = clean_company_name(value)
    if suspicious_company_name(s):
        return -10000.0

    tokens = re.findall(r"[A-Za-z0-9&.'()-]+", s)
    score = min(len(s), 100) * 0.20 + len(tokens) * 4.0

    if len(tokens) >= 3:
        score += 12

    if re.search(r"\b(?:Ltd\.?|Limited|Bank|Industries|Corporation|Company)\b", s, re.I):
        score += 8

    if re.search(r"\b(?:India|Bharat|Hindustan|Technologies|Pharmaceuticals|Motors|Power)\b", s, re.I):
        score += 4

    return score


def valid_isin(value: object) -> str:
    s = re.sub(r"[^A-Za-z0-9]", "", txt(value)).upper()
    return s if VALID_ISIN_RE.fullmatch(s) else ""


def canonical_scheme_from_row(row: pd.Series) -> str:
    # V5.8 can place the scheme name in different identity columns.
    fields = [
        "Scheme",
        "Portfolio_Display_Name",
        "Clean_Section",
        "Clean_Variant",
        "Section_Label",
    ]
    combined = " | ".join(txt(row.get(c, "")) for c in fields if c in row.index)

    for canonical, _, pattern in CORE_SCHEMES:
        if pattern.search(combined):
            return canonical

    return ""


def best_name_by_isin(frame: pd.DataFrame) -> dict[str, str]:
    candidates: dict[str, list[str]] = {}

    for r in frame.itertuples(index=False):
        isin = getattr(r, "_isin", "")
        raw = getattr(r, "_raw_company", "")
        if isin:
            candidates.setdefault(isin, []).append(raw)

    result: dict[str, str] = {}

    for isin, names in candidates.items():
        unique = list(dict.fromkeys(clean_company_name(x) for x in names if txt(x)))
        unique = [x for x in unique if x]
        if not unique:
            continue

        best = max(unique, key=lambda x: (company_name_score(x), len(x)))
        if not suspicious_company_name(best):
            result[isin] = best

    return result


def best_sector_by_isin(frame: pd.DataFrame) -> dict[str, str]:
    result: dict[str, str] = {}

    if "_sector" not in frame.columns:
        return result

    for isin, g in frame[frame["_isin"].ne("")].groupby("_isin"):
        values = [
            txt(x)
            for x in g["_sector"].tolist()
            if txt(x) and txt(x).lower() not in {"nan", "unclassified"}
        ]
        if values:
            result[isin] = Counter(values).most_common(1)[0][0]

    return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--output", required=True)
    args = ap.parse_args()

    source = Path(args.source)
    out = Path(args.output)

    d = pd.read_excel(source, sheet_name="Holdings")
    initial_rows = len(d)

    d["Report_Date"] = pd.to_datetime(d["Report_Date"], errors="coerce")
    d = d[d["Report_Date"].notna()].copy()
    d = d[d["Report_Date"].dt.year.isin([2025, 2026])].copy()

    # Exclude separate index-only source factsheets.
    d = d[
        ~clean_series(d["PDF_File"]).str.contains(
            EXCLUDE_SOURCE_RE,
            na=False,
        )
    ].copy()

    d["_scheme"] = d.apply(canonical_scheme_from_row, axis=1)
    d = d[d["_scheme"].ne("")].copy()

    # Company / ISIN / sector raw fields.
    d["_raw_company"] = clean_series(d["Company"])

    isin_col = "ISIN" if "ISIN" in d.columns else None
    if isin_col:
        d["_isin"] = d[isin_col].map(valid_isin)
    else:
        d["_isin"] = ""

    if "Industry" in d.columns:
        d["_sector"] = clean_series(d["Industry"]).replace("", "Unclassified")
    else:
        d["_sector"] = "Unclassified"

    d["_weight"] = pd.to_numeric(d["Portfolio_Weight_Percent"], errors="coerce")
    d = d[d["_weight"].notna() & d["_weight"].gt(0) & d["_weight"].le(100)].copy()

    # Build canonical company dictionary BEFORE eligibility filtering.
    # If one month has "Limited" and another month has the full name for the
    # same ISIN, the full name wins everywhere.
    name_map = best_name_by_isin(d)
    sector_map = best_sector_by_isin(d)

    eligible = (
        bool_series(d["Website_Eligible"])
        if "Website_Eligible" in d.columns
        else pd.Series(False, index=d.index)
    )

    # Strong recovery: an explicit selected core scheme + valid Indian equity
    # ISIN can be included even when the generic website flag was conservative.
    explicit_equity_recovery = (~eligible) & d["_isin"].ne("")
    d["_recovered_explicit"] = explicit_equity_recovery

    d = d[eligible | explicit_equity_recovery].copy()

    def choose_name(r: pd.Series) -> str:
        isin = r["_isin"]
        if isin and isin in name_map:
            return name_map[isin]
        return clean_company_name(r["_raw_company"])

    d["stock"] = d.apply(choose_name, axis=1)
    d["sector"] = d.apply(
        lambda r: sector_map.get(r["_isin"], r["_sector"]) if r["_isin"] else r["_sector"],
        axis=1,
    )

    d["_raw_clean"] = d["_raw_company"].map(clean_company_name)
    d["_repaired"] = d["stock"].ne(d["_raw_clean"])

    before_suspicious = len(d)
    d = d[~d["stock"].map(suspicious_company_name)].copy()
    dropped_suspicious = before_suspicious - len(d)

    # Precision-first equity filter:
    # if a valid ISIN is present, it is stable identity.
    # If ISIN is absent, only already-public-ready rows survive.
    if "Website_Eligible" in d.columns:
        d["_eligible"] = bool_series(d["Website_Eligible"])
    else:
        d["_eligible"] = False

    d = d[d["_isin"].ne("") | d["_eligible"]].copy()

    d["amc"] = clean_series(d["AMC"])
    d["scheme"] = d["_scheme"]
    d["category"] = d["scheme"].map(CATEGORY_MAP)
    d["month"] = d["Report_Date"].dt.strftime("%Y-%m")
    d["weight"] = d["_weight"]

    d["securityId"] = d.apply(
        lambda r: r["_isin"] if r["_isin"] else "NAME:" + re.sub(
            r"[^a-z0-9]+", "-", r["stock"].lower()
        ).strip("-"),
        axis=1,
    )

    d["isin"] = d["_isin"]
    d["quality"] = d["_isin"].map(lambda x: "ISIN verified" if x else "Name only")
    d["nameSource"] = d.apply(
        lambda r: "ISIN canonical" if r["_repaired"] and r["_isin"] else (
            "ISIN source" if r["_isin"] else "Source name"
        ),
        axis=1,
    )

    # Collapse duplicate PDF copies by stable security identity.
    site = (
        d.groupby(
            [
                "amc", "scheme", "category", "month", "securityId",
                "isin", "stock", "sector", "quality", "nameSource"
            ],
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
            "securityId": str(r.securityId),
            "isin": str(r.isin),
            "stock": str(r.stock),
            "sector": str(r.sector),
            "weight": round(float(r.weight), 4),
            "quality": str(r.quality),
            "nameSource": str(r.nameSource),
        }
        for r in site.itertuples(index=False)
    ]

    months = sorted(site["month"].unique().tolist())
    available = set(site["scheme"].unique())
    present = [x for x in CORE_ORDER if x in available]
    missing = [x for x in CORE_ORDER if x not in available]

    isin_rows = int(site["isin"].astype(str).str.len().gt(0).sum())
    isin_coverage = round(isin_rows / max(len(site), 1) * 100, 1)

    quality_audit = {
        "sourceWorkbookRows": int(initial_rows),
        "publishedHoldings": int(len(site)),
        "canonicalNamesAvailable": int(len(name_map)),
        "repairedCompanyNames": int(d["_repaired"].sum()),
        "droppedSuspiciousCompanyFragments": int(dropped_suspicious),
        "explicitCoreEquityRecoveries": int(d["_recovered_explicit"].sum()),
        "isinCoveragePct": isin_coverage,
    }

    meta = {
        "dataset": "CredoNomics Core Equity Portfolio Intelligence",
        "scope": "Selected HDFC active equity schemes; precision-first public dataset",
        "years": [2025, 2026],
        "months": months,
        "latestMonth": months[-1] if months else None,
        "coreSchemes": CORE_ORDER,
        "presentCoreSchemes": present,
        "missingCoreSchemes": missing,
        "counts": {
            "holdings": int(len(site)),
            "schemes": int(site["scheme"].nunique()),
            "stocks": int(site["securityId"].nunique()),
            "amcs": int(site["amc"].nunique()),
        },
        "qualityAudit": quality_audit,
        "methodology": {
            "securityIdentity": "ISIN when available; canonical source name fallback",
            "companyNameRepair": "Best full company name observed for the same ISIN across selected history",
            "duplicateRule": "Maximum reported weight retained for duplicate source copies",
            "indexOnlyFactsheets": "Excluded",
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

    site.to_csv(out / "all.csv", index=False, encoding="utf-8-sig")

    print("=" * 78)
    print("CREDONOMICS MF PRO DATASET READY")
    print("=" * 78)
    print(f"Published holdings : {len(site):,}")
    print(f"Unique securities  : {site['securityId'].nunique():,}")
    print(f"Core schemes       : {site['scheme'].nunique():,}")
    print(f"Latest month       : {months[-1] if months else '-'}")
    print(f"ISIN coverage      : {isin_coverage:.1f}%")
    print(f"Names repaired     : {quality_audit['repairedCompanyNames']:,}")
    print(f"Bad fragments drop : {quality_audit['droppedSuspiciousCompanyFragments']:,}")
    print(f"Explicit recoveries: {quality_audit['explicitCoreEquityRecoveries']:,}")
    print()
    print("SCHEMES PUBLISHED")
    for x in present:
        print("  [OK]", x)
    for x in missing:
        print("  [NOT PUBLIC-READY]", x)
    print("=" * 78)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
