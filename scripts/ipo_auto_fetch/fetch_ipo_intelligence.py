from __future__ import annotations

import hashlib
import io
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "data" / "ipo-intelligence" / "index.json"
CACHE = ROOT / ".cache" / "ipo-intelligence"

NSE_HOME = "https://www.nseindia.com/"
NSE_ISSUES = "https://www.nseindia.com/market-data/all-upcoming-issues-ipo"
NSE_TRACKER = "https://www.nseindia.com/ipo-tracker?type=ipo_year"
BSE_SUMMARY = "https://www.bseindia.com/markets/PublicIssues/Issuesummary.aspx"
SEBI_RHP = (
    "https://www.sebi.gov.in/sebiweb/home/"
    "HomeAction.do?doListing=yes&sid=3&smid=11%2F1000&ssid=15"
)
SEBI_DRHP = (
    "https://www.sebi.gov.in/sebiweb/home/"
    "HomeAction.do?doListing=yes&sid=3&smid=10&ssid=15"
)

MAX_SEBI_DETAIL_PAGES = 70
MAX_PDF_MB = 18
HTTP_TIMEOUT = 35
RECENT_DAYS = 120

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/151.0 Safari/537.36"
    ),
    "Accept-Language": "en-IN,en;q=0.9",
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

SOURCE_LABELS = {
    "nse_issue_board": "NSE public issue board",
    "nse_ipo_tracker": "NSE IPO Tracker",
    "sebi_rhp": "SEBI RHP/Prospectus filings",
    "sebi_drhp": "SEBI DRHP filings",
    "bse_issue_summary": "BSE issue summary",
}


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def repair_mojibake(value: str) -> str:
    if not value:
        return ""

    # Common UTF-8 -> Windows-1252 corruption produced when old Windows
    # PowerShell reads UTF-8 source without a BOM.
    replacements = {
        "\u00e2\u20ac\u201d": "\u2014",  # em dash
        "\u00e2\u20ac\u201c": "\u2013",  # en dash
        "\u00e2\u201a\u00b9": "\u20b9",  # rupee sign
        "\u00e2\u20ac\u2122": "\u2019",  # right apostrophe
        "\u00e2\u20ac\u0153": "\u201c",  # left quote
        "\u00e2\u20ac\u009d": "\u201d",  # right quote
        "\u00c2": "",
    }

    repaired = value
    for broken, correct in replacements.items():
        repaired = repaired.replace(broken, correct)

    return repaired


def clean(value: Any) -> str:
    if value is None:
        return ""

    repaired = repair_mojibake(str(value))
    return re.sub(r"\s+", " ", repaired).strip()


def slugify(value: str) -> str:
    value = re.sub(r"\b(limited|ltd|private|pvt)\b", "", value, flags=re.I)
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value or "ipo"


def key_company(value: str) -> str:
    value = clean(value).lower()
    value = value.replace("&", " and ")
    value = re.sub(
        r"\b(limited|ltd|private|pvt|company|co|india)\b",
        " ",
        value,
    )
    return re.sub(r"[^a-z0-9]+", "", value)


def parse_date(value: str) -> str:
    value = clean(value)
    if not value:
        return ""

    for dayfirst in (True, False):
        try:
            dt = date_parser.parse(value, dayfirst=dayfirst, fuzzy=True)
            return dt.date().isoformat()
        except Exception:
            pass

    return ""


def date_display(value: str) -> str:
    parsed = parse_date(value)
    if not parsed:
        return clean(value)

    dt = datetime.fromisoformat(parsed)
    return dt.strftime("%d %b %Y")


def number_text(value: str) -> str:
    return clean(value).replace("\u20b9", "\u20b9")


def first_number(value: str) -> float | None:
    if not value:
        return None

    match = re.search(r"-?\d[\d,]*(?:\.\d+)?", value)

    if not match:
        return None

    try:
        return float(match.group(0).replace(",", ""))
    except ValueError:
        return None


def recent_enough(value: str, days: int = RECENT_DAYS) -> bool:
    parsed = parse_date(value)
    if not parsed:
        return True

    dt = datetime.fromisoformat(parsed).date()
    return dt >= (datetime.now().date() - timedelta(days=days))


@dataclass
class FinancialMetric:
    label: str
    values: list[str] = field(default_factory=list)
    source: str = ""
    confidence: str = "low"


@dataclass
class IssueRecord:
    slug: str
    company: str
    board: str = "Unclassified"
    securityType: str = ""
    status: str = "Research"
    openDate: str = ""
    closeDate: str = ""
    allotmentDate: str = ""
    listingDate: str = ""
    priceBand: str = ""
    issuePrice: str = ""
    lotSize: str = ""
    faceValue: str = ""
    issueSize: str = ""
    freshIssue: str = ""
    offerForSale: str = ""
    exchange: str = ""
    subscription: str = ""
    subscriptionRetail: str = ""
    subscriptionQib: str = ""
    subscriptionNii: str = ""
    listedPrice: str = ""
    listingDayClose: str = ""
    listingGain: str = ""
    ltp: str = ""
    returnSinceIssue: str = ""
    sebiFilingDate: str = ""
    sebiFilingType: str = ""
    sebiPageUrl: str = ""
    prospectusUrl: str = ""
    financialPeriods: list[str] = field(default_factory=list)
    financials: list[FinancialMetric] = field(default_factory=list)
    financialExtractionStatus: str = "not_available"
    sourceLabels: list[str] = field(default_factory=list)
    sourceUrls: list[str] = field(default_factory=list)
    sourceUpdatedAt: str = ""
    warnings: list[str] = field(default_factory=list)

    def merge_source(self, label: str, url: str) -> None:
        if label and label not in self.sourceLabels:
            self.sourceLabels.append(label)
        if url and url not in self.sourceUrls:
            self.sourceUrls.append(url)


