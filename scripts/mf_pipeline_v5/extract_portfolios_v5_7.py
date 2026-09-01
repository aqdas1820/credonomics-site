from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from pathlib import Path
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import pdfplumber


NOISE_TERMS = [
    "benchmark", "riskometer", "performance", "returns", "expense ratio",
    "exit load", "entry load", "fund manager", "nav as on", "sip", "stp",
    "investment objective", "past performance", "face value", "allotment",
    "annualised", "average for month", "direct plan", "regular plan",
    "growth option", "idcw", "calculated on", "redeemed", "switched",
    "switch-in", "switch-out", "units allotted", "total amount invested",
    "additional benchmark", "load structure", "assets under management",
    "portfolio turnover", "yield to maturity", "weighted average",
    "monthly dividend", "quarterly dividend", "dividend option",
    "for tax benefits", "since inception", "last 1 year", "last 2 years",
    "last 3 years", "last 5 years", "standard deviation", "sharpe ratio",
    "beta", "tracking error", "scheme returns", "returns (%)", "date period",
    "quantitative data", "credit exposure", "cash equivalents",
    "net current assets", "government securities", "g-sec",
    "total equity", "equity related", "related holdings",
]

BAD_ROW_STARTS = (
    "total", "subtotal", "grand total", "benchmark", "exit load", "entry load",
    "note", "nav", "direct plan", "regular plan", "portfolio - top",
    "portfolio top", "outstanding exposure", "weighted average",
    "yield to maturity", "monthly dividend", "quarterly dividend",
    "for tax benefits", "date period", "average for month",
    "assets under management", "as on", "equity & equity related",
)

INDUSTRY_HINTS = {
    "finance", "banks", "bank", "consumer durables", "construction",
    "construction project", "realty", "industrial products", "gas",
    "non - ferrous metals", "non-ferrous metals", "pharmaceuticals",
    "healthcare", "automobiles", "auto components", "telecom services",
    "it services", "software", "cement", "chemicals", "petroleum products",
    "insurance", "retailing", "leisure services", "food products", "power",
    "capital markets", "aerospace", "textiles", "electrical equipment",
    "media", "transport services", "industrial manufacturing",
    "household products", "financial technology", "personal products",
    "consumer non durables", "industrial capital goods", "pesticides",
    "fertilizers", "metals & minerals trading", "ferrous metals",
    "diversified", "agricultural food & other products",
    "commercial services & supplies", "health care", "consumer services",
    "telecom - services", "oil exploration & production", "auto",
    "cement & cement products", "industrial products", "consumer non-durables"
}

COMPANY_SUFFIX_RE = re.compile(
    r"\b(ltd\.?|limited|bank|corp\.?|corporation|industries|industry|pharma|"
    r"pharmaceuticals|finance|motors|technologies|technology|systems|services|"
    r"gas|cables|properties|infratech|electric|electricals|enterprises|power|"
    r"steel|cement|chemicals|consumer|homes|developers|laboratories|labs|"
    r"holdings|infrastructure|engineering|energy|communications|telecom)\b",
    re.I,
)

SCHEME_REJECT = [
    "benchmark", "performance", "portfolio", "nav", "direct plan",
    "regular plan", "riskometer", "expense ratio", "fund manager", "returns",
]


def clean_text(v: Any) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return ""
    return re.sub(r"\s+", " ", str(v).replace("\n", " ").replace("\r", " ")).strip()


def parse_number(token: str) -> float | None:
    raw = clean_text(token)
    if not raw:
        return None
    raw = raw.replace(",", "").replace("%", "").replace("₹", "").strip("() ")
    if not re.fullmatch(r"-?\d+(?:\.\d+)?", raw):
        return None
    try:
        return float(raw)
    except Exception:
        return None


def looks_like_noise(text: str) -> bool:
    low = clean_text(text).lower()
    if not low:
        return True
    if len(low) > 190 or len(low.split()) > 22:
        return True
    if any(term in low for term in NOISE_TERMS):
        return True
    if any(low.startswith(prefix) for prefix in BAD_ROW_STARTS):
        return True
    if "www." in low or ".com" in low:
        return True
    return False


def canonical_scheme(text: str) -> str:
    s = clean_text(text)
    s = re.sub(r"\s*\(.*?open[- ]ended.*?\)\s*$", "", s, flags=re.I)
    s = re.sub(r"\bnav as on\b.*$", "", s, flags=re.I)
    s = re.sub(r"\b(direct|regular)\s+plan\b.*$", "", s, flags=re.I)
    s = re.sub(r"[\s,;:|•·†‡*#~^]+$", "", s)
    return clean_text(s).strip(" ,;:-")


def cluster_words_into_lines(words: list[dict], tolerance: float = 1.5) -> list[list[dict]]:
    lines: list[list[dict]] = []
    for word in sorted(words, key=lambda w: (float(w["top"]), float(w["x0"]))):
        top = float(word["top"])
        placed = False
        for line in reversed(lines[-16:]):
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


def _split_company_industry(text: str) -> tuple[str, str]:
    text = clean_text(text)
    low = text.lower()
    best = ""
    for hint in INDUSTRY_HINTS:
        if low.endswith(hint.lower()) and len(hint) > len(best):
            best = hint

    if not best:
        return text, ""

    n = len(best.split())
    toks = text.split()
    if len(toks) <= n:
        return text, ""

    return clean_text(" ".join(toks[:-n])), clean_text(" ".join(toks[-n:]))


def _company_shape_ok(company: str) -> bool:
    c = clean_text(company)
    low = c.lower()

    if len(c) < 3 or len(c) > 105 or len(c.split()) > 12:
        return False
    if looks_like_noise(c):
        return False
    if any(low.startswith(x) for x in BAD_ROW_STARTS):
        return False
    if not re.search(r"[A-Za-z]{2}", c):
        return False

    if re.search(
        r"\b(as on|total equity|equity related|quantitative data|related holdings|"
        r"credit exposure|cash equivalents|net current assets|primarily drawn|"
        r"crisil|benchmark index|g-sec|government securities|portfolio turnover|"
        r"weighted average|maturity|duration|last|year|month|inception|average|"
        r"yield|ratio|option|units?|exposure|assets under management)\b",
        low,
    ):
        return False

    if re.search(
        r"\b(january|february|march|april|may|june|july|august|september|"
        r"october|november|december)\b",
        low,
    ):
        return False

    if any(
        x in low
        for x in [
            " please ", " from the ", " calculated ", " companies in ",
            " refer ", " including ", " applicable ", " respect of ",
            "prevent capital erosion",
        ]
    ):
        return False

    # Strong company evidence.
    titleish = sum(
        1 for t in c.split()
        if t[:1].isupper() and re.search(r"[A-Za-z]", t)
    )
    return bool(COMPANY_SUFFIX_RE.search(c)) or titleish >= 2


def detect_weight_clusters(words: list[dict], page_width: float) -> list[float]:
    """
    Find recurring right-side percentage/weight x-positions.

    Multiple HDFC portfolio tables can exist side-by-side on one PDF page.
    Each table tends to have its own repeated weight x-coordinate.
    """
    xs = []

    for w in words:
        val = parse_number(str(w.get("text", "")))
        if val is None or not (0 < val <= 25):
            continue

        x0 = float(w["x0"])

        # Ignore numbers too close to page edges.
        if x0 < page_width * 0.18 or x0 > page_width * 0.98:
            continue

        xs.append(x0)

    if len(xs) < 8:
        return []

    xs.sort()

    # Simple 1-D clustering by x-gap.
    clusters: list[list[float]] = []
    for x in xs:
        if not clusters or abs(x - sum(clusters[-1]) / len(clusters[-1])) > 24:
            clusters.append([x])
        else:
            clusters[-1].append(x)

    # Keep only repeated columns.
    strong = [c for c in clusters if len(c) >= 6]

    # If many tiny clusters survive, prioritize the densest recurring columns.
    strong.sort(key=len, reverse=True)
    strong = strong[:4]

    centers = sorted(sum(c) / len(c) for c in strong)
    return centers


def build_blocks(weight_centers: list[float], page_width: float) -> list[dict]:
    """
    Build non-overlapping horizontal blocks around each weight column.
    Boundaries are midpoints between neighboring weight columns.
    """
    if not weight_centers:
        return []

    blocks = []

    for i, wx in enumerate(weight_centers):
        if i == 0:
            left = 0.0
        else:
            left = (weight_centers[i - 1] + wx) / 2.0

        if i == len(weight_centers) - 1:
            right = page_width
        else:
            right = (wx + weight_centers[i + 1]) / 2.0

        # A table's company/industry columns should sit to the left of its weight.
        if wx - left < 80:
            left = max(0.0, wx - 220)

        blocks.append({
            "block_id": i + 1,
            "left": left,
            "right": right,
            "weight_x": wx,
        })

    return blocks


def words_in_block(line: list[dict], block: dict) -> list[dict]:
    return [
        w for w in line
        if block["left"] <= float(w["x0"]) < block["right"]
    ]


def detect_page_scheme_candidates(lines: list[list[dict]]) -> list[dict]:
    """
    Detect scheme headings anywhere on the page and keep their geometry.

    V5.0 allowed a previously seen scheme to flow into later blocks/pages.
    V5.1 does NOT do that. A block gets a scheme only from a heading that is
    geometrically associated with that same page/block.
    """
    candidates = []

    for idx, line in enumerate(lines):
        text = line_text(line)
        low = text.lower()

        if "hdfc" not in low:
            continue
        if not re.search(r"\b(fund|etf|fof)\b", low):
            continue
        if len(text) > 110:
            continue
        if any(t in low for t in SCHEME_REJECT):
            continue

        s = canonical_scheme(text)
        if not re.search(r"\b(fund|etf|fof)\b", s, re.I):
            continue

        x0 = min(float(w["x0"]) for w in line)
        x1 = max(float(w["x1"]) for w in line)
        top = sum(float(w["top"]) for w in line) / len(line)

        candidates.append({
            "line_idx": idx,
            "scheme": s,
            "x0": x0,
            "x1": x1,
            "top": top,
        })

    return candidates


