from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path
from typing import Any

import pandas as pd


BAD_COMPANY_PATTERNS = [
    r"\bsince inception\b",
    r"\bcagr\b",
    r"\briskometer\b",
    r"\bbenchmark\b",
    r"\bexpense ratio\b",
    r"\bexit load\b",
    r"\bfund manager\b",
    r"\binvestment objective\b",
    r"\bscheme objective\b",
    r"\bminimum application\b",
    r"\bminimum purchase\b",
    r"\bstatutory details\b",
    r"\bpast performance\b",
    r"\bstandard deviation\b",
    r"\bsharpe ratio\b",
    r"\bportfolio turnover\b",
    r"\bassets under management\b",
    r"\bnav as on\b",
    r"\breturns are calculated\b",
    r"\binvestors should\b",
    r"\bclassification is recommended\b",
    r"\bgrand total\b",
    r"^total$",
    r"^sub\s*total$",
    r"^notes?$",
    r"^portfolio$",
    r"^equity$",
    r"^debt$",
    r"^cash$",
]

NON_EQUITY_PATTERNS = [
    r"\btreps\b",
    r"\brepo\b",
    r"\bt-?bill\b",
    r"\btreasury bill\b",
    r"\bcommercial paper\b",
    r"\bcertificate of deposit\b",
    r"\bgovernment securit",
    r"\bsovereign\b",
    r"\bncd\b",
    r"\bdebenture\b",
    r"\bbond\b",
    r"\bnet current asset\b",
    r"\bcash and cash equivalents\b",
    r"\bmoney market\b",
    r"\bfixed deposit\b",
]

EQUITY_ASSET_TERMS = [
    "equity",
    "foreign equity",
    "reit",
    "invit",
]

EXPECTED_COLUMNS = {
    "AMC",
    "Scheme",
    "Report_Date",
    "Company",
    "Portfolio_Weight_Percent",
}


def clean_text(value: Any) -> str:
    if pd.isna(value):
        return ""
    text = str(value).replace("\n", " ").replace("\r", " ").replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def safe_number(value: Any) -> float | None:
    try:
        number = float(value)
        if math.isnan(number) or math.isinf(number):
            return None
        return number
    except Exception:
        return None