class Http:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.nse_warmed = False

    def warm_nse(self) -> None:
        if self.nse_warmed:
            return
        try:
            self.session.get(NSE_HOME, timeout=HTTP_TIMEOUT)
        except requests.RequestException:
            pass
        self.nse_warmed = True

    def get(
        self,
        url: str,
        *,
        nse: bool = False,
        binary: bool = False,
        attempts: int = 3,
    ) -> requests.Response:
        if nse:
            self.warm_nse()

        last: Exception | None = None

        for attempt in range(attempts):
            try:
                response = self.session.get(
                    url,
                    timeout=HTTP_TIMEOUT,
                    allow_redirects=True,
                )

                if response.status_code in (401, 403, 429) and nse:
                    self.nse_warmed = False
                    self.warm_nse()

                response.raise_for_status()
                return response
            except requests.RequestException as exc:
                last = exc
                time.sleep(1.2 * (attempt + 1))

        raise RuntimeError(f"GET failed for {url}: {last}")


HTTP = Http()


def table_rows(html: str) -> list[list[str]]:
    soup = BeautifulSoup(html, "html.parser")
    rows: list[list[str]] = []

    for tr in soup.find_all("tr"):
        cells = [
            clean(cell.get_text(" ", strip=True))
            for cell in tr.find_all(["th", "td"])
        ]
        if cells:
            rows.append(cells)

    return rows


def find_header_index(headers: list[str], candidates: Iterable[str]) -> int:
    lower = [h.lower() for h in headers]

    for candidate in candidates:
        for idx, header in enumerate(lower):
            if candidate.lower() in header:
                return idx

    return -1


def parse_nse_issue_board() -> tuple[list[dict[str, str]], list[str]]:
    warnings: list[str] = []

    try:
        response = HTTP.get(NSE_ISSUES, nse=True)
    except Exception as exc:
        return [], [f"NSE issue board unavailable: {exc}"]

    rows = table_rows(response.text)
    records: list[dict[str, str]] = []

    for index, row in enumerate(rows):
        joined = " | ".join(row).lower()

        if (
            "company name" not in joined
            or "issue start date" not in joined
            or "issue end date" not in joined
        ):
            continue

        headers = row
        company_i = find_header_index(headers, ["company name"])
        security_i = find_header_index(headers, ["security type"])
        start_i = find_header_index(headers, ["issue start date", "start date"])
        end_i = find_header_index(headers, ["issue end date", "end date"])
        status_i = find_header_index(headers, ["status"])
        offered_i = find_header_index(headers, ["offered", "reserved"])
        bids_i = find_header_index(headers, ["bids"])
        subscription_i = find_header_index(headers, ["subscription"])

        for data in rows[index + 1 :]:
            if len(data) <= company_i or company_i < 0:
                continue

            company = data[company_i] if company_i < len(data) else ""
            if not company or "company name" in company.lower():
                continue

            start = data[start_i] if 0 <= start_i < len(data) else ""
            end = data[end_i] if 0 <= end_i < len(data) else ""
            status = data[status_i] if 0 <= status_i < len(data) else ""

            if not start and not end and not status:
                continue

            records.append(
                {
                    "company": company,
                    "securityType": (
                        data[security_i]
                        if 0 <= security_i < len(data)
                        else next(
                            (
                                cell
                                for cell in data[:4]
                                if clean(cell).upper()
                                in ("EQ", "SME")
                            ),
                            "",
                        )
                    ),
                    "openDate": start,
                    "closeDate": end,
                    "status": status,
                    "offered": data[offered_i]
                    if 0 <= offered_i < len(data)
                    else "",
                    "bids": data[bids_i] if 0 <= bids_i < len(data) else "",
                    "subscription": data[subscription_i]
                    if 0 <= subscription_i < len(data)
                    else "",
                }
            )

        if records:
            break

    if not records:
        # NSE frequently hydrates its table client-side. Search embedded JSON
        # without relying on undocumented private endpoints.
        soup = BeautifulSoup(response.text, "html.parser")

        for script in soup.find_all("script"):
            raw = script.string or script.get_text()
            if not raw or "Issue Start Date" not in raw:
                continue

            for match in re.finditer(
                r'"(?:companyName|company)"\s*:\s*"([^"]+)"'
                r'[\s\S]{0,1200}?'
                r'"(?:issueStartDate|startDate)"\s*:\s*"([^"]+)"'
                r'[\s\S]{0,800}?'
                r'"(?:issueEndDate|endDate)"\s*:\s*"([^"]+)"',
                raw,
                flags=re.I,
            ):
                records.append(
                    {
                        "company": clean(match.group(1)),
                        "openDate": clean(match.group(2)),
                        "closeDate": clean(match.group(3)),
                        "status": "",
                        "securityType": "",
                        "subscription": "",
                    }
                )

    if not records:
        warnings.append(
            "NSE issue-board HTML contained no parseable issue rows. "
            "SEBI/BSE sources will still populate the dashboard."
        )

    return records, warnings