def _horizontal_overlap(a0: float, a1: float, b0: float, b1: float) -> float:
    overlap = max(0.0, min(a1, b1) - max(a0, b0))
    denom = max(1.0, min(a1 - a0, b1 - b0))
    return overlap / denom


def assign_scheme_to_block(
    lines: list[list[dict]],
    block: dict,
    model: dict,
    scheme_candidates: list[dict],
) -> tuple[str, float, str]:
    """
    Assign a scheme to one physical holdings block using same-page geometry.

    Priority:
    1. Scheme heading horizontally overlapping the block.
    2. Heading above/near the portfolio region.
    3. Otherwise UNASSIGNED.

    No cross-page/global scheme inheritance.
    """
    if not scheme_candidates:
        return "UNASSIGNED", 0.0, "no-page-heading"

    start_idx = model["start"]
    start_line = lines[start_idx]
    start_top = (
        sum(float(w["top"]) for w in start_line) / len(start_line)
        if start_line else 99999.0
    )

    scored = []

    for c in scheme_candidates:
        overlap = _horizontal_overlap(
            c["x0"], c["x1"], block["left"], block["right"]
        )

        # Prefer headings at or above the holdings block, with limited lookback.
        vertical_gap = start_top - c["top"]
        if vertical_gap < -25:
            continue
        if vertical_gap > 260:
            continue

        center = (c["x0"] + c["x1"]) / 2.0
        block_center = (block["left"] + block["right"]) / 2.0
        center_distance = abs(center - block_center)

        score = 0.0
        score += overlap * 70.0
        score += max(0.0, 20.0 - center_distance / 12.0)
        score += max(0.0, 25.0 - abs(vertical_gap) / 8.0)

        # Strong bonus for a heading whose center falls inside the block.
        if block["left"] <= center < block["right"]:
            score += 25.0

        scored.append((score, c))

    if not scored:
        return "UNASSIGNED", 0.0, "no-local-heading"

    scored.sort(key=lambda x: x[0], reverse=True)
    best_score, best = scored[0]

    if best_score < 35:
        return "UNASSIGNED", best_score, "weak-local-heading"

    return best["scheme"], best_score, "local-heading"


def sanitize_scheme_name(name: str) -> str:
    s = canonical_scheme(name)

    # Split obvious concatenated duplicate scheme headings.
    matches = list(re.finditer(r"(?i)\bHDFC\s+", s))
    if len(matches) > 1:
        first = s[:matches[1].start()].strip(" -|,;:")
        if re.search(r"\b(fund|etf|fof)\b", first, re.I):
            s = first

    s = re.sub(r"\s+-\s+(savings|investment)\s+plan.*$", "", s, flags=re.I)
    return clean_text(s).strip(" -|,;:")

