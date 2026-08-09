'use client'

import {
  ArrowLeft, BarChart3, Building2, CalendarRange, CheckCircle2, ChevronDown,
  Database, Download, Filter, Flame, Info, Layers3, LineChart, Search, Sparkles,
  TrendingDown, TrendingUp, Upload, UsersRound
} from 'lucide-react'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'

type RecordRow={amc:string;scheme:string;month:string;stock:string;sector:string;weight:number}
type Dataset={meta?:{name?:string;periodStart?:string;periodEnd?:string;isDemo?:boolean;amcs?:number;schemes?:number;months?:number;records?:number;note?:string};records:RecordRow[]}
type Movement={stock:string;sector:string;previous:number;current:number;change:number;status:'New'|'Exit'|'Increased'|'Reduced'|'Unchanged'}

const fmt=(n:number,d=2)=>Number.isFinite(n)?n.toFixed(d):'0.00'
const uniq=(xs:string[])=>Array.from(new Set(xs)).sort((a,b)=>a.localeCompare(b))
const monthLabel=(m:string)=>{const [y,mo]=m.split('-').map(Number);return Number.isFinite(y)&&Number.isFinite(mo)?new Date(y,mo-1,1).toLocaleDateString('en-IN',{month:'short',year:'numeric'}):m}