def parse_nse_tracker() -> tuple[list[dict[str, str]], list[str]]:
    warnings: list[str] = []

    try:
        response = HTTP.get(NSE_TRACKER, nse=True)
    except Exception as exc:
        return [], [f"NSE IPO Tracker unavailable: {exc}"]

    rows = table_rows(response.text)
    records: list[dict[str, str]] = []

    for index, row in enumerate(rows):
        joined = " | ".join(row).lower()
        if (
            "company name" not in joined
            or "issue price" not in joined
            or "listed on" not in joined
        ):
            continue

        headers = row
        indexes = {
            "company": find_header_index(headers, ["company name"]),
            "symbol": find_header_index(headers, ["symbol"]),
            "listedOn": find_header_index(headers, ["listed on"]),
            "issuePrice": find_header_index(headers, ["issue price"]),
            "listingClose": find_header_index(
                headers,
                ["listing day close"],
            ),
            "listingGain": find_header_index(
                headers,
                ["listing day gain", "gain/loss"],
            ),
            "ltp": find_header_index(headers, ["ltp"]),
        }

        for data in rows[index + 1 :]:
            company_i = indexes["company"]
            if company_i < 0 or company_i >= len(data):
                continue

            company = data[company_i]
            if not company or "company name" in company.lower():
                continue

            row_record: dict[str, str] = {"company": company}

            for key, idx in indexes.items():
                if key == "company":
                    continue
                row_record[key] = data[idx] if 0 <= idx < len(data) else ""

            if recent_enough(row_record.get("listedOn", "")):
                records.append(row_record)

        if records:
            break

    if not records:
        warnings.append("NSE IPO Tracker had no parseable recent rows.")

    return records, warnings


def infer_sebi_filing_type(title: str, fallback: str = "") -> str:
    lower = clean(title).lower()

    if "drhp" in lower or "draft offer" in lower:
        if "corrigendum" in lower:
            return "DRHP Corrigendum"
        if "addendum" in lower:
            return "DRHP Addendum"
        return "DRHP"

    if "rhp" in lower or "red herring" in lower:
        if "corrigendum" in lower:
            return "RHP Corrigendum"
        if "addendum" in lower:
            return "RHP Addendum"
        return "RHP"

    if "prospectus" in lower:
        return "Prospectus"

    return clean(fallback) or "Public Issue Filing"


def filing_rank(value: str) -> int:
    upper = clean(value).upper()

    if "PROSPECTUS" in upper and "DRHP" not in upper:
        return 40
    if "RHP" in upper and "DRHP" not in upper:
        return 30
    if "DRHP" in upper:
        return 10

    return 0


def is_draft_filing(value: str) -> bool:
    return "DRHP" in clean(value).upper()


def is_final_offer_filing(value: str) -> bool:
    upper = clean(value).upper()

    if "DRHP" in upper:
        return False

    return (
        "RHP" in upper
        or "PROSPECTUS" in upper
    )


def has_market_source(record: IssueRecord) -> bool:
    return any(
        label in record.sourceLabels
        for label in (
            SOURCE_LABELS["nse_issue_board"],
            SOURCE_LABELS["nse_ipo_tracker"],
        )
    )


def parse_sebi_listing(
    url: str,
    filing_type: str,
) -> tuple[list[dict[str, str]], list[str]]:
    warnings: list[str] = []

    try:
        response = HTTP.get(url)
    except Exception as exc:
        return [], [f"SEBI {filing_type} listing unavailable: {exc}"]

    soup = BeautifulSoup(response.text, "html.parser")
    results: list[dict[str, str]] = []

    for tr in soup.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 2:
            continue

        texts = [clean(cell.get_text(" ", strip=True)) for cell in cells]
        date_text = next(
            (
                value
                for value in texts
                if re.search(r"\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b", value)
            ),
            "",
        )

        if date_text and not recent_enough(date_text):
            continue

        link = tr.find("a", href=True)
        if not link:
            continue

        title = clean(link.get_text(" ", strip=True))
        href = urljoin("https://www.sebi.gov.in/", link["href"])

        if not title or "/filings/public-issues/" not in href:
            continue

        company = re.sub(
            r"\s*[-–]\s*(?:addendum to |corrigendum to )?"
            r"(?:u?drhp|drhp|rhp|prospectus).*$",
            "",
            title,
            flags=re.I,
        )
        company = re.sub(
            r"\b(?:draft\s+)?abridged\s+prospectus\b.*$",
            "",
            company,
            flags=re.I,
        ).strip(" -–")

        results.append(
            {
                "company": company or title,
                "title": title,
                "date": date_text,
                "pageUrl": href,
                "filingType": infer_sebi_filing_type(
                    title,
                    filing_type,
                ),
            }
        )

    unique: dict[str, dict[str, str]] = {}

    for item in results:
        key = item["pageUrl"]
        unique.setdefault(key, item)

    parsed = list(unique.values())[:MAX_SEBI_DETAIL_PAGES]

    if not parsed:
        warnings.append(f"SEBI {filing_type} page had no parseable filing rows.")

    return parsed, warnings


