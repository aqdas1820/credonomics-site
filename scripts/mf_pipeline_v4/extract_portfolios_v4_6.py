from __future__ import annotations
import argparse, math, re
from pathlib import Path
from typing import Any
import pandas as pd
import pdfplumber

NOISE_TERMS = [
    "benchmark","riskometer","performance","returns","expense ratio","exit load","entry load",
    "fund manager","nav","sip","stp","investment objective","past performance","face value",
    "allotment","market value as on","annualised","average for month","direct plan","regular plan",
    "growth option","idcw","note:","calculated on","redeemed","switched","switch-in","switch-out",
    "units allotted","total amount invested","date period","additional benchmark","load structure",
    "assets under management"
]
BAD_ROW_STARTS = ["total","subtotal","grand total","benchmark","exit load","entry load","note","nav","direct plan","regular plan"]
VALID_COMPANY_RE = re.compile(r"[A-Za-z]")

INDUSTRY_HINTS = {
    "finance","banks","bank","consumer durables","construction","realty","industrial products",
    "gas","non - ferrous metals","non-ferrous metals","pharmaceuticals","healthcare","automobiles",
    "auto components","telecom services","it services","software","cement","chemicals",
    "petroleum products","insurance","retailing","leisure services","food products","power",
    "capital markets","aerospace","textiles","electrical equipment","media","transport services",
    "industrial manufacturing","household products","financial technology","personal products"
}

def clean_text(v: Any) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)): return ""
    return re.sub(r"\s+"," ",str(v).replace("\n"," ").replace("\r"," ")).strip()

def cluster_words_into_lines(words, tolerance=1.6):
    lines=[]
    for word in sorted(words,key=lambda w:(float(w["top"]),float(w["x0"]))):
        top=float(word["top"]); placed=False
        for line in reversed(lines[-12:]):
            mean_top=sum(float(x["top"]) for x in line)/len(line)
            if abs(top-mean_top)<=tolerance:
                line.append(word); placed=True; break
        if not placed: lines.append([word])
    for line in lines: line.sort(key=lambda w:float(w["x0"]))
    return lines

def line_text(line):
    return clean_text(" ".join(str(w.get("text","")) for w in line))

def parse_number(token):
    raw=clean_text(token)
    if not raw: return None
    raw=raw.replace(",","").replace("%","").replace("₹","").strip("() ")
    if not re.fullmatch(r"-?\d+(?:\.\d+)?",raw): return None
    try: return float(raw)
    except: return None

def looks_like_noise(text):
    low=text.lower()
    if not text or len(text)>180 or len(text.split())>24: return True
    if any(term in low for term in NOISE_TERMS): return True
    if any(low.startswith(prefix) for prefix in BAD_ROW_STARTS): return True
    return False

def split_row_from_visual_line(line):
    if not line: return None
    text=line_text(line)
    if looks_like_noise(text): return None
    numeric=[]
    for i,word in enumerate(line):
        val=parse_number(str(word.get("text","")))
        if val is not None: numeric.append((i,val,float(word["x0"])))
    if not numeric: return None
    weight_idx=None; weight=None
    for i,val,x0 in reversed(numeric):
        if 0<=val<=100.5:
            weight_idx=i; weight=val; break
    if weight_idx is None: return None
    words_before=line[:weight_idx]
    if not words_before: return None
    txt=clean_text(" ".join(str(w.get("text","")) for w in words_before))
    if looks_like_noise(txt): return None
    if sum(c.isalpha() for c in txt)<4: return None
    tokens=[clean_text(w.get("text","")) for w in words_before]
    tokens=[t for t in tokens if t]
    industry=""; company_tokens=tokens[:]
    joined=" ".join(tokens).lower()
    best=""
    for hint in INDUSTRY_HINTS:
        if joined.endswith(hint.lower()) and len(hint)>len(best): best=hint
    if best:
        n=len(best.split())
        company_tokens=tokens[:-n]
        industry=" ".join(tokens[-n:])
    company=clean_text(" ".join(company_tokens))
    if not company or looks_like_noise(company) or not VALID_COMPANY_RE.search(company): return None
    low=company.lower()
    if any(low.startswith(x) for x in ["for product label","applicable only","in respect of","no exit load","units","scheme","benchmark"]): return None
    return {"Company":company,"Industry":industry,"Portfolio_Weight_Percent":weight,"Extraction_Method":"Coordinate Row V4.6"}

def identify_portfolio_page(lines):
    return sum(1 for line in lines if split_row_from_visual_line(line))>=8

def detect_scheme_name(lines,fallback=""):
    for line in lines[:80]:
        text=line_text(line); low=text.lower()
        if low.startswith("hdfc ") and re.search(r"\b(fund|etf|fof)\b",low):
            if len(text)<=110 and not any(t in low for t in ["benchmark","performance","portfolio"]):
                text=re.sub(r"\s*\(.*?open[- ]ended.*?\)\s*$","",text,flags=re.I)
                return clean_text(text).strip(" ,;:-")
    return clean_text(fallback)

def extract_pdf(pdf_path,inventory_scheme):
    rows=[]; carried=clean_text(inventory_scheme)
    with pdfplumber.open(pdf_path) as pdf:
        for page_number,page in enumerate(pdf.pages,start=1):
            try:
                words=page.extract_words(x_tolerance=1.5,y_tolerance=1.5,keep_blank_chars=False,use_text_flow=False)
            except Exception:
                continue
            if not words: continue
            lines=cluster_words_into_lines(words)
            scheme=detect_scheme_name(lines,carried)
            if scheme: carried=scheme
            if not identify_portfolio_page(lines): continue
            for line in lines:
                rec=split_row_from_visual_line(line)
                if rec:
                    rec.update({"Scheme":carried,"Page_Number":page_number})
                    rows.append(rec)
    return rows