def infer_block_model(lines: list[list[dict]], block: dict) -> dict | None:
    """
    Learn the industry's x-position for one horizontal table block.
    """
    candidates = []

    for idx, line in enumerate(lines):
        bw = words_in_block(line, block)
        if not bw:
            continue

        text = line_text(bw)
        if looks_like_noise(text):
            continue

        # Pick a weight aligned to this block's expected weight x.
        chosen = None
        for i, w in enumerate(bw):
            val = parse_number(str(w.get("text", "")))
            if val is None or not (0 < val <= 25):
                continue
            x0 = float(w["x0"])
            if abs(x0 - block["weight_x"]) <= 26:
                chosen = (i, val, x0)

        if not chosen:
            continue

        wi, _, wx = chosen
        before = bw[:wi]

        if len(before) < 2:
            continue

        left = clean_text(" ".join(str(w.get("text", "")) for w in before))
        company, industry = _split_company_industry(left)

        if not industry:
            continue
        if industry.lower() not in {x.lower() for x in INDUSTRY_HINTS}:
            continue
        if not _company_shape_ok(company):
            continue

        n = len(industry.split())
        if len(before) <= n:
            continue

        industry_start = float(before[-n]["x0"])

        candidates.append({
            "idx": idx,
            "industry_x": industry_start,
            "weight_x": wx,
        })

    if len(candidates) < 4:
        return None

    # Dense local portfolio run.
    best = []
    for c in candidates:
        block_rows = [
            z for z in candidates
            if c["idx"] - 2 <= z["idx"] <= c["idx"] + 45
        ]
        if len(block_rows) > len(best):
            best = block_rows

    if len(best) < 4:
        return None

    ixs = sorted(x["industry_x"] for x in best)
    wxs = sorted(x["weight_x"] for x in best)

    median_ix = ixs[len(ixs) // 2]
    median_wx = wxs[len(wxs) // 2]

    aligned_i = sum(1 for x in ixs if abs(x - median_ix) <= 40)
    aligned_w = sum(1 for x in wxs if abs(x - median_wx) <= 22)

    if aligned_i < max(4, int(len(best) * 0.55)):
        return None
    if aligned_w < max(4, int(len(best) * 0.70)):
        return None

    return {
        "start": max(0, min(x["idx"] for x in best) - 2),
        "end": min(len(lines) - 1, max(x["idx"] for x in best) + 3),
        "industry_x": median_ix,
        "weight_x": median_wx,
    }


def parse_block_row(
    line: list[dict],
    block: dict,
    model: dict,
) -> dict | None:
    bw = words_in_block(line, block)

    if not bw:
        return None

    text = line_text(bw)
    if looks_like_noise(text):
        return None

    # Exact weight for this physical table.
    chosen = None
    for i, w in enumerate(bw):
        val = parse_number(str(w.get("text", "")))
        if val is None or not (0 < val <= 25):
            continue

        x0 = float(w["x0"])
        if abs(x0 - model["weight_x"]) <= 22:
            chosen = (i, val, x0)

    if not chosen:
        return None

    wi, weight, wx = chosen
    before = bw[:wi]

    if not before:
        return None

    ix = model["industry_x"]

    company_words = [
        w for w in before
        if float(w["x0"]) < ix - 3
    ]
    industry_words = [
        w for w in before
        if ix - 10 <= float(w["x0"]) < wx - 4
    ]

    company = clean_text(" ".join(str(w.get("text", "")) for w in company_words))
    industry = clean_text(" ".join(str(w.get("text", "")) for w in industry_words))

    # Conservative fallback inside this block only.
    if industry.lower() not in {x.lower() for x in INDUSTRY_HINTS}:
        left = clean_text(" ".join(str(w.get("text", "")) for w in before))
        f_company, f_industry = _split_company_industry(left)

        if f_industry.lower() not in {x.lower() for x in INDUSTRY_HINTS}:
            return None

        company = f_company
        industry = f_industry

    if not _company_shape_ok(company):
        return None

    low = text.lower()
    if re.search(
        r"\b(as on|total equity|equity related|quantitative data|related holdings|"
        r"credit exposure|cash equivalents|net current assets|benchmark|crisil|"
        r"g-sec|government securities|portfolio turnover|weighted average|"
        r"primarily drawn|total g-sec|total debt|total portfolio)\b",
        low,
    ):
        return None

    # Prevent cells from another block leaking into this row.
    if company_words:
        company_right = max(float(w["x1"]) for w in company_words)
        if company_right > ix + 15:
            return None

    return {
        "Company": company,
        "Industry": industry,
        "Portfolio_Weight_Percent": weight,
        "Extraction_Method": "Production-Date-Resolved Coordinate V5.7",
        "Block_ID": block["block_id"],
    }



def detect_section_markers(lines: list[list[dict]]) -> list[dict]:
    markers = []
    marker_terms = [
        "portfolio", "equity & equity related", "equity related",
        "top holdings", "top 10", "top ten", "index", "etf",
        "savings plan", "investment plan", "wholesale plan",
        "plan", "scheme", "fund",
    ]

    for idx, line in enumerate(lines):
        txt = line_text(line)
        low = txt.lower()

        if not txt or len(txt) > 120:
            continue

        score = 0
        if "hdfc" in low and re.search(r"\b(fund|etf|fof)\b", low):
            score += 5
        if any(term in low for term in marker_terms):
            score += 2
        if len(txt.split()) <= 12:
            score += 1
        if re.search(
            r"\b(nav|returns|benchmark|riskometer|expense ratio|exit load|"
            r"yield|maturity|average|ratio|as on|date period)\b",
            low,
        ):
            score -= 5

        if score < 3:
            continue

        markers.append({
            "line_idx": idx,
            "text": canonical_scheme(txt),
            "x0": min(float(w["x0"]) for w in line),
            "x1": max(float(w["x1"]) for w in line),
            "top": sum(float(w["top"]) for w in line) / len(line),
            "score": score,
        })

    return markers


def assign_section_to_block(lines, block, model, markers):
    if not markers:
        return "UNLABELED_SECTION", 0.0

    start_idx = model["start"]
    start_line = lines[start_idx]
    start_top = (
        sum(float(w["top"]) for w in start_line) / len(start_line)
        if start_line else 99999.0
    )

    scored = []
    for m in markers:
        overlap = _horizontal_overlap(m["x0"], m["x1"], block["left"], block["right"])
        vertical_gap = start_top - m["top"]
        if vertical_gap < -30 or vertical_gap > 320:
            continue

        center = (m["x0"] + m["x1"]) / 2.0
        block_center = (block["left"] + block["right"]) / 2.0
        center_distance = abs(center - block_center)

        score = (
            overlap * 55.0
            + max(0.0, 18.0 - center_distance / 14.0)
            + max(0.0, 22.0 - abs(vertical_gap) / 10.0)
            + m["score"] * 3.0
        )
        if block["left"] <= center < block["right"]:
            score += 15.0
        scored.append((score, m))

    if not scored:
        return "UNLABELED_SECTION", 0.0

    scored.sort(key=lambda x: x[0], reverse=True)
    best_score, best = scored[0]

    if best_score < 25:
        return "UNLABELED_SECTION", best_score

    return clean_text(best["text"]) or "UNLABELED_SECTION", best_score


def normalize_variant_from_text(text: str) -> str:
    """
    Normalize historical plan/variant wording to a compact identity.

    Priority matters: specific named historical variants are detected before
    generic '... Plan' patterns.
    """
    s = clean_text(text)
    low = s.lower()

    if not s or low in {"unlabeled_variant", "unlabeled variant"}:
        return "UNLABELED_VARIANT"

    patterns = [
        (r"\b(?:hdfc\s+)?sensex\s+plus\s+plan\b", "SENSEX Plus Plan"),
        (r"\b(?:hdfc\s+)?nifty\s+plan\b", "NIFTY Plan"),
        (r"\b(?:hdfc\s+)?sensex\s+plan\b", "SENSEX Plan"),
        (r"\bsavings\s+plan\b", "Savings Plan"),
        (r"\binvestment\s+plan\b", "Investment Plan"),
        (r"\bwholesale\s+plan\b", "Wholesale Plan"),
        (r"\bretail\s+plan\b", "Retail Plan"),
        (r"\bdirect\s+plan\b", "Direct Plan"),
        (r"\bregular\s+plan\b", "Regular Plan"),
        (r"\bgrowth\s+plan\b", "Growth Plan"),
        (r"\bdividend\s+plan\b", "Dividend Plan"),
        (r"\bplan\s*[-–—:]?\s*2005\b", "Plan 2005"),
    ]

    for pat, name in patterns:
        if re.search(pat, s, flags=re.I):
            return name

    # Explicit single-letter/number plan labels such as Plan A / Plan 1.
    m = re.search(r"\bplan\s*[-–—:]?\s*([A-Z]|\d{1,4})\b", s, flags=re.I)
    if m:
        token = m.group(1).upper()
        return f"Plan {token}"

    return "UNLABELED_VARIANT"


def detect_variant_markers(lines: list[list[dict]]) -> list[dict]:
    """
    Detect only explicit variant names. Store normalized variant identity rather
    than the entire surrounding sentence.
    """
    markers = []

    for idx, line in enumerate(lines):
        txt = line_text(line)
        low = txt.lower()

        if not txt or len(txt) > 150:
            continue

        # Avoid prose/reporting lines accidentally containing the word "plan".
        if re.search(
            r"\b(fund manager|benchmark|returns?|riskometer|expense ratio|"
            r"exit load|yield|maturity|portfolio turnover|average|crisil)\b",
            low,
        ):
            continue

        variant = normalize_variant_from_text(txt)
        if variant == "UNLABELED_VARIANT":
            continue

        markers.append({
            "line_idx": idx,
            "label": variant,
            "source_text": txt,
            "x0": min(float(w["x0"]) for w in line),
            "x1": max(float(w["x1"]) for w in line),
            "top": sum(float(w["top"]) for w in line) / len(line),
        })

    return markers


def assign_variant_to_block(lines, block, model, variant_markers):
    if not variant_markers:
        return "UNLABELED_VARIANT", 0.0, "no-variant-marker"

    start_line = lines[model["start"]]
    start_top = (
        sum(float(w["top"]) for w in start_line) / len(start_line)
        if start_line else 99999.0
    )

    scored = []
    for m in variant_markers:
        overlap = _horizontal_overlap(
            m["x0"], m["x1"], block["left"], block["right"]
        )
        vertical_gap = start_top - m["top"]
        if vertical_gap < -35 or vertical_gap > 300:
            continue

        center = (m["x0"] + m["x1"]) / 2.0
        block_center = (block["left"] + block["right"]) / 2.0
        center_distance = abs(center - block_center)

        score = (
            overlap * 60.0
            + max(0.0, 20.0 - center_distance / 12.0)
            + max(0.0, 25.0 - abs(vertical_gap) / 9.0)
        )
        if block["left"] <= center < block["right"]:
            score += 20.0

        scored.append((score, m))

    if not scored:
        return "UNLABELED_VARIANT", 0.0, "no-local-variant"

    scored.sort(key=lambda x: x[0], reverse=True)
    best_score, best = scored[0]

    if best_score < 30:
        return "UNLABELED_VARIANT", best_score, "weak-variant-match"

    return best["label"], best_score, "local-explicit-variant"

def make_physical_portfolio_id(page_number, block_id, scheme, section_label, variant_label):
    safe_scheme = re.sub(r"[^A-Za-z0-9]+", "_", scheme or "UNASSIGNED").strip("_")
    safe_section = re.sub(r"[^A-Za-z0-9]+", "_", section_label or "UNLABELED_SECTION").strip("_")
    safe_variant = re.sub(r"[^A-Za-z0-9]+", "_", variant_label or "UNLABELED_VARIANT").strip("_")
    safe_scheme = safe_scheme[:42] or "UNASSIGNED"
    safe_section = safe_section[:34] or "UNLABELED_SECTION"
    safe_variant = safe_variant[:34] or "UNLABELED_VARIANT"
    return f"P{page_number:03d}_B{block_id:02d}_{safe_scheme}_{safe_variant}_{safe_section}"


def stable_portfolio_id(amc, report_date, pdf_file, physical_id, scheme, variant_label):
    """Stable ID with month + source filename to prevent cross-month collisions."""
    if pd.isna(report_date):
        month_key = "UNKNOWN_DATE"
    else:
        month_key = pd.Timestamp(report_date).strftime("%Y-%m")

    raw = "|".join([
        clean_text(amc).lower(), month_key, clean_text(pdf_file).lower(),
        clean_text(physical_id).lower(), clean_text(scheme).lower(),
        clean_text(variant_label).lower(),
    ])
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16].upper()
    return f"MFPORT_{month_key.replace('-', '')}_{digest}"


def classify_portfolio_total(weight):
    if 90 <= weight <= 105:
        return "High Confidence"
    if 60 <= weight < 90:
        return "Partial / Continuation Candidate"
    if 105 < weight <= 115:
        return "Review High"
    if 20 <= weight < 60:
        return "Partial"
    if weight < 20:
        return "Very Partial"
    return "Suspicious High"


def portfolio_confidence_score(total_weight, scheme_score, section_score, variant_score, rows, assigned_scheme):
    score = 0
    if 90 <= total_weight <= 105:
        score += 45
    elif 80 <= total_weight <= 110:
        score += 35
    elif 60 <= total_weight <= 115:
        score += 22
    else:
        score += 8

    if scheme_score >= 70:
        score += 20
    elif scheme_score >= 45:
        score += 15
    elif scheme_score >= 30:
        score += 8

    if section_score >= 55:
        score += 12
    elif section_score >= 30:
        score += 8
    elif section_score > 0:
        score += 4

    if variant_score >= 55:
        score += 12
    elif variant_score >= 30:
        score += 7

    if rows >= 12:
        score += 6
    elif rows >= 6:
        score += 3

    if assigned_scheme:
        score += 5

    score = min(100, int(round(score)))
    label = "High" if score >= 80 else "Medium" if score >= 60 else "Review"
    return score, label



def canonical_variant_label(label: str) -> str:
    """Canonical identity used in logical portfolio keys."""
    return normalize_variant_from_text(label)


def canonical_section_label(label: str) -> str:
    """
    Clean section identity. Explicit plan names belong in Variant_Label, not in
    Section_Label. Fund-manager/statistical/industry rows are rejected.
    """
    s = clean_text(label)
    low = s.lower()

    if not s or low in {"unlabeled_section", "unlabeled section"}:
        return "UNLABELED_SECTION"

    # These were observed as false section headings in historical factsheets.
    if re.search(
        r"\b(fund manager|crisil|benchmark|returns?|riskometer|expense ratio|"
        r"exit load|yield|maturity|portfolio turnover|average|consumer non durables|"
        r"industrial capital goods|petroleum products|pharmaceuticals|banks|finance|"
        r"software|auto components|construction project)\b",
        low,
    ):
        return "UNLABELED_SECTION"

    variant = normalize_variant_from_text(s)
    if variant != "UNLABELED_VARIANT":
        return "Plan Portfolio"

    if "equity" in low and "related" in low:
        return "Equity & Equity Related"
    if "top holdings" in low or "top 10" in low or "top ten" in low:
        return "Top Holdings"
    if "portfolio" in low:
        return "Portfolio"
    if "index" in low:
        return "Index Portfolio"

    # Unknown short headings are retained only if they look heading-like.
    if len(s.split()) <= 8 and not re.search(r"\d+\.\d+", s):
        return s[:60]

    return "UNLABELED_SECTION"


def portfolio_display_name(scheme: str, variant: str, section: str) -> str:
    scheme = clean_text(scheme) or "UNASSIGNED"
    variant = canonical_variant_label(variant)
    section = canonical_section_label(section)

    if variant != "UNLABELED_VARIANT":
        return f"{scheme} — {variant}"
    if section not in {
        "UNLABELED_SECTION", "Equity & Equity Related", "Portfolio",
        "Top Holdings", "Plan Portfolio"
    }:
        return f"{scheme} — {section}"
    return scheme


def identity_status(scheme: str, variant: str, section: str) -> str:
    if scheme == "UNASSIGNED":
        return "Review — Scheme Unassigned"
    if canonical_variant_label(variant) != "UNLABELED_VARIANT":
        return "Explicit Variant"
    if canonical_section_label(section) not in {
        "UNLABELED_SECTION", "Equity & Equity Related", "Portfolio",
        "Top Holdings", "Plan Portfolio"
    }:
        return "Named Section"
    return "Scheme Only"



MONTH_NAME_TO_NUMBER = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
}
MONTH_NUMBER_TO_NAME = {v: k.title() for k, v in MONTH_NAME_TO_NUMBER.items()}


def _decode_filename_text(text: str) -> str:
    """Normalize separators/URL-encoded spaces for month-year recognition."""
    s = clean_text(text)
    s = re.sub(r"%20", " ", s, flags=re.I)
    s = s.replace("_", " ").replace("-", " ")
    return clean_text(s)