def parse_bse_summary() -> tuple[list[dict[str, str]], list[str]]:
    warnings: list[str] = []

    try:
        response = HTTP.get(BSE_SUMMARY)
    except Exception as exc:
        return [], [f"BSE issue summary unavailable: {exc}"]

    soup = BeautifulSoup(response.text, "html.parser")
    results: list[dict[str, str]] = []

    for tr in soup.find_all("tr"):
        cells = [clean(c.get_text(" ", strip=True)) for c in tr.find_all("td")]
        if not cells:
            continue

        company = cells[0]
        if (
            not company
            or company.lower() == "company name"
            or len(company) < 3
        ):
            continue

        links = [
            urljoin(BSE_SUMMARY, a["href"])
            for a in tr.find_all("a", href=True)
        ]

        results.append(
            {
                "company": company,
                "detailUrls": links,
            }
        )

    if not results:
        warnings.append("BSE issue summary had no parseable company rows.")

    return results[:250], warnings


def sebi_detail(item: dict[str, str]) -> tuple[dict[str, str], list[str]]:
    warnings: list[str] = []
    result = dict(item)

    try:
        response = HTTP.get(item["pageUrl"])
    except Exception as exc:
        warnings.append(f"SEBI filing detail failed for {item['company']}: {exc}")
        return result, warnings

    soup = BeautifulSoup(response.text, "html.parser")
    pdf_links: list[tuple[str, str]] = []

    for a in soup.find_all("a", href=True):
        href = urljoin(item["pageUrl"], a["href"])
        label = clean(a.get_text(" ", strip=True))

        if ".pdf" not in href.lower():
            continue

        pdf_links.append((label, href))

    preferred = next(
        (
            pair
            for pair in pdf_links
            if "abridged" in pair[0].lower()
        ),
        None,
    )

    if not preferred:
        preferred = next(
            (
                pair
                for pair in pdf_links
                if any(
                    token in pair[0].lower()
                    for token in ("rhp", "prospectus", "drhp")
                )
            ),
            None,
        )

    if preferred:
        result["prospectusLabel"] = preferred[0]
        result["prospectusUrl"] = preferred[1]

    return result, warnings


def pdf_text(url: str, company: str) -> tuple[str, list[str]]:
    warnings: list[str] = []

    if not url:
        return "", warnings

    CACHE.mkdir(parents=True, exist_ok=True)
    name = hashlib.sha256(url.encode("utf-8")).hexdigest()[:24] + ".pdf"
    cached = CACHE / name

    try:
        if cached.exists():
            data = cached.read_bytes()
        else:
            response = HTTP.get(url, binary=True)
            data = response.content

            if len(data) > MAX_PDF_MB * 1024 * 1024:
                warnings.append(
                    f"Prospectus skipped for {company}: PDF exceeds "
                    f"{MAX_PDF_MB} MB."
                )
                return "", warnings

            if not data.startswith(b"%PDF"):
                warnings.append(
                    f"Prospectus skipped for {company}: response is not PDF."
                )
                return "", warnings

            cached.write_bytes(data)

        reader = PdfReader(io.BytesIO(data))
        chunks: list[str] = []

        # Abridged prospectuses are typically compact. For full prospectuses,
        # focus on the first 140 pages to keep CI predictable.
        for page in reader.pages[:140]:
            try:
                chunks.append(page.extract_text() or "")
            except Exception:
                continue

        return "\n".join(chunks), warnings
    except Exception as exc:
        warnings.append(f"Prospectus extraction failed for {company}: {exc}")
        return "", warnings


def parse_decimal(value: str) -> float | None:
    raw = clean(value).replace(",", "")

    if not re.fullmatch(r"\d+(?:\.\d+)?", raw):
        return None

    try:
        return float(raw)
    except ValueError:
        return None


def format_number(value: float) -> str:
    if value.is_integer():
        return f"{int(value):,}"

    return f"{value:,.2f}".rstrip("0").rstrip(".")


def format_rupee_crore(amount: str, unit: str) -> str:
    numeric = parse_decimal(amount)
    normalized_unit = clean(unit).lower()

    if numeric is None or numeric <= 0:
        return ""

    if normalized_unit.startswith("crore"):
        crore = numeric
    elif normalized_unit.startswith("million"):
        crore = numeric / 10
    elif normalized_unit.startswith("lakh"):
        crore = numeric / 100
    elif normalized_unit.startswith("billion"):
        crore = numeric * 100
    else:
        # Never publish an alleged monetary issue size without a unit.
        return ""

    if crore <= 0 or crore > 100000:
        return ""

    return "\u20b9" + format_number(crore) + " Cr"


def valid_price_band(low: str, high: str) -> str:
    low_value = parse_decimal(low)
    high_value = parse_decimal(high)

    if low_value is None or high_value is None:
        return ""

    if not (1 <= low_value <= high_value <= 100000):
        return ""

    return (
        "\u20b9"
        + format_number(low_value)
        + " \u2013 \u20b9"
        + format_number(high_value)
    )


def valid_lot_size(value: str) -> str:
    numeric = parse_decimal(value)

    if numeric is None or not numeric.is_integer():
        return ""

    if not (1 <= numeric <= 1000000):
        return ""

    return str(int(numeric))


def valid_face_value(value: str) -> str:
    numeric = parse_decimal(value)

    if numeric is None or not (0.1 <= numeric <= 100):
        return ""

    return "\u20b9" + format_number(numeric)


