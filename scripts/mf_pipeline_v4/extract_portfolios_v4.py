from __future__ import annotations

import argparse
import math
import re
from pathlib import Path
from typing import Any

import pandas as pd
import pdfplumber


ISIN_RE = re.compile(r"\bIN[A-Z0-9]{10}\b", re.I)

BAD_COMPANY = [
    "total", "subtotal", "grand total", "portfolio", "industry",
    "benchmark", "riskometer", "performance", "fund manager",
    "expense ratio", "exit load", "since inception", "nav as on",
]

NON_EQUITY = [
    "treps", "repo", "treasury bill", "t-bill", "commercial paper",
    "certificate of deposit", "government security", "government securities",
    "bond", "debenture", "ncd", "cash and cash equivalents",
    "net current assets", "money market",
]


def clean_text(v: Any) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return ""
    return re.sub(r"\s+", " ", str(v).replace("\n", " ").replace("\r", " ")).strip()


def clean_company(value: str) -> str:
    text = clean_text(value)
    text = re.sub(r"^\W+", "", text)
    text = re.sub(r"\s+\*+$", "", text)
    return text.strip(" |:-")


def company_ok(value: str) -> bool:
    company = clean_company(value)
    low = company.lower()
    if len(company) < 2 or len(company) > 140:
        return False
    if len(company.split()) > 18:
        return False
    if not re.search(r"[A-Za-z]", company):
        return False
    if any(low == x or low.startswith(x + " ") for x in BAD_COMPANY):
        return False
    return True


def normalize_isin(value: str) -> str:
    return re.sub(r"\s+", "", clean_text(value)).upper()


def valid_indian_isin(value: str) -> bool:
    # For the diagnostic extractor, use structural validation first.
    # Checksum validation can be added after we confirm AMC PDF coverage.
    return bool(re.fullmatch(r"IN[A-Z0-9]{10}", normalize_isin(value)))


def parse_numeric(token: str) -> float | None:
    raw = clean_text(token)
    if not raw:
        return None
    negative = raw.startswith("(") and raw.endswith(")")
    raw = (
        raw.replace(",", "")
        .replace("%", "")
        .replace("₹", "")
        .replace("Rs.", "")
        .replace("Rs", "")
        .strip("() ")
    )
    if not re.fullmatch(r"-?\d+(?:\.\d+)?", raw):
        return None
    try:
        value = float(raw)
        return -value if negative else value
    except ValueError:
        return None


def likely_weight(values: list[float]) -> float | None:
    for value in reversed(values):
        if 0 <= value <= 100.5:
            return value
    return None


def cluster_words_into_lines(words: list[dict], tolerance: float = 2.5) -> list[list[dict]]:
    lines: list[list[dict]] = []
    for word in sorted(words, key=lambda w: (float(w["top"]), float(w["x0"]))):
        top = float(word["top"])
        placed = False
        for line in reversed(lines[-10:]):
            mean_top = sum(float(x["top"]) for x in line) / len(line)
            if abs(top - mean_top) <= tolerance:
                line.append(word)
                placed = True
                break
        if not placed:
            lines.append([word])
    for line in lines:
        line.sort(key=lambda w: float(w["x0"]))
    return lines


def line_text(line: list[dict]) -> str:
    return clean_text(" ".join(str(w.get("text", "")) for w in line))


def detect_asset_context(line_index: int, lines: list[list[dict]]) -> str:
    for j in range(max(0, line_index - 20), line_index):
        text = line_text(lines[j]).lower()
        if "equity" in text and "debt" not in text:
            return "Equity"
        if "reit" in text or "invit" in text:
            return "REIT/InvIT"
        if "debt" in text or "money market" in text:
            return "Debt"
    return "Unclassified"