def load_inventory(path):
    excel=pd.ExcelFile(path)
    sheet="Factsheet Inventory" if "Factsheet Inventory" in excel.sheet_names else excel.sheet_names[0]
    return pd.read_excel(path,sheet_name=sheet)

def choose_column(df,candidates):
    exact={str(c).strip().lower():c for c in df.columns}
    for candidate in candidates:
        if candidate.lower() in exact: return exact[candidate.lower()]
    for c in df.columns:
        low=str(c).lower()
        if any(candidate.lower() in low for candidate in candidates): return c
    return None

def resolve_pdf_path(raw_path,base_dir,inventory_path):
    raw=clean_text(raw_path)
    if not raw: return Path("__MISSING__")
    p=Path(raw)
    if p.is_absolute(): return p
    for candidate in [base_dir/p,inventory_path.parent.parent/p,inventory_path.parent/p]:
        if candidate.exists(): return candidate.resolve()
    return (base_dir/p).resolve()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--inventory",required=True)
    parser.add_argument("--base-dir",required=True)
    parser.add_argument("--output",required=True)
    parser.add_argument("--max-pdfs",type=int,default=10)
    parser.add_argument("--amc",default="")
    args=parser.parse_args()

    inventory_path=Path(args.inventory).resolve()
    base_dir=Path(args.base_dir).resolve()
    inventory=load_inventory(inventory_path)

    path_col=choose_column(inventory,["PDF_Path","Path","File Path"])
    amc_col=choose_column(inventory,["AMC"])
    scheme_col=choose_column(inventory,["Scheme"])
    date_col=choose_column(inventory,["Report_Date","Report Date","Date","Month"])
    if not path_col: raise SystemExit(f"Could not detect PDF path column. Columns: {list(inventory.columns)}")

    if args.amc and amc_col:
        inventory=inventory[inventory[amc_col].astype(str).str.contains(args.amc,case=False,na=False)]
    if args.max_pdfs: inventory=inventory.head(args.max_pdfs)

    all_rows=[]; log=[]
    for _,item in inventory.iterrows():
        pdf_path=resolve_pdf_path(clean_text(item.get(path_col,"")),base_dir,inventory_path)
        amc=clean_text(item.get(amc_col,"")) if amc_col else ""
        inv_scheme=clean_text(item.get(scheme_col,"")) if scheme_col else ""
        report_date=pd.to_datetime(item.get(date_col,None) if date_col else None,errors="coerce")
        if not pdf_path.exists():
            print(f"[MISSING] {pdf_path}"); log.append({"PDF":str(pdf_path),"Status":"Missing","Rows":0}); continue
        try:
            rows=extract_pdf(pdf_path,inv_scheme)
            for rec in rows:
                rec.update({
                    "AMC":amc,"Report_Date":report_date,
                    "Year":report_date.year if not pd.isna(report_date) else None,
                    "Month_Number":report_date.month if not pd.isna(report_date) else None,
                    "Month":report_date.strftime("%B") if not pd.isna(report_date) else "",
                    "Month_Year":report_date.strftime("%B-%Y") if not pd.isna(report_date) else "",
                    "PDF_File":pdf_path.name,"PDF_Path":str(pdf_path)
                })
            all_rows.extend(rows)
            schemes=len({r.get("Scheme","") for r in rows if r.get("Scheme","")})
            print(f"[OK] {pdf_path.name}: {len(rows)} coordinate rows | {schemes} schemes")
            log.append({"PDF":str(pdf_path),"Status":"Processed","Rows":len(rows),"Schemes":schemes})
        except Exception as exc:
            print(f"[ERROR] {pdf_path.name}: {exc}")
            log.append({"PDF":str(pdf_path),"Status":"Error","Rows":0,"Message":str(exc)})

    holdings=pd.DataFrame(all_rows); log_df=pd.DataFrame(log)
    if not holdings.empty:
        holdings=holdings[holdings["Portfolio_Weight_Percent"].between(0.0001,100.5,inclusive="both")].copy()
        holdings=holdings.drop_duplicates(subset=["AMC","Scheme","Report_Date","Company","Portfolio_Weight_Percent"],keep="first")
        holdings=holdings.sort_values(["Report_Date","AMC","Scheme","Portfolio_Weight_Percent"],ascending=[True,True,True,False])

    output=Path(args.output); output.parent.mkdir(parents=True,exist_ok=True)
    with pd.ExcelWriter(output,engine="openpyxl") as writer:
        holdings.to_excel(writer,sheet_name="Holdings",index=False)
        log_df.to_excel(writer,sheet_name="Processing Log",index=False)
        if not holdings.empty:
            summary=(holdings.groupby(["AMC","Scheme","Report_Date"])
                     .agg(Holdings=("Company","nunique"),Total_Weight=("Portfolio_Weight_Percent","sum"))
                     .reset_index())
            summary.to_excel(writer,sheet_name="Scheme Summary",index=False)

    print("\n"+"="*78)
    print("CREDONOMICS MF EXTRACTOR V4.6 COMPLETE")
    print("="*78)
    print(f"Holdings rows : {len(holdings):,}")
    print(f"AMCs          : {holdings['AMC'].nunique() if not holdings.empty else 0}")
    print(f"Schemes       : {holdings[['AMC','Scheme']].drop_duplicates().shape[0] if not holdings.empty else 0}")
    print(f"Companies     : {holdings['Company'].nunique() if not holdings.empty else 0:,}")
    print(f"Output        : {output.resolve()}")
    print("="*78)

if __name__=="__main__":
    main()