def extract_issue_details(text: str) -> dict[str, str]:
    if not text:
        return {}

    normalized = repair_mojibake(text)
    normalized = re.sub(r"[ \t]+", " ", normalized)
    result: dict[str, str] = {}

    currency = r"(?:\u20b9|rs\.?|inr)?"
    number = r"(\d[\d,]*(?:\.\d+)?)"
    unit = r"(crore|crores|million|millions|lakh|lakhs|billion|billions)"

    price_patterns = [
        rf"price\s+band.{{0,160}}?{currency}\s*{number}"
        rf"\s*(?:to|[-\u2013\u2014])\s*{currency}\s*{number}",
        rf"floor\s+price.{{0,120}}?{currency}\s*{number}"
        rf".{{0,180}}?cap\s+price.{{0,120}}?{currency}\s*{number}",
        rf"price\s+band\s+of\s+{currency}\s*{number}"
        rf"\s*(?:to|[-\u2013\u2014])\s*{currency}\s*{number}",
    ]

    for pattern in price_patterns:
        match = re.search(pattern, normalized, flags=re.I | re.S)

        if match:
            price_band = valid_price_band(
                match.group(1),
                match.group(2),
            )
            if price_band:
                result["priceBand"] = price_band
                break

    lot_patterns = [
        r"minimum\s+(?:bid\s+)?lot.{0,140}?(\d[\d,]*)"
        r"\s+(?:equity\s+)?shares",
        r"minimum\s+(?:application|bid).{0,140}?(\d[\d,]*)"
        r"\s+(?:equity\s+)?shares",
        r"bids?\s+(?:can|may)\s+be\s+made.{0,170}?"
        r"(?:minimum\s+of\s+)?(\d[\d,]*)\s+(?:equity\s+)?shares",
    ]

    for pattern in lot_patterns:
        match = re.search(pattern, normalized, flags=re.I | re.S)

        if match:
            lot = valid_lot_size(match.group(1))
            if lot:
                result["lotSize"] = lot
                break

    face_patterns = [
        rf"face\s+value.{{0,120}}?{currency}\s*{number}",
    ]

    for pattern in face_patterns:
        match = re.search(pattern, normalized, flags=re.I | re.S)

        if match:
            face = valid_face_value(match.group(1))
            if face:
                result["faceValue"] = face
                break

    monetary_patterns: dict[str, list[str]] = {
        "issueSize": [
            rf"(?:total\s+)?(?:issue|offer)\s+size.{{0,220}}?"
            rf"{currency}\s*{number}\s*{unit}",
            rf"(?:aggregate|aggregating)\s+(?:up\s+)?to.{{0,160}}?"
            rf"{currency}\s*{number}\s*{unit}",
        ],
        "freshIssue": [
            rf"fresh\s+issue.{{0,240}}?"
            rf"{currency}\s*{number}\s*{unit}",
            rf"fresh\s+issue.{{0,240}}?(?:aggregate|aggregating)"
            rf".{{0,100}}?{currency}\s*{number}\s*{unit}",
        ],
        "offerForSale": [
            rf"offer\s+for\s+sale.{{0,240}}?"
            rf"{currency}\s*{number}\s*{unit}",
            rf"offer\s+for\s+sale.{{0,240}}?(?:aggregate|aggregating)"
            rf".{{0,100}}?{currency}\s*{number}\s*{unit}",
        ],
    }

    for key, patterns in monetary_patterns.items():
        for pattern in patterns:
            match = re.search(pattern, normalized, flags=re.I | re.S)

            if not match:
                continue

            formatted = format_rupee_crore(
                match.group(1),
                match.group(2),
            )

            if formatted:
                result[key] = formatted
                break

    date_patterns = {
        "openDate": [
            r"(?:bid|issue)\s*/?\s*offer\s+opens?.{0,140}?"
            r"([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
            r"issue\s+opening\s+date.{0,120}?"
            r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",
            r"opening\s+date.{0,120}?"
            r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",
        ],
        "closeDate": [
            r"(?:bid|issue)\s*/?\s*offer\s+closes?.{0,140}?"
            r"([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
            r"issue\s+closing\s+date.{0,120}?"
            r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",
            r"closing\s+date.{0,120}?"
            r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",
        ],
    }

    for key, variants in date_patterns.items():
        for pattern in variants:
            match = re.search(pattern, normalized, flags=re.I | re.S)

            if match:
                result[key] = date_display(match.group(1))
                break

    return result


def detect_board_from_text(text: str) -> str:
    if not text:
        return ""

    lower = clean(text[:500000]).lower()

    sme_markers = (
        "nse emerge",
        "bse sme",
        "sme platform",
        "sme exchange",
        "small and medium enterprises platform",
        "emerge platform of nse",
    )

    if any(marker in lower for marker in sme_markers):
        return "SME"

    mainboard_markers = (
        "main board of bse",
        "main board of nse",
        "mainboard of bse",
        "mainboard of nse",
        "main board of the stock exchanges",
    )

    if any(marker in lower for marker in mainboard_markers):
        return "Mainboard"

    # Mainboard RHPs commonly name both full exchanges, while SME documents
    # identify Emerge/BSE SME explicitly. Only apply this after the SME check.
    if (
        "bse limited" in lower
        and "national stock exchange of india limited" in lower
    ):
        return "Mainboard"

    return ""