def parse_isin_line(line: list[dict], page_number: int, asset_class: str) -> dict | None:
    text = line_text(line)
    compact = re.sub(r"\s+", "", text).upper()
    candidates = [x for x in re.findall(r"IN[A-Z0-9]{10}", compact) if valid_indian_isin(x)]
    if not candidates:
        return None

    isin = candidates[0]

    # Locate the sequence of words forming the ISIN.
    start = end = None
    for i in range(len(line)):
        running = ""
        for j in range(i, min(len(line), i + 5)):
            running += re.sub(r"\s+", "", str(line[j].get("text", ""))).upper()
            if isin in running:
                start, end = i, j
                break
            if len(running) > 24:
                break
        if start is not None:
            break

    if start is None:
        return None

    company = clean_company(" ".join(str(w.get("text", "")) for w in line[:start]))
    if not company_ok(company):
        return None

    numbers = []
    for word in line[end + 1 :]:
        value = parse_numeric(str(word.get("text", "")))
        if value is not None:
            numbers.append(value)

    weight = likely_weight(numbers)
    if weight is None:
        return None

    quantity = numbers[-3] if len(numbers) >= 3 else None
    market_value = numbers[-2] if len(numbers) >= 2 else None

    return {
        "Company": company,
        "ISIN": isin,
        "Industry": "",
        "Quantity": quantity,
        "Market_Value": market_value,
        "Portfolio_Weight_Percent": weight,
        "Page_Number": page_number,
        "Extraction_Method": "Word-Anchored ISIN V4.1",
        "Asset_Class": asset_class,
    }


def parse_pdf(pdf_path: Path) -> list[dict]:
    holdings: list[dict] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            try:
                words = page.extract_words(
                    x_tolerance=2,
                    y_tolerance=2,
                    keep_blank_chars=False,
                    use_text_flow=False,
                )
            except Exception:
                continue
            if not words:
                continue

            lines = cluster_words_into_lines(words)
            page_compact = re.sub(r"\s+", "", "\n".join(line_text(x) for x in lines)).upper()
            if "IN" not in page_compact:
                continue

            for line_index, line in enumerate(lines):
                compact = re.sub(r"\s+", "", line_text(line)).upper()
                if "IN" not in compact:
                    continue
                asset_class = detect_asset_context(line_index, lines)
                record = parse_isin_line(line, page_number, asset_class)
                if not record:
                    continue
                low = record["Company"].lower()
                if any(term in low for term in NON_EQUITY) and asset_class != "Equity":
                    continue
                holdings.append(record)
    return holdings


def load_inventory(path: Path) -> pd.DataFrame:
    excel = pd.ExcelFile(path)
    sheet = "Factsheet Inventory" if "Factsheet Inventory" in excel.sheet_names else excel.sheet_names[0]
    return pd.read_excel(path, sheet_name=sheet)


def choose_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    exact = {str(c).strip().lower(): c for c in df.columns}
    for candidate in candidates:
        if candidate.lower() in exact:
            return exact[candidate.lower()]
    for c in df.columns:
        low = str(c).lower()
        if any(candidate.lower() in low for candidate in candidates):
            return c
    return None


