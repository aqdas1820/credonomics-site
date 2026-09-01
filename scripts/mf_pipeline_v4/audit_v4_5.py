import pandas as pd
import re
from pathlib import Path

INPUT = Path(r"D:\MF Tracking\Reports\Master_Portfolio_HDFC_V4_5_FULL.xlsx")
OUTPUT = Path(r"D:\MF Tracking\Reports\HDFC_V4_5_AUDIT.xlsx")

print("=" * 70)
print("CREDONOMICS MF V4.5 DATA QUALITY AUDIT")
print("=" * 70)

df = pd.read_excel(INPUT, sheet_name="Holdings")

print(f"Rows loaded       : {len(df):,}")
print(f"Schemes detected  : {df['Scheme'].nunique():,}")
print(f"Raw ISIN strings  : {df['ISIN'].nunique():,}")

# -------------------------------------------------------
# Basic cleanup
# -------------------------------------------------------

for col in ["Company", "ISIN", "Scheme", "AMC", "Industry"]:
    if col in df.columns:
        df[col] = df[col].astype("string").str.strip()

# -------------------------------------------------------
# ISIN validation
# Indian securities normally use a 12-character ISIN.
# We use structural validation here rather than trusting
# every word captured beside an ISIN anchor.
# -------------------------------------------------------

isin = df["ISIN"].fillna("").str.upper().str.replace(
    r"[^A-Z0-9]", "", regex=True
)

df["ISIN_Clean"] = isin

# Broad structural test
df["ISIN_Length_OK"] = isin.str.len().eq(12)

# India prefix test
df["ISIN_India_Prefix"] = isin.str.startswith(
    ("INE", "INF", "IN0")
)

df["Valid_ISIN_Structure"] = (
    df["ISIN_Length_OK"] &
    df["ISIN_India_Prefix"] &
    isin.str.match(r"^[A-Z0-9]{12}$")
)

# -------------------------------------------------------
# Detect obvious document-text contamination
# -------------------------------------------------------

noise_patterns = [
    r"face value",
    r"past performance",
    r"assets under management",
    r"industry classification",
    r"portfolio classification",
    r"investment objective",
    r"riskometer",
    r"benchmark",
    r"load structure",
    r"exit load",
    r"entry load",
    r"expense ratio",
    r"total expense",
    r"registrar",
    r"disclaimer",
    r"mutual fund investments",
    r"market value",
    r"portfolio details",
]

noise_regex = "|".join(noise_patterns)

company = df["Company"].fillna("")

df["Text_Noise"] = company.str.contains(
    noise_regex,
    case=False,
    regex=True
)

# -------------------------------------------------------
# Numeric holding evidence
# -------------------------------------------------------

numeric_cols = [
    "Quantity",
    "Market_Value",
    "Portfolio_Weight_Percent"
]

for col in numeric_cols:
    if col in df.columns:
        df[col + "_Numeric"] = pd.to_numeric(
            df[col],
            errors="coerce"
        )

df["Has_Numeric_Holding_Data"] = False

for col in numeric_cols:
    ncol = col + "_Numeric"
    if ncol in df.columns:
        df["Has_Numeric_Holding_Data"] |= df[ncol].notna()

# -------------------------------------------------------
# Classification
# -------------------------------------------------------

def classify(row):

    if row["Text_Noise"]:
        return "REJECT_TEXT_NOISE"

    if row["Valid_ISIN_Structure"]:
        return "HIGH_CONFIDENCE_SECURITY"

    if row["Has_Numeric_Holding_Data"]:
        return "REVIEW_NO_VALID_ISIN"

    return "REJECT_NO_SECURITY_EVIDENCE"


df["Audit_Status"] = df.apply(classify, axis=1)

# -------------------------------------------------------
# Scheme audit
# -------------------------------------------------------

scheme_summary = (
    df.groupby("Scheme", dropna=False)
      .agg(
          Rows=("Scheme", "size"),
          Months=("Month_Year", "nunique"),
          First_Date=("Report_Date", "min"),
          Last_Date=("Report_Date", "max"),
          Unique_ISINs=("ISIN_Clean", "nunique"),
          Valid_ISIN_Rows=("Valid_ISIN_Structure", "sum"),
          Noise_Rows=("Text_Noise", "sum"),
      )
      .reset_index()
      .sort_values(
          ["Months", "Rows"],
          ascending=[False, False]
      )
)

# -------------------------------------------------------
# Scheme normalization for duplicate investigation
# Do NOT merge automatically.
# -------------------------------------------------------

def normalize_scheme(name):

    if pd.isna(name):
        return ""

    s = str(name).upper()

    s = s.replace("&", " AND ")

    s = re.sub(
        r"\bAN?\s+OPEN[\s-]*ENDED.*$",
        "",
        s
    )

    s = re.sub(
        r"\bOPEN[\s-]*ENDED.*$",
        "",
        s
    )

    s = re.sub(
        r"[^A-Z0-9]+",
        " ",
        s
    )

    s = re.sub(r"\s+", " ", s).strip()

    return s


scheme_summary["Normalized_Scheme"] = (
    scheme_summary["Scheme"].apply(normalize_scheme)
)

duplicate_candidates = (
    scheme_summary[
        scheme_summary.duplicated(
            "Normalized_Scheme",
            keep=False
        )
    ]
    .sort_values("Normalized_Scheme")
)

# -------------------------------------------------------
# Audit statistics
# -------------------------------------------------------

status_summary = (
    df["Audit_Status"]
    .value_counts()
    .rename_axis("Status")
    .reset_index(name="Rows")
)

print()
print("AUDIT RESULTS")
print("-" * 70)

for _, r in status_summary.iterrows():
    print(f"{r['Status']:<30}: {r['Rows']:,}")

print()
print(f"Scheme strings              : {df['Scheme'].nunique():,}")
print(f"Normalized scheme strings   : {scheme_summary['Normalized_Scheme'].nunique():,}")
print(f"Duplicate-name candidates   : {len(duplicate_candidates):,}")

# -------------------------------------------------------
# Write workbook
# -------------------------------------------------------

with pd.ExcelWriter(
    OUTPUT,
    engine="openpyxl"
) as writer:

    status_summary.to_excel(
        writer,
        sheet_name="Audit Summary",
        index=False
    )

    scheme_summary.to_excel(
        writer,
        sheet_name="Scheme Audit",
        index=False
    )

    duplicate_candidates.to_excel(
        writer,
        sheet_name="Scheme Duplicates",
        index=False
    )

    df[df["Audit_Status"] == "HIGH_CONFIDENCE_SECURITY"].to_excel(
        writer,
        sheet_name="High Confidence",
        index=False
    )

    df[df["Audit_Status"] == "REVIEW_NO_VALID_ISIN"].to_excel(
        writer,
        sheet_name="Needs Review",
        index=False
    )

    df[df["Audit_Status"].str.startswith("REJECT")].to_excel(
        writer,
        sheet_name="Rejected",
        index=False
    )

print()
print("=" * 70)
print("AUDIT COMPLETE")
print("=" * 70)
print(f"Output: {OUTPUT}")