def extract_periods(text: str) -> list[str]:
    if not text:
        return []

    candidates: list[str] = []

    for match in re.finditer(
        r"(?:March\s+31,?\s+20\d{2}|20\d{2}\s*[-–]\s*\d{2})",
        text,
        flags=re.I,
    ):
        value = clean(match.group(0))
        if value not in candidates:
            candidates.append(value)
        if len(candidates) >= 5:
            break

    return candidates[:4]


def metric_values_from_line(line: str) -> list[str]:
    values = re.findall(
        r"(?<!\d)(?:\(?-?\d[\d,]*(?:\.\d+)?\)?)(?!\d)",
        line,
    )

    clean_values: list[str] = []

    for value in values:
        raw = value.replace(",", "").strip("()")
        try:
            numeric = float(raw)
        except ValueError:
            continue

        # Drop obvious years.
        if numeric.is_integer() and 1990 <= numeric <= 2100:
            continue

        clean_values.append(value)

    return clean_values[:5]


def extract_financials(
    text: str,
    source_url: str,
) -> tuple[list[str], list[FinancialMetric], str]:
    if not text:
        return [], [], "not_available"

    periods = extract_periods(text)
    lines = [clean(line) for line in text.splitlines() if clean(line)]

    aliases: list[tuple[str, list[str]]] = [
        (
            "Revenue from operations",
            [
                "revenue from operations",
                "revenue from operation",
                "revenue",
            ],
        ),
        (
            "Profit after tax",
            [
                "profit after tax",
                "profit for the year",
                "profit for the period",
            ],
        ),
        (
            "Total assets",
            ["total assets"],
        ),
        (
            "Net worth",
            ["net worth", "networth"],
        ),
        (
            "Total borrowings",
            [
                "total borrowings",
                "total debt",
                "borrowings",
            ],
        ),
        (
            "Earnings per share",
            [
                "earnings per share",
                "basic eps",
                "basic earning per share",
            ],
        ),
        (
            "Return on net worth",
            [
                "return on net worth",
                "ronw",
            ],
        ),
        (
            "Net asset value",
            [
                "net asset value",
                "nav per equity share",
            ],
        ),
    ]

    metrics: list[FinancialMetric] = []

    for label, terms in aliases:
        selected: list[str] = []

        for index, line in enumerate(lines):
            lower = line.lower()
            if not any(term in lower for term in terms):
                continue

            window = " ".join(lines[index:index + 3])
            values = metric_values_from_line(window)

            if len(values) >= 2:
                selected = values
                break

        if selected:
            metrics.append(
                FinancialMetric(
                    label=label,
                    values=selected,
                    source=source_url,
                    confidence="medium",
                )
            )

    status = (
        "auto_extracted_verify_with_prospectus"
        if metrics
        else "prospectus_found_financial_table_not_normalized"
    )

    return periods, metrics, status


def board_from_security(value: str, company: str = "") -> str:
    text = f"{value} {company}".lower()

    if "sme" in text or "emerge" in text:
        return "SME"

    # NSE's public-issue page identifies Mainboard equity issues as EQ.
    if re.search(r"\beq\b", text) or "mainboard" in text or "main board" in text:
        return "Mainboard"

    return "Unclassified"


def status_from_dates(
    open_date: str,
    close_date: str,
    listing_date: str,
    explicit: str = "",
) -> str:
    lower = explicit.lower()

    if "active" in lower or lower == "open":
        return "Open"
    if "upcoming" in lower:
        return "Upcoming"
    if "listed" in lower:
        return "Listed"

    today = datetime.now().date()
    open_parsed = parse_date(open_date)
    close_parsed = parse_date(close_date)
    listing_parsed = parse_date(listing_date)

    open_day = (
        datetime.fromisoformat(open_parsed).date()
        if open_parsed
        else None
    )
    close_day = (
        datetime.fromisoformat(close_parsed).date()
        if close_parsed
        else None
    )
    listing_day = (
        datetime.fromisoformat(listing_parsed).date()
        if listing_parsed
        else None
    )

    if open_day and close_day and open_day <= today <= close_day:
        return "Open"
    if open_day and today < open_day:
        return "Upcoming"
    if listing_day and today >= listing_day:
        return "Listed"
    if close_day and today > close_day:
        return "Closed"

    return clean(explicit) or "Research"


def choose_record(
    records: dict[str, IssueRecord],
    company: str,
) -> IssueRecord:
    key = key_company(company)

    if key in records:
        return records[key]

    # Match common naming variations conservatively.
    best_key = ""
    for existing_key in records:
        if len(key) >= 7 and (
            key in existing_key or existing_key in key
        ):
            best_key = existing_key
            break

    if best_key:
        return records[best_key]

    slug = slugify(company)
    record = IssueRecord(slug=slug, company=clean(company))
    records[key] = record
    return record


def apply_if_empty(record: IssueRecord, field_name: str, value: str) -> None:
    value = clean(value)
    if value and not clean(getattr(record, field_name)):
        setattr(record, field_name, value)


