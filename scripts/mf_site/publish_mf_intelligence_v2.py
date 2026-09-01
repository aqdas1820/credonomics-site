from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import shutil
import calendar
from datetime import datetime, timezone
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import pandas as pd


EXCLUDE_SOURCE_RE = re.compile(
    r"Index Solutions|Index Funds\s*&\s*ETFs",
    re.IGNORECASE,
)

CORE_SCHEMES = [
    (
        "HDFC Flexi Cap Fund",
        "Flexi Cap",
        re.compile(
            r"\bHDFC\s+Flexi[\s-]*Cap\s+Fund\b",
            re.I,
        ),
    ),
    (
        "HDFC Mid Cap Fund",
        "Mid Cap",
        re.compile(
            r"\bHDFC\s+(?:Mid[\s-]*Cap\s+Fund|Mid[\s-]*Cap\s+Opportunities\s+Fund)\b",
            re.I,
        ),
    ),
    (
        "HDFC Small Cap Fund",
        "Small Cap",
        re.compile(
            r"\bHDFC\s+Small[\s-]*Cap\s+Fund\b",
            re.I,
        ),
    ),
    (
        "HDFC Large and Mid Cap Fund",
        "Large & Mid Cap",
        re.compile(
            r"\bHDFC\s+Large\s+(?:and|&)\s+Mid[\s-]*Cap\s+Fund\b",
            re.I,
        ),
    ),
    (
        "HDFC Multi Cap Fund",
        "Multi Cap",
        re.compile(
            r"\bHDFC\s+Multi[\s-]*Cap\s+Fund\b",
            re.I,
        ),
    ),
    (
        "HDFC Focused Fund",
        "Focused",
        re.compile(
            r"\bHDFC\s+Focused(?:\s+30)?\s+Fund\b",
            re.I,
        ),
    ),
]

CORE_ORDER = [x[0] for x in CORE_SCHEMES]
CATEGORY_MAP = {name: category for name, category, _ in CORE_SCHEMES}

VALID_EQUITY_ISIN_RE = re.compile(r"^INE[A-Z0-9]{9}$", re.I)

GENERIC_BAD_NAMES = {
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
    "services ltd",
    "services ltd.",
    "services limited",
    "corporation ltd",
    "corporation ltd.",
    "corporation limited",
}

BAD_PHRASE_RE = re.compile(
    r"\b(?:category of scheme|top holdings|fund manager|riskometer|"
    r"benchmark|expense ratio|exit load|net current assets|"
    r"cash equivalents?|treps|repo|government securities|"
    r"equity\s*&\s*equity related|portfolio turnover)\b",
    re.I,
)

LEADING_NUMBER_RE = re.compile(
    r"^\s*(?:â‚¹\s*)?\d{1,3}(?:\.\d{1,4})?\s+(?=[A-Za-z])"
)

TRAILING_SECTOR_RE = re.compile(
    r"\s+(?:IT|Auto|Finance|Banks?|Power|Software|Pharmaceuticals?|"
    r"Consumer(?:\s+Non)?\s+Durables?|Industrial(?:\s+Products)?|"
    r"Construction(?:\s+Project)?|Telecom(?:\s*-\s*Services)?|"
    r"Realty|Cement|Chemicals?|Retailing|Leisure\s+Services|"
    r"Auto\s+Components?)\s*-?\s*$",
    re.I,
)

LEGAL_SUFFIX_RE = re.compile(
    r"^(.+?\b(?:Ltd\.?|Limited|Corporation|Bank|Company))"
    r"(?=\s+(?:IT|Auto|Finance|Banks?|Power|Software|Pharmaceuticals?|"
    r"Consumer|Industrial|Construction|Telecom|Realty|Cement|Chemicals?|"
    r"Retailing|Leisure)|\s+\d+(?:\.\d+)?\s*$|$)",
    re.I,
)


def text(value: Any) -> str:
    if value is None:
        return ""
    try:
        if isinstance(value, float) and math.isnan(value):
            return ""
    except Exception:
        pass
    return re.sub(
        r"\s+",
        " ",
        str(value).replace("\n", " ").replace("\r", " ").replace("\xa0", " "),
    ).strip()


def clean_series(series: pd.Series) -> pd.Series:
    return (
        series.fillna("")
        .astype(str)
        .str.replace("\n", " ", regex=False)
        .str.replace("\r", " ", regex=False)
        .str.replace("\xa0", " ", regex=False)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )


def bool_series(series: pd.Series) -> pd.Series:
    if pd.api.types.is_bool_dtype(series):
        return series.fillna(False)
    return (
        series.astype(str)
        .str.strip()
        .str.lower()
        .isin({"true", "1", "yes", "y"})
    )


def valid_equity_isin(value: Any) -> str:
    s = re.sub(r"[^A-Za-z0-9]", "", text(value)).upper()
    return s if VALID_EQUITY_ISIN_RE.fullmatch(s) else ""


TARGET_SCHEME_ALIASES = {
    "HDFC Flexi Cap Fund": [
        "hdfc flexi cap fund",
        "hdfc flexicap fund",
        "flexi cap fund",
        "flexicap fund",
        "hdfc equity fund",
    ],
    "HDFC Mid Cap Fund": [
        "hdfc mid cap fund",
        "hdfc mid-cap fund",
        "hdfc mid cap opportunities fund",
        "hdfc mid-cap opportunities fund",
        "mid cap opportunities fund",
        "mid-cap opportunities fund",
        "mid cap fund",
    ],
    "HDFC Small Cap Fund": [
        "hdfc small cap fund",
        "hdfc small-cap fund",
        "small cap fund",
        "small-cap fund",
    ],
    "HDFC Large and Mid Cap Fund": [
        "hdfc large and mid cap fund",
        "hdfc large & mid cap fund",
        "hdfc large and mid-cap fund",
        "large and mid cap fund",
        "large & mid cap fund",
        "hdfc growth opportunities fund",
    ],
    "HDFC Multi Cap Fund": [
        "hdfc multi cap fund",
        "hdfc multi-cap fund",
        "multi cap fund",
        "multi-cap fund",
    ],
    "HDFC Focused Fund": [
        "hdfc focused fund",
        "hdfc focused 30 fund",
        "focused 30 fund",
        "focused fund",
    ],
}

TARGET_SCHEME_ORDER = [
    "HDFC Flexi Cap Fund",
    "HDFC Mid Cap Fund",
    "HDFC Small Cap Fund",
    "HDFC Large and Mid Cap Fund",
    "HDFC Multi Cap Fund",
    "HDFC Focused Fund",
]