def resolve_pdf_path(raw_path: str, base_dir: Path, inventory_path: Path) -> Path:
    raw = clean_text(raw_path)
    if not raw:
        return Path("__MISSING__")

    p = Path(raw)
    if p.is_absolute():
        return p

    candidates = [
        base_dir / p,
        inventory_path.parent.parent / p,
        inventory_path.parent / p,
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()

    # Return most likely path for diagnostics.
    return (base_dir / p).resolve()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", default="Reports/Factsheet_Inventory.xlsx")
    parser.add_argument("--output", default="Reports/Master_Portfolio_All_AMCs_V4_TEST.xlsx")
    parser.add_argument(
        "--base-dir",
        default="",
        help=r'Root of MF Tracking, e.g. "D:\MF Tracking". Relative PDF paths are resolved from here.',
    )
    parser.add_argument("--max-pdfs", type=int, default=10)
    parser.add_argument("--amc", default="")
    args = parser.parse_args()

    inventory_path = Path(args.inventory).resolve()
    inventory = load_inventory(inventory_path)

    base_dir = Path(args.base_dir).resolve() if args.base_dir else inventory_path.parent.parent

    path_col = choose_column(inventory, ["PDF_Path", "Path", "File Path"])
    amc_col = choose_column(inventory, ["AMC"])
    scheme_col = choose_column(inventory, ["Scheme"])
    date_col = choose_column(inventory, ["Report_Date", "Report Date", "Date", "Month"])

    if not path_col:
        raise SystemExit(
            "Could not detect the PDF path column.\n"
            f"Inventory columns: {list(inventory.columns)}"
        )

    print("Inventory :", inventory_path)
    print("Base dir  :", base_dir)
    print("Path col  :", path_col)
    print("AMC col   :", amc_col or "(not detected)")
    print("Scheme col:", scheme_col or "(not detected)")
    print("Date col  :", date_col or "(not detected)")
    print()

    if args.amc and amc_col:
        inventory = inventory[
            inventory[amc_col].astype(str).str.contains(args.amc, case=False, na=False)
        ]

    if args.max_pdfs:
        inventory = inventory.head(args.max_pdfs)

    rows = []
    processing = []

    for _, item in inventory.iterrows():
        raw_path = clean_text(item.get(path_col, ""))
        pdf_path = resolve_pdf_path(raw_path, base_dir, inventory_path)

        amc = clean_text(item.get(amc_col, "")) if amc_col else ""
        scheme = clean_text(item.get(scheme_col, "")) if scheme_col else ""
        report_date = pd.to_datetime(item.get(date_col, None) if date_col else None, errors="coerce")

        if not pdf_path.exists():
            print(f"[MISSING] inventory='{raw_path}' -> '{pdf_path}'")
            processing.append({
                "Inventory_Path": raw_path,
                "Resolved_PDF_Path": str(pdf_path),
                "AMC": amc,
                "Scheme": scheme,
                "Status": "Missing",
                "Rows": 0,
            })
            continue

        try:
            found = parse_pdf(pdf_path)
            for rec in found:
                rec.update({
                    "AMC": amc,
                    "Scheme": scheme,
                    "Report_Date": report_date,
                    "Year": report_date.year if not pd.isna(report_date) else None,
                    "Month_Number": report_date.month if not pd.isna(report_date) else None,
                    "Month": report_date.strftime("%B") if not pd.isna(report_date) else "",
                    "Month_Year": report_date.strftime("%B-%Y") if not pd.isna(report_date) else "",
                    "PDF_File": pdf_path.name,
                    "PDF_Path": str(pdf_path),
                })
            rows.extend(found)
            processing.append({
                "Inventory_Path": raw_path,
                "Resolved_PDF_Path": str(pdf_path),
                "AMC": amc,
                "Scheme": scheme,
                "Status": "Processed",
                "Rows": len(found),
            })
            print(f"[OK] {pdf_path.name}: {len(found)} ISIN-anchored rows")
        except Exception as exc:
            print(f"[ERROR] {pdf_path.name}: {exc}")
            processing.append({
                "Inventory_Path": raw_path,
                "Resolved_PDF_Path": str(pdf_path),
                "AMC": amc,
                "Scheme": scheme,
                "Status": "Error",
                "Rows": 0,
                "Message": str(exc),
            })

    holdings = pd.DataFrame(rows)
    processing_df = pd.DataFrame(processing)

    if not holdings.empty:
        holdings = holdings[holdings["ISIN"].map(valid_indian_isin)].copy()
        holdings = holdings.drop_duplicates(
            subset=["AMC", "Scheme", "Report_Date", "ISIN"], keep="first"
        )
        holdings = holdings.sort_values(
            ["Report_Date", "AMC", "Scheme", "Portfolio_Weight_Percent"],
            ascending=[True, True, True, False],
        )

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        holdings.to_excel(writer, sheet_name="Holdings", index=False)
        processing_df.to_excel(writer, sheet_name="Processing Log", index=False)

    processed = int((processing_df["Status"] == "Processed").sum()) if not processing_df.empty else 0
    missing = int((processing_df["Status"] == "Missing").sum()) if not processing_df.empty else 0
    errors = int((processing_df["Status"] == "Error").sum()) if not processing_df.empty else 0

    print()
    print("=" * 78)
    print("CREDONOMICS MF EXTRACTOR V4.1 DIAGNOSTIC COMPLETE")
    print("=" * 78)
    print(f"PDFs processed : {processed}")
    print(f"PDFs missing   : {missing}")
    print(f"PDF errors     : {errors}")
    print(f"Holdings rows  : {len(holdings):,}")
    print(f"Unique ISINs   : {holdings['ISIN'].nunique() if not holdings.empty else 0:,}")
    print(f"AMCs           : {holdings['AMC'].nunique() if not holdings.empty else 0}")
    print(f"Schemes        : {holdings[['AMC','Scheme']].drop_duplicates().shape[0] if not holdings.empty else 0}")
    print(f"Output         : {output.resolve()}")
    print("=" * 78)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
