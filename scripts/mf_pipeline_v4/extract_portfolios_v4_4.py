from __future__ import annotations

import argparse
import math
import re
from pathlib import Path
from typing import Any

import pandas as pd
import pdfplumber


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

SCHEME_REJECT = [
    "benchmark", "performance", "returns", "riskometer", "fund manager",
    "expense ratio", "exit load", "aum", "nav", "portfolio", "allocation",
    "market cap", "investment objective", "since inception", "sip",
    "regular plan", "direct plan", "growth option", "idcw",
]

SCHEME_PRODUCT_RE = re.compile(
    r"\b(fund|etf|fof|fund of funds?)\b",
    re.I,
)

SCHEME_SUFFIX_RE = re.compile(
    r"\b(fund|etf|fof|fund of funds?)\b[^\w]{0,6}$",
    re.I,
)

TRAILING_SYMBOLS_RE = re.compile(r"[\s,;:|•·†‡*#~^]+$")

KNOWN_TOKEN_CASE = {
    "hdfc": "HDFC",
    "etf": "ETF",
    "fof": "FOF",
    "psu": "PSU",
    "nifty": "Nifty",
    "mid-cap": "Mid-Cap",
    "midcap": "Mid Cap",
    "multi-cap": "Multi-Cap",
    "multicap": "Multi Cap",
    "small-cap": "Small-Cap",
    "smallcap": "Small Cap",
    "large-cap": "Large-Cap",
    "largecap": "Large Cap",
}


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


def line_font_size(line: list[dict]) -> float:
    sizes = []
    for w in line:
        try:
            sizes.append(float(w.get("size", 0) or 0))
        except Exception:
            pass
    return sum(sizes) / len(sizes) if sizes else 0.0


def smart_title_token(token: str) -> str:
    low = token.lower()

    if low in KNOWN_TOKEN_CASE:
        return KNOWN_TOKEN_CASE[low]

    if "-" in token:
        parts = token.split("-")
        return "-".join(smart_title_token(x) for x in parts)

    if token.isupper() and len(token) <= 5:
        return token

    if token.lower() in {"and", "of", "the", "for", "to"}:
        return token.lower()

    return token[:1].upper() + token[1:].lower() if token else token


def canonicalize_scheme_name(value: str) -> str:
    text = clean_text(value)

    # Strip decorative/footer markers first.
    text = TRAILING_SYMBOLS_RE.sub("", text)
    text = re.sub(r"^[\s,;:|•·†‡*#~^]+", "", text)

    # Strip plan/option tails that are not the scheme's base identity.
    text = re.sub(r"\b(direct|regular)\s+plan\b.*$", "", text, flags=re.I)
    text = re.sub(r"\b(growth|idcw|dividend)\b.*$", "", text, flags=re.I)
    text = re.sub(r"\b(factsheet|portfolio|as on)\b.*$", "", text, flags=re.I)

    # Normalize common punctuation/casing variants.
    text = re.sub(r"\s+", " ", text).strip(" |:-,;")
    text = re.sub(r"\bmid\s*[- ]?\s*cap\b", "Mid-Cap", text, flags=re.I)
    text = re.sub(r"\bmulti\s*[- ]?\s*cap\b", "Multi-Cap", text, flags=re.I)
    text = re.sub(r"\bsmall\s*[- ]?\s*cap\b", "Small-Cap", text, flags=re.I)
    text = re.sub(r"\blarge\s*[- ]?\s*cap\b", "Large-Cap", text, flags=re.I)

    tokens = text.split()
    normalized = [smart_title_token(tok) for tok in tokens]
    text = " ".join(normalized)

    # Preserve brand/product acronyms after title-normalization.
    replacements = {
        r"\bHdfc\b": "HDFC",
        r"\bEtf\b": "ETF",
        r"\bFof\b": "FOF",
        r"\bPsu\b": "PSU",
        r"\bNifty\b": "Nifty",
    }
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, replacement, text)

    return text.strip()


def split_merged_scheme_line(value: str) -> list[str]:
    """
    A PDF text line can accidentally contain multiple headings:
      HDFC High Interest Fund - Dynamic Plan HDFC Liquid Fund

    Split whenever a second 'HDFC ' begins. Each segment is then independently
    normalized and validated.
    """
    text = clean_text(value)

    starts = [m.start() for m in re.finditer(r"(?<!^)\bHDFC\s+", text, flags=re.I)]
    if not starts:
        return [text]

    segments = []
    last = 0
    for idx in starts:
        segments.append(text[last:idx].strip(" ,-:|"))
        last = idx
    segments.append(text[last:].strip(" ,-:|"))

    return [x for x in segments if x]