def detect_explicit_month_year(text: str) -> tuple[pd.Timestamp | None, str]:
    """
    Detect an explicit month-name + four-digit year.

    Supported: September2016, September 2016, September_2016,
    September-2016 and URL-encoded equivalents.

    Compact numeric dates such as 14102016 are deliberately ignored because
    they commonly represent publication/download dates rather than report month.
    """
    raw = _decode_filename_text(text)
    low = raw.lower()
    month_pattern = "|".join(MONTH_NAME_TO_NUMBER.keys())

    m = re.search(rf"\b({month_pattern})\s+([12]\d{{3}})\b", low, flags=re.I)
    if m:
        month = MONTH_NAME_TO_NUMBER[m.group(1).lower()]
        year = int(m.group(2))
        return pd.Timestamp(year=year, month=month, day=1), "MONTH_NAME_YEAR"

    m = re.search(rf"({month_pattern})([12]\d{{3}})", low, flags=re.I)
    if m:
        month = MONTH_NAME_TO_NUMBER[m.group(1).lower()]
        year = int(m.group(2))
        return pd.Timestamp(year=year, month=month, day=1), "MONTH_NAME_YEAR_COMPACT"

    return None, ""


def resolve_report_date(pdf_path: Path, inventory_date) -> dict:
    """
    V5.7 date priority:
      1. explicit month + year in PDF filename
      2. explicit month + year in PDF path
      3. inventory Report_Date
    """
    inv = pd.to_datetime(inventory_date, errors="coerce")
    if not pd.isna(inv):
        inv = pd.Timestamp(year=inv.year, month=inv.month, day=1)

    filename_date, filename_method = detect_explicit_month_year(pdf_path.name)
    path_date, path_method = detect_explicit_month_year(str(pdf_path))

    if filename_date is not None:
        resolved, source, method = filename_date, "PDF_FILENAME", filename_method
        evidence = pdf_path.name
    elif path_date is not None:
        resolved, source, method = path_date, "PDF_PATH", path_method
        evidence = str(pdf_path)
    elif not pd.isna(inv):
        resolved, source, method = inv, "INVENTORY_REPORT_DATE", "INVENTORY"
        evidence = str(inv.date())
    else:
        resolved, source, method = pd.NaT, "UNRESOLVED", "NONE"
        evidence = ""

    conflict = False
    if not pd.isna(inv) and not pd.isna(resolved):
        conflict = (inv.year != resolved.year) or (inv.month != resolved.month)

    if pd.isna(resolved):
        status = "UNRESOLVED"
    elif conflict:
        status = "CORRECTED"
    elif source in {"PDF_FILENAME", "PDF_PATH"}:
        status = "VERIFIED"
    else:
        status = "INVENTORY_USED"

    return {
        "Original_Inventory_Date": inv,
        "Resolved_Date": resolved,
        "Date_Status": status,
        "Date_Source": source,
        "Date_Method": method,
        "Date_Conflict": "YES" if conflict else "NO",
        "Date_Evidence": evidence,
        "PDF_File": pdf_path.name,
        "PDF_Path": str(pdf_path),
    }


def apply_resolved_date_fields(rec: dict, resolved_date) -> None:
    dt = pd.to_datetime(resolved_date, errors="coerce")
    rec["Report_Date"] = dt
    rec["Year"] = dt.year if not pd.isna(dt) else None
    rec["Month_Number"] = dt.month if not pd.isna(dt) else None
    rec["Month"] = dt.strftime("%B") if not pd.isna(dt) else ""
    rec["Month_Year"] = dt.strftime("%B-%Y") if not pd.isna(dt) else ""
def stable_source_portfolio_id(
    amc: str,
    report_date,
    pdf_file: str,
    page_number: int,
    block_id: int,
) -> str:
    """
    Production-stable physical portfolio ID.

    IMPORTANT: this ID is based only on immutable source location, not on
    extracted scheme/variant labels. If identity improves later, the website ID
    remains stable.
    """
    if pd.isna(report_date):
        month_key = "UNKNOWN_DATE"
    else:
        month_key = pd.Timestamp(report_date).strftime("%Y-%m")

    raw = "|".join([
        clean_text(amc).lower(),
        month_key,
        clean_text(pdf_file).lower(),
        str(int(page_number)),
        str(int(block_id)),
    ])
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:18].upper()
    return f"MFBLK_{month_key.replace('-', '')}_{digest}"