function parseCsv(text:string):RecordRow[]{
  const lines=text.split(/\r?\n/).filter(Boolean); if(lines.length<2)return []
  const split=(line:string)=>line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(x=>x.replace(/^\"|\"$/g,'').trim())
  const head=split(lines[0]).map(x=>x.toLowerCase().replace(/[_-]/g,' ').replace(/\s+/g,' '))
  const ix=(...names:string[])=>head.findIndex(h=>names.includes(h))
  const i={amc:ix('amc','fund house','mutual fund'),scheme:ix('scheme','scheme name','fund','fund name'),month:ix('month','date','portfolio date','as on'),stock:ix('stock','security','company','instrument','name of instrument'),sector:ix('sector','industry','sector name'),weight:ix('weight','weight %','% to nav','% of nav','portfolio %','allocation')}
  if(Object.values(i).some(v=>v<0))return []
  return lines.slice(1).map(line=>{const p=split(line);return{amc:p[i.amc]||'',scheme:p[i.scheme]||'',month:(p[i.month]||'').slice(0,7),stock:p[i.stock]||'',sector:p[i.sector]||'Unclassified',weight:Number((p[i.weight]||'0').replace('%',''))||0}}).filter(r=>r.amc&&r.scheme&&r.month&&r.stock)
}

export default function MFPortfolioTracker(){
  const [data,setData]=useState<Dataset>({records:[]})
  const [source,setSource]=useState<'loading'|'live'|'demo'|'upload'>('loading')
  const [amc,setAmc]=useState('All AMCs'),[scheme,setScheme]=useState('All schemes')
  const [fromMonth,setFromMonth]=useState(''),[toMonth,setToMonth]=useState('')
  const [stockSearch,setStockSearch]=useState('')
  const [tab,setTab]=useState<'overview'|'movements'|'stocks'|'sectors'>('overview')

  useEffect(()=>{
    const load=async()=>{
      try{
        const live=await fetch('/data/mf-intelligence/all.json',{cache:'no-store'}); if(live.ok){const j=await live.json();if(j?.records?.length){setData(j);setSource('live');return}}
      }catch{}
      try{const demo=await fetch('/data/mf-intelligence/demo.json');const j=await demo.json();setData(j);setSource('demo')}catch{setSource('demo')}
    };load()
  },[])

  const months=useMemo(()=>uniq(data.records.map(r=>r.month)).sort(),[data])
  useEffect(()=>{if(months.length&&!toMonth){setToMonth(months[months.length-1]);setFromMonth(months[Math.max(0,months.length-2)])}},[months,toMonth])
  const amcs=useMemo(()=>uniq(data.records.map(r=>r.amc)),[data])
  const schemes=useMemo(()=>uniq(data.records.filter(r=>amc==='All AMCs'||r.amc===amc).map(r=>r.scheme)),[data,amc])
  useEffect(()=>{if(scheme!=='All schemes'&&!schemes.includes(scheme))setScheme('All schemes')},[amc,scheme,schemes])

  const currentMonth=toMonth||months[months.length-1]||''
  const previousMonth=fromMonth||months[Math.max(0,months.length-2)]||currentMonth
  const scoped=(m:string)=>data.records.filter(r=>r.month===m&&(amc==='All AMCs'||r.amc===amc)&&(scheme==='All schemes'||r.scheme===scheme))
  const currentRows=useMemo(()=>scoped(currentMonth),[data,currentMonth,amc,scheme])
  const previousRows=useMemo(()=>scoped(previousMonth),[data,previousMonth,amc,scheme])

  const movements=useMemo<Movement[]>(()=>{
    const agg=(rows:RecordRow[])=>{const m=new Map<string,{stock:string;sector:string,total:number,n:number}>();rows.forEach(r=>{const k=r.stock.toLowerCase();const x=m.get(k)||{stock:r.stock,sector:r.sector,total:0,n:0};x.total+=r.weight;x.n++;m.set(k,x)});return m}
    const a=agg(previousRows),b=agg(currentRows),keys=Array.from(new Set([...Array.from(a.keys()),...Array.from(b.keys())]))
    return keys.map(k=>{const p=a.get(k),c=b.get(k),pv=p?p.total/p.n:0,cv=c?c.total/c.n:0,change=cv-pv;let status:Movement['status']='Unchanged';if(!p&&c)status='New';else if(p&&!c)status='Exit';else if(change>.05)status='Increased';else if(change<-.05)status='Reduced';return{stock:c?.stock||p?.stock||k,sector:c?.sector||p?.sector||'Unclassified',previous:pv,current:cv,change,status}}).sort((x,y)=>Math.abs(y.change)-Math.abs(x.change))
  },[previousRows,currentRows])

  const favorites=useMemo(()=>{
    const map=new Map<string,{stock:string;sector:string;schemes:Set<string>;amcs:Set<string>;sum:number;count:number}>()
    currentRows.forEach(r=>{const k=r.stock.toLowerCase(),x=map.get(k)||{stock:r.stock,sector:r.sector,schemes:new Set(),amcs:new Set(),sum:0,count:0};x.schemes.add(`${r.amc}|${r.scheme}`);x.amcs.add(r.amc);x.sum+=r.weight;x.count++;map.set(k,x)})
    return Array.from(map.values()).map(x=>({...x,avg:x.sum/x.count,conviction:x.amcs.size*12+x.schemes.size*4+x.avg})).sort((a,b)=>b.conviction-a.conviction)
  },[currentRows])

  const sectors=useMemo(()=>{
    const calc=(rows:RecordRow[])=>{const m=new Map<string,{sum:number,n:number}>();rows.forEach(r=>{const x=m.get(r.sector)||{sum:0,n:0};x.sum+=r.weight;x.n++;m.set(r.sector,x)});return m}
    const a=calc(previousRows),b=calc(currentRows),names=Array.from(new Set([...Array.from(a.keys()),...Array.from(b.keys())]))
    return names.map(s=>({sector:s,previous:(a.get(s)?.sum||0),current:(b.get(s)?.sum||0),change:(b.get(s)?.sum||0)-(a.get(s)?.sum||0)})).sort((x,y)=>y.current-x.current)
  },[previousRows,currentRows])

  const stats=useMemo(()=>({
    amcs:new Set(currentRows.map(r=>r.amc)).size,
    schemes:new Set(currentRows.map(r=>`${r.amc}|${r.scheme}`)).size,
    stocks:new Set(currentRows.map(r=>r.stock.toLowerCase())).size,
    newHoldings:movements.filter(r=>r.status==='New').length,
    increased:movements.filter(r=>r.status==='Increased').length,
    reduced:movements.filter(r=>r.status==='Reduced').length,
  }),[currentRows,movements])

  const topMovers=movements.filter(r=>r.status!=='Unchanged').slice(0,10)
  const searched=favorites.filter(x=>!stockSearch||x.stock.toLowerCase().includes(stockSearch.toLowerCase())).slice(0,50)
  const maxSector=Math.max(1,...sectors.map(s=>s.current))

  const upload=(e:ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{let d:Dataset;if(f.name.toLowerCase().endsWith('.json'))d=JSON.parse(String(r.result||'{}'));else d={meta:{name:f.name,isDemo:false},records:parseCsv(String(r.result||''))};if(d.records?.length){setData(d);setSource('upload');setAmc('All AMCs');setScheme('All schemes');setFromMonth('');setToMonth('')}}catch{alert('Could not read this file. Use CredoNomics normalized CSV/JSON format.')}};r.readAsText(f)}
  const downloadCsv=()=>{const header='AMC,Scheme,Month,Stock,Sector,Weight\n';const body=currentRows.map(r=>[r.amc,r.scheme,r.month,r.stock,r.sector,r.weight].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([header+body],{type:'text/csv'}));a.download=`credonomics-mf-${currentMonth||'data'}.csv`;a.click();URL.revokeObjectURL(a.href)}

  return <main className="mfProPage">
    <header className="calcNav wrap"><a className="brand" href="/"><img src="/credonomics-mark.png" alt="" className="brandMark"/><span className="brandWords"><strong>CREDONOMICS</strong><small>Investment Solutions</small></span></a><div className="mfTopActions"><a className="backLink" href="/#tools"><ArrowLeft size={16}/> Back to tools</a><label className="mfUpload"><Upload size={15}/> Import portfolio data<input type="file" accept=".csv,.json" onChange={upload}/></label></div></header>

    <section className="mfProHero"><div className="wrap mfProHeroGrid"><div><div className="eyebrow"><Sparkles size={14}/> Mutual fund intelligence</div><h1>See what India’s mutual funds are <span>buying, holding & cutting.</span></h1><p>Explore scheme portfolios across time, discover AMC-favourite stocks, sector shifts, new positions, exits and conviction changes from disclosed portfolio data.</p><div className="mfSourceLine"><Database size={15}/><span>{source==='live'?'Production dataset':source==='upload'?'Uploaded dataset':source==='loading'?'Loading dataset…':'Demo dataset'}</span><i/> <span>{data.meta?.periodStart||'—'} → {data.meta?.periodEnd||'—'}</span>{data.meta?.isDemo&&<b>DEMO</b>}</div></div><div className="mfHeroPanel"><div className="mfHeroMini"><span>AMCs</span><strong>{amcs.length}</strong></div><div className="mfHeroMini"><span>Schemes</span><strong>{new Set(data.records.map(r=>`${r.amc}|${r.scheme}`)).size}</strong></div><div className="mfHeroMini"><span>Months</span><strong>{months.length}</strong></div><div className="mfHeroMini"><span>Holdings rows</span><strong>{data.records.length.toLocaleString('en-IN')}</strong></div><small>Engine supports up to 60+ monthly snapshots per scheme. Production breadth depends on the portfolio-disclosure dataset loaded.</small></div></div></section>

    <section className="mfWorkspace wrap">
      <aside className="mfFilters"><div className="mfFilterHead"><div><span className="overline">Universe</span><h2>Explore funds</h2></div><Filter size={18}/></div>
        <label>AMC<select value={amc} onChange={e=>setAmc(e.target.value)}><option>All AMCs</option>{amcs.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Scheme<select value={scheme} onChange={e=>setScheme(e.target.value)}><option>All schemes</option>{schemes.map(x=><option key={x}>{x}</option>)}</select></label>
        <div className="mfDatePair"><label>Compare from<select value={fromMonth} onChange={e=>setFromMonth(e.target.value)}>{months.map(x=><option key={x} value={x}>{monthLabel(x)}</option>)}</select></label><label>To<select value={toMonth} onChange={e=>setToMonth(e.target.value)}>{months.map(x=><option key={x} value={x}>{monthLabel(x)}</option>)}</select></label></div>
        <button className="mfDownload" onClick={downloadCsv}><Download size={15}/> Export current snapshot</button>
        <div className="mfDataNote"><Info size={15}/><p><b>Professional-data mode:</b> load normalized monthly portfolio disclosures with AMC, scheme, month, stock, sector and portfolio weight. The included Python builder converts CSV/XLSX history into the site dataset.</p></div>
      </aside>

      <div className="mfDashboard">
        <div className="mfKpis"><article><Building2/><span>AMCs in view</span><b>{stats.amcs}</b></article><article><Layers3/><span>Schemes in view</span><b>{stats.schemes}</b></article><article><UsersRound/><span>Stocks tracked</span><b>{stats.stocks}</b></article><article><Flame/><span>New positions</span><b>{stats.newHoldings}</b></article></div>
        <nav className="mfTabs">{([['overview','Overview'],['movements','Portfolio moves'],['stocks','Favourite stocks'],['sectors','Sector view']] as const).map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>{l}</button>)}</nav>

        {tab==='overview'&&<>
          <div className="mfGrid2"><article className="mfCard"><div className="mfCardHead"><div><span className="overline">Latest signals</span><h2>Biggest portfolio moves</h2></div><CalendarRange size={19}/></div><div className="mfMovementList">{topMovers.length?topMovers.map((r,i)=><div className="mfMove" key={r.stock}><span className="mfMoveRank">{String(i+1).padStart(2,'0')}</span><div><b>{r.stock}</b><small>{r.sector} · {r.status}</small></div><strong className={r.change>=0?'positive':'negative'}>{r.change>0?'+':''}{fmt(r.change)} pp</strong></div>):<div className="mfEmpty">Choose two different months to detect portfolio changes.</div>}</div></article>
          <article className="mfCard"><div className="mfCardHead"><div><span className="overline">Consensus</span><h2>AMC favourite stocks</h2></div><Flame size={19}/></div><div className="mfFavList">{favorites.slice(0,8).map((x,i)=><div key={x.stock}><span>{i+1}</span><div><b>{x.stock}</b><small>{x.amcs.size} AMC{x.amcs.size!==1?'s':''} · {x.schemes.size} scheme{x.schemes.size!==1?'s':''}</small></div><strong>{fmt(x.avg)}%</strong></div>)}</div></article></div>
          <article className="mfCard mfSectorOverview"><div className="mfCardHead"><div><span className="overline">Allocation map</span><h2>Sector exposure</h2></div><BarChart3 size={19}/></div><div className="mfSectorBars">{sectors.slice(0,10).map(s=><div key={s.sector}><div><b>{s.sector}</b><span>{fmt(s.current)} <small className={s.change>=0?'positive':'negative'}>{s.change>0?'+':''}{fmt(s.change)} pp</small></span></div><i><em style={{width:`${Math.min(100,s.current/maxSector*100)}%`}}/></i></div>)}</div></article>
        </>}

        {tab==='movements'&&<article className="mfCard"><div className="mfCardHead"><div><span className="overline">Month-on-month</span><h2>{monthLabel(previousMonth)} → {monthLabel(currentMonth)}</h2></div><div className="mfMoveBadges"><span><TrendingUp/> {stats.increased} increased</span><span><TrendingDown/> {stats.reduced} reduced</span></div></div><div className="mfTable"><div className="mfTr mfTh"><span>Stock</span><span>Sector</span><span>Previous</span><span>Current</span><span>Change</span><span>Signal</span></div>{movements.map(r=><div className="mfTr" key={r.stock}><span><b>{r.stock}</b></span><span>{r.sector}</span><span>{fmt(r.previous)}%</span><span>{fmt(r.current)}%</span><span className={r.change>0?'positive':r.change<0?'negative':''}>{r.change>0?'+':''}{fmt(r.change)} pp</span><span><em className={`mfSignal ${r.status.toLowerCase()}`}>{r.status}</em></span></div>)}</div></article>}

        {tab==='stocks'&&<article className="mfCard"><div className="mfCardHead stockHead"><div><span className="overline">Cross-fund ownership</span><h2>Mutual fund favourite stocks</h2></div><label className="mfSearch"><Search size={15}/><input value={stockSearch} onChange={e=>setStockSearch(e.target.value)} placeholder="Search stock…"/></label></div><div className="mfTable"><div className="mfTr favTr mfTh"><span>Stock</span><span>Sector</span><span>AMCs</span><span>Schemes</span><span>Avg weight</span><span>Conviction</span></div>{searched.map(x=><div className="mfTr favTr" key={x.stock}><span><b>{x.stock}</b></span><span>{x.sector}</span><span>{x.amcs.size}</span><span>{x.schemes.size}</span><span>{fmt(x.avg)}%</span><span><strong className="conviction">{fmt(x.conviction,0)}</strong></span></div>)}</div></article>}

        {tab==='sectors'&&<article className="mfCard"><div className="mfCardHead"><div><span className="overline">Portfolio allocation</span><h2>Sector shifts</h2></div><BarChart3 size={19}/></div><div className="mfSectorDetail">{sectors.map(s=><div className="mfSectorRow" key={s.sector}><div><b>{s.sector}</b><small>{s.change>0?'Allocation increased':s.change<0?'Allocation reduced':'No material change'}</small></div><div className="mfSectorCompare"><span><small>{monthLabel(previousMonth)}</small><b>{fmt(s.previous)}</b></span><i>→</i><span><small>{monthLabel(currentMonth)}</small><b>{fmt(s.current)}</b></span><strong className={s.change>=0?'positive':'negative'}>{s.change>0?'+':''}{fmt(s.change)} pp</strong></div></div>)}</div></article>}

        <div className="mfMethod"><CheckCircle2 size={18}/><div><b>How to read the signals</b><p>Portfolio-weight changes are not identical to buy/sell quantities. Weight can move because the fund traded the security, because the security price moved relative to the rest of the portfolio, or because cash/AUM changed. Treat this dashboard as portfolio-disclosure intelligence and confirm trade conclusions with share-count disclosures where available.</p></div></div>
      </div>
    </section>

    <section className="mfCoverage wrap"><div><span className="overline">Built for five-year research</span><h2>One data model. Every AMC, every scheme, every month.</h2><p>The dashboard is designed around normalized monthly portfolio disclosures. Feed it 60 months of official AMC/AMFI data and the same interface scales from one scheme to the full Indian mutual-fund universe.</p></div><div className="mfCoverageSteps"><span>01 <b>Collect</b><small>AMC factsheets / portfolio disclosures</small></span><span>02 <b>Normalize</b><small>AMC · Scheme · Month · Stock · Sector · Weight</small></span><span>03 <b>Publish</b><small>Generate one optimized JSON dataset</small></span><span>04 <b>Explore</b><small>Consensus, changes, sectors & history</small></span></div></section>
    <footer className="calcFooter wrap"><p><LineChart size={15}/> Portfolio intelligence from disclosed mutual-fund holdings.</p><a href="/research">Research hub →</a></footer>
  </main>
}
