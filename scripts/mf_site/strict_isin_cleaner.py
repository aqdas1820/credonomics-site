from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path
from typing import Any

import pandas as pd


REQUIRED = {
    "AMC",
    "Scheme",
    "Report_Date",
    "Company",
    "Portfolio_Weight_Percent",
}

BAD_TEXT_PATTERNS = [
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
]

NON_EQUITY = [
    r"\btreps\b",
    r"\brepo\b",
    r"\btreasury bill\b",
    r"\bt-?bill\b",
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

EQUITY_ASSET_TERMS = {"equity", "foreign equity", "reit", "invit"}


def clean_text(v: Any) -> str:
    if pd.isna(v):
        return ""
    return re.sub(r"\s+", " ", str(v).replace("\n", " ").replace("\r", " ").replace("\xa0", " ")).strip()


def clean_company(v: Any) -> str:
    text = clean_text(v)
    text = re.sub(r"^\s*\d+\s*[\.\)\-:]\s*", "", text)
    text = re.sub(r"^\s*\d+\s+(?=[A-Za-z])", "", text)
    return text.strip(" |:-")


def clean_scheme(v: Any) -> str:
    text = clean_text(v)
    text = re.sub(r"\b(direct|regular)\s+plan\b.*$", "", text, flags=re.I)
    text = re.sub(r"\b(growth|idcw|dividend)\b.*$", "", text, flags=re.I)
    text = re.sub(r"\b(factsheet|portfolio|as on)\b.*$", "", text, flags=re.I)
    return text.strip(" |:-")


def numeric(v: Any) -> float | None:
    try:
        x = float(v)
        if math.isnan(x) or math.isinf(x):
            return None
        return x
    except Exception:
        return None


def normalize_isin(v: Any) -> str:
    return clean_text(v).replace(" ", "").upper()


def valid_indian_isin(v: Any) -> bool:
    return bool(re.fullmatch(r"IN[A-Z0-9]{10}", normalize_isin(v)))


def obvious_junk(company: str) -> bool:
    if not company:
        return True
    low = company.lower()
    if len(company) > 140:
        return True
    if len(company.split()) > 18:
        return True
    if company.count(".") >= 3:
        return True
    if re.fullmatch(r"[\d,.\-%() ]+", company):
        return True
    return any(re.search(p, low, re.I) for p in BAD_TEXT_PATTERNS)


def equity_like(row: pd.Series) -> bool:
    asset = clean_text(row.get("Asset_Class", "")).lower()
    company = clean_company(row.get("Company", ""))

    if asset:
        if any(term in asset for term in EQUITY_ASSET_TERMS):
            return True
        if any(term in asset for term in ["debt", "money market", "cash"]):
            return False

    return not any(re.search(p, company, re.I) for p in NON_EQUITY)


def quality(row: pd.Series) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    company = clean_company(row.get("Company", ""))
    isin = normalize_isin(row.get("ISIN", ""))
    weight = numeric(row.get("Portfolio_Weight_Percent"))
    method = clean_text(row.get("Extraction_Method", "")).lower()
    industry = clean_text(row.get("Industry", ""))
    asset = clean_text(row.get("Asset_Class", "")).lower()

    if obvious_junk(company):
        score -= 10
        reasons.append("junk_company_text")
    else:
        score += 3

    if valid_indian_isin(isin):
        score += 7
    else:
        reasons.append("invalid_or_missing_isin")

    if weight is None:
        score -= 6
        reasons.append("invalid_weight")
    elif 0 < weight <= 25:
        score += 3
    elif 25 < weight <= 40:
        score += 1
    elif 40 < weight <= 100.5:
        score -= 1
        reasons.append("unusually_high_weight")
    else:
        score -= 6
        reasons.append("invalid_weight")

    if "table" in method:
        score += 2
    elif "text" in method:
        score += 1

    if industry and len(industry) <= 100:
        score += 1

    if any(term in asset for term in EQUITY_ASSET_TERMS):
        score += 2

    if not equity_like(row):
        score -= 8
        reasons.append("non_equity")

    return score, reasons


def load_workbook(path: Path) -> pd.DataFrame:
    excel = pd.ExcelFile(path)
    sheet = "Holdings" if "Holdings" in excel.sheet_names else excel.sheet_names[0]
    df = pd.read_excel(path, sheet_name=sheet)

    missing = sorted(REQUIRED - set(df.columns))
    if missing:
        raise ValueError(f"Missing columns: {', '.join(missing)}")

    for col in ["ISIN", "Industry", "Asset_Class", "Extraction_Method", "PDF_File"]:
        if col not in df.columns:
            df[col] = ""

    return df


def audit_and_clean(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    work = df.copy()

    work["AMC"] = work["AMC"].map(clean_text)
    work["Scheme"] = work["Scheme"].map(clean_scheme)
    work["Company"] = work["Company"].map(clean_company)
    work["ISIN"] = work["ISIN"].map(normalize_isin)
    work["Report_Date"] = pd.to_datetime(work["Report_Date"], errors="coerce")
    work["Portfolio_Weight_Percent"] = pd.to_numeric(work["Portfolio_Weight_Percent"], errors="coerce")

    scores = work.apply(quality, axis=1)
    work["Quality_Score"] = [x[0] for x in scores]
    work["Reject_Reasons"] = [";".join(x[1]) for x in scores]
    work["Valid_ISIN"] = work["ISIN"].map(valid_indian_isin)
    work["Equity_Like"] = work.apply(equity_like, axis=1)

    base_valid = (
        work["AMC"].ne("")
        & work["Scheme"].ne("")
        & work["Company"].ne("")
        & work["Report_Date"].notna()
        & work["Portfolio_Weight_Percent"].between(0.0001, 100.5, inclusive="both")
    )

    # Strict production rule:
    # - valid Indian ISIN is required
    # - equity-like
    # - quality score >= 8
    strict = work[
        base_valid
        & work["Valid_ISIN"]
        & work["Equity_Like"]
        & work["Quality_Score"].ge(8)
    ].copy()

    strict["_security_key"] = strict["ISIN"]

    strict = strict.sort_values(
        ["Quality_Score", "Report_Date"],
        ascending=[False, False],
    ).drop_duplicates(
        subset=["AMC", "Scheme", "Report_Date", "_security_key"],
        keep="first",
    )

    strict = strict.sort_values(
        ["Report_Date", "AMC", "Scheme", "Portfolio_Weight_Percent"],
        ascending=[True, True, True, False],
    ).reset_index(drop=True)

    audit = work.copy()
    audit["Production_Accepted"] = audit.index.isin(strict.index)

    return strict, audit


def make_summary(raw: pd.DataFrame, strict: pd.DataFrame, audit: pd.DataFrame) -> dict[str, Any]:
    rejected = len(raw) - len(strict)
    valid_isin_count = int(audit["Valid_ISIN"].sum()) if not audit.empty else 0

    def count_months(df: pd.DataFrame) -> int:
        if df.empty:
            return 0
        return int(df["Report_Date"].dropna().dt.to_period("M").nunique())

    return {
        "rawRows": int(len(raw)),
        "acceptedRows": int(len(strict)),
        "rejectedRows": int(rejected),
        "acceptanceRatePct": round((len(strict) / len(raw) * 100) if len(raw) else 0, 2),
        "validIsinRows": valid_isin_count,
        "validIsinPct": round((valid_isin_count / len(raw) * 100) if len(raw) else 0, 2),
        "amcs": int(strict["AMC"].nunique()) if not strict.empty else 0,
        "schemes": int(strict[["AMC", "Scheme"]].drop_duplicates().shape[0]) if not strict.empty else 0,
        "uniqueSecurities": int(strict["ISIN"].nunique()) if not strict.empty else 0,
        "months": count_months(strict),
        "firstMonth": (
            strict["Report_Date"].min().strftime("%Y-%m") if not strict.empty else None
        ),
        "latestMonth": (
            strict["Report_Date"].max().strftime("%Y-%m") if not strict.empty else None
        ),
    }


def build_rejection_report(audit: pd.DataFrame) -> pd.DataFrame:
    if audit.empty:
        return pd.DataFrame(columns=["Reason", "Rows"])

    exploded = (
        audit["Reject_Reasons"]
        .fillna("")
        .str.split(";")
        .explode()
        .str.strip()
    )
    exploded = exploded[exploded.ne("")]

    return (
        exploded.value_counts()
        .rename_axis("Reason")
        .reset_index(name="Rows")
    )


def write_outputs(strict: pd.DataFrame, audit: pd.DataFrame, out_dir: Path) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)

    summary = make_summary(audit, strict, audit)
    rejection_summary = build_rejection_report(audit)

    strict.to_excel(out_dir / "Verified_Equity_Holdings.xlsx", index=False)
    rejection_summary.to_excel(out_dir / "Rejection_Summary.xlsx", index=False)

    # Keep a compact sample of rejected rows for review rather than writing a huge workbook.
    rejected = audit[
        ~(
            audit["Valid_ISIN"]
            & audit["Equity_Like"]
            & audit["Quality_Score"].ge(8)
        )
    ].copy()

    rejected.head(5000).to_excel(
        out_dir / "Rejected_Rows_Sample.xlsx",
        index=False,
    )

    (out_dir / "quality_summary.json").write_text(
        json.dumps(summary, indent=2),
        encoding="utf-8",
    )

    return summary


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Strict ISIN-based cleaner and quality audit for CredoNomics MF data."
    )
    parser.add_argument("--input", required=True)
    parser.add_argument(
        "--output",
        default="Reports/CredoNomics_Verified",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    out_dir = Path(args.output)

    raw = load_workbook(input_path)
    strict, audit = audit_and_clean(raw)
    summary = write_outputs(strict, audit, out_dir)

    print("=" * 78)
    print("CREDONOMICS STRICT MF SECURITY AUDIT COMPLETE")
    print("=" * 78)
    print(f"Input                : {input_path}")
    print(f"Raw rows             : {summary['rawRows']:,}")
    print(f"Accepted holdings    : {summary['acceptedRows']:,}")
    print(f"Rejected rows        : {summary['rejectedRows']:,}")
    print(f"Acceptance rate      : {summary['acceptanceRatePct']}%")
    print(f"Valid ISIN rows      : {summary['validIsinRows']:,} ({summary['validIsinPct']}%)")
    print(f"AMCs                 : {summary['amcs']}")
    print(f"Schemes              : {summary['schemes']}")
    print(f"Unique securities    : {summary['uniqueSecurities']}")
    print(f"Months               : {summary['months']}")
    print(f"First month          : {summary['firstMonth']}")
    print(f"Latest month         : {summary['latestMonth']}")
    print(f"Output folder        : {out_dir.resolve()}")
    print("=" * 78)

    if summary["acceptedRows"] == 0:
        raise SystemExit("No rows passed the strict audit. Review Rejected_Rows_Sample.xlsx.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