def normalize_company(value: Any) -> str:
    text = clean_text(value)
    text = re.sub(r"^\s*\d+\s*[\.\)\-:]\s*", "", text)
    text = re.sub(r"^\s*\d+\s+(?=[A-Za-z])", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip(" |:-")


def normalize_scheme(value: Any) -> str:
    text = clean_text(value)
    text = re.sub(r"\b(direct|regular)\s+plan\b.*$", "", text, flags=re.I)
    text = re.sub(r"\b(growth|idcw|dividend)\b.*$", "", text, flags=re.I)
    text = re.sub(r"\b(factsheet|portfolio|as on)\b.*$", "", text, flags=re.I)
    return text.strip(" |:-")


def valid_isin(value: Any) -> bool:
    text = clean_text(value).replace(" ", "").upper()
    return bool(re.fullmatch(r"[A-Z]{2}[A-Z0-9]{10}", text))


def looks_like_paragraph(text: str) -> bool:
    low = text.lower()
    if len(text) > 160:
        return True
    if text.count(".") >= 3:
        return True
    if len(text.split()) > 20:
        return True
    if any(re.search(pattern, low, re.I) for pattern in BAD_COMPANY_PATTERNS):
        return True
    return False


def equity_like(row: pd.Series) -> bool:
    asset = clean_text(row.get("Asset_Class", "")).lower()
    company = normalize_company(row.get("Company", ""))

    if asset:
        if any(term in asset for term in EQUITY_ASSET_TERMS):
            return True
        if any(term in asset for term in ["debt", "money market", "cash"]):
            return False

    if any(re.search(pattern, company, re.I) for pattern in NON_EQUITY_PATTERNS):
        return False

    return True


def quality_score(row: pd.Series) -> int:
    company = normalize_company(row.get("Company", ""))
    isin = clean_text(row.get("ISIN", ""))
    method = clean_text(row.get("Extraction_Method", "")).lower()
    industry = clean_text(row.get("Industry", ""))
    asset = clean_text(row.get("Asset_Class", "")).lower()
    weight = safe_number(row.get("Portfolio_Weight_Percent"))

    score = 0

    if company and 2 <= len(company) <= 120 and not looks_like_paragraph(company):
        score += 3
    else:
        score -= 8

    if valid_isin(isin):
        score += 4

    if "table" in method:
        score += 2
    elif "text" in method:
        score += 1

    if industry and len(industry) <= 100:
        score += 1

    if any(term in asset for term in EQUITY_ASSET_TERMS):
        score += 2

    if weight is not None and 0 < weight <= 40:
        score += 2
    elif weight is not None and 40 < weight <= 100.5:
        score -= 1
    else:
        score -= 5

    return score


def read_holdings(path: Path) -> pd.DataFrame:
    excel = pd.ExcelFile(path)
    sheet = "Holdings" if "Holdings" in excel.sheet_names else excel.sheet_names[0]
    df = pd.read_excel(path, sheet_name=sheet)

    missing = sorted(EXPECTED_COLUMNS - set(df.columns))
    if missing:
        raise ValueError(f"{path.name}: missing columns: {', '.join(missing)}")

    return df


def clean_holdings(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["AMC"] = df["AMC"].map(clean_text)
    df["Scheme"] = df["Scheme"].map(normalize_scheme)
    df["Company"] = df["Company"].map(normalize_company)
    df["Report_Date"] = pd.to_datetime(df["Report_Date"], errors="coerce")
    df["Portfolio_Weight_Percent"] = pd.to_numeric(
        df["Portfolio_Weight_Percent"], errors="coerce"
    )

    for col in ["ISIN", "Industry", "Asset_Class", "Extraction_Method", "PDF_File"]:
        if col not in df.columns:
            df[col] = ""
        else:
            df[col] = df[col].map(clean_text)

    df = df.dropna(
        subset=["Report_Date", "Portfolio_Weight_Percent"]
    ).copy()

    df = df[
        (df["AMC"] != "")
        & (df["Scheme"] != "")
        & (df["Company"] != "")
        & df["Portfolio_Weight_Percent"].between(0.0001, 100.5, inclusive="both")
    ].copy()

    df = df[df.apply(equity_like, axis=1)].copy()
    df["Quality_Score"] = df.apply(quality_score, axis=1)
    df = df[df["Quality_Score"] >= 4].copy()

    # Strong final junk filter.
    df = df[
        ~df["Company"].map(looks_like_paragraph)
    ].copy()

    # Prefer ISIN as the security identity, else normalized company.
    df["_security_key"] = df.apply(
        lambda r: (
            clean_text(r["ISIN"]).replace(" ", "").upper()
            if valid_isin(r["ISIN"])
            else normalize_company(r["Company"]).lower()
        ),
        axis=1,
    )

    df = df.sort_values(
        ["Quality_Score", "Report_Date"],
        ascending=[False, False],
    )

    df = df.drop_duplicates(
        subset=[
            "AMC",
            "Scheme",
            "Report_Date",
            "_security_key",
        ],
        keep="first",
    )

    return df.sort_values(
        ["Report_Date", "AMC", "Scheme", "Portfolio_Weight_Percent"],
        ascending=[True, True, True, False],
    ).reset_index(drop=True)


def choose_best_source(paths: list[Path]) -> tuple[Path, pd.DataFrame, list[dict[str, Any]]]:
    candidates = []

    for path in paths:
        if not path.exists():
            continue
        raw = read_holdings(path)
        clean = clean_holdings(raw)
        metrics = {
            "file": path.name,
            "rawRows": int(len(raw)),
            "cleanRows": int(len(clean)),
            "amcs": int(clean["AMC"].nunique()) if not clean.empty else 0,
            "schemes": int(clean[["AMC", "Scheme"]].drop_duplicates().shape[0]) if not clean.empty else 0,
            "months": int(clean["Report_Date"].dt.to_period("M").nunique()) if not clean.empty else 0,
        }
        candidates.append((path, clean, metrics))

    if not candidates:
        raise FileNotFoundError("No usable Master_Portfolio_All_AMCs workbook was found.")

    # Prefer coverage, then clean row count. This prevents a tiny V3 file from
    # winning merely because it is newer.
    candidates.sort(
        key=lambda item: (
            item[2]["amcs"],
            item[2]["schemes"],
            item[2]["months"],
            item[2]["cleanRows"],
        ),
        reverse=True,
    )

    selected_path, selected_df, _ = candidates[0]
    return selected_path, selected_df, [x[2] for x in candidates]


def row_to_json(row: pd.Series) -> dict[str, Any]:
    date = pd.Timestamp(row["Report_Date"])
    data: dict[str, Any] = {
        "amc": row["AMC"],
        "scheme": row["Scheme"],
        "month": date.strftime("%Y-%m"),
        "stock": row["Company"],
        "sector": row["Industry"] or "Unclassified",
        "weight": round(float(row["Portfolio_Weight_Percent"]), 6),
        "quality": int(row["Quality_Score"]),
    }

    if valid_isin(row["ISIN"]):
        data["isin"] = clean_text(row["ISIN"]).replace(" ", "").upper()

    asset = clean_text(row["Asset_Class"])
    if asset:
        data["assetClass"] = asset

    return data


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def build_month_files(df: pd.DataFrame, output: Path) -> list[str]:
    months = sorted(
        df["Report_Date"].dt.to_period("M").astype(str).unique().tolist()
    )

    holdings_dir = output / "holdings"
    holdings_dir.mkdir(parents=True, exist_ok=True)

    for month in months:
        month_df = df[
            df["Report_Date"].dt.to_period("M").astype(str) == month
        ]
        rows = [row_to_json(row) for _, row in month_df.iterrows()]
        write_json(
            holdings_dir / f"{month}.json",
            {"month": month, "holdings": rows},
        )

    return months


def build_index(
    df: pd.DataFrame,
    months: list[str],
    selected: Path,
    candidates: list[dict[str, Any]],
) -> dict[str, Any]:
    amcs = sorted(df["AMC"].unique().tolist())

    scheme_records = (
        df[["AMC", "Scheme"]]
        .drop_duplicates()
        .sort_values(["AMC", "Scheme"])
        .to_dict(orient="records")
    )

    return {
        "version": 2,
        "sourceWorkbook": selected.name,
        "holdings": int(len(df)),
        "stocks": int(df["_security_key"].nunique()),
        "amcs": amcs,
        "amcCount": len(amcs),
        "schemes": [
            {"amc": row["AMC"], "scheme": row["Scheme"]}
            for row in scheme_records
        ],
        "schemeCount": len(scheme_records),
        "months": sorted(months, reverse=True),
        "firstMonth": months[0] if months else None,
        "latestMonth": months[-1] if months else None,
        "candidateSources": candidates,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build production CredoNomics MF Portfolio Intelligence data."
    )
    parser.add_argument(
        "--reports",
        default=r"D:\MF Tracking\Reports",
        help="Path to your MF Tracking Reports folder.",
    )
    parser.add_argument(
        "--output",
        default="public/data/mf-intelligence",
        help="CredoNomics public data folder.",
    )
    args = parser.parse_args()

    reports = Path(args.reports)
    output = Path(args.output)

    sources = [
        reports / "Master_Portfolio_All_AMCs_V3.xlsx",
        reports / "Master_Portfolio_All_AMCs_V2.xlsx",
        reports / "Master_Portfolio_All_AMCs.xlsx",
    ]

    selected, df, candidates = choose_best_source(sources)

    if df.empty:
        raise SystemExit("Cleaning produced zero valid equity holdings. Nothing was published.")

    months = build_month_files(df, output)
    index = build_index(df, months, selected, candidates)
    write_json(output / "index.json", index)

    # Backward-compatible all.json for any older code, but only latest month
    # to keep the website repository lightweight.
    latest = index["latestMonth"]
    latest_df = df[
        df["Report_Date"].dt.to_period("M").astype(str) == latest
    ]
    write_json(
        output / "all.json",
        {"holdings": [row_to_json(row) for _, row in latest_df.iterrows()]},
    )

    print("=" * 76)
    print("CREDONOMICS MF PRODUCTION DATASET BUILT")
    print("=" * 76)
    print(f"Selected source : {selected}")
    print(f"Valid holdings  : {len(df):,}")
    print(f"AMCs            : {index['amcCount']}")
    print(f"Schemes         : {index['schemeCount']}")
    print(f"Stocks          : {index['stocks']}")
    print(f"Months          : {len(months)}")
    print(f"First month     : {index['firstMonth']}")
    print(f"Latest month    : {index['latestMonth']}")
    print(f"Output          : {output.resolve()}")
    print()
    print("Candidate source comparison:")
    for item in candidates:
        print(
            f"  {item['file']}: clean={item['cleanRows']:,}, "
            f"AMCs={item['amcs']}, schemes={item['schemes']}, months={item['months']}"
        )
    print("=" * 76)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