def is_strong_scheme_heading(text: str, avg_size: float, page_median_size: float) -> bool:
    text = canonicalize_scheme_name(text)
    low = text.lower()

    if not low.startswith("hdfc "):
        return False

    if any(term in low for term in SCHEME_REJECT):
        return False

    if re.search(r"IN[A-Z0-9]{10}", text.upper()):
        return False

    if "%" in text or "₹" in text:
        return False

    if sum(ch.isdigit() for ch in text) > 5:
        return False

    if len(text) < 10 or len(text) > 95:
        return False

    if len(text.split()) > 14:
        return False

    if not SCHEME_PRODUCT_RE.search(low):
        return False

    if not SCHEME_SUFFIX_RE.search(low):
        return False

    typographic = avg_size >= max(page_median_size + 0.7, page_median_size * 1.08)
    clean_shape = low.count("hdfc") == 1 and not re.search(r"\b\d{2,}\b", low)

    return typographic or clean_shape


def detect_page_scheme_headings(lines: list[list[dict]]) -> list[tuple[int, str]]:
    sizes = [line_font_size(x) for x in lines if line_font_size(x) > 0]
    page_median = sorted(sizes)[len(sizes)//2] if sizes else 0.0

    headings: list[tuple[int, str]] = []

    for i, line in enumerate(lines):
        raw = line_text(line)
        avg_size = line_font_size(line)

        # First split merged one-line headings.
        for segment in split_merged_scheme_line(raw):
            if is_strong_scheme_heading(segment, avg_size, page_median):
                headings.append((i, canonicalize_scheme_name(segment)))

        # Two-line heading support.
        if i + 1 < len(lines):
            t1 = clean_text(raw)
            t2 = clean_text(line_text(lines[i + 1]))
            combined = clean_text(f"{t1} {t2}")
            combined_size = max(avg_size, line_font_size(lines[i + 1]))

            # If combining creates two HDFC headings, split them after joining.
            for segment in split_merged_scheme_line(combined):
                if (
                    segment.lower().startswith("hdfc ")
                    and is_strong_scheme_heading(segment, combined_size, page_median)
                ):
                    headings.append((i, canonicalize_scheme_name(segment)))

    # Canonical de-duplication while preserving order and location.
    deduped: list[tuple[int, str]] = []
    last_by_name: dict[str, int] = {}

    for idx, name in headings:
        key = name.casefold()
        last_idx = last_by_name.get(key)

        if last_idx is not None and idx - last_idx <= 4:
            continue

        deduped.append((idx, name))
        last_by_name[key] = idx

    return deduped


def scheme_for_holding_line(
    line_index: int,
    headings: list[tuple[int, str]],
    carried_scheme: str,
    inventory_scheme: str,
) -> str:
    eligible = [name for idx, name in headings if idx <= line_index]
    if eligible:
        return eligible[-1]

    if carried_scheme:
        return canonicalize_scheme_name(carried_scheme)

    inv = canonicalize_scheme_name(inventory_scheme)
    return inv if inv else "Scheme Not Detected"


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
        "Extraction_Method": "Word-Anchored ISIN V4.4",
        "Asset_Class": asset_class,
    }