def normalize_scheme_evidence(value: object) -> str:
    s = text(value).lower()
    s = (
        s.replace("â€“", "-")
        .replace("â€”", "-")
        .replace("â€‘", "-")
        .replace("âˆ’", "-")
        .replace("&", " and ")
        .replace("%20", " ")
        .replace("_", " ")
    )
    s = re.sub(r"[/|:;,+()\[\]{}]+", " ", s)
    s = re.sub(r"-+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def canonical_target_from_text(value: object, allow_bare: bool = True) -> str:
    s = normalize_scheme_evidence(value)
    if not s:
        return ""

    ordered = [
        "HDFC Large and Mid Cap Fund",
        "HDFC Flexi Cap Fund",
        "HDFC Small Cap Fund",
        "HDFC Mid Cap Fund",
        "HDFC Multi Cap Fund",
        "HDFC Focused Fund",
    ]

    for canonical in ordered:
        for alias in TARGET_SCHEME_ALIASES[canonical]:
            a = normalize_scheme_evidence(alias)
            if a and a in s:
                if a.startswith("hdfc ") or allow_bare:
                    return canonical

    if "hdfc" in s or allow_bare:
        if "large" in s and "mid" in s and "cap" in s and "fund" in s:
            return "HDFC Large and Mid Cap Fund"
        if "flexi" in s and "cap" in s and "fund" in s:
            return "HDFC Flexi Cap Fund"
        if "small" in s and "cap" in s and "fund" in s:
            return "HDFC Small Cap Fund"
        if "mid" in s and "cap" in s and ("opportunit" in s or "fund" in s):
            return "HDFC Mid Cap Fund"
        if "multi" in s and "cap" in s and "fund" in s:
            return "HDFC Multi Cap Fund"
        if "focused" in s and ("fund" in s or "30" in s):
            return "HDFC Focused Fund"

    return ""


def scheme_metadata_values(row: pd.Series) -> list[str]:
    preferred = [
        "Scheme",
        "Portfolio_Display_Name",
        "Clean_Section",
        "Clean_Variant",
        "Section_Label",
        "Variant_Label",
        "Original_Scheme",
        "Resolved_Scheme",
        "Inventory_Scheme",
        "Scheme_Name",
        "Portfolio_Name",
        "Category",
        "Category_of_Scheme",
        "Scheme_Category",
        "Fund_Category",
        "Portfolio_Label",
        "Section",
        "Variant",
        "Heading",
        "Header",
        "Title",
    ]

    values: list[str] = []

    for col in preferred:
        if col in row.index:
            v = text(row.get(col, ""))
            if v:
                values.append(v)

    deny = {
        "company",
        "industry",
        "isin",
        "portfolio_weight_percent",
        "report_date",
        "pdf_file",
        "pdf_path",
        "source_path",
        "year",
        "month",
        "month_number",
        "month_year",
    }

    for col in row.index:
        key = str(col).lower()
        if key in deny or col in preferred:
            continue
        if any(
            token in key
            for token in (
                "scheme",
                "section",
                "variant",
                "portfolio",
                "category",
                "label",
                "heading",
                "header",
                "title",
            )
        ):
            v = text(row.get(col, ""))
            if v:
                values.append(v)

    return values


def scheme_from_row(row: pd.Series) -> str:
    amc = normalize_scheme_evidence(row.get("AMC", ""))
    allow_bare = "hdfc" in amc

    for value in scheme_metadata_values(row):
        found = canonical_target_from_text(value, allow_bare=allow_bare)
        if found:
            return found

    return ""


def _page_number(value: object) -> int | None:
    try:
        n = int(float(value))
        return n if n > 0 else None
    except Exception:
        return None


def _block_number(value: object) -> int:
    try:
        return int(float(value))
    except Exception:
        return 0


def _row_has_non_target_scheme_boundary(row: pd.Series) -> bool:
    values = []

    for col in (
        "Scheme",
        "Portfolio_Display_Name",
        "Clean_Section",
        "Section_Label",
        "Original_Scheme",
        "Resolved_Scheme",
        "Scheme_Name",
        "Portfolio_Name",
    ):
        if col in row.index:
            v = normalize_scheme_evidence(row.get(col, ""))
            if v:
                values.append(v)

    neutral = {
        "unassigned",
        "unlabeled section",
        "unlabeled variant",
        "portfolio",
        "top holdings",
        "equity and equity related",
        "equity equity related",
        "category of scheme",
        "regular plan",
        "direct plan",
        "plan s",
    }

    for v in values:
        if canonical_target_from_text(v, allow_bare=True):
            continue
        if v in neutral:
            continue
        if (
            ("hdfc" in v and re.search(r"\b(?:fund|etf)\b", v))
            or (v.startswith("hdfc ") and "plan" in v)
        ):
            return True

    return False


def resolve_with_workbook_sequence(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()

    doc_cols = [
        c for c in ("AMC", "Report_Date", "PDF_File")
        if c in frame.columns
    ]

    if "Page" not in frame.columns or len(doc_cols) < 2:
        return frame

    frame["_v25_page"] = frame["Page"].map(_page_number)
    frame["_v25_block"] = (
        frame["Block"].map(_block_number)
        if "Block" in frame.columns
        else 0
    )
    frame["_v25_other_boundary"] = frame.apply(
        _row_has_non_target_scheme_boundary,
        axis=1,
    )

    recovered = 0

    for _, doc in frame.groupby(doc_cols, dropna=False, sort=False):
        blocks = []

        for (page, block), g in doc.groupby(
            ["_v25_page", "_v25_block"],
            dropna=False,
            sort=False,
        ):
            if page is None or pd.isna(page):
                continue

            schemes = sorted(
                set(
                    s
                    for s in g["_scheme"].astype(str)
                    if s and s != "nan"
                )
            )

            blocks.append(
                {
                    "page": int(page),
                    "block": int(block),
                    "indices": list(g.index),
                    "schemes": schemes,
                    "otherBoundary": bool(g["_v25_other_boundary"].any()),
                }
            )

        blocks.sort(key=lambda x: (x["page"], x["block"]))

        active = ""
        active_page = None

        for item in blocks:
            schemes = item["schemes"]

            if len(schemes) == 1:
                active = schemes[0]
                active_page = item["page"]

                for idx in item["indices"]:
                    if not text(frame.at[idx, "_scheme"]):
                        frame.at[idx, "_scheme"] = active
                        frame.at[idx, "_scheme_method"] = "same_block_anchor"
                        frame.at[idx, "_scheme_confidence"] = 96
                        recovered += 1
                continue

            if len(schemes) > 1:
                active = ""
                active_page = None
                continue

            if item["otherBoundary"]:
                active = ""
                active_page = None
                continue

            if active and active_page is not None:
                gap = item["page"] - active_page

                if 0 <= gap <= 2:
                    for idx in item["indices"]:
                        if not text(frame.at[idx, "_scheme"]):
                            frame.at[idx, "_scheme"] = active
                            frame.at[idx, "_scheme_method"] = "forward_page_anchor"
                            frame.at[idx, "_scheme_confidence"] = 88 if gap == 1 else 80
                            recovered += 1
                elif gap > 2:
                    active = ""
                    active_page = None

    if recovered:
        print(f"[RESOLVER V2.5] Workbook page/block recovery: {recovered:,} rows")

    return frame


def _locate_pdf_for_group(
    group: pd.DataFrame,
    tracking_root: Path,
    basename_index: dict[str, list[Path]],
) -> Path | None:
    for col in (
        "PDF_Path",
        "FullPath",
        "Source_Path",
        "Source_PDF_Path",
        "File_Path",
    ):
        if col not in group.columns:
            continue

        for raw in group[col].dropna().astype(str).unique().tolist():
            raw = raw.strip()
            if not raw:
                continue

            p = Path(raw)
            candidates = [p]
            if not p.is_absolute():
                candidates.append(tracking_root / p)

            for candidate in candidates:
                if candidate.exists() and candidate.suffix.lower() == ".pdf":
                    return candidate

    if "PDF_File" not in group.columns:
        return None

    vals = group["PDF_File"].dropna().astype(str).unique().tolist()
    if not vals:
        return None

    file_name = Path(vals[0]).name
    matches = basename_index.get(file_name.lower(), [])

    if not matches:
        return None

    return sorted(matches, key=lambda p: (len(str(p)), str(p).lower()))[0]


def _extract_pdf_page_text(pdf_path: Path, page_numbers: list[int]) -> dict[int, str]:
    result: dict[int, str] = {}
    wanted = sorted(set(p for p in page_numbers if p and p > 0))

    if not wanted:
        return result

    try:
        import pdfplumber  # type: ignore

        with pdfplumber.open(str(pdf_path)) as pdf:
            for page_no in wanted:
                idx = page_no - 1
                if 0 <= idx < len(pdf.pages):
                    try:
                        result[page_no] = pdf.pages[idx].extract_text() or ""
                    except Exception:
                        result[page_no] = ""
        return result
    except Exception:
        pass

    try:
        from pypdf import PdfReader  # type: ignore

        reader = PdfReader(str(pdf_path))
        for page_no in wanted:
            idx = page_no - 1
            if 0 <= idx < len(reader.pages):
                try:
                    result[page_no] = reader.pages[idx].extract_text() or ""
                except Exception:
                    result[page_no] = ""
    except Exception:
        return {}

    return result


def _target_from_pdf_heading(page_text: str) -> tuple[str, bool]:
    lines = [
        normalize_scheme_evidence(line)
        for line in str(page_text or "").splitlines()[:55]
        if normalize_scheme_evidence(line)
    ]

    for line in lines:
        target = canonical_target_from_text(line, allow_bare=True)
        if target:
            return target, False

    for line in lines[:35]:
        if line in {
            "hdfc mutual fund",
            "hdfc asset management company limited",
        }:
            continue

        if (
            line.startswith("hdfc ")
            and re.search(r"\b(?:fund|etf)\b", line)
            and len(line) <= 120
        ):
            return "", True

    return "", False


def resolve_with_source_pdf_headings(
    frame: pd.DataFrame,
    tracking_root: Path,
) -> pd.DataFrame:
    frame = frame.copy()

    if "PDF_File" not in frame.columns or "Page" not in frame.columns:
        print("[RESOLVER V2.5] PDF heading recovery skipped: PDF_File/Page missing")
        return frame

    if not frame["_scheme"].astype(str).eq("").any():
        return frame

    basename_index: dict[str, list[Path]] = {}

    search_roots = []
    for candidate in (
        tracking_root / "Factsheets",
        tracking_root / "factsheets",
        tracking_root,
    ):
        if candidate.exists() and candidate not in search_roots:
            search_roots.append(candidate)

    for root in search_roots:
        try:
            for p in root.rglob("*.pdf"):
                basename_index.setdefault(p.name.lower(), []).append(p)
            if basename_index:
                break
        except Exception:
            continue

    if not basename_index:
        print("[RESOLVER V2.5] PDF heading recovery skipped: no source PDFs indexed")
        return frame

    doc_cols = [c for c in ("Report_Date", "PDF_File") if c in frame.columns]

    recovered = 0
    pdfs_read = 0
    pdfs_missing = 0

    for _, group in frame.groupby(doc_cols, dropna=False, sort=False):
        if not group["_scheme"].astype(str).eq("").any():
            continue

        pdf_path = _locate_pdf_for_group(group, tracking_root, basename_index)

        if not pdf_path:
            pdfs_missing += 1
            continue

        pages = sorted(
            set(
                p
                for p in group["Page"].map(_page_number).tolist()
                if p is not None
            )
        )

        if not pages:
            continue

        wanted = set()

        for p in pages:
            wanted.add(p)
            if p > 1:
                wanted.add(p - 1)
            wanted.add(p + 1)

        page_text = _extract_pdf_page_text(pdf_path, sorted(wanted))

        if not page_text:
            continue

        pdfs_read += 1

        active = ""
        active_page = None
        page_assignment: dict[int, str] = {}

        for page_no in sorted(page_text):
            target, other_boundary = _target_from_pdf_heading(
                page_text.get(page_no, "")
            )

            if target:
                active = target
                active_page = page_no
                page_assignment[page_no] = target
                continue

            if other_boundary:
                active = ""
                active_page = None
                continue

            if active and active_page is not None:
                gap = page_no - active_page

                if 0 <= gap <= 2:
                    page_assignment[page_no] = active
                elif gap > 2:
                    active = ""
                    active_page = None

        for idx in group.index:
            if text(frame.at[idx, "_scheme"]):
                continue

            page_no = _page_number(frame.at[idx, "Page"])

            if page_no is None:
                continue

            target = page_assignment.get(page_no, "")

            if target:
                frame.at[idx, "_scheme"] = target
                frame.at[idx, "_scheme_method"] = "source_pdf_heading"
                frame.at[idx, "_scheme_confidence"] = 99
                recovered += 1

    print(
        "[RESOLVER V2.5] Source-PDF heading recovery: "
        f"{recovered:,} rows | {pdfs_read:,} PDFs read | "
        f"{pdfs_missing:,} PDFs not found"
    )

    return frame


def propagate_scheme_within_portfolios(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()

    candidate_ids = [
        "Logical_Portfolio_ID",
        "Physical_Portfolio_ID",
        "Portfolio_ID",
        "Original_Portfolio_ID",
        "Clean_Portfolio_ID",
        "Block_Portfolio_ID",
        "Block_ID",
    ]

    group_id = next(
        (c for c in candidate_ids if c in frame.columns),
        None,
    )

    if not group_id:
        return frame

    base_group = [
        c for c in ("AMC", "Report_Date", "PDF_File", group_id)
        if c in frame.columns
    ]

    if len(base_group) < 2:
        return frame

    assignments: dict[tuple, str] = {}

    for key, group in frame.groupby(base_group, dropna=False):
        resolved = sorted(
            set(
                s
                for s in group["_scheme"].astype(str)
                if s and s != "nan"
            )
        )

        if len(resolved) == 1:
            assignments[
                key if isinstance(key, tuple) else (key,)
            ] = resolved[0]

    recovered = 0

    for idx, row in frame[frame["_scheme"].astype(str).eq("")].iterrows():
        key = tuple(row.get(c) for c in base_group)
        target = assignments.get(key)

        if target:
            frame.at[idx, "_scheme"] = target
            frame.at[idx, "_scheme_method"] = "portfolio_id_propagation"
            frame.at[idx, "_scheme_confidence"] = 94
            recovered += 1

    if recovered:
        print(f"[RESOLVER V2.5] Portfolio-ID recovery: {recovered:,} rows")

    return frame

def candidate_company_names(raw: Any, sector: Any = "") -> list[str]:
    s = text(raw)
    if not s:
        return []

    sector_text = text(sector)

    s = s.replace("â€“", "-").replace("â€”", "-")
    s = re.sub(r"^[â€¢|:;,.\-]+\s*", "", s)
    s = LEADING_NUMBER_RE.sub("", s)
    s = re.sub(r"\s+\d{1,3}(?:\.\d{1,4})\s*$", "", s)
    s = TRAILING_SECTOR_RE.sub("", s)

    if sector_text:
        s = re.sub(
            rf"\s+{re.escape(sector_text)}\s*$",
            "",
            s,
            flags=re.I,
        )

    s = re.sub(r"\bLtd\s*\.\s*", "Ltd. ", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip(" |,;:-")

    candidates = [s]

    legal = LEGAL_SUFFIX_RE.search(s)
    if legal:
        candidates.append(legal.group(1).strip(" |,;:-"))

    # If a company name has a legal suffix followed by obvious PDF garbage,
    # keep the legal-suffix portion as another candidate.
    legal2 = re.search(r"^(.+?\b(?:Ltd\.?|Limited))\b", s, flags=re.I)
    if legal2 and len(s) - len(legal2.group(1)) >= 4:
        candidates.append(legal2.group(1).strip(" |,;:-"))

    out: list[str] = []
    for c in candidates:
        c = LEADING_NUMBER_RE.sub("", c)
        c = re.sub(r"\s+", " ", c).strip(" |,;:-")
        if c and c not in out:
            out.append(c)

    return out


def suspicious_company(value: Any) -> bool:
    s = text(value)
    if not s:
        return True

    low = s.lower().strip(" .,-")

    if low in GENERIC_BAD_NAMES:
        return True

    if BAD_PHRASE_RE.search(s):
        return True

    if re.match(r"^(?:ltd\.?|limited|of\s+|company\s+|bank\s+)", low):
        return True

    if re.search(r"\s-\s*$", s):
        return True

    letters = sum(ch.isalpha() for ch in s)
    if letters < 4:
        return True

    tokens = re.findall(r"[A-Za-z0-9&.'()-]+", s)
    if len(tokens) <= 2 and tokens:
        first = tokens[0].lower().strip(".")
        if first in {
            "company", "india", "bank", "products", "industries",
            "services", "corporation", "limited", "ltd", "of",
        }:
            return True

    return False


def name_score(value: Any) -> float:
    s = text(value)
    if suspicious_company(s):
        return -10000.0

    tokens = re.findall(r"[A-Za-z0-9&.'()-]+", s)
    score = min(len(s), 120) * 0.15 + len(tokens) * 4.0

    if len(tokens) >= 3:
        score += 14.0

    if re.search(
        r"\b(?:Ltd\.?|Limited|Bank|Industries|Corporation|Company)\b",
        s,
        re.I,
    ):
        score += 8.0

    if re.search(
        r"\b(?:India|Bharat|Hindustan|Technologies|Pharmaceuticals|"
        r"Motors|Power|Finance|Financial|Consumer|Engineering)\b",
        s,
        re.I,
    ):
        score += 4.0

    if re.search(r"\b(?:IT|Auto|Banks?|Software)\s*-\s*$", s, re.I):
        score -= 20.0

    return score


def canonical_names_by_isin(frame: pd.DataFrame) -> dict[str, str]:
    candidates: dict[str, Counter] = defaultdict(Counter)

    for _, row in frame.iterrows():
        isin = row["_isin"]
        if not isin:
            continue

        for candidate in candidate_company_names(
            row["_raw_company"],
            row["_sector"],
        ):
            candidates[isin][candidate] += 1

    result: dict[str, str] = {}

    for isin, counter in candidates.items():
        ranked = []
        for candidate, frequency in counter.items():
            ranked.append(
                (
                    name_score(candidate) + min(frequency, 12) * 1.5,
                    len(candidate),
                    frequency,
                    candidate,
                )
            )

        if not ranked:
            continue

        ranked.sort(reverse=True)
        best = ranked[0][3]

        if not suspicious_company(best):
            result[isin] = best

    return result


def canonical_sector_by_isin(frame: pd.DataFrame) -> dict[str, str]:
    result: dict[str, str] = {}

    for isin, group in frame[frame["_isin"].ne("")].groupby("_isin"):
        values = [
            text(x)
            for x in group["_sector"].tolist()
            if text(x) and text(x).lower() not in {"nan", "unclassified"}
        ]
        if values:
            result[isin] = Counter(values).most_common(1)[0][0]

    return result


def safe_slug(value: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return s[:72] or "security"


def normalized_name_key(value: str) -> str:
    s = text(value).lower()
    s = s.replace("&", " and ")
    s = re.sub(r"\blimited\b", " ltd ", s)
    s = re.sub(r"\bltd\.?\b", " ltd ", s)
    s = re.sub(r"\bco\.?\b", " company ", s)
    s = re.sub(r"\bcorp\.?\b", " corporation ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def direct_scheme_evidence(row: pd.Series) -> bool:
    direct_fields = [
        "Scheme",
        "Portfolio_Display_Name",
        "Clean_Section",
        "Clean_Variant",
    ]
    combined = " | ".join(
        text(row.get(col, ""))
        for col in direct_fields
        if col in row.index
    )
    return any(pattern.search(combined) for _, _, pattern in CORE_SCHEMES)


def security_slug(security_id: str, stock: str) -> str:
    if VALID_EQUITY_ISIN_RE.fullmatch(security_id):
        return security_id.lower()

    digest = hashlib.sha1(security_id.encode("utf-8")).hexdigest()[:8]
    return f"{safe_slug(stock)}-{digest}"


def snapshot_quality(total_weight: float, securities: int, isin_pct: float) -> str:
    if securities >= 12 and 15 <= total_weight <= 120:
        return "High"

    if securities >= 7 and 7 <= total_weight <= 120:
        return "Medium"

    return "Review"


def month_payload(frame: pd.DataFrame, month: str) -> dict:
    g = frame[frame["month"] == month].copy()

    holdings = [
        {
            "amc": r.amc,
            "scheme": r.scheme,
            "category": r.category,
            "month": r.month,
            "securityId": r.securityId,
            "slug": r.slug,
            "isin": r.isin,
            "stock": r.stock,
            "sector": r.sector,
            "weight": round(float(r.weight), 4),
            "quality": r.quality,
            "sourcePdf": r.sourcePdf,
        }
        for r in g.itertuples(index=False)
    ]

    return {
        "month": month,
        "schemes": sorted(g["scheme"].unique().tolist()),
        "holdings": holdings,
    }


def aggregate_month(frame: pd.DataFrame, month: str) -> dict[str, dict]:
    g = frame[frame["month"] == month]
    live_schemes = max(g["scheme"].nunique(), 1)
    result: dict[str, dict] = {}

    for security_id, sg in g.groupby("securityId"):
        weights = {
            r.scheme: round(float(r.weight), 4)
            for r in sg.itertuples(index=False)
        }
        total_weight = float(sg["weight"].sum())
        scheme_count = int(sg["scheme"].nunique())
        normalized_weight = total_weight / live_schemes
        avg_held_weight = total_weight / max(scheme_count, 1)

        first = sg.iloc[0]
        result[security_id] = {
            "securityId": security_id,
            "slug": first["slug"],
            "isin": first["isin"],
            "stock": first["stock"],
            "sector": first["sector"],
            "schemeCount": scheme_count,
            "liveSchemes": live_schemes,
            "breadth": scheme_count / live_schemes,
            "totalWeight": total_weight,
            "normalizedWeight": normalized_weight,
            "avgHeldWeight": avg_held_weight,
            "weights": weights,
        }

    return result


def build_latest_intelligence(
    frame: pd.DataFrame,
    months: list[str],
) -> dict:
    if not months:
        return {
            "latestMonth": None,
            "previousMonth": None,
            "summary": {},
            "topConsensus": [],
            "signals": {},
            "sectorRotation": [],
            "ownershipMatrix": [],
        }

    latest = months[-1]
    previous = months[-2] if len(months) >= 2 else latest

    curr = aggregate_month(frame, latest)
    prev = aggregate_month(frame, previous)

    history_maps = {
        month: aggregate_month(frame, month)
        for month in months
    }

    last6 = months[-6:]
    current_scores: list[dict] = []

    for security_id, x in curr.items():
        persistence = sum(
            1 for month in last6
            if security_id in history_maps[month]
        ) / max(len(last6), 1)

        if len(months) >= 4:
            base_month = months[-4]
            base_weight = history_maps[base_month].get(
                security_id,
                {},
            ).get("normalizedWeight", 0.0)
            trend3m = x["normalizedWeight"] - float(base_weight)
        else:
            trend3m = 0.0

        breadth_component = x["breadth"] * 50.0
        weight_component = min(x["normalizedWeight"] / 3.0, 1.0) * 25.0
        trend_component = min(max(trend3m, 0.0) / 1.0, 1.0) * 15.0
        persistence_component = persistence * 10.0

        score = breadth_component + weight_component + trend_component + persistence_component

        prev_norm = prev.get(security_id, {}).get("normalizedWeight", 0.0)

        current_scores.append(
            {
                **x,
                "score": round(score, 1),
                "change": round(x["normalizedWeight"] - float(prev_norm), 4),
                "trend3m": round(trend3m, 4),
                "persistence6m": round(persistence, 3),
            }
        )

    current_scores.sort(
        key=lambda x: (x["score"], x["normalizedWeight"], x["schemeCount"]),
        reverse=True,
    )

    curr_month_rows = frame[frame["month"] == latest]
    prev_month_rows = frame[frame["month"] == previous]

    curr_weights = {
        (r.securityId, r.scheme): float(r.weight)
        for r in curr_month_rows.itertuples(index=False)
    }
    prev_weights = {
        (r.securityId, r.scheme): float(r.weight)
        for r in prev_month_rows.itertuples(index=False)
    }

    all_security_ids = set(curr) | set(prev)
    signals_base: list[dict] = []

    for security_id in all_security_ids:
        c = curr.get(security_id)
        p = prev.get(security_id)

        stock = (c or p)["stock"]
        sector = (c or p)["sector"]
        slug = (c or p)["slug"]

        schemes = set()
        if c:
            schemes.update(c["weights"].keys())
        if p:
            schemes.update(p["weights"].keys())

        increase_count = 0
        decrease_count = 0
        new_scheme_count = 0
        exit_scheme_count = 0

        for scheme in schemes:
            cw = curr_weights.get((security_id, scheme), 0.0)
            pw = prev_weights.get((security_id, scheme), 0.0)

            if pw == 0 and cw > 0:
                new_scheme_count += 1
            elif cw == 0 and pw > 0:
                exit_scheme_count += 1

            delta = cw - pw
            if delta >= 0.05:
                increase_count += 1
            elif delta <= -0.05:
                decrease_count += 1

        current_norm = c["normalizedWeight"] if c else 0.0
        previous_norm = p["normalizedWeight"] if p else 0.0

        signals_base.append(
            {
                "securityId": security_id,
                "slug": slug,
                "stock": stock,
                "sector": sector,
                "currentSchemeCount": int(c["schemeCount"]) if c else 0,
                "previousSchemeCount": int(p["schemeCount"]) if p else 0,
                "currentWeight": round(float(current_norm), 4),
                "previousWeight": round(float(previous_norm), 4),
                "change": round(float(current_norm - previous_norm), 4),
                "increaseCount": increase_count,
                "decreaseCount": decrease_count,
                "newSchemeCount": new_scheme_count,
                "exitSchemeCount": exit_scheme_count,
            }
        )

    broad_accumulation = sorted(
        [
            x for x in signals_base
            if x["increaseCount"] >= 2 and x["currentSchemeCount"] >= 2
        ],
        key=lambda x: (x["increaseCount"], x["change"]),
        reverse=True,
    )[:15]

    new_consensus = sorted(
        [
            x for x in signals_base
            if x["newSchemeCount"] >= 2
            or (
                x["previousSchemeCount"] == 0
                and x["currentSchemeCount"] >= 2
            )
        ],
        key=lambda x: (x["newSchemeCount"], x["currentSchemeCount"], x["currentWeight"]),
        reverse=True,
    )[:15]

    broad_reduction = sorted(
        [
            x for x in signals_base
            if x["decreaseCount"] >= 2
        ],
        key=lambda x: (x["decreaseCount"], abs(x["change"])),
        reverse=True,
    )[:15]

    exits = sorted(
        [
            x for x in signals_base
            if x["previousSchemeCount"] > 0 and x["currentSchemeCount"] == 0
        ],
        key=lambda x: x["previousWeight"],
        reverse=True,
    )[:15]

    sustained = []
    if len(months) >= 4:
        window = months[-4:]
        for security_id, current_item in curr.items():
            vals = [
                history_maps[m].get(
                    security_id,
                    {},
                ).get("normalizedWeight", 0.0)
                for m in window
            ]

            diffs = [
                float(vals[i]) - float(vals[i - 1])
                for i in range(1, len(vals))
            ]

            if (
                current_item["schemeCount"] >= 2
                and all(delta > 0.01 for delta in diffs)
                and vals[-1] - vals[0] >= 0.10
            ):
                sustained.append(
                    {
                        "securityId": security_id,
                        "slug": current_item["slug"],
                        "stock": current_item["stock"],
                        "sector": current_item["sector"],
                        "currentSchemeCount": current_item["schemeCount"],
                        "currentWeight": round(current_item["normalizedWeight"], 4),
                        "change3m": round(float(vals[-1] - vals[0]), 4),
                    }
                )

        sustained.sort(
            key=lambda x: (x["change3m"], x["currentSchemeCount"]),
            reverse=True,
        )
        sustained = sustained[:15]

    def sector_map(month: str) -> tuple[dict[str, float], int]:
        g = frame[frame["month"] == month]
        live = max(g["scheme"].nunique(), 1)
        values = (
            g.groupby("sector", as_index=True)["weight"]
            .sum()
            .to_dict()
        )
        return {k: float(v) / live for k, v in values.items()}, live

    curr_sector, _ = sector_map(latest)
    prev_sector, _ = sector_map(previous)

    sectors = sorted(
        set(curr_sector) | set(prev_sector),
        key=lambda x: curr_sector.get(x, 0.0),
        reverse=True,
    )

    sector_rotation = [
        {
            "sector": sector,
            "current": round(curr_sector.get(sector, 0.0), 4),
            "previous": round(prev_sector.get(sector, 0.0), 4),
            "change": round(
                curr_sector.get(sector, 0.0)
                - prev_sector.get(sector, 0.0),
                4,
            ),
        }
        for sector in sectors
    ]

    matrix = [
        {
            "securityId": x["securityId"],
            "slug": x["slug"],
            "stock": x["stock"],
            "sector": x["sector"],
            "score": x["score"],
            "weights": x["weights"],
        }
        for x in current_scores[:35]
    ]

    return {
        "latestMonth": latest,
        "previousMonth": previous,
        "summary": {
            "securities": len(curr),
            "schemes": int(frame[frame["month"] == latest]["scheme"].nunique()),
            "heldBy3PlusSchemes": sum(1 for x in curr.values() if x["schemeCount"] >= 3),
            "broadAccumulation": len(broad_accumulation),
            "newConsensus": len(new_consensus),
            "broadReduction": len(broad_reduction),
            "exits": len(exits),
        },
        "scoreMethod": {
            "breadth": 50,
            "normalizedWeight": 25,
            "positive3mTrend": 15,
            "sixMonthPersistence": 10,
        },
        "topConsensus": current_scores[:25],
        "signals": {
            "broadAccumulation": broad_accumulation,
            "newConsensus": new_consensus,
            "sustained3m": sustained,
            "broadReduction": broad_reduction,
            "exits": exits,
        },
        "sectorRotation": sector_rotation[:20],
        "ownershipMatrix": matrix,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    source = Path(args.source)
    output = Path(args.output)

    if not source.exists():
        raise FileNotFoundError(source)

    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True, exist_ok=True)

    by_month_dir = output / "by-month"
    by_scheme_dir = output / "by-scheme"
    securities_dir = output / "securities"
    by_month_dir.mkdir(parents=True, exist_ok=True)
    by_scheme_dir.mkdir(parents=True, exist_ok=True)
    securities_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_excel(source, sheet_name="Holdings")
    source_rows = len(df)

    required = {
        "AMC",
        "Report_Date",
        "PDF_File",
        "Company",
        "Portfolio_Weight_Percent",
    }
    missing = sorted(required - set(df.columns))
    if missing:
        raise RuntimeError(f"Missing Holdings columns: {missing}")

    df["Report_Date"] = pd.to_datetime(df["Report_Date"], errors="coerce")
    df = df[df["Report_Date"].notna()].copy()
    df = df[df["Report_Date"].dt.year.isin([2025, 2026])].copy()

    df = df[
        ~clean_series(df["PDF_File"]).str.contains(
            EXCLUDE_SOURCE_RE,
            na=False,
        )
    ].copy()

    df["_scheme"] = df.apply(scheme_from_row, axis=1)
    df["_scheme_method"] = [
        "direct_metadata" if text(x) else "unresolved"
        for x in df["_scheme"]
    ]
    df["_scheme_confidence"] = [
        100 if text(x) else 0
        for x in df["_scheme"]
    ]

    print(
        "[RESOLVER V2.5] Direct metadata: "
        f"{int(df['_scheme'].astype(str).ne('').sum()):,} rows"
    )

    df = resolve_with_workbook_sequence(df)

    tracking_root = source.parent.parent
    df = resolve_with_source_pdf_headings(df, tracking_root)

    df = propagate_scheme_within_portfolios(df)
    df = resolve_with_workbook_sequence(df)

    resolver_summary = (
        df[df["_scheme"].astype(str).ne("")]
        .groupby(["_scheme", "_scheme_method"], dropna=False)
        .size()
        .reset_index(name="rows")
        .sort_values(["_scheme", "rows"], ascending=[True, False])
    )

    resolver_summary.to_csv(
        output / "resolver_method_summary.csv",
        index=False,
        encoding="utf-8-sig",
    )

    print("[RESOLVER V2.5] Final selected-scheme row counts:")

    final_counts = (
        df[df["_scheme"].astype(str).ne("")]
        .groupby("_scheme")
        .size()
        .sort_values(ascending=False)
    )

    for scheme_name, count in final_counts.items():
        print(f"  {scheme_name}: {int(count):,}")

    unresolved = df[df["_scheme"].astype(str).eq("")].copy()

    if not unresolved.empty:
        diag_cols = [
            c for c in (
                "AMC",
                "Report_Date",
                "PDF_File",
                "Page",
                "Block",
                "Scheme",
                "Portfolio_Display_Name",
                "Clean_Section",
                "Clean_Variant",
                "Section_Label",
                "Variant_Label",
                "Company",
                "Portfolio_Weight_Percent",
            )
            if c in unresolved.columns
        ]

        unresolved[diag_cols].head(2500).to_csv(
            output / "unresolved_scheme_rows.csv",
            index=False,
            encoding="utf-8-sig",
        )

    df = df[df["_scheme"].astype(str).ne("")].copy()

    df["_raw_company"] = clean_series(df["Company"])

    if "Industry" in df.columns:
        df["_sector"] = clean_series(df["Industry"]).replace("", "Unclassified")
    else:
        df["_sector"] = "Unclassified"

    if "ISIN" in df.columns:
        df["_isin"] = df["ISIN"].map(valid_equity_isin)
    else:
        df["_isin"] = ""

    df["_weight"] = pd.to_numeric(
        df["Portfolio_Weight_Percent"],
        errors="coerce",
    )

    df = df[
        df["_weight"].notna()
        & df["_weight"].gt(0)
        & df["_weight"].le(100)
    ].copy()

    name_map = canonical_names_by_isin(df)
    sector_map = canonical_sector_by_isin(df)

    website_eligible = (
        bool_series(df["Website_Eligible"])
        if "Website_Eligible" in df.columns
        else pd.Series(False, index=df.index)
    )

    def row_clean_name(row: pd.Series) -> str:
        isin = row["_isin"]
        if isin and isin in name_map:
            return name_map[isin]

        candidates = candidate_company_names(
            row["_raw_company"],
            row["_sector"],
        )
        candidates = [
            c for c in candidates
            if not suspicious_company(c)
        ]
        return max(candidates, key=name_score) if candidates else ""

    df["_stock"] = df.apply(row_clean_name, axis=1)
    df["_repaired"] = (
        df["_stock"].ne(df["_raw_company"])
        & df["_stock"].ne("")
    )

    df["_sector_final"] = df.apply(
        lambda r: sector_map.get(
            r["_isin"],
            r["_sector"],
        ) if r["_isin"] else r["_sector"],
        axis=1,
    )

    df["_direct_scheme_evidence"] = df.apply(
        direct_scheme_evidence,
        axis=1,
    )

    # V2.3 core rule:
    # Once a row has been resolved to one of our six selected schemes, keep it
    # if the security name and weight are clean. Website_Eligible remains an
    # audit signal, not a hard gate. The old hard gate was discarding entire
    # Flexi / Mid / Small portfolios because many historical rows were assigned
    # through Section_Label / Variant_Label rather than direct identity fields.
    selected_core_row = (
        df["_scheme"].ne("")
        & df["_stock"].ne("")
        & (~df["_stock"].map(suspicious_company))
    )

    df["_explicit_recovery"] = (
        selected_core_row
        & (~website_eligible)
    )

    df = df[selected_core_row].copy()

    suspicious_before = len(df)
    df = df[~df["_stock"].map(suspicious_company)].copy()
    dropped_suspicious = suspicious_before - len(df)

    df["amc"] = clean_series(df["AMC"])
    df["scheme"] = df["_scheme"]
    df["category"] = df["scheme"].map(CATEGORY_MAP)
    df["month"] = df["Report_Date"].dt.strftime("%Y-%m")
    df["isin"] = df["_isin"]
    df["stock"] = df["_stock"]
    df["sector"] = df["_sector_final"].replace("", "Unclassified")
    df["weight"] = df["_weight"]
    df["sourcePdf"] = clean_series(df["PDF_File"])

    df["securityId"] = df.apply(
        lambda r: r["isin"]
        if r["isin"]
        else "NAME:" + re.sub(
            r"[^a-z0-9]+",
            "-",
            normalized_name_key(r["stock"]),
        ).strip("-"),
        axis=1,
    )

    df["slug"] = df.apply(
        lambda r: security_slug(
            r["securityId"],
            r["stock"],
        ),
        axis=1,
    )

    # Collapse duplicate source PDFs / plan copies.
    dedup = (
        df.groupby(
            [
                "amc",
                "scheme",
                "category",
                "month",
                "securityId",
                "slug",
                "isin",
                "stock",
                "sector",
            ],
            as_index=False,
            dropna=False,
        )
        .agg(
            weight=("weight", "max"),
            sourcePdf=("sourcePdf", "first"),
            repaired=("_repaired", "max"),
            explicitRecovery=("_explicit_recovery", "max"),
            resolverMethod=("_scheme_method", "first"),
            resolverConfidence=("_scheme_confidence", "max"),
        )
    )

    # Snapshot-level quality gate.
    audits = []

    for (scheme, month), group in dedup.groupby(["scheme", "month"]):
        total_weight = float(group["weight"].sum())
        securities = int(group["securityId"].nunique())
        isin_pct = float(group["isin"].astype(str).str.len().gt(0).mean() * 100.0)
        grade = snapshot_quality(total_weight, securities, isin_pct)

        audits.append(
            {
                "scheme": scheme,
                "month": month,
                "totalWeight": round(total_weight, 4),
                "securities": securities,
                "isinCoveragePct": round(isin_pct, 1),
                "quality": grade,
            }
        )

    audit_df = pd.DataFrame(audits)

    if audit_df.empty:
        raise RuntimeError("No selected core-scheme snapshots were found.")

    audit_df["fallbackAccepted"] = (
        audit_df["fallbackAccepted"]
        if "fallbackAccepted" in audit_df.columns
        else False
    )

    fallback = audit_df[
        (audit_df["quality"] == "Review")
        & (audit_df["securities"] >= 5)
        & (audit_df["totalWeight"] >= 4)
        & (audit_df["totalWeight"] <= 120)
    ].copy()

    if not fallback.empty:
        fallback_keys = set(zip(fallback["scheme"], fallback["month"]))

        fallback_mask = [
            (scheme, month) in fallback_keys
            for scheme, month in zip(audit_df["scheme"], audit_df["month"])
        ]

        audit_df.loc[fallback_mask, "quality"] = "Medium"
        audit_df.loc[fallback_mask, "fallbackAccepted"] = True

    accepted_audit = audit_df[
        audit_df["quality"].isin(["High", "Medium"])
    ].copy()

    accepted_scheme_names = set(accepted_audit["scheme"].astype(str))

    for scheme_name in sorted(set(audit_df["scheme"].astype(str))):
        if scheme_name in accepted_scheme_names:
            continue

        candidates = audit_df[
            (audit_df["scheme"] == scheme_name)
            & (audit_df["securities"] >= 4)
            & (audit_df["totalWeight"] >= 3)
            & (audit_df["totalWeight"] <= 120)
        ].copy()

        if candidates.empty:
            continue

        rescue_keys = set(zip(candidates["scheme"], candidates["month"]))

        rescue_mask = [
            (scheme, month) in rescue_keys
            for scheme, month in zip(audit_df["scheme"], audit_df["month"])
        ]

        audit_df.loc[rescue_mask, "quality"] = "Medium"
        audit_df.loc[rescue_mask, "fallbackAccepted"] = True

    accepted_audit = audit_df[
        audit_df["quality"].isin(["High", "Medium"])
    ].copy()

    if accepted_audit.empty:
        raise RuntimeError(
            "No usable core-scheme snapshots remain after V2.5 quality gating."
        )

    accepted_keys = set(
        zip(
            accepted_audit["scheme"],
            accepted_audit["month"],
        )
    )

    dedup["snapshotAccepted"] = [
        (scheme, month) in accepted_keys
        for scheme, month in zip(dedup["scheme"], dedup["month"])
    ]

    published = dedup[dedup["snapshotAccepted"]].copy()

    # Direct crash fix: check empty BEFORE assigning derived quality.
    if published.empty:
        raise RuntimeError(
            "No snapshots passed the V2.1 public quality gate. "
            "Review quality_audit.csv."
        )

    quality_lookup = {
        (r.scheme, r.month): r.quality
        for r in audit_df.itertuples(index=False)
    }

    # Avoid DataFrame.apply() here: on an empty frame some pandas versions
    # can return a DataFrame and trigger the single-column assignment error.
    published["quality"] = [
        quality_lookup.get((scheme, month), "Medium")
        for scheme, month in zip(published["scheme"], published["month"])
    ]

    published = published.sort_values(
        ["month", "scheme", "weight", "stock"],
        ascending=[True, True, False, True],
    ).reset_index(drop=True)

    months = sorted(published["month"].unique().tolist())
    present_schemes = [
        s for s in CORE_ORDER
        if s in set(published["scheme"].unique())
    ]
    missing_schemes = [
        s for s in CORE_ORDER
        if s not in set(published["scheme"].unique())
    ]

    # -------------------------
    # Monthly shards
    # -------------------------
    generated_files = []

    for month in months:
        payload = month_payload(published, month)
        target = by_month_dir / f"{month}.json"
        target.write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        generated_files.append(str(target.relative_to(output)).replace("\\", "/"))

    # -------------------------
    # Scheme shards
    # -------------------------
    scheme_slugs = {}

    for scheme in present_schemes:
        slug = safe_slug(scheme)
        scheme_slugs[scheme] = slug
        g = published[published["scheme"] == scheme].copy()

        payload = {
            "scheme": scheme,
            "category": CATEGORY_MAP[scheme],
            "months": sorted(g["month"].unique().tolist()),
            "holdings": [
                {
                    "month": r.month,
                    "securityId": r.securityId,
                    "slug": r.slug,
                    "isin": r.isin,
                    "stock": r.stock,
                    "sector": r.sector,
                    "weight": round(float(r.weight), 4),
                    "quality": r.quality,
                }
                for r in g.itertuples(index=False)
            ],
        }

        target = by_scheme_dir / f"{slug}.json"
        target.write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        generated_files.append(str(target.relative_to(output)).replace("\\", "/"))

    # -------------------------
    # Security detail shards
    # -------------------------
    security_index = []

    for security_id, g in published.groupby("securityId"):
        g = g.sort_values(["month", "scheme"]).copy()
        first = g.iloc[-1]

        slug = first["slug"]
        month_groups = []

        for month, mg in g.groupby("month"):
            live_schemes = max(
                published[published["month"] == month]["scheme"].nunique(),
                1,
            )
            total_weight = float(mg["weight"].sum())
            scheme_count = int(mg["scheme"].nunique())

            month_groups.append(
                {
                    "month": month,
                    "schemeCount": scheme_count,
                    "totalWeight": round(total_weight, 4),
                    "normalizedWeight": round(total_weight / live_schemes, 4),
                    "avgHeldWeight": round(total_weight / max(scheme_count, 1), 4),
                }
            )

        scheme_history = []
        for scheme, sg in g.groupby("scheme"):
            scheme_history.append(
                {
                    "scheme": scheme,
                    "history": [
                        {
                            "month": r.month,
                            "weight": round(float(r.weight), 4),
                            "quality": r.quality,
                        }
                        for r in sg.itertuples(index=False)
                    ],
                }
            )

        latest_month = g["month"].max()
        latest_rows = g[g["month"] == latest_month]

        sources = []
        for month, mg in g.groupby("month"):
            sources.append(
                {
                    "month": month,
                    "pdfs": sorted(
                        set(
                            x for x in mg["sourcePdf"].astype(str).tolist()
                            if x
                        )
                    ),
                }
            )

        detail = {
            "securityId": security_id,
            "slug": slug,
            "isin": first["isin"],
            "stock": first["stock"],
            "sector": first["sector"],
            "firstTracked": g["month"].min(),
            "latestTracked": latest_month,
            "monthsTracked": int(g["month"].nunique()),
            "maxSchemeCount": max(x["schemeCount"] for x in month_groups),
            "peakNormalizedWeight": round(
                max(x["normalizedWeight"] for x in month_groups),
                4,
            ),
            "latestSchemeWeights": [
                {
                    "scheme": r.scheme,
                    "weight": round(float(r.weight), 4),
                    "quality": r.quality,
                }
                for r in latest_rows.itertuples(index=False)
            ],
            "monthlyHistory": month_groups,
            "schemeHistory": scheme_history,
            "sources": sources,
        }

        target = securities_dir / f"{slug}.json"
        target.write_text(
            json.dumps(detail, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        generated_files.append(str(target.relative_to(output)).replace("\\", "/"))

        security_index.append(
            {
                "securityId": security_id,
                "slug": slug,
                "isin": first["isin"],
                "stock": first["stock"],
                "sector": first["sector"],
                "latestTracked": latest_month,
            }
        )

    security_index.sort(key=lambda x: x["stock"].lower())
    security_index_path = securities_dir / "index.json"
    security_index_path.write_text(
        json.dumps(
            {"securities": security_index},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    generated_files.append(
        str(security_index_path.relative_to(output)).replace("\\", "/")
    )

    # -------------------------
    # Latest intelligence
    # -------------------------
    latest = build_latest_intelligence(published, months)

    latest_path = output / "latest.json"
    latest_path.write_text(
        json.dumps(latest, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    generated_files.append("latest.json")

    # -------------------------
    # Index / audit
    # -------------------------
    published_isin_pct = round(
        float(published["isin"].astype(str).str.len().gt(0).mean() * 100.0),
        1,
    )

    quality_audit = {
        "sourceWorkbookRows": int(source_rows),
        "selectedCandidateRows": int(len(df)),
        "publishedHoldings": int(len(published)),
        "publishedSecurities": int(published["securityId"].nunique()),
        "canonicalIsinNames": int(len(name_map)),
        "repairedCompanyRows": int(published["repaired"].sum()),
        "droppedSuspiciousFragments": int(dropped_suspicious),
        "explicitCoreEquityRecoveries": int(published["explicitRecovery"].sum()),
        "isinCoveragePct": published_isin_pct,
        "highSnapshots": int((audit_df["quality"] == "High").sum()),
        "mediumSnapshots": int((audit_df["quality"] == "Medium").sum()),
        "reviewSnapshotsExcluded": int((audit_df["quality"] == "Review").sum()),
        "fallbackSnapshotsAccepted": int(
            audit_df["fallbackAccepted"].sum()
            if "fallbackAccepted" in audit_df.columns
            else 0
        ),
    }

    index_payload = {
        "version": 5,
        "dataset": "CredoNomics Core Mutual Fund Intelligence",
        "metadata": {
            "source": "HDFC Mutual Fund portfolio disclosures",
            "asOf": f"{months[-1]}-{calendar.monthrange(int(months[-1][:4]), int(months[-1][5:]))[1]:02d}T23:59:59.000Z",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "quality": "high" if published_isin_pct >= 95 else "medium" if published_isin_pct >= 80 else "low",
            "availability": "stale",
        },
        "years": [2025, 2026],
        "months": months,
        "firstMonth": months[0],
        "latestMonth": months[-1],
        "schemes": [
            {
                "scheme": scheme,
                "category": CATEGORY_MAP[scheme],
                "slug": scheme_slugs.get(scheme, safe_slug(scheme)),
            }
            for scheme in present_schemes
        ],
        "presentCoreSchemes": present_schemes,
        "missingCoreSchemes": missing_schemes,
        "counts": {
            "holdings": int(len(published)),
            "stocks": int(published["securityId"].nunique()),
            "schemes": int(published["scheme"].nunique()),
            "amcs": int(published["amc"].nunique()),
        },
        "qualityAudit": quality_audit,
        "methodology": {
            "scope": "Six selected HDFC active-equity schemes",
            "securityIdentity": "ISIN where available; clean-name fallback",
            "companyRepair": "Canonical company name chosen across matching ISIN observations",
            "snapshotGate": "High and Medium snapshot grades only",
            "duplicateHandling": "Maximum weight retained across duplicate PDF/plan copies",
            "dedicatedIndexFactsheets": "Excluded",
            "consensusScore": {
                "schemeBreadth": 50,
                "normalizedPortfolioWeight": 25,
                "positiveThreeMonthTrend": 15,
                "sixMonthPersistence": 10,
            },
        },
    }

    index_path = output / "index.json"
    index_path.write_text(
        json.dumps(index_payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    generated_files.append("index.json")

    audit_path = output / "quality_audit.csv"
    audit_df.sort_values(["month", "scheme"]).to_csv(
        audit_path,
        index=False,
        encoding="utf-8-sig",
    )
    generated_files.append("quality_audit.csv")

    for diagnostic_name in (
        "resolver_method_summary.csv",
        "unresolved_scheme_rows.csv",
    ):
        diagnostic_path = output / diagnostic_name
        if diagnostic_path.exists():
            generated_files.append(diagnostic_name)

    # Compact latest holdings CSV for manual inspection.
    latest_month = months[-1]
    latest_csv = output / "latest_holdings.csv"
    published[published["month"] == latest_month][
        [
            "scheme",
            "category",
            "securityId",
            "isin",
            "stock",
            "sector",
            "weight",
            "quality",
            "sourcePdf",
        ]
    ].to_csv(
        latest_csv,
        index=False,
        encoding="utf-8-sig",
    )
    generated_files.append("latest_holdings.csv")

    manifest = {
        "version": 2,
        "root": "public/data/mf-intelligence/v2",
        "files": sorted(generated_files),
    }

    manifest_path = output / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("=" * 80)
    print("CREDONOMICS MF INTELLIGENCE V2 READY")
    print("=" * 80)
    print(f"Published holdings       : {len(published):,}")
    print(f"Unique securities        : {published['securityId'].nunique():,}")
    print(f"Core schemes             : {published['scheme'].nunique():,}")
    print(f"History                  : {months[0]} -> {months[-1]}")
    print(f"ISIN coverage            : {published_isin_pct:.1f}%")
    print(f"Company rows repaired    : {quality_audit['repairedCompanyRows']:,}")
    print(f"Bad fragments removed    : {dropped_suspicious:,}")
    print(f"Explicit equity recoveries: {quality_audit['explicitCoreEquityRecoveries']:,}")
    print(f"High snapshots           : {quality_audit['highSnapshots']:,}")
    print(f"Medium snapshots         : {quality_audit['mediumSnapshots']:,}")
    print(f"Review snapshots excluded: {quality_audit['reviewSnapshotsExcluded']:,}")
    print()
    print("CORE SCHEMES LIVE")
    for scheme in present_schemes:
        print("  [OK]", scheme)
    for scheme in missing_schemes:
        print("  [NOT CLEAN ENOUGH YET]", scheme)
    print()
    print("Generated:", output)
    print("=" * 80)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

