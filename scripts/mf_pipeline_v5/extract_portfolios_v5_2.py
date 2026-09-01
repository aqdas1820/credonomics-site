from __future__ import annotations

import argparse
import math
import re
from pathlib import Path
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
        "Extraction_Method": "Portfolio-Hierarchy Coordinate V5.2",
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


def make_portfolio_id(page_number, block_id, scheme, section_label):
    safe_scheme = re.sub(r"[^A-Za-z0-9]+", "_", scheme or "UNASSIGNED").strip("_")
    safe_section = re.sub(
        r"[^A-Za-z0-9]+", "_", section_label or "UNLABELED_SECTION"
    ).strip("_")
    safe_scheme = safe_scheme[:50] or "UNASSIGNED"
    safe_section = safe_section[:50] or "UNLABELED_SECTION"
    return f"P{page_number:03d}_B{block_id:02d}_{safe_scheme}_{safe_section}"


def classify_portfolio_total(weight):
    if weight < 20:
        return "Very Partial"
    if weight < 60:
        return "Partial"
    if weight <= 115:
        return "Portfolio-like"
    return "Suspicious High"
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

                portfolio_id = make_portfolio_id(
                    page_number, block["block_id"], scheme, section_label
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
                        "Portfolio_ID": portfolio_id,
                        "Page_Number": page_number,
                    })
                    block_rows.append(rec)

                if not block_rows:
                    continue

                block_total = sum(float(r["Portfolio_Weight_Percent"]) for r in block_rows)
                quality = classify_portfolio_total(block_total)

                for rec in block_rows:
                    rec["Portfolio_Total_Weight"] = round(block_total, 4)
                    rec["Portfolio_Quality"] = quality
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

    for _, item in inventory.iterrows():
        pdf_path = resolve_pdf_path(
            clean_text(item.get(path_col, "")),
            base_dir,
            inventory_path,
        )

        amc = clean_text(item.get(amc_col, "")) if amc_col else ""
        inv_scheme = clean_text(item.get(scheme_col, "")) if scheme_col else ""

        report_date = pd.to_datetime(
            item.get(date_col, None) if date_col else None,
            errors="coerce",
        )

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
                    "Report_Date": report_date,
                    "Year": report_date.year if not pd.isna(report_date) else None,
                    "Month_Number": report_date.month if not pd.isna(report_date) else None,
                    "Month": report_date.strftime("%B") if not pd.isna(report_date) else "",
                    "Month_Year": report_date.strftime("%B-%Y") if not pd.isna(report_date) else "",
                    "PDF_File": pdf_path.name,
                    "PDF_Path": str(pdf_path),
                })

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

    if not holdings.empty:
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

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        holdings.to_excel(writer, sheet_name="Holdings", index=False)
        log_df.to_excel(writer, sheet_name="Processing Log", index=False)

        if not holdings.empty:
            summary = (
                holdings.groupby(
                    ["AMC", "Scheme", "Report_Date", "Portfolio_ID",
                     "Section_Label", "Portfolio_Quality"]
                )
                .agg(
                    Holdings=("Company", "nunique"),
                    Total_Weight=("Portfolio_Weight_Percent", "sum"),
                    Pages=("Page_Number", "nunique"),
                    Blocks=("Block_ID", "nunique"),
                    Avg_Scheme_Match_Score=("Scheme_Match_Score", "mean"),
                    Avg_Section_Match_Score=("Section_Match_Score", "mean"),
                )
                .reset_index()
            )
            summary.to_excel(
                writer,
                sheet_name="Scheme Summary",
                index=False,
            )

            block_summary = (
                holdings.groupby(
                    ["PDF_File", "Page_Number", "Block_ID", "Portfolio_ID",
                     "Scheme", "Scheme_Source", "Section_Label",
                     "Portfolio_Quality"]
                )
                .agg(
                    Rows=("Company", "size"),
                    Companies=("Company", "nunique"),
                    Total_Weight=("Portfolio_Weight_Percent", "sum"),
                    Avg_Scheme_Match_Score=("Scheme_Match_Score", "mean"),
                    Avg_Section_Match_Score=("Section_Match_Score", "mean"),
                )
                .reset_index()
            )
            block_summary.to_excel(
                writer,
                sheet_name="Block Audit",
                index=False,
            )

            portfolio_audit = (
                holdings.groupby(
                    ["Report_Date", "Scheme", "Portfolio_ID",
                     "Section_Label", "Portfolio_Quality"]
                )
                .agg(
                    Rows=("Company", "size"),
                    Companies=("Company", "nunique"),
                    Total_Weight=("Portfolio_Weight_Percent", "sum"),
                    Page=("Page_Number", "min"),
                    Block=("Block_ID", "min"),
                    Avg_Scheme_Match_Score=("Scheme_Match_Score", "mean"),
                    Avg_Section_Match_Score=("Section_Match_Score", "mean"),
                )
                .reset_index()
                .sort_values(["Report_Date", "Scheme", "Page", "Block"])
            )
            portfolio_audit.to_excel(
                writer,
                sheet_name="Portfolio Audit",
                index=False,
            )

    print()
    print("=" * 82)
    print("CREDONOMICS MF EXTRACTOR V5.2 COMPLETE")
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
    print(
        f"Assigned rows : "
        f"{int((holdings['Scheme'] != 'UNASSIGNED').sum()) if not holdings.empty else 0:,}"
    )
    print(
        f"Unassigned    : "
        f"{int((holdings['Scheme'] == 'UNASSIGNED').sum()) if not holdings.empty else 0:,}"
    )
    print(f"Output        : {output.resolve()}")
    print("=" * 82)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
