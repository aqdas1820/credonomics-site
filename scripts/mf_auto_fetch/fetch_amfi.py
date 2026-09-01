from __future__ import annotations

import argparse
import json
import re
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dateutil.relativedelta import relativedelta
from playwright.sync_api import sync_playwright

AMFI_PORTFOLIO_URL = "https://www.amfiindia.com/online-center/portfolio-disclosure"
UA = "Mozilla/5.0 CredoNomics-MF-Research/1.0"

FILE_RE = re.compile(r"\.(xlsx?|csv|pdf)(?:$|[?#])", re.I)
MONTH_WORDS = {
    1: "january", 2: "february", 3: "march", 4: "april",
    5: "may", 6: "june", 7: "july", 8: "august",
    9: "september", 10: "october", 11: "november", 12: "december",
}

@dataclass
class DiscoveredFile:
    amc: str
    month: str
    url: str
    source: str = "AMFI"


def _safe_name(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9._-]+", "-", value.strip())
    return value.strip("-") or "file"


def _extract_urls(value, out: set[str]) -> None:
    if isinstance(value, str):
        if value.startswith(("http://", "https://")) and FILE_RE.search(value):
            out.add(value)
    elif isinstance(value, dict):
        for v in value.values():
            _extract_urls(v, out)
    elif isinstance(value, list):
        for v in value:
            _extract_urls(v, out)


def static_discovery(url: str = AMFI_PORTFOLIO_URL) -> set[str]:
    """Cheap first pass: HTML, Next.js payloads, and direct links."""
    urls: set[str] = set()
    r = requests.get(url, headers={"User-Agent": UA}, timeout=45)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")
    for a in soup.select("a[href]"):
        href = urljoin(url, a.get("href", ""))
        if FILE_RE.search(href):
            urls.add(href)

    for script in soup.select("script"):
        raw = script.string or script.get_text(" ", strip=False)
        if not raw:
            continue
        for match in re.findall(r'https?://[^"\'<>\s]+', raw):
            match = match.replace("\\u0026", "&").replace("\\/", "/")
            if FILE_RE.search(match):
                urls.add(match)
        try:
            _extract_urls(json.loads(raw), urls)
        except Exception:
            pass

    return urls


def _select_matching_option(select, needles: Iterable[str]) -> bool:
    try:
        options = select.locator("option").all()
        labels = [(o.get_attribute("value") or "", (o.inner_text() or "").strip()) for o in options]
        for value, label in labels:
            l = label.lower()
            if value and all(n.lower() in l for n in needles):
                select.select_option(value=value)
                return True
        for value, label in labels:
            l = label.lower()
            if value and any(n.lower() in l for n in needles):
                select.select_option(value=value)
                return True
    except Exception:
        return False
    return False


