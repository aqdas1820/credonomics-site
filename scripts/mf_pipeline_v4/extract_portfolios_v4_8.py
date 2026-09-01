from __future__ import annotations
import argparse, math, re
from pathlib import Path
from typing import Any
import pandas as pd
import pdfplumber

NOISE_TERMS = [
    "benchmark","riskometer","performance","returns","expense ratio","exit load","entry load",
    "fund manager","nav as on","sip","stp","investment objective","past performance","face value",
    "allotment","annualised","average for month","direct plan","regular plan","growth option","idcw",
    "calculated on","redeemed","switched","switch-in","switch-out","units allotted",
    "total amount invested","additional benchmark","load structure","assets under management",
    "portfolio turnover","yield to maturity","weighted average","monthly dividend",
    "quarterly dividend","dividend option","for tax benefits","since inception","last 1 year",
    "last 2 years","last 3 years","last 5 years","standard deviation","sharpe ratio",
    "beta","tracking error","scheme returns","returns (%)","date period"
]

BAD_ROW_STARTS = (
    "total","subtotal","grand total","benchmark","exit load","entry load","note","nav",
    "direct plan","regular plan","portfolio - top","portfolio top","outstanding exposure",
    "weighted average","yield to maturity","monthly dividend","quarterly dividend",
    "for tax benefits","date period","average for month","assets under management"
)

INDUSTRY_HINTS = {
    "finance","banks","bank","consumer durables","construction","construction project","realty",
    "industrial products","gas","non - ferrous metals","non-ferrous metals","pharmaceuticals",
    "healthcare","automobiles","auto components","telecom services","it services","software",
    "cement","chemicals","petroleum products","insurance","retailing","leisure services",
    "food products","power","capital markets","aerospace","textiles","electrical equipment",
    "media","transport services","industrial manufacturing","household products",
    "financial technology","personal products","consumer non durables","industrial capital goods",
    "pesticides","fertilizers","metals & minerals trading","ferrous metals","diversified",
    "agricultural food & other products","commercial services & supplies","health care",
    "consumer services","telecom - services","oil exploration & production"
}

COMPANY_SUFFIX_RE = re.compile(
    r"\b(ltd\.?|limited|bank|corp\.?|corporation|industries|industry|pharma|pharmaceuticals|"
    r"finance|motors|technologies|technology|systems|services|gas|cables|properties|infratech|"
    r"electric|electricals|enterprises|power|steel|cement|chemicals|consumer|homes|developers|"
    r"laboratories|labs|holdings|infrastructure|engineering|energy|communications|telecom)\b",
    re.I
)

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
    low=clean_text(text).lower()
    if not low or len(low)>190 or len(low.split())>22: return True
    if any(term in low for term in NOISE_TERMS): return True
    if any(low.startswith(prefix) for prefix in BAD_ROW_STARTS): return True
    if "www." in low or ".com" in low: return True
    return False

def canonical_scheme(text):
    s=clean_text(text)
    s=re.sub(r"\s*\(.*?open[- ]ended.*?\)\s*$","",s,flags=re.I)
    s=re.sub(r"\bnav as on\b.*$","",s,flags=re.I)
    s=re.sub(r"\b(direct|regular)\s+plan\b.*$","",s,flags=re.I)
    return clean_text(s).strip(" ,;:-")

def detect_scheme_name(lines,fallback=""):
    # V4.6 accepted any early HDFC line containing Fund/ETF/FOF.
    # V4.7 additionally rejects NAV/plan/performance strings and very long headings.
    for line in lines[:90]:
        text=line_text(line); low=text.lower()
        if not low.startswith("hdfc "): continue
        if not re.search(r"\b(fund|etf|fof)\b",low): continue
        if len(text)>95 or any(t in low for t in [
            "benchmark","performance","portfolio","nav","direct plan","regular plan",
            "riskometer","expense ratio","fund manager","returns"
        ]): continue
        s=canonical_scheme(text)
        if re.search(r"\b(fund|etf|fof)\b",s,re.I):
            return s
    return canonical_scheme(fallback)

def _rightmost_weight(line, page_width):
    candidates=[]
    for i,w in enumerate(line):
        val=parse_number(str(w.get("text","")))
        x0=float(w["x0"])
        if val is not None and 0 < val <= 25 and x0 >= page_width*0.58:
            candidates.append((i,val,x0))
    return candidates[-1] if candidates else None

def _split_company_industry(text):
    text=clean_text(text)
    low=text.lower()
    best=""
    for hint in INDUSTRY_HINTS:
        if low.endswith(hint.lower()) and len(hint)>len(best):
            best=hint
    if not best: return text,""
    n=len(best.split()); toks=text.split()
    if len(toks)<=n: return text,""
    return clean_text(" ".join(toks[:-n])),clean_text(" ".join(toks[-n:]))

