#!/usr/bin/env python3
"""Build CredoNomics MF Intelligence JSON from normalized CSV/XLSX portfolio exports.

Required columns (case-insensitive aliases supported):
AMC, Scheme, Month, Stock, Sector, Weight
Month should be YYYY-MM, YYYY-MM-DD, or a parseable date. Weight is portfolio %.

Usage:
  python scripts/mf_intelligence/build_dataset.py input_folder public/data/mf-intelligence/all.json
"""
from __future__ import annotations
import json, sys
from pathlib import Path
import pandas as pd

ALIASES = {
    'amc': ['amc','fund house','mutual fund','fund_house'],
    'scheme': ['scheme','scheme name','fund','fund name','scheme_name'],
    'month': ['month','date','portfolio date','as on','as_on'],
    'stock': ['stock','security','company','instrument','name of instrument'],
    'sector': ['sector','industry','sector name','industry / rating'],
    'weight': ['weight','weight %','% to nav','% of nav','portfolio %','allocation'],
}

def canon(s): return ' '.join(str(s).strip().lower().replace('_',' ').split())

def pick(cols, names):
    lookup={canon(c):c for c in cols}
    for n in names:
        if canon(n) in lookup:return lookup[canon(n)]
    return None

def read_file(p:Path):
    if p.suffix.lower()=='.csv': return pd.read_csv(p)
    if p.suffix.lower() in ('.xlsx','.xls'): return pd.read_excel(p)
    return None

def main():
    if len(sys.argv)<3:
        print(__doc__); raise SystemExit(2)
    src,out=Path(sys.argv[1]),Path(sys.argv[2])
    files=[p for p in src.rglob('*') if p.suffix.lower() in ('.csv','.xlsx','.xls')]
    frames=[]
    for p in files:
        try:
            df=read_file(p)
            if df is None or df.empty: continue
            mapping={k:pick(df.columns,v) for k,v in ALIASES.items()}
            missing=[k for k,v in mapping.items() if v is None and k!='sector']
            if missing:
                print(f'SKIP {p.name}: missing {missing}')
                continue
            x=pd.DataFrame({k:(df[v] if v is not None else 'Unclassified') for k,v in mapping.items()})
            x['month']=pd.to_datetime(x['month'],errors='coerce').dt.to_period('M').astype(str)
            x['weight']=pd.to_numeric(x['weight'].astype(str).str.replace('%','',regex=False),errors='coerce')
            x=x.dropna(subset=['month','weight'])
            for c in ['amc','scheme','stock','sector']: x[c]=x[c].astype(str).str.strip()
            x=x[(x.stock!='') & (x.scheme!='') & (x.amc!='') & (x.weight>=0)]
            frames.append(x)
        except Exception as e:
            print(f'ERROR {p}: {e}')
    if not frames: raise SystemExit('No compatible files found.')
    all_df=pd.concat(frames,ignore_index=True).drop_duplicates(['amc','scheme','month','stock'],keep='last')
    all_df=all_df.sort_values(['month','amc','scheme','weight'],ascending=[True,True,True,False])
    records=all_df.to_dict('records')
    months=sorted(all_df.month.unique())
    amcs=all_df.amc.nunique(); schemes=all_df[['amc','scheme']].drop_duplicates().shape[0]
    payload={'meta':{'name':'CredoNomics MF Intelligence','periodStart':months[0],'periodEnd':months[-1],'isDemo':False,'amcs':int(amcs),'schemes':int(schemes),'months':len(months),'records':len(records)},'records':records}
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(f'Wrote {len(records):,} holdings | {amcs} AMCs | {schemes} schemes | {len(months)} months -> {out}')

if __name__=='__main__': main()
