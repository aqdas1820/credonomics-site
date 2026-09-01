from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_holdings(path: Path) -> list[dict]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, list) else data.get("holdings", [])


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--new", default="data/mf_normalized/latest.json")
    p.add_argument("--history", default="public/data/mf-intelligence/all.json")
    p.add_argument("--status", default="public/data/mf-intelligence/status.json")
    args = p.parse_args()

    history_path = Path(args.history)
    old = load_holdings(history_path)
    new = load_holdings(Path(args.new))

    combined = {}
    for h in old + new:
        key = (
            str(h.get("amc", "")).lower(),
            str(h.get("scheme", "")).lower(),
            str(h.get("month", "")),
            str(h.get("stock", "")).lower(),
            str(h.get("isin", "")).lower(),
        )
        combined[key] = h

    rows = list(combined.values())
    rows.sort(key=lambda x: (
        str(x.get("month", "")),
        str(x.get("amc", "")),
        str(x.get("scheme", "")),
        str(x.get("stock", "")),
    ))

    history_path.parent.mkdir(parents=True, exist_ok=True)
    history_path.write_text(
        json.dumps({"holdings": rows}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    months = sorted({str(x.get("month", "")) for x in rows if x.get("month")})
    amcs = {str(x.get("amc", "")) for x in rows if x.get("amc")}
    schemes = {f'{x.get("amc","")}::{x.get("scheme","")}' for x in rows if x.get("scheme")}

    status = {
        "holdings": len(rows),
        "amcs": len(amcs),
        "schemes": len(schemes),
        "months": len(months),
        "first_month": months[0] if months else None,
        "latest_month": months[-1] if months else None,
    }
    Path(args.status).write_text(json.dumps(status, indent=2), encoding="utf-8")
    print(json.dumps(status, indent=2))


if __name__ == "__main__":
    main()