def _company_shape_ok(company):
    c=clean_text(company); low=c.lower()
    if len(c)<3 or len(c)>105 or len(c.split())>12: return False
    if looks_like_noise(c): return False
    if any(low.startswith(x) for x in BAD_ROW_STARTS): return False
    if not re.search(r"[A-Za-z]{2}",c): return False

    # V4.8: reject prose/statistical/table-summary fragments that survived V4.7.
    if re.search(r"\b(as on|total equity|equity related|quantitative data|related holdings|"
                 r"credit exposure|cash equivalents|net current assets|primarily drawn|"
                 r"crisil|benchmark index|g-sec|government securities|portfolio turnover|"
                 r"weighted average|maturity|duration|last|year|month|inception|average|"
                 r"yield|ratio|option|units?|exposure|assets under management)\b",low):
        return False
    if re.search(r"\b(january|february|march|april|may|june|july|august|september|"
                 r"october|november|december)\b",low):
        return False
    # Sentences / explanatory fragments are not company names.
    if any(x in low for x in [" please ", " from the ", " calculated ", " companies in ",
                              " refer ", " including ", " applicable ", " respect of "]):
        return False

    titleish=sum(1 for t in c.split() if t[:1].isupper() and re.search(r"[A-Za-z]",t))
    return bool(COMPANY_SUFFIX_RE.search(c)) or titleish>=2

def infer_portfolio_region(lines,page_width):
    """
    Strict page gate.
    A page is accepted only when it contains a dense run of holding-shaped rows:
    alphabetic security text + right-side 0..25 weight, with repeated X alignment.
    """
    candidates=[]
    for idx,line in enumerate(lines):
        txt=line_text(line)
        if looks_like_noise(txt): continue
        w=_rightmost_weight(line,page_width)
        if not w: continue
        wi,val,wx=w
        left=clean_text(" ".join(str(x.get("text","")) for x in line[:wi]))
        company,industry=_split_company_industry(left)
        if not industry: continue
        if not _company_shape_ok(company): continue
        candidates.append((idx,wx))

    if len(candidates)<6: return None

    # Find a locally dense block instead of accepting unrelated percentage rows elsewhere.
    indices=[x[0] for x in candidates]
    best=[]
    for i in indices:
        block=[j for j in indices if i-2 <= j <= i+45]
        if len(block)>len(best): best=block
    if len(best)<6: return None

    wxs=sorted(wx for idx,wx in candidates if idx in best)
    median_wx=wxs[len(wxs)//2]
    aligned=sum(1 for x in wxs if abs(x-median_wx)<=45)
    if aligned < max(5,int(len(wxs)*0.65)): return None

    return {
        "start":max(0,min(best)-2),
        "end":min(len(lines)-1,max(best)+3),
        "weight_x":median_wx
    }

def split_row_from_visual_line(line,page_width,region):
    txt=line_text(line)
    if looks_like_noise(txt): return None
    w=_rightmost_weight(line,page_width)
    if not w: return None
    wi,weight,wx=w

    # V4.8 geometry: the percentage must sit very close to the page-specific
    # portfolio weight column, not merely somewhere on the right half.
    if abs(wx-region["weight_x"])>28: return None

    left_words=line[:wi]
    if not left_words: return None
    left=clean_text(" ".join(str(x.get("text","")) for x in left_words))
    company,industry=_split_company_industry(left)
    if not industry or industry.lower() not in {x.lower() for x in INDUSTRY_HINTS}: return None
    if not _company_shape_ok(company): return None

    # Require a plausible visual company/industry block to the left of weight.
    lx0=min(float(x["x0"]) for x in left_words)
    lx1=max(float(x["x1"]) for x in left_words)
    if lx0 > page_width*0.52: return None
    if lx1 >= wx-4: return None

    # Reject rows containing obvious summary/date/statistical language anywhere.
    low=txt.lower()
    if re.search(r"\b(as on|total equity|equity related|quantitative data|related holdings|"
                 r"credit exposure|cash equivalents|net current assets|benchmark|crisil|"
                 r"g-sec|government securities|portfolio turnover|weighted average)\b",low):
        return None

    return {
        "Company":company,
        "Industry":industry,
        "Portfolio_Weight_Percent":weight,
        "Extraction_Method":"Geometry-Validated Coordinate V4.8"
    }

def extract_pdf(pdf_path,inventory_scheme):
    rows=[]; carried=canonical_scheme(inventory_scheme)
    with pdfplumber.open(pdf_path) as pdf:
        for page_number,page in enumerate(pdf.pages,start=1):
            try:
                words=page.extract_words(
                    x_tolerance=1.5,y_tolerance=1.5,
                    keep_blank_chars=False,use_text_flow=False
                )
            except Exception:
                continue
            if not words: continue
            lines=cluster_words_into_lines(words)

            scheme=detect_scheme_name(lines,carried)
            if scheme: carried=scheme

            region=infer_portfolio_region(lines,float(page.width))
            if not region: continue

            for idx in range(region["start"],region["end"]+1):
                rec=split_row_from_visual_line(lines[idx],float(page.width),region)
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
    print("CREDONOMICS MF EXTRACTOR V4.8 COMPLETE")
    print("="*78)
    print(f"Holdings rows : {len(holdings):,}")
    print(f"AMCs          : {holdings['AMC'].nunique() if not holdings.empty else 0}")
    print(f"Schemes       : {holdings[['AMC','Scheme']].drop_duplicates().shape[0] if not holdings.empty else 0}")
    print(f"Companies     : {holdings['Company'].nunique() if not holdings.empty else 0:,}")
    print(f"Output        : {output.resolve()}")
    print("="*78)

if __name__=="__main__":
    main()