def recover_unassigned_schemes(holdings: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Conservative V5.6 scheme recovery.

    Recover UNASSIGNED only when:
      1. same AMC + report month + source PDF + page
      2. target has an EXPLICIT cleaned variant
      3. an assigned portfolio on that same page has the exact same variant
      4. exactly ONE distinct assigned scheme matches that variant
      5. physical portfolios remain separate; this function never merges rows

    Example supported by the HDFC diagnostics:
      UNASSIGNED + SENSEX Plus Plan on page 19
        -> HDFC Index Fund + SENSEX Plus Plan on page 19
        -> recover HDFC Index Fund

    UNLABELED_VARIANT never receives a scheme from page proximity alone.
    """
    if holdings.empty:
        return holdings.copy(), pd.DataFrame()

    d = holdings.copy()

    if "Scheme_Original" not in d.columns:
        d["Scheme_Original"] = d["Scheme"]

    d["Scheme_Recovery"] = "NONE"
    d["Scheme_Recovery_Confidence"] = ""
    d["Scheme_Recovery_Evidence"] = ""

    portfolio_meta = (
        d.groupby([
            "AMC", "Report_Date", "PDF_File", "Page_Number", "Block_ID",
            "Portfolio_ID", "Scheme", "Clean_Variant", "Clean_Section"
        ], dropna=False)
        .agg(
            Rows=("Company", "size"),
            Total_Weight=("Portfolio_Weight_Percent", "sum"),
        )
        .reset_index()
    )

    recovery_rows = []

    targets = portfolio_meta[
        (portfolio_meta["Scheme"] == "UNASSIGNED")
        & (portfolio_meta["Clean_Variant"] != "UNLABELED_VARIANT")
    ]

    for _, target in targets.iterrows():
        peers = portfolio_meta[
            (portfolio_meta["AMC"] == target["AMC"])
            & (portfolio_meta["Report_Date"] == target["Report_Date"])
            & (portfolio_meta["PDF_File"] == target["PDF_File"])
            & (portfolio_meta["Page_Number"] == target["Page_Number"])
            & (portfolio_meta["Scheme"] != "UNASSIGNED")
            & (portfolio_meta["Clean_Variant"] == target["Clean_Variant"])
        ]

        schemes = sorted({
            clean_text(x)
            for x in peers["Scheme"].tolist()
            if clean_text(x) and clean_text(x) != "UNASSIGNED"
        })

        decision = "UNRESOLVED"
        recovered_scheme = ""
        evidence = (
            f"same page={int(target['Page_Number'])}; "
            f"variant={target['Clean_Variant']}; matching schemes={schemes}"
        )

        if len(schemes) == 1:
            recovered_scheme = schemes[0]
            decision = "SAME_PAGE_EXPLICIT_VARIANT"

            mask = d["Portfolio_ID"] == target["Portfolio_ID"]
            d.loc[mask, "Scheme"] = recovered_scheme
            d.loc[mask, "Scheme_Source"] = "recovered-same-page-explicit-variant"
            d.loc[mask, "Scheme_Recovery"] = decision
            d.loc[mask, "Scheme_Recovery_Confidence"] = "High"
            d.loc[mask, "Scheme_Recovery_Evidence"] = evidence

        else:
            mask = d["Portfolio_ID"] == target["Portfolio_ID"]
            d.loc[mask, "Scheme_Recovery"] = decision
            d.loc[mask, "Scheme_Recovery_Evidence"] = evidence

        recovery_rows.append({
            "AMC": target["AMC"],
            "Report_Date": target["Report_Date"],
            "PDF_File": target["PDF_File"],
            "Page_Number": target["Page_Number"],
            "Block_ID": target["Block_ID"],
            "Portfolio_ID": target["Portfolio_ID"],
            "Original_Scheme": "UNASSIGNED",
            "Clean_Variant": target["Clean_Variant"],
            "Clean_Section": target["Clean_Section"],
            "Recovered_Scheme": recovered_scheme,
            "Recovery_Decision": decision,
            "Recovery_Confidence": "High" if recovered_scheme else "",
            "Recovery_Evidence": evidence,
            "Rows": target["Rows"],
            "Total_Weight": round(float(target["Total_Weight"]), 4),
        })

    # Recompute identity presentation after recovery.
    d["Portfolio_Display_Name"] = d.apply(
        lambda r: portfolio_display_name(
            r.get("Scheme", ""),
            r.get("Clean_Variant", ""),
            r.get("Clean_Section", ""),
        ),
        axis=1,
    )
    d["Identity_Status"] = d.apply(
        lambda r: (
            "Recovered — Explicit Variant"
            if r.get("Scheme_Recovery") == "SAME_PAGE_EXPLICIT_VARIANT"
            else identity_status(
                r.get("Scheme", ""),
                r.get("Clean_Variant", ""),
                r.get("Clean_Section", ""),
            )
        ),
        axis=1,
    )

    return d, pd.DataFrame(recovery_rows)


def apply_production_flags(holdings: pd.DataFrame) -> pd.DataFrame:
    """
    Final public/review classification.

    Historical partial portfolio sections are not treated as errors. They remain
    publishable when scheme identity is assigned and the block is not suspicious.
    """
    if holdings.empty:
        return holdings.copy()

    d = holdings.copy()

    statuses = []
    reasons = []
    eligible = []
    coverage = []

    for _, r in d.iterrows():
        scheme = clean_text(r.get("Scheme", ""))
        total = float(r.get("Portfolio_Total_Weight", 0) or 0)
        quality = clean_text(r.get("Portfolio_Quality", ""))
        variant = clean_text(r.get("Clean_Variant", ""))
        recovery = clean_text(r.get("Scheme_Recovery", ""))

        if scheme == "UNASSIGNED":
            status = "REVIEW"
            reason = "SCHEME_UNASSIGNED"
            web = False
        elif total > 115 or quality == "Suspicious High":
            status = "REVIEW"
            reason = "SUSPICIOUS_PORTFOLIO_TOTAL"
            web = False
        elif total <= 0:
            status = "REVIEW"
            reason = "NO_VALID_WEIGHT"
            web = False
        elif total < 60:
            status = "READY_PARTIAL"
            reason = (
                "RECOVERED_EXPLICIT_VARIANT_PARTIAL"
                if recovery == "SAME_PAGE_EXPLICIT_VARIANT"
                else "PARTIAL_PORTFOLIO_SECTION"
            )
            web = True
        else:
            status = "READY"
            reason = (
                "RECOVERED_EXPLICIT_VARIANT"
                if recovery == "SAME_PAGE_EXPLICIT_VARIANT"
                else "ASSIGNED_PORTFOLIO"
            )
            web = True

        if total >= 90:
            cov = "Near Complete"
        elif total >= 60:
            cov = "Substantial"
        elif total >= 20:
            cov = "Partial"
        else:
            cov = "Very Partial"

        statuses.append(status)
        reasons.append(reason)
        eligible.append(web)
        coverage.append(cov)

    d["Production_Status"] = statuses
    d["Production_Reason"] = reasons
    d["Website_Eligible"] = eligible
    d["Coverage_Label"] = coverage
    return d


def _json_safe_value(v):
    if isinstance(v, pd.Timestamp):
        return v.strftime("%Y-%m-%d")
    if pd.isna(v):
        return None
    if hasattr(v, "item"):
        try:
            return v.item()
        except Exception:
            pass
    return v


def _records_json(df: pd.DataFrame) -> list[dict]:
    return [
        {k: _json_safe_value(v) for k, v in rec.items()}
        for rec in df.to_dict("records")
    ]


def export_web_datasets(
    holdings: pd.DataFrame,
    logical_audit: pd.DataFrame,
    export_dir: Path,
) -> dict:
    """
    Export static datasets for credonomics.in.

    Public files contain only Website_Eligible rows.
    Review rows are preserved separately for manual QA.
    """
    export_dir.mkdir(parents=True, exist_ok=True)
    monthly_dir = export_dir / "by_month"
    monthly_dir.mkdir(parents=True, exist_ok=True)

    if holdings.empty:
        manifest = {
            "schemaVersion": "5.6",
            "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
            "holdings": 0,
            "portfolios": 0,
            "months": [],
        }
        (export_dir / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return manifest

    d = holdings.copy()
    d["Report_Date"] = pd.to_datetime(d["Report_Date"], errors="coerce")
    d["Report_Month"] = d["Report_Date"].dt.strftime("%Y-%m")

    public = d[d["Website_Eligible"] == True].copy()
    review = d[d["Website_Eligible"] != True].copy()

    portfolio_cols = [
        "Portfolio_ID", "Logical_Portfolio_ID", "AMC", "Report_Date",
        "Report_Month", "Scheme", "Clean_Variant", "Clean_Section",
        "Portfolio_Display_Name", "Identity_Status", "Scheme_Recovery",
        "Production_Status", "Coverage_Label", "Portfolio_Total_Weight",
        "Page_Number", "Block_ID", "PDF_File",
    ]
    portfolio_cols = [c for c in portfolio_cols if c in public.columns]

    portfolios = (
        public[portfolio_cols]
        .drop_duplicates(subset=["Portfolio_ID"])
        .copy()
    )

    portfolio_counts = (
        public.groupby("Portfolio_ID")
        .agg(
            Holdings_Count=("Company", "size"),
            Companies_Count=("Company", "nunique"),
        )
        .reset_index()
    )
    portfolios = portfolios.merge(portfolio_counts, on="Portfolio_ID", how="left")

    scheme_summary = (
        portfolios.groupby(
            ["AMC", "Scheme", "Clean_Variant", "Portfolio_Display_Name"],
            dropna=False,
        )
        .agg(
            First_Month=("Report_Month", "min"),
            Latest_Month=("Report_Month", "max"),
            Portfolio_Count=("Portfolio_ID", "nunique"),
        )
        .reset_index()
        .sort_values(["AMC", "Scheme", "Clean_Variant"])
    )

    public_csv_cols = [
        "Portfolio_ID", "Logical_Portfolio_ID", "AMC", "Report_Date",
        "Report_Month", "Scheme", "Clean_Variant", "Clean_Section",
        "Portfolio_Display_Name", "Company", "Industry",
        "Portfolio_Weight_Percent", "Production_Status", "Coverage_Label",
        "Page_Number", "Block_ID",
    ]
    public_csv_cols = [c for c in public_csv_cols if c in public.columns]

    review_cols = [
        "Portfolio_ID", "AMC", "Report_Date", "Scheme", "Clean_Variant",
        "Clean_Section", "Portfolio_Display_Name", "Company", "Industry",
        "Portfolio_Weight_Percent", "Production_Status", "Production_Reason",
        "Page_Number", "Block_ID", "PDF_File",
    ]
    review_cols = [c for c in review_cols if c in review.columns]

    # CSV exports
    public[public_csv_cols].to_csv(
        export_dir / "holdings_public.csv", index=False, encoding="utf-8-sig"
    )
    portfolios.to_csv(
        export_dir / "portfolios_public.csv", index=False, encoding="utf-8-sig"
    )
    scheme_summary.to_csv(
        export_dir / "schemes.csv", index=False, encoding="utf-8-sig"
    )
    review[review_cols].to_csv(
        export_dir / "review_queue.csv", index=False, encoding="utf-8-sig"
    )

    # JSON exports
    (export_dir / "holdings_public.json").write_text(
        json.dumps(_records_json(public[public_csv_cols]), ensure_ascii=False),
        encoding="utf-8",
    )
    (export_dir / "portfolios_public.json").write_text(
        json.dumps(_records_json(portfolios), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (export_dir / "schemes.json").write_text(
        json.dumps(_records_json(scheme_summary), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    # Month chunks designed for a static Next.js frontend.
    month_files = []
    for month, mh in public.groupby("Report_Month"):
        month_portfolios = []
        for pid, ph in mh.groupby("Portfolio_ID"):
            first = ph.iloc[0]
            month_portfolios.append({
                "portfolioId": pid,
                "logicalPortfolioId": _json_safe_value(
                    first.get("Logical_Portfolio_ID")
                ),
                "amc": _json_safe_value(first.get("AMC")),
                "scheme": _json_safe_value(first.get("Scheme")),
                "variant": _json_safe_value(first.get("Clean_Variant")),
                "section": _json_safe_value(first.get("Clean_Section")),
                "displayName": _json_safe_value(
                    first.get("Portfolio_Display_Name")
                ),
                "coverage": _json_safe_value(first.get("Coverage_Label")),
                "totalWeight": round(
                    float(first.get("Portfolio_Total_Weight", 0) or 0), 4
                ),
                "page": int(first.get("Page_Number")),
                "block": int(first.get("Block_ID")),
                "holdings": [
                    {
                        "company": _json_safe_value(r.get("Company")),
                        "industry": _json_safe_value(r.get("Industry")),
                        "weight": round(
                            float(r.get("Portfolio_Weight_Percent", 0) or 0), 4
                        ),
                    }
                    for _, r in ph.sort_values(
                        "Portfolio_Weight_Percent", ascending=False
                    ).iterrows()
                ],
            })

        payload = {
            "schemaVersion": "5.6",
            "month": month,
            "portfolios": month_portfolios,
        }
        fname = f"{month}.json"
        (monthly_dir / fname).write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        month_files.append(f"by_month/{fname}")

    latest_month = max(public["Report_Month"]) if not public.empty else None
    if latest_month:
        latest_src = monthly_dir / f"{latest_month}.json"
        (export_dir / "latest.json").write_text(
            latest_src.read_text(encoding="utf-8"),
            encoding="utf-8",
        )

    recovered_portfolios = (
        d.loc[
            d["Scheme_Recovery"] == "SAME_PAGE_EXPLICIT_VARIANT",
            "Portfolio_ID",
        ].nunique()
        if "Scheme_Recovery" in d.columns
        else 0
    )

    months = sorted(public["Report_Month"].dropna().unique().tolist())
    manifest = {
        "schemaVersion": "5.6",
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
        "amcs": sorted(public["AMC"].dropna().astype(str).unique().tolist()),
        "firstMonth": months[0] if months else None,
        "latestMonth": months[-1] if months else None,
        "months": months,
        "counts": {
            "publicHoldings": int(len(public)),
            "publicPortfolios": int(public["Portfolio_ID"].nunique()),
            "publicSchemes": int(
                public[["AMC", "Scheme", "Clean_Variant"]]
                .drop_duplicates()
                .shape[0]
            ),
            "reviewRows": int(len(review)),
            "recoveredPortfolios": int(recovered_portfolios),
        },
        "files": {
            "holdingsCsv": "holdings_public.csv",
            "holdingsJson": "holdings_public.json",
            "portfoliosCsv": "portfolios_public.csv",
            "portfoliosJson": "portfolios_public.json",
            "schemesCsv": "schemes.csv",
            "schemesJson": "schemes.json",
            "reviewCsv": "review_queue.csv",
            "latestJson": "latest.json" if latest_month else None,
            "monthly": month_files,
        },
    }

    (export_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    return manifest
def _logical_id(report_date, pdf_file: str, scheme: str, variant: str, member_ids: list[str]) -> str:
    if pd.isna(report_date):
        month_key = "UNKNOWN_DATE"
    else:
        month_key = pd.Timestamp(report_date).strftime("%Y-%m")
    raw = "|".join([
        month_key,
        clean_text(pdf_file).lower(),
        clean_text(scheme).lower(),
        clean_text(variant).lower(),
        *sorted(str(x).lower() for x in member_ids),
    ])
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16].upper()
    return f"MFLOG_{month_key.replace('-', '')}_{digest}"


def _logical_confidence(total_weight: float, scheme_score: float, section_score: float,
                        variant: str, rows: int, member_count: int,
                        overlap_ratio: float = 0.0) -> tuple[int, str]:
    """Confidence for a logical portfolio, not an individual physical block."""
    score = 0.0

    # Identity is more important than a block individually summing to 100%.
    if scheme_score >= 80:
        score += 30
    elif scheme_score >= 55:
        score += 24
    elif scheme_score >= 30:
        score += 14

    if section_score >= 80:
        score += 12
    elif section_score >= 45:
        score += 9
    elif section_score > 0:
        score += 5

    if variant != "UNLABELED_VARIANT":
        score += 8

    if rows >= 15:
        score += 10
    elif rows >= 8:
        score += 7
    elif rows >= 4:
        score += 4

    # Portfolio completeness is a validation signal, not the only confidence driver.
    if 90 <= total_weight <= 105:
        score += 30
    elif 80 <= total_weight <= 110:
        score += 24
    elif 60 <= total_weight <= 115:
        score += 15
    elif 20 <= total_weight < 60:
        score += 8
    else:
        score += 2

    if member_count > 1:
        score += 5
        if overlap_ratio <= 0.10:
            score += 5
        elif overlap_ratio > 0.25:
            score -= 8

    if total_weight > 115:
        score -= 20

    score = max(0, min(100, int(round(score))))
    label = "High" if score >= 70 else "Medium" if score >= 50 else "Review"
    return score, label


def assemble_logical_portfolios(holdings: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Freeze the V5.3 physical holdings parser and assemble only highly-supported
    continuation blocks into logical portfolios.

    Conservative continuation rule:
      - same report month, source PDF, scheme, clean section
      - adjacent pages only (never side-by-side blocks on same page)
      - same Block_ID to preserve the same physical column lane
      - compatible clean variant
      - each physical block is partial (<90%)
      - combined total is 85-115%
      - HARD anti-merge: company overlap must be <=15%

    Historical Index Fund diagnostics showed 50-89% overlap across adjacent
    pages. Those are treated as distinct variants/portfolios, never continuations.
    """
    if holdings.empty:
        return holdings.copy(), pd.DataFrame()

    d = holdings.copy()
    d["Clean_Variant"] = d["Variant_Label"].map(canonical_variant_label)
    d["Clean_Section"] = d["Section_Label"].map(canonical_section_label)
    d["Portfolio_Display_Name"] = d.apply(
        lambda r: portfolio_display_name(
            r.get("Scheme", ""),
            r.get("Clean_Variant", ""),
            r.get("Clean_Section", ""),
        ),
        axis=1,
    )
    d["Identity_Status"] = d.apply(
        lambda r: identity_status(
            r.get("Scheme", ""),
            r.get("Clean_Variant", ""),
            r.get("Clean_Section", ""),
        ),
        axis=1,
    )

    phys = (
        d.groupby([
            "AMC", "Report_Date", "PDF_File", "Scheme", "Clean_Variant",
            "Clean_Section", "Portfolio_Display_Name", "Identity_Status",
            "Portfolio_ID", "Physical_Portfolio_ID",
            "Page_Number", "Block_ID"
        ])
        .agg(
            Rows=("Company", "size"),
            Companies=("Company", "nunique"),
            Total_Weight=("Portfolio_Weight_Percent", "sum"),
            Avg_Scheme_Match_Score=("Scheme_Match_Score", "mean"),
            Avg_Section_Match_Score=("Section_Match_Score", "mean"),
        )
        .reset_index()
        .sort_values(["Report_Date", "PDF_File", "Scheme", "Page_Number", "Block_ID"])
        .reset_index(drop=True)
    )

    company_sets = {
        pid: set(d.loc[d["Portfolio_ID"] == pid, "Company"].astype(str))
        for pid in phys["Portfolio_ID"]
    }

    used: set[str] = set()
    logical_records: list[dict] = []
    mapping: dict[str, str] = {}

    for _, a in phys.iterrows():
        pid_a = a["Portfolio_ID"]
        if pid_a in used:
            continue

        members = [a]
        overlap_ratio = 0.0
        assembly = "Single Physical Portfolio"

        # Consider only the immediately adjacent page in the same column lane.
        if 20 <= float(a["Total_Weight"]) < 90 and a["Scheme"] != "UNASSIGNED":
            candidates = phys[
                (phys["Portfolio_ID"] != pid_a)
                & (~phys["Portfolio_ID"].isin(used))
                & (phys["AMC"] == a["AMC"])
                & (phys["Report_Date"] == a["Report_Date"])
                & (phys["PDF_File"] == a["PDF_File"])
                & (phys["Scheme"] == a["Scheme"])
                & (phys["Clean_Section"] == a["Clean_Section"])
                & (phys["Block_ID"] == a["Block_ID"])
                & (phys["Page_Number"] == int(a["Page_Number"]) + 1)
                & (phys["Total_Weight"] >= 20)
                & (phys["Total_Weight"] < 90)
            ]

            for _, b in candidates.iterrows():
                # Variants must agree. Unlabeled only pairs with unlabeled.
                if b["Clean_Variant"] != a["Clean_Variant"]:
                    continue

                combined = float(a["Total_Weight"]) + float(b["Total_Weight"])
                if not (85 <= combined <= 115):
                    continue

                sa = company_sets.get(pid_a, set())
                sb = company_sets.get(b["Portfolio_ID"], set())
                denom = max(1, min(len(sa), len(sb)))
                overlap_ratio = len(sa & sb) / denom
                if overlap_ratio > 0.15:
                    continue

                members.append(b)
                assembly = "Adjacent Continuation Pair"
                break

        member_ids = [str(x["Portfolio_ID"]) for x in members]
        logical_id = _logical_id(
            a["Report_Date"], a["PDF_File"], a["Scheme"], a["Clean_Variant"], member_ids
        )

        for mid in member_ids:
            used.add(mid)
            mapping[mid] = logical_id

        total_weight = sum(float(x["Total_Weight"]) for x in members)
        total_rows = sum(int(x["Rows"]) for x in members)
        scheme_score = max(float(x["Avg_Scheme_Match_Score"]) for x in members)
        section_score = max(float(x["Avg_Section_Match_Score"]) for x in members)
        conf_score, conf_label = _logical_confidence(
            total_weight, scheme_score, section_score, a["Clean_Variant"],
            total_rows, len(members), overlap_ratio
        )

        logical_records.append({
            "AMC": a["AMC"],
            "Report_Date": a["Report_Date"],
            "PDF_File": a["PDF_File"],
            "Scheme": a["Scheme"],
            "Clean_Variant": a["Clean_Variant"],
            "Clean_Section": a["Clean_Section"],
            "Portfolio_Display_Name": a["Portfolio_Display_Name"],
            "Identity_Status": a["Identity_Status"],
            "Logical_Portfolio_ID": logical_id,
            "Assembly": assembly,
            "Member_Count": len(members),
            "Member_Portfolio_IDs": "; ".join(member_ids),
            "Start_Page": min(int(x["Page_Number"]) for x in members),
            "End_Page": max(int(x["Page_Number"]) for x in members),
            "Block_ID": int(a["Block_ID"]),
            "Rows": total_rows,
            "Companies": len(set().union(*(company_sets.get(mid, set()) for mid in member_ids))),
            "Logical_Total_Weight": round(total_weight, 4),
            "Company_Overlap_Ratio": round(overlap_ratio, 4),
            "Logical_Confidence_Score": conf_score,
            "Logical_Confidence": conf_label,
        })

    logical = pd.DataFrame(logical_records)
    d["Logical_Portfolio_ID"] = d["Portfolio_ID"].map(mapping)

    if not logical.empty:
        extra = logical.set_index("Logical_Portfolio_ID")[[
            "Assembly", "Member_Count", "Logical_Total_Weight",
            "Logical_Confidence_Score", "Logical_Confidence"
        ]]
        d = d.join(extra, on="Logical_Portfolio_ID")

    return d, logical
def extract_pdf(pdf_path: Path, inventory_scheme: str) -> list[dict]:
    rows = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            try:
                words = page.extract_words(
                    x_tolerance=1.5,
                    y_tolerance=1.5,
                    keep_blank_chars=False,
                    use_text_flow=False,
                )
            except Exception:
                continue

            if not words:
                continue

            lines = cluster_words_into_lines(words)
            page_width = float(page.width)
            weight_centers = detect_weight_clusters(words, page_width)
            blocks = build_blocks(weight_centers, page_width)
            if not blocks:
                continue

            scheme_candidates = detect_page_scheme_candidates(lines)
            section_markers = detect_section_markers(lines)
            variant_markers = detect_variant_markers(lines)

            for block in blocks:
                model = infer_block_model(lines, block)
                if not model:
                    continue

                scheme, scheme_score, scheme_source = assign_scheme_to_block(
                    lines, block, model, scheme_candidates
                )
                scheme = sanitize_scheme_name(scheme)

                section_label, section_score = assign_section_to_block(
                    lines, block, model, section_markers
                )
                variant_label, variant_score, variant_source = assign_variant_to_block(
                    lines, block, model, variant_markers
                )
                variant_label = canonical_variant_label(variant_label)

                physical_id = make_physical_portfolio_id(
                    page_number, block["block_id"], scheme, section_label, variant_label
                )

                block_rows = []
                for idx in range(model["start"], model["end"] + 1):
                    rec = parse_block_row(lines[idx], block, model)
                    if not rec:
                        continue

                    rec.update({
                        "Scheme": scheme,
                        "Scheme_Match_Score": round(float(scheme_score), 2),
                        "Scheme_Source": scheme_source,
                        "Section_Label": section_label,
                        "Section_Match_Score": round(float(section_score), 2),
                        "Variant_Label": variant_label,
                        "Variant_Match_Score": round(float(variant_score), 2),
                        "Variant_Source": variant_source,
                        "Physical_Portfolio_ID": physical_id,
                        "Page_Number": page_number,
                    })
                    block_rows.append(rec)

                if not block_rows:
                    continue

                block_total = sum(float(r["Portfolio_Weight_Percent"]) for r in block_rows)
                quality = classify_portfolio_total(block_total)
                confidence_score, confidence_label = portfolio_confidence_score(
                    block_total, float(scheme_score), float(section_score),
                    float(variant_score), len(block_rows), scheme != "UNASSIGNED"
                )

                for rec in block_rows:
                    rec["Portfolio_Total_Weight"] = round(block_total, 4)
                    rec["Portfolio_Quality"] = quality
                    rec["Portfolio_Confidence_Score"] = confidence_score
                    rec["Portfolio_Confidence"] = confidence_label
                    rows.append(rec)

    return rows

def load_inventory(path: Path) -> pd.DataFrame:
    excel = pd.ExcelFile(path)
    sheet = (
        "Factsheet Inventory"
        if "Factsheet Inventory" in excel.sheet_names
        else excel.sheet_names[0]
    )
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

    for candidate in [
        base_dir / p,
        inventory_path.parent.parent / p,
        inventory_path.parent / p,
    ]:
        if candidate.exists():
            return candidate.resolve()

    return (base_dir / p).resolve()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", required=True)
    parser.add_argument("--base-dir", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--max-pdfs", type=int, default=10)
    parser.add_argument("--amc", default="")
    parser.add_argument(
        "--export-dir",
        default="",
        help="Website export folder. Default: <output-stem>_web beside the XLSX.",
    )
    args = parser.parse_args()

    inventory_path = Path(args.inventory).resolve()
    base_dir = Path(args.base_dir).resolve()
    inventory = load_inventory(inventory_path)

    path_col = choose_column(inventory, ["PDF_Path", "Path", "File Path"])
    amc_col = choose_column(inventory, ["AMC"])
    scheme_col = choose_column(inventory, ["Scheme"])
    date_col = choose_column(
        inventory,
        ["Report_Date", "Report Date", "Date", "Month"],
    )
    inventory_month_col = choose_column(inventory, ["Month"])
    inventory_month_year_col = choose_column(inventory, ["Month_Year", "Month Year"])
    inventory_date_source_col = choose_column(
        inventory, ["Date_Detection_Source", "Date Detection Source"]
    )

    if not path_col:
        raise SystemExit(
            f"Could not detect PDF path column. Columns: {list(inventory.columns)}"
        )

    if args.amc and amc_col:
        inventory = inventory[
            inventory[amc_col]
            .astype(str)
            .str.contains(args.amc, case=False, na=False)
        ]

    if args.max_pdfs:
        inventory = inventory.head(args.max_pdfs)

    all_rows = []
    log = []
    date_audit_rows = []

    for _, item in inventory.iterrows():
        pdf_path = resolve_pdf_path(
            clean_text(item.get(path_col, "")),
            base_dir,
            inventory_path,
        )

        amc = clean_text(item.get(amc_col, "")) if amc_col else ""
        inv_scheme = clean_text(item.get(scheme_col, "")) if scheme_col else ""

        inventory_report_date = pd.to_datetime(
            item.get(date_col, None) if date_col else None,
            errors="coerce",
        )
        date_info = resolve_report_date(pdf_path, inventory_report_date)
        report_date = date_info["Resolved_Date"]

        date_audit_rows.append({
            "AMC": amc,
            "Inventory_Scheme": inv_scheme,
            "Original_Inventory_Month": clean_text(
                item.get(inventory_month_col, "") if inventory_month_col else ""
            ),
            "Original_Inventory_Month_Year": clean_text(
                item.get(inventory_month_year_col, "") if inventory_month_year_col else ""
            ),
            "Inventory_Date_Detection_Source": clean_text(
                item.get(inventory_date_source_col, "") if inventory_date_source_col else ""
            ),
            **date_info,
        })

        if not pdf_path.exists():
            print(f"[MISSING] {pdf_path}")
            log.append({
                "PDF": str(pdf_path),
                "Status": "Missing",
                "Rows": 0,
            })
            continue

        try:
            rows = extract_pdf(pdf_path, inv_scheme)

            for rec in rows:
                rec.update({
                    "AMC": amc,
                    "PDF_File": pdf_path.name,
                    "PDF_Path": str(pdf_path),
                    "Original_Inventory_Date": date_info["Original_Inventory_Date"],
                    "Date_Status": date_info["Date_Status"],
                    "Date_Source": date_info["Date_Source"],
                    "Date_Method": date_info["Date_Method"],
                    "Date_Conflict": date_info["Date_Conflict"],
                    "Date_Evidence": date_info["Date_Evidence"],
                })
                apply_resolved_date_fields(rec, report_date)

                rec["Clean_Variant"] = canonical_variant_label(
                    rec.get("Variant_Label", "")
                )
                rec["Clean_Section"] = canonical_section_label(
                    rec.get("Section_Label", "")
                )
                rec["Portfolio_Display_Name"] = portfolio_display_name(
                    rec.get("Scheme", ""),
                    rec.get("Clean_Variant", ""),
                    rec.get("Clean_Section", ""),
                )
                rec["Identity_Status"] = identity_status(
                    rec.get("Scheme", ""),
                    rec.get("Clean_Variant", ""),
                    rec.get("Clean_Section", ""),
                )

                rec["Legacy_Portfolio_ID"] = stable_portfolio_id(
                    amc, report_date, pdf_path.name,
                    rec.get("Physical_Portfolio_ID", ""),
                    rec.get("Scheme", ""),
                    rec.get("Clean_Variant", ""),
                )
                rec["Source_Portfolio_ID"] = stable_source_portfolio_id(
                    amc,
                    report_date,
                    pdf_path.name,
                    rec.get("Page_Number", 0),
                    rec.get("Block_ID", 0),
                )
                rec["Portfolio_ID"] = rec["Source_Portfolio_ID"]

            all_rows.extend(rows)

            schemes = len({
                r.get("Scheme", "")
                for r in rows
                if r.get("Scheme", "")
            })

            blocks = len({
                (r.get("Page_Number"), r.get("Block_ID"))
                for r in rows
            })

            print(
                f"[OK] {pdf_path.name}: "
                f"{len(rows)} rows | {schemes} schemes | {blocks} blocks"
            )

            log.append({
                "PDF": str(pdf_path),
                "Status": "Processed",
                "Rows": len(rows),
                "Schemes": schemes,
                "Blocks": blocks,
            })

        except Exception as exc:
            print(f"[ERROR] {pdf_path.name}: {exc}")
            log.append({
                "PDF": str(pdf_path),
                "Status": "Error",
                "Rows": 0,
                "Message": str(exc),
            })

    holdings = pd.DataFrame(all_rows)
    log_df = pd.DataFrame(log)
    date_audit = pd.DataFrame(date_audit_rows)
    recovery_audit = pd.DataFrame()

    if not holdings.empty:
        holdings, recovery_audit = recover_unassigned_schemes(holdings)

        holdings = holdings[
            holdings["Portfolio_Weight_Percent"].between(
                0.0001,
                25.0,
                inclusive="both",
            )
        ].copy()

        holdings = holdings.drop_duplicates(
            subset=[
                "AMC",
                "Scheme",
                "Report_Date",
                "Portfolio_ID",
                "Company",
                "Portfolio_Weight_Percent",
            ],
            keep="first",
        )

        holdings = holdings.sort_values(
            [
                "Report_Date",
                "AMC",
                "Scheme",
                "Page_Number",
                "Block_ID",
                "Portfolio_Weight_Percent",
            ],
            ascending=[True, True, True, True, True, False],
        )

        holdings, logical_audit = assemble_logical_portfolios(holdings)
        holdings = apply_production_flags(holdings)
    else:
        logical_audit = pd.DataFrame()

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        holdings.to_excel(writer, sheet_name="Holdings", index=False)
        log_df.to_excel(writer, sheet_name="Processing Log", index=False)

        if not date_audit.empty:
            date_audit = date_audit.sort_values(
                ["Resolved_Date", "PDF_File"], na_position="last"
            )
            date_audit.to_excel(writer, sheet_name="Date Audit", index=False)

        if not recovery_audit.empty:
            recovery_audit.to_excel(
                writer, sheet_name="Recovery Audit", index=False
            )

        if not holdings.empty:
            production_summary = (
                holdings[[
                    "Portfolio_ID", "Production_Status", "Production_Reason",
                    "Website_Eligible", "Coverage_Label"
                ]]
                .drop_duplicates()
                .groupby(
                    ["Production_Status", "Production_Reason",
                     "Website_Eligible", "Coverage_Label"],
                    dropna=False,
                )
                .agg(Portfolios=("Portfolio_ID", "nunique"))
                .reset_index()
            )
            production_summary.to_excel(
                writer, sheet_name="Production Summary", index=False
            )
            summary = (
                holdings.groupby(
                    ["AMC", "Scheme", "Variant_Label", "Report_Date",
                     "Portfolio_ID", "Physical_Portfolio_ID", "Section_Label",
                     "Portfolio_Quality", "Portfolio_Confidence"]
                )
                .agg(
                    Holdings=("Company", "nunique"),
                    Total_Weight=("Portfolio_Weight_Percent", "sum"),
                    Pages=("Page_Number", "nunique"),
                    Blocks=("Block_ID", "nunique"),
                    Avg_Scheme_Match_Score=("Scheme_Match_Score", "mean"),
                    Avg_Section_Match_Score=("Section_Match_Score", "mean"),
                    Avg_Variant_Match_Score=("Variant_Match_Score", "mean"),
                    Confidence_Score=("Portfolio_Confidence_Score", "max"),
                )
                .reset_index()
            )
            summary.to_excel(writer, sheet_name="Scheme Summary", index=False)

            block_summary = (
                holdings.groupby(
                    ["PDF_File", "Page_Number", "Block_ID", "Portfolio_ID",
                     "Physical_Portfolio_ID", "Scheme", "Scheme_Source",
                     "Variant_Label", "Variant_Source", "Section_Label",
                     "Portfolio_Quality", "Portfolio_Confidence"]
                )
                .agg(
                    Rows=("Company", "size"),
                    Companies=("Company", "nunique"),
                    Total_Weight=("Portfolio_Weight_Percent", "sum"),
                    Avg_Scheme_Match_Score=("Scheme_Match_Score", "mean"),
                    Avg_Section_Match_Score=("Section_Match_Score", "mean"),
                    Avg_Variant_Match_Score=("Variant_Match_Score", "mean"),
                    Confidence_Score=("Portfolio_Confidence_Score", "max"),
                )
                .reset_index()
            )
            block_summary.to_excel(writer, sheet_name="Block Audit", index=False)

            portfolio_audit = (
                holdings.groupby(
                    ["Report_Date", "Scheme", "Variant_Label", "Portfolio_ID",
                     "Physical_Portfolio_ID", "Section_Label", "Portfolio_Quality",
                     "Portfolio_Confidence"]
                )
                .agg(
                    Rows=("Company", "size"),
                    Companies=("Company", "nunique"),
                    Total_Weight=("Portfolio_Weight_Percent", "sum"),
                    Page=("Page_Number", "min"),
                    Block=("Block_ID", "min"),
                    Avg_Scheme_Match_Score=("Scheme_Match_Score", "mean"),
                    Avg_Section_Match_Score=("Section_Match_Score", "mean"),
                    Avg_Variant_Match_Score=("Variant_Match_Score", "mean"),
                    Confidence_Score=("Portfolio_Confidence_Score", "max"),
                )
                .reset_index()
                .sort_values(["Report_Date", "Scheme", "Variant_Label", "Page", "Block"])
            )

            portfolio_audit["Clean_Variant"] = portfolio_audit["Variant_Label"].map(
                canonical_variant_label
            )
            portfolio_audit["Clean_Section"] = portfolio_audit["Section_Label"].map(
                canonical_section_label
            )
            portfolio_audit["Portfolio_Display_Name"] = portfolio_audit.apply(
                lambda r: portfolio_display_name(
                    r.get("Scheme", ""),
                    r.get("Clean_Variant", ""),
                    r.get("Clean_Section", ""),
                ),
                axis=1,
            )
            portfolio_audit["Identity_Status"] = portfolio_audit.apply(
                lambda r: identity_status(
                    r.get("Scheme", ""),
                    r.get("Clean_Variant", ""),
                    r.get("Clean_Section", ""),
                ),
                axis=1,
            )

            portfolio_audit["Continuation_Candidate"] = ""
            portfolio_audit["Continuation_With"] = ""
            portfolio_audit["Continuation_Overlap_Pct"] = ""
            portfolio_audit["Continuation_Decision"] = ""

            _company_sets = {
                pid: set(
                    holdings.loc[
                        holdings["Portfolio_ID"] == pid, "Company"
                    ].astype(str)
                )
                for pid in portfolio_audit["Portfolio_ID"]
            }

            for i in range(len(portfolio_audit)):
                a = portfolio_audit.iloc[i]
                if not (20 <= float(a["Total_Weight"]) < 90):
                    continue

                considered = False

                for j in range(i + 1, len(portfolio_audit)):
                    b = portfolio_audit.iloc[j]

                    if b["Report_Date"] != a["Report_Date"]:
                        break
                    if b["Scheme"] != a["Scheme"]:
                        continue
                    if int(b["Block"]) != int(a["Block"]):
                        continue
                    if int(b["Page"]) != int(a["Page"]) + 1:
                        continue
                    if b["Clean_Variant"] != a["Clean_Variant"]:
                        continue
                    if b["Clean_Section"] != a["Clean_Section"]:
                        continue

                    combined = float(a["Total_Weight"]) + float(b["Total_Weight"])
                    if not (85 <= combined <= 115):
                        continue

                    considered = True
                    sa = _company_sets.get(a["Portfolio_ID"], set())
                    sb = _company_sets.get(b["Portfolio_ID"], set())
                    denom = max(1, min(len(sa), len(sb)))
                    overlap = len(sa & sb) / denom
                    overlap_pct = round(overlap * 100, 1)

                    portfolio_audit.at[i, "Continuation_Overlap_Pct"] = overlap_pct
                    portfolio_audit.at[j, "Continuation_Overlap_Pct"] = overlap_pct

                    if overlap <= 0.15:
                        portfolio_audit.at[i, "Continuation_Candidate"] = "YES"
                        portfolio_audit.at[i, "Continuation_With"] = b["Portfolio_ID"]
                        portfolio_audit.at[j, "Continuation_Candidate"] = "YES"
                        portfolio_audit.at[j, "Continuation_With"] = a["Portfolio_ID"]
                        portfolio_audit.at[i, "Continuation_Decision"] = "MERGE-SAFE"
                        portfolio_audit.at[j, "Continuation_Decision"] = "MERGE-SAFE"
                    else:
                        portfolio_audit.at[i, "Continuation_Decision"] = "KEEP SEPARATE — HIGH OVERLAP"
                        portfolio_audit.at[j, "Continuation_Decision"] = "KEEP SEPARATE — HIGH OVERLAP"
                    break

                if not considered and not portfolio_audit.at[i, "Continuation_Decision"]:
                    portfolio_audit.at[i, "Continuation_Decision"] = "NO MATCHING ADJACENT BLOCK"

            portfolio_audit.to_excel(writer, sheet_name="Portfolio Audit", index=False)

            identity_audit = (
                portfolio_audit[
                    [
                        "Report_Date", "Scheme", "Clean_Variant", "Clean_Section",
                        "Portfolio_Display_Name", "Identity_Status",
                        "Portfolio_ID", "Page", "Block", "Total_Weight",
                        "Continuation_Candidate", "Continuation_With",
                        "Continuation_Overlap_Pct", "Continuation_Decision",
                    ]
                ]
                .copy()
                .sort_values(
                    ["Report_Date", "Scheme", "Clean_Variant", "Page", "Block"]
                )
            )
            identity_audit.to_excel(
                writer,
                sheet_name="Identity Audit",
                index=False,
            )

            if not logical_audit.empty:
                logical_audit.to_excel(
                    writer,
                    sheet_name="Logical Portfolio Audit",
                    index=False,
                )

                logical_summary = (
                    logical_audit.groupby([
                        "AMC", "Report_Date", "Scheme", "Clean_Variant",
                        "Portfolio_Display_Name", "Identity_Status",
                        "Logical_Confidence"
                    ])
                    .agg(
                        Logical_Portfolios=("Logical_Portfolio_ID", "nunique"),
                        Avg_Weight=("Logical_Total_Weight", "mean"),
                        Avg_Confidence=("Logical_Confidence_Score", "mean"),
                    )
                    .reset_index()
                )
                logical_summary.to_excel(
                    writer,
                    sheet_name="Logical Summary",
                    index=False,
                )

    if args.export_dir:
        export_dir = Path(args.export_dir).resolve()
    else:
        export_dir = output.parent / f"{output.stem}_web"

    manifest = export_web_datasets(
        holdings,
        logical_audit,
        export_dir,
    )

    corrected_dates = int(
        (date_audit["Date_Status"] == "CORRECTED").sum()
    ) if not date_audit.empty else 0
    unresolved_dates = int(
        (date_audit["Date_Status"] == "UNRESOLVED").sum()
    ) if not date_audit.empty else 0

    manifest["dateAudit"] = {
        "corrected": corrected_dates,
        "unresolved": unresolved_dates,
    }
    (export_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print()
    print("=" * 82)
    print("CREDONOMICS MF EXTRACTOR V5.7 COMPLETE")
    print("=" * 82)
    print(f"Holdings rows : {len(holdings):,}")
    print(
        f"AMCs          : "
        f"{holdings['AMC'].nunique() if not holdings.empty else 0}"
    )
    print(
        f"Schemes       : "
        f"{holdings[['AMC','Scheme']].drop_duplicates().shape[0] if not holdings.empty else 0}"
    )
    print(
        f"Companies     : "
        f"{holdings['Company'].nunique() if not holdings.empty else 0:,}"
    )
    print(
        f"Blocks        : "
        f"{holdings[['PDF_File','Page_Number','Block_ID']].drop_duplicates().shape[0] if not holdings.empty else 0}"
    )
    print(
        f"Portfolios    : "
        f"{holdings['Portfolio_ID'].nunique() if not holdings.empty else 0}"
    )
    if not holdings.empty:
        _pc = (
            holdings[["Portfolio_ID", "Portfolio_Confidence"]]
            .drop_duplicates()["Portfolio_Confidence"]
            .value_counts()
            .to_dict()
        )
        print(f"Physical conf.: {_pc}")
    if not logical_audit.empty:
        _lc = logical_audit["Logical_Confidence"].value_counts().to_dict()
        print(f"Logical ports : {logical_audit['Logical_Portfolio_ID'].nunique()}")
        print(f"Logical conf. : {_lc}")
        print(
            f"Merged pairs  : "
            f"{int((logical_audit['Member_Count'] > 1).sum())}"
        )
        if "Identity_Status" in logical_audit.columns:
            _ids = logical_audit["Identity_Status"].value_counts().to_dict()
            print(f"Identity      : {_ids}")
    print(
        f"Assigned rows : "
        f"{int((holdings['Scheme'] != 'UNASSIGNED').sum()) if not holdings.empty else 0:,}"
    )
    print(
        f"Unassigned    : "
        f"{int((holdings['Scheme'] == 'UNASSIGNED').sum()) if not holdings.empty else 0:,}"
    )
    if not holdings.empty:
        recovered = int(
            holdings.loc[
                holdings["Scheme_Recovery"] == "SAME_PAGE_EXPLICIT_VARIANT",
                "Portfolio_ID"
            ].nunique()
        )
        public_ports = int(
            holdings.loc[holdings["Website_Eligible"] == True, "Portfolio_ID"]
            .nunique()
        )
        review_ports = int(
            holdings.loc[holdings["Website_Eligible"] != True, "Portfolio_ID"]
            .nunique()
        )
        print(f"Recovered IDs : {recovered}")
        print(f"Public ports  : {public_ports}")
        print(f"Review ports  : {review_ports}")
    print(f"Date corrected: {corrected_dates}")
    print(f"Date unresolved: {unresolved_dates}")
    print(f"Output        : {output.resolve()}")
    print(f"Web export    : {export_dir}")
    print("=" * 82)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
