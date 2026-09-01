from __future__ import annotations

import argparse
import subprocess
import sys


def run(*args: str):
    print("+", " ".join(args))
    subprocess.run(args, check=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--months", type=int, default=1)
    p.add_argument("--headed", action="store_true")
    args = p.parse_args()

    py = sys.executable
    fetch_args = [
        py, "scripts/mf_auto_fetch/fetch_amfi.py",
        "--months", str(args.months),
        "--out", "data/mf_raw",
    ]
    if args.headed:
        fetch_args.append("--headed")

    run(*fetch_args)
    run(
        py, "scripts/mf_auto_fetch/normalize_portfolios.py",
        "--raw", "data/mf_raw",
        "--out", "data/mf_normalized/latest.json",
    )
    run(
        py, "scripts/mf_auto_fetch/merge_history.py",
        "--new", "data/mf_normalized/latest.json",
        "--history", "public/data/mf-intelligence/all.json",
        "--status", "public/data/mf-intelligence/status.json",
    )


if __name__ == "__main__":
    main()