def browser_discovery(target_months: list[str], headless: bool = True) -> list[DiscoveredFile]:
    """
    Render AMFI's portfolio disclosure page and collect downloadable files.

    The routine is intentionally DOM-driven rather than tied to a private AMFI API.
    It tries to identify the AMC, disclosure-type, month and year selectors from
    their option labels, then iterates AMC choices. If AMFI changes markup, the
    static fallback and captured network URLs still provide a second route.
    """
    found: list[DiscoveredFile] = []
    seen: set[tuple[str, str, str]] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        page = browser.new_page(user_agent=UA, viewport={"width": 1500, "height": 1000})
        network_urls: set[str] = set()

        def on_response(resp):
            try:
                if FILE_RE.search(resp.url):
                    network_urls.add(resp.url)
                ctype = (resp.headers.get("content-type") or "").lower()
                if "json" in ctype and resp.request.resource_type in {"xhr", "fetch"}:
                    body = resp.json()
                    _extract_urls(body, network_urls)
            except Exception:
                pass

        page.on("response", on_response)
        page.goto(AMFI_PORTFOLIO_URL, wait_until="domcontentloaded", timeout=90000)
        page.wait_for_timeout(2500)

        selects = page.locator("select")
        select_count = selects.count()

        # Identify selectors heuristically.
        amc_index = None
        type_index = None
        month_index = None
        year_index = None

        for i in range(select_count):
            sel = selects.nth(i)
            try:
                labels = [(x.inner_text() or "").strip() for x in sel.locator("option").all()]
            except Exception:
                continue
            joined = " | ".join(labels).lower()
            if len(labels) >= 15 and ("mutual fund" in joined or "fund" in joined):
                amc_index = i if amc_index is None else amc_index
            if any(k in joined for k in ["monthly portfolio", "portfolio disclosure", "monthly disclosure"]):
                type_index = i
            if all(m in joined for m in ["january", "february", "march"]):
                month_index = i
            if any(str(y) in joined for y in range(2021, 2028)):
                year_index = i

        if type_index is not None:
            _select_matching_option(selects.nth(type_index), ["portfolio"])
            page.wait_for_timeout(1200)

        # Re-read selectors because the page may re-render after disclosure type.
        selects = page.locator("select")
        if amc_index is None or amc_index >= selects.count():
            # Last heuristic pass after re-render.
            for i in range(selects.count()):
                sel = selects.nth(i)
                labels = [(x.inner_text() or "").strip() for x in sel.locator("option").all()]
                joined = " | ".join(labels).lower()
                if len(labels) >= 15 and ("mutual fund" in joined or "fund" in joined):
                    amc_index = i
                    break

        amc_options: list[tuple[str, str]] = [("", "All AMCs")]
        if amc_index is not None:
            sel = selects.nth(amc_index)
            amc_options = []
            for opt in sel.locator("option").all():
                value = opt.get_attribute("value") or ""
                label = (opt.inner_text() or "").strip()
                if value and label and "select" not in label.lower():
                    amc_options.append((value, label))

        for month in target_months:
            year, mon = [int(x) for x in month.split("-")]
            month_name = MONTH_WORDS[mon]

            # Refresh selector references each loop.
            selects = page.locator("select")
            if month_index is not None and month_index < selects.count():
                _select_matching_option(selects.nth(month_index), [month_name])
            if year_index is not None and year_index < selects.count():
                _select_matching_option(selects.nth(year_index), [str(year)])
            page.wait_for_timeout(800)

            for amc_value, amc_name in amc_options:
                before = set(network_urls)
                if amc_index is not None:
                    selects = page.locator("select")
                    if amc_index < selects.count():
                        try:
                            selects.nth(amc_index).select_option(value=amc_value)
                        except Exception:
                            continue
                        page.wait_for_timeout(900)

                # Click obvious action buttons if present.
                for label in ["View", "Search", "Submit", "Go"]:
                    btn = page.get_by_role("button", name=re.compile(label, re.I))
                    if btn.count():
                        try:
                            btn.first.click(timeout=1500)
                            page.wait_for_timeout(1200)
                        except Exception:
                            pass

                urls: set[str] = set()
                for a in page.locator("a[href]").all():
                    try:
                        href = urljoin(AMFI_PORTFOLIO_URL, a.get_attribute("href") or "")
                        if FILE_RE.search(href):
                            urls.add(href)
                    except Exception:
                        pass
                urls.update(network_urls - before)

                for url in urls:
                    key = (amc_name, month, url)
                    if key not in seen:
                        seen.add(key)
                        found.append(DiscoveredFile(amc=amc_name, month=month, url=url))

        browser.close()

    return found


def download_files(files: list[DiscoveredFile], out_dir: Path) -> list[dict]:
    out_dir.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update({"User-Agent": UA, "Referer": AMFI_PORTFOLIO_URL})

    manifest: list[dict] = []
    for idx, item in enumerate(files, 1):
        parsed = urlparse(item.url)
        suffix = Path(parsed.path).suffix.lower() or ".bin"
        folder = out_dir / item.month / _safe_name(item.amc)
        folder.mkdir(parents=True, exist_ok=True)
        destination = folder / f"{idx:04d}{suffix}"

        status = "downloaded"
        error = ""
        try:
            r = session.get(item.url, timeout=90, allow_redirects=True)
            r.raise_for_status()
            destination.write_bytes(r.content)
        except Exception as exc:
            status = "error"
            error = str(exc)
            destination = Path("")

        row = asdict(item)
        row.update({
            "status": status,
            "path": str(destination) if destination else "",
            "error": error,
        })
        manifest.append(row)

    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return manifest


def requested_months(count: int) -> list[str]:
    from datetime import date
    base = date.today().replace(day=1)
    return [(base - relativedelta(months=i)).strftime("%Y-%m") for i in range(count)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--months", type=int, default=1, help="Current + previous months to discover.")
    parser.add_argument("--out", default="data/mf_raw")
    parser.add_argument("--headed", action="store_true")
    args = parser.parse_args()

    months = requested_months(max(1, args.months))
    discovered = browser_discovery(months, headless=not args.headed)

    # Keep static direct files too; month/amc can be resolved later from workbook content.
    try:
        for url in static_discovery():
            discovered.append(DiscoveredFile(amc="Unknown AMC", month=months[0], url=url))
    except Exception as exc:
        print(f"Static discovery warning: {exc}")

    dedup = {}
    for x in discovered:
        dedup[x.url] = x
    discovered = list(dedup.values())

    print(f"Discovered {len(discovered)} unique portfolio files.")
    manifest = download_files(discovered, Path(args.out))
    ok = sum(x["status"] == "downloaded" for x in manifest)
    print(f"Downloaded {ok}/{len(manifest)} files to {args.out}")


if __name__ == "__main__":
    main()