def build_dataset() -> dict[str, Any]:
    warnings: list[str] = []
    records: dict[str, IssueRecord] = {}

    nse_issues, source_warnings = parse_nse_issue_board()
    warnings.extend(source_warnings)

    for item in nse_issues:
        record = choose_record(records, item["company"])
        record.securityType = clean(item.get("securityType"))
        record.board = board_from_security(
            record.securityType,
            record.company,
        )
        apply_if_empty(record, "openDate", date_display(item.get("openDate", "")))
        apply_if_empty(record, "closeDate", date_display(item.get("closeDate", "")))
        apply_if_empty(record, "subscription", item.get("subscription", ""))
        record.status = status_from_dates(
            record.openDate,
            record.closeDate,
            record.listingDate,
            item.get("status", ""),
        )
        record.merge_source(SOURCE_LABELS["nse_issue_board"], NSE_ISSUES)

    nse_tracker, source_warnings = parse_nse_tracker()
    warnings.extend(source_warnings)

    for item in nse_tracker:
        record = choose_record(records, item["company"])
        apply_if_empty(record, "listingDate", date_display(item.get("listedOn", "")))
        apply_if_empty(record, "issuePrice", item.get("issuePrice", ""))
        apply_if_empty(record, "listingDayClose", item.get("listingClose", ""))
        apply_if_empty(record, "listingGain", item.get("listingGain", ""))
        apply_if_empty(record, "ltp", item.get("ltp", ""))
        record.status = "Listed"
        record.merge_source(SOURCE_LABELS["nse_ipo_tracker"], NSE_TRACKER)

    sebi_items: list[dict[str, str]] = []

    for listing_url, filing_type, source_key in (
        (SEBI_RHP, "RHP/Prospectus", "sebi_rhp"),
        (SEBI_DRHP, "DRHP", "sebi_drhp"),
    ):
        items, source_warnings = parse_sebi_listing(
            listing_url,
            filing_type,
        )
        warnings.extend(source_warnings)

        for item in items:
            item["sourceKey"] = source_key
            sebi_items.append(item)

    # Prefer recent RHP/Prospectus over DRHP for enrichment.
    seen_pages: set[str] = set()

    for item in sebi_items:
        if item["pageUrl"] in seen_pages:
            continue
        seen_pages.add(item["pageUrl"])

        detail, detail_warnings = sebi_detail(item)
        warnings.extend(detail_warnings)

        record = choose_record(records, detail["company"])
        record.sebiFilingDate = (
            record.sebiFilingDate or date_display(detail.get("date", ""))
        )
        incoming_filing_type = clean(detail.get("filingType"))

        if (
            filing_rank(incoming_filing_type)
            >= filing_rank(record.sebiFilingType)
        ):
            record.sebiFilingType = incoming_filing_type
            record.sebiPageUrl = detail.get("pageUrl", "") or record.sebiPageUrl
            record.prospectusUrl = (
                detail.get("prospectusUrl", "")
                or record.prospectusUrl
            )
        record.merge_source(
            SOURCE_LABELS[item["sourceKey"]],
            detail["pageUrl"],
        )

        if detail.get("prospectusUrl"):
            record.merge_source(
                "SEBI prospectus document",
                detail["prospectusUrl"],
            )

        final_offer_filing = is_final_offer_filing(
            incoming_filing_type
        )

        should_extract = bool(detail.get("prospectusUrl"))

        if should_extract and not record.financials:
            text, pdf_warnings = pdf_text(
                detail["prospectusUrl"],
                record.company,
            )
            warnings.extend(pdf_warnings)

            issue_details = extract_issue_details(text)

            if record.board == "Unclassified":
                prospectus_board = detect_board_from_text(text)
                if prospectus_board:
                    record.board = prospectus_board

            # Offer dates / price band / lot / monetary issue size only belong
            # in the market table when the document is an RHP/final prospectus.
            if final_offer_filing:
                for field_name in (
                    "priceBand",
                    "lotSize",
                    "faceValue",
                    "issueSize",
                    "freshIssue",
                    "offerForSale",
                    "openDate",
                    "closeDate",
                ):
                    apply_if_empty(
                        record,
                        field_name,
                        issue_details.get(field_name, ""),
                    )
            else:
                # A DRHP may still be useful for research/financials, but it
                # must not manufacture market dates or an issue price.
                apply_if_empty(
                    record,
                    "faceValue",
                    issue_details.get("faceValue", ""),
                )

            periods, financials, extraction_status = extract_financials(
                text,
                detail["prospectusUrl"],
            )

            if financials:
                record.financialPeriods = periods
                record.financials = financials

            record.financialExtractionStatus = extraction_status

        if (
            is_draft_filing(incoming_filing_type)
            and not has_market_source(record)
        ):
            record.status = "Research"
            record.openDate = ""
            record.closeDate = ""
            record.listingDate = ""
            record.priceBand = ""
            record.lotSize = ""
            record.issueSize = ""
        else:
            record.status = status_from_dates(
                record.openDate,
                record.closeDate,
                record.listingDate,
                record.status,
            )

        record.status = status_from_dates(
            record.openDate,
            record.closeDate,
            record.listingDate,
            record.status,
        )

    bse_items, source_warnings = parse_bse_summary()
    warnings.extend(source_warnings)

    for item in bse_items:
        record = choose_record(records, item["company"])
        if item.get("detailUrls"):
            record.merge_source(
                SOURCE_LABELS["bse_issue_summary"],
                item["detailUrls"][0],
            )
        else:
            record.merge_source(
                SOURCE_LABELS["bse_issue_summary"],
                BSE_SUMMARY,
            )

    result_records = list(records.values())

    for record in result_records:
        if (
            is_draft_filing(record.sebiFilingType)
            and not has_market_source(record)
        ):
            record.status = "Research"
            record.openDate = ""
            record.closeDate = ""
            record.listingDate = ""
            record.priceBand = ""
            record.lotSize = ""
            record.issueSize = ""
        else:
            record.status = status_from_dates(
                record.openDate,
                record.closeDate,
                record.listingDate,
                record.status,
            )

        # Last-line validation: malformed extraction must become unavailable.
        if record.priceBand:
            band_match = re.fullmatch(
                r"₹([\d,]+(?:\.\d+)?)\s+[–-]\s+"
                r"₹([\d,]+(?:\.\d+)?)",
                clean(record.priceBand),
            )
            record.priceBand = (
                valid_price_band(
                    band_match.group(1),
                    band_match.group(2),
                )
                if band_match
                else ""
            )

        if record.lotSize:
            record.lotSize = valid_lot_size(record.lotSize)

        if record.issueSize and not re.fullmatch(
            r"₹[\d,.]+\s+Cr",
            clean(record.issueSize),
            flags=re.I,
        ):
            record.issueSize = ""

        record.sourceUpdatedAt = now_utc_iso()

        if record.financialExtractionStatus.startswith("auto_extracted"):
            record.warnings.append(
                "Financial metrics were auto-extracted from prospectus text "
                "and must be verified against the linked filing."
            )

    status_order = {
        "Open": 0,
        "Upcoming": 1,
        "Closed": 2,
        "Listed": 3,
        "Research": 4,
    }

    result_records.sort(
        key=lambda r: (
            status_order.get(r.status, 9),
            r.company.lower(),
        )
    )

    # Keep useful current/recent records and recent SEBI research candidates.
    filtered: list[IssueRecord] = []

    for record in result_records:
        if record.status in ("Open", "Upcoming"):
            filtered.append(record)
            continue

        if (
            recent_enough(record.listingDate)
            or recent_enough(record.closeDate)
            or recent_enough(record.sebiFilingDate)
        ):
            filtered.append(record)

    source_health = {
        "nseIssueBoardRecords": len(nse_issues),
        "nseTrackerRecords": len(nse_tracker),
        "sebiFilingRecords": len(sebi_items),
        "bseIssueSummaryRecords": len(bse_items),
    }

    return {
        "schemaVersion": 1,
        "generatedAt": now_utc_iso(),
        "timezone": "Asia/Kolkata",
        "sourceHealth": source_health,
        "sources": [
            {
                "name": "NSE public issue board",
                "url": NSE_ISSUES,
                "purpose": "current/upcoming issue dates and subscription",
            },
            {
                "name": "NSE IPO Tracker",
                "url": NSE_TRACKER,
                "purpose": "recent listing and issue-price performance",
            },
            {
                "name": "SEBI public issue filings",
                "url": SEBI_RHP,
                "purpose": "RHP/prospectus documents and filing dates",
            },
            {
                "name": "SEBI draft public issue filings",
                "url": SEBI_DRHP,
                "purpose": "DRHP pipeline / future issue research",
            },
            {
                "name": "BSE issue summary",
                "url": BSE_SUMMARY,
                "purpose": "issue discovery and source cross-check",
            },
        ],
        "policy": {
            "gmp": (
                "Not populated automatically because GMP is an unofficial "
                "grey-market indicator and is not published by the official "
                "exchange/regulatory sources used by this pipeline."
            ),
            "financials": (
                "Financial tables are best-effort text extraction from linked "
                "SEBI prospectus documents. Displayed auto-extracted values "
                "must be verified against the source filing."
            ),
        },
        "warnings": sorted(set(warnings))[:80],
        "issues": [asdict(record) for record in filtered],
    }


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    dataset = build_dataset()
    temp = OUT.with_suffix(".json.tmp")

    temp.write_text(
        json.dumps(dataset, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    temp.replace(OUT)

    health = dataset["sourceHealth"]
    print("")
    print("CredoNomics IPO Auto Fetch")
    print("==========================")
    print(f"Generated: {dataset['generatedAt']}")
    print(f"Issues: {len(dataset['issues'])}")
    print(f"NSE issue rows: {health['nseIssueBoardRecords']}")
    print(f"NSE tracker rows: {health['nseTrackerRecords']}")
    print(f"SEBI filings: {health['sebiFilingRecords']}")
    print(f"BSE summary rows: {health['bseIssueSummaryRecords']}")
    print(f"Warnings: {len(dataset['warnings'])}")

    if not dataset["issues"]:
        print(
            "ERROR: no IPO records were produced from any official source.",
            file=sys.stderr,
        )
        return 2

    # Do not fail merely because one source is temporarily unavailable.
    # Multi-source redundancy is intentional.
    active_sources = sum(
        1
        for value in health.values()
        if isinstance(value, int) and value > 0
    )

    if active_sources < 2:
        print(
            "ERROR: fewer than two official source layers returned data; "
            "refusing to publish a weak refresh.",
            file=sys.stderr,
        )
        return 3

    return 0


if __name__ == "__main__":
    raise SystemExit(main())