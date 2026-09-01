from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd


def clean_text(v):
    if pd.isna(v):
        return ""
    return " ".join(str(v).replace("\n", " ").replace("\r", " ").split()).strip()


def row_json(row):
    date = pd.Timestamp(row["Report_Date"])
    data = {
        "amc": clean_text(row["AMC"]),
        "scheme": clean_text(row["Scheme"]),
        "month": date.strftime("%Y-%m"),
        "stock": clean_text(row["Company"]),
        "sector": clean_text(row.get("Industry", "")) or "Unclassified",
        "weight": round(float(row["Portfolio_Weight_Percent"]), 6),
        "isin": clean_text(row["ISIN"]),
        "quality": int(row.get("Quality_Score", 0)),
    }
    asset = clean_text(row.get("Asset_Class", ""))
    if asset:
        data["assetClass"] = asset
    return data


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", default="public/data/mf-intelligence")
    args = p.parse_args()

    df = pd.read_excel(args.input)
    df["Report_Date"] = pd.to_datetime(df["Report_Date"], errors="coerce")
    df = df.dropna(subset=["Report_Date"])

    out = Path(args.output)
    months = sorted(df["Report_Date"].dt.to_period("M").astype(str).unique())

    for month in months:
        part = df[df["Report_Date"].dt.to_period("M").astype(str) == month]
        write_json(
            out / "holdings" / f"{month}.json",
            {"month": month, "holdings": [row_json(r) for _, r in part.iterrows()]},
        )

    amcs = sorted(df["AMC"].dropna().astype(str).unique().tolist())
    schemes = (
        df[["AMC", "Scheme"]]
        .drop_duplicates()
        .sort_values(["AMC", "Scheme"])
        .to_dict(orient="records")
    )

    index = {
        "version": 3,
        "source": Path(args.input).name,
        "holdings": int(len(df)),
        "amcs": amcs,
        "amcCount": len(amcs),
        "schemes": [{"amc": x["AMC"], "scheme": x["Scheme"]} for x in schemes],
        "schemeCount": len(schemes),
        "stocks": int(df["ISIN"].nunique()),
        "months": sorted(months, reverse=True),
        "firstMonth": months[0] if len(months) else None,
        "latestMonth": months[-1] if len(months) else None,
    }
    write_json(out / "index.json", index)

    print(json.dumps(index, indent=2))


if __name__ == "__main__":
    main()
