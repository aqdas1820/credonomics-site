from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import pandas as pd

EQUITY_EXCLUDES = re.compile(
    r"\b("
    r"government|g-sec|treasury|t-?bill|commercial paper|certificate of deposit|"
    r"repo|reverse repo|cash|net current|debenture|bond|ncd|money market|"
    r"fixed deposit|sovereign gold|units of|mutual fund units"
    r")\b",
    re.I,
)

ALIASES = {
    "isin": ["isin", "isin no", "isin code"],
    "stock": [
        "name of instrument", "name of the instrument", "instrument",
        "issuer", "company", "security name", "name of issuer"
    ],
    "sector": ["industry", "sector", "industry / rating", "industry/rating"],
    "weight": [
        "% to nav", "% of nav", "percentage to nav", "portfolio weight",
        "weight (%)", "% net assets", "% of net assets"
    ],
}


def clean_cell(v: Any) -> str:
    if pd.isna(v):
        return ""
    return re.sub(r"\s+", " ", str(v)).strip()


def normalize_header(v: Any) -> str:
    s = clean_cell(v).lower()
    s = re.sub(r"[^a-z0-9%]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def find_col(headers: list[str], aliases: list[str]) -> int | None:
    normalized_aliases = [normalize_header(x) for x in aliases]
    for i, h in enumerate(headers):
        if h in normalized_aliases:
            return i
    for i, h in enumerate(headers):
        if any(a in h or h in a for a in normalized_aliases if h):
            return i
    return None


def find_header_row(df: pd.DataFrame) -> int | None:
    max_rows = min(50, len(df))
    for r in range(max_rows):
        headers = [normalize_header(x) for x in df.iloc[r].tolist()]
        has_isin = find_col(headers, ALIASES["isin"]) is not None
        has_stock = find_col(headers, ALIASES["stock"]) is not None
        has_weight = find_col(headers, ALIASES["weight"]) is not None
        if has_stock and has_weight and (has_isin or "industry" in " ".join(headers)):
            return r
    return None


def infer_scheme(df: pd.DataFrame, header_row: int, sheet_name: str) -> str:
    candidates: list[str] = []
    for r in range(max(0, header_row - 12), header_row):
        values = [clean_cell(x) for x in df.iloc[r].tolist()]
        for value in values:
            low = value.lower()
            if len(value) >= 8 and any(k in low for k in ["fund", "scheme", "etf", "index"]):
                if not any(k in low for k in ["portfolio", "disclosure", "as on", "mutual fund"]):
                    candidates.append(value)
    if candidates:
        return max(candidates, key=len)
    return sheet_name.strip() or "Unknown Scheme"


def to_number(v: Any) -> float:
    s = clean_cell(v).replace("%", "").replace(",", "")
    try:
        return float(s)
    except Exception:
        return 0.0


def looks_equity(stock: str, isin: str, sector: str) -> bool:
    combined = f"{stock} {sector}"
    if EQUITY_EXCLUDES.search(combined):
        return False
    # Equity securities generally have a meaningful corporate name; keep unknown ISINs
    # rather than silently dropping them, but reject obvious non-equity headings/totals.
    if re.search(r"\b(total|subtotal|grand total)\b", stock, re.I):
        return False
    if not stock or len(stock) < 3:
        return False
    return True


def parse_workbook(path: Path, amc: str, month: str) -> list[dict]:
    rows: list[dict] = []
    try:
        book = pd.ExcelFile(path)
    except Exception as exc:
        print(f"SKIP workbook {path}: {exc}")
        return rows

    for sheet in book.sheet_names:
        try:
            raw = pd.read_excel(book, sheet_name=sheet, header=None, dtype=object)
        except Exception as exc:
            print(f"SKIP sheet {path.name} / {sheet}: {exc}")
            continue
        if raw.empty:
            continue

        header_row = find_header_row(raw)
        if header_row is None:
            continue

        headers = [normalize_header(x) for x in raw.iloc[header_row].tolist()]
        stock_i = find_col(headers, ALIASES["stock"])
        isin_i = find_col(headers, ALIASES["isin"])
        sector_i = find_col(headers, ALIASES["sector"])
        weight_i = find_col(headers, ALIASES["weight"])

        if stock_i is None or weight_i is None:
            continue

        scheme = infer_scheme(raw, header_row, sheet)
        body = raw.iloc[header_row + 1 :]

        for _, r in body.iterrows():
            stock = clean_cell(r.iloc[stock_i]) if stock_i < len(r) else ""
            isin = clean_cell(r.iloc[isin_i]) if isin_i is not None and isin_i < len(r) else ""
            sector = clean_cell(r.iloc[sector_i]) if sector_i is not None and sector_i < len(r) else "Unclassified"
            weight = to_number(r.iloc[weight_i]) if weight_i < len(r) else 0.0

            if not looks_equity(stock, isin, sector):
                continue
            if weight <= 0 or weight > 100:
                continue

            rows.append({
                "amc": amc,
                "scheme": scheme,
                "month": month,
                "stock": stock,
                "sector": sector or "Unclassified",
                "weight": round(weight, 6),
                "isin": isin,
                "source_file": path.name,
            })

    return rows


def parse_csv(path: Path, amc: str, month: str) -> list[dict]:
    try:
        df = pd.read_csv(path)
    except Exception:
        return []
    # Reuse workbook parser logic by writing rows through normalized aliases.
    headers = [normalize_header(x) for x in df.columns]
    stock_i = find_col(headers, ALIASES["stock"])
    isin_i = find_col(headers, ALIASES["isin"])
    sector_i = find_col(headers, ALIASES["sector"])
    weight_i = find_col(headers, ALIASES["weight"])
    if stock_i is None or weight_i is None:
        return []
    cols = list(df.columns)
    out = []
    for _, r in df.iterrows():
        stock = clean_cell(r[cols[stock_i]])
        isin = clean_cell(r[cols[isin_i]]) if isin_i is not None else ""
        sector = clean_cell(r[cols[sector_i]]) if sector_i is not None else "Unclassified"
        weight = to_number(r[cols[weight_i]])
        if looks_equity(stock, isin, sector) and 0 < weight <= 100:
            out.append({
                "amc": amc, "scheme": path.stem, "month": month, "stock": stock,
                "sector": sector or "Unclassified", "weight": round(weight, 6),
                "isin": isin, "source_file": path.name,
            })
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--raw", default="data/mf_raw")
    p.add_argument("--out", default="data/mf_normalized/latest.json")
    args = p.parse_args()

    raw_dir = Path(args.raw)
    manifest_path = raw_dir / "manifest.json"
    if not manifest_path.exists():
        raise SystemExit(f"Missing {manifest_path}. Run fetch_amfi.py first.")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    holdings: list[dict] = []

    for item in manifest:
        if item.get("status") != "downloaded" or not item.get("path"):
            continue
        path = Path(item["path"])
        suffix = path.suffix.lower()
        if suffix in {".xlsx", ".xls"}:
            holdings.extend(parse_workbook(path, item.get("amc", "Unknown AMC"), item.get("month", "")))
        elif suffix == ".csv":
            holdings.extend(parse_csv(path, item.get("amc", "Unknown AMC"), item.get("month", "")))
        else:
            # PDF disclosures are intentionally not OCR'd here. Spreadsheet disclosures are
            # preferred for reliable, auditable portfolio extraction.
            print(f"SKIP non-tabular disclosure: {path}")

    # De-duplicate exact holding keys; keep latest encountered row.
    dedup = {}
    for h in holdings:
        key = (
            h["amc"].lower(), h["scheme"].lower(), h["month"],
            h["stock"].lower(), h.get("isin", "").lower()
        )
        dedup[key] = h

    output = list(dedup.values())
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(
        json.dumps({"holdings": output}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {len(output):,} normalized equity holdings to {args.out}")


if __name__ == "__main__":
    main()