def parse_pdf(pdf_path: Path, inventory_scheme: str, debug_schemes: bool = False) -> list[dict]:
    holdings: list[dict] = []
    carried_scheme = canonicalize_scheme_name(inventory_scheme)
    detected_names: list[str] = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            try:
                words = page.extract_words(
                    x_tolerance=2,
                    y_tolerance=2,
                    keep_blank_chars=False,
                    use_text_flow=False,
                    extra_attrs=["size", "fontname"],
                )
            except Exception:
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
            headings = detect_page_scheme_headings(lines)

            if headings:
                detected_names.extend([name for _, name in headings])

            page_compact = re.sub(r"\s+", "", "\n".join(line_text(x) for x in lines)).upper()

            if "IN" in page_compact:
                for line_index, line in enumerate(lines):
                    compact = re.sub(r"\s+", "", line_text(line)).upper()
                    if "IN" not in compact:
                        continue

                    scheme = scheme_for_holding_line(
                        line_index,
                        headings,
                        carried_scheme,
                        inventory_scheme,
                    )

                    asset_class = detect_asset_context(line_index, lines)
                    record = parse_isin_line(line, page_number, asset_class)
                    if not record:
                        continue

                    low = record["Company"].lower()
                    if any(term in low for term in NON_EQUITY) and asset_class != "Equity":
                        continue

                    record["Scheme"] = canonicalize_scheme_name(scheme)
                    holdings.append(record)

            if headings:
                carried_scheme = headings[-1][1]

    if debug_schemes:
        unique = []
        seen = set()
        for name in detected_names:
            key = canonicalize_scheme_name(name).casefold()
            if key not in seen:
                seen.add(key)
                unique.append(canonicalize_scheme_name(name))

        print("    detected canonical scheme headings:")
        for name in unique:
            print(f"      - {name}")

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

    return (base_dir / p).resolve()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--base-dir", required=True)
    parser.add_argument("--max-pdfs", type=int, default=10)
    parser.add_argument("--amc", default="")
    parser.add_argument("--debug-schemes", action="store_true")
    args = parser.parse_args()

    inventory_path = Path(args.inventory).resolve()
    base_dir = Path(args.base_dir).resolve()
    inventory = load_inventory(inventory_path)

    path_col = choose_column(inventory, ["PDF_Path", "Path", "File Path"])
    amc_col = choose_column(inventory, ["AMC"])
    scheme_col = choose_column(inventory, ["Scheme"])
    date_col = choose_column(inventory, ["Report_Date", "Report Date", "Date", "Month"])

    if not path_col:
        raise SystemExit(f"Could not detect PDF path column. Columns: {list(inventory.columns)}")

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
        inventory_scheme = clean_text(item.get(scheme_col, "")) if scheme_col else ""
        report_date = pd.to_datetime(item.get(date_col, None) if date_col else None, errors="coerce")

        if not pdf_path.exists():
            print(f"[MISSING] {pdf_path}")
            processing.append({
                "PDF_Path": str(pdf_path),
                "AMC": amc,
                "Status": "Missing",
                "Rows": 0,
            })
            continue

        try:
            found = parse_pdf(pdf_path, inventory_scheme, args.debug_schemes)

            for rec in found:
                rec.update({
                    "AMC": amc,
                    "Report_Date": report_date,
                    "Year": report_date.year if not pd.isna(report_date) else None,
                    "Month_Number": report_date.month if not pd.isna(report_date) else None,
                    "Month": report_date.strftime("%B") if not pd.isna(report_date) else "",
                    "Month_Year": report_date.strftime("%B-%Y") if not pd.isna(report_date) else "",
                    "PDF_File": pdf_path.name,
                    "PDF_Path": str(pdf_path),
                })

            rows.extend(found)

            scheme_count = len({
                canonicalize_scheme_name(x["Scheme"])
                for x in found
                if x.get("Scheme")
            })

            processing.append({
                "PDF_Path": str(pdf_path),
                "AMC": amc,
                "Status": "Processed",
                "Rows": len(found),
                "Schemes_Detected": scheme_count,
            })

            print(f"[OK] {pdf_path.name}: {len(found)} rows | {scheme_count} schemes")

        except Exception as exc:
            print(f"[ERROR] {pdf_path.name}: {exc}")
            processing.append({
                "PDF_Path": str(pdf_path),
                "AMC": amc,
                "Status": "Error",
                "Rows": 0,
                "Message": str(exc),
            })

    holdings = pd.DataFrame(rows)
    processing_df = pd.DataFrame(processing)

    if not holdings.empty:
        holdings["Scheme"] = holdings["Scheme"].map(canonicalize_scheme_name)

        holdings = holdings[holdings["ISIN"].map(valid_indian_isin)].copy()
        holdings = holdings[
            holdings["Scheme"].ne("")
            & holdings["Scheme"].ne("Scheme Not Detected")
        ].copy()

        holdings = holdings.drop_duplicates(
            subset=["AMC", "Scheme", "Report_Date", "ISIN"],
            keep="first",
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

        if not holdings.empty:
            summary = (
                holdings.groupby(["AMC", "Scheme", "Report_Date"])
                .agg(
                    Holdings=("ISIN", "nunique"),
                    Total_Weight=("Portfolio_Weight_Percent", "sum"),
                )
                .reset_index()
            )
            summary.to_excel(writer, sheet_name="Scheme Summary", index=False)

            scheme_inventory = (
                holdings[["AMC", "Scheme"]]
                .drop_duplicates()
                .sort_values(["AMC", "Scheme"])
            )
            scheme_inventory.to_excel(writer, sheet_name="Scheme Inventory", index=False)

    unique_schemes = (
        holdings[["AMC", "Scheme"]].drop_duplicates().shape[0]
        if not holdings.empty else 0
    )

    print()
    print("=" * 78)
    print("CREDONOMICS MF EXTRACTOR V4.4 COMPLETE")
    print("=" * 78)
    print(f"Holdings rows : {len(holdings):,}")
    print(f"Unique ISINs  : {holdings['ISIN'].nunique() if not holdings.empty else 0:,}")
    print(f"AMCs          : {holdings['AMC'].nunique() if not holdings.empty else 0}")
    print(f"Schemes       : {unique_schemes}")
    print(f"Output        : {output.resolve()}")
    print("=" * 78)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
