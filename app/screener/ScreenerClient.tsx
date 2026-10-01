'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { FilterCondition, ScreenerQuery, ScreenerResult } from '../../src/domain/screener/types';

const PRESETS = [
  {
    id: 'high-roce',
    name: 'High ROCE',
    description: 'Companies generating efficient returns on capital employed (>20%).',
    filters: [{ field: 'roce', operator: '>', value: 20 }] as FilterCondition[]
  },
  {
    id: 'revenue-growth',
    name: 'High Revenue Growth',
    description: 'Quarterly YoY revenue growth exceeds 25%.',
    filters: [{ field: 'revenueGrowthYoY', operator: '>', value: 25, periodSemantics: 'yoy_quarterly' }] as FilterCondition[]
  },
  {
    id: 'low-debt',
    name: 'Low Debt',
    description: 'Debt to Equity ratio below 0.5.',
    filters: [{ field: 'debtToEquity', operator: '<', value: 0.5 }] as FilterCondition[]
  }
];

export default function ScreenerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState<ScreenerQuery>({ filters: [] });
  const [result, setResult] = useState<ScreenerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from URL
  useEffect(() => {
    const filtersParam = searchParams.get('filters');
    if (filtersParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(filtersParam));
        setQuery({ filters: decoded });
      } catch (e) {
        console.error('Failed to parse URL filters', e);
      }
    }
  }, [searchParams]);

  // Sync to URL
  const updateUrl = useCallback((newQuery: ScreenerQuery) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.filters.length > 0) {
       params.set('filters', encodeURIComponent(JSON.stringify(newQuery.filters)));
    } else {
       params.delete('filters');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const runScreen = useCallback(async (currentQuery: ScreenerQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/screener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentQuery)
      });
      if (!res.ok) throw new Error('Failed to run screener');
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Run screen when query changes
  useEffect(() => {
     if (query.filters.length > 0) {
        runScreen(query);
     } else {
        setResult(null);
     }
  }, [query, runScreen]);

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const newQuery = { ...query, filters: preset.filters };
    setQuery(newQuery);
    updateUrl(newQuery);
  };

  const clearFilters = () => {
    setQuery({ filters: [] });
    updateUrl({ filters: [] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar: Filters & Presets */}
      <div className="lg:col-span-1 space-y-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-4">Discovery Presets</h2>
            <div className="space-y-3">
               {PRESETS.map(preset => (
                 <button 
                   key={preset.id}
                   onClick={() => applyPreset(preset.id)}
                   className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors group"
                 >
                   <div className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                     {preset.name}
                   </div>
                   <div className="text-xs text-slate-500 mt-1">{preset.description}</div>
                 </button>
               ))}
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Active Filters</h2>
              {query.filters.length > 0 && (
                <button onClick={clearFilters} className="text-xs font-medium text-red-500 hover:text-red-600">Clear All</button>
              )}
            </div>

            {query.filters.length === 0 ? (
              <div className="text-sm text-slate-500 italic py-4 text-center">No active filters. Select a preset to begin.</div>
            ) : (
              <div className="space-y-3">
                 {query.filters.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-slate-50 dark:bg-slate-800">
                       <span className="font-medium font-mono text-xs">{f.field}</span>
                       <span className="text-slate-500 font-mono text-xs">{f.operator} {Array.isArray(f.value) ? f.value.join(' and ') : f.value}</span>
                    </div>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* Main Content: Results Table */}
      <div className="lg:col-span-3">
         {loading && !result ? (
            <div className="h-64 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
         ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
         ) : !result ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
               <div className="text-center text-slate-500">
                  <p>Run a screen to discover factual opportunities.</p>
               </div>
            </div>
         ) : (
            <div className="space-y-4">
               {/* Coverage Report */}
               <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 text-sm">
                  <div className="font-medium">Screen Evaluated: <span className="text-emerald-600">{result.totalMatched}</span> / {result.totalEvaluated}</div>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
                  <div className="flex gap-4 text-slate-500 text-xs">
                     <span title="Data freshness">Financials: {result.dataCoverage.financials}</span>
                     <span title="Data freshness">Shareholding: {result.dataCoverage.shareholding}</span>
                  </div>
               </div>

               {/* Institutional Table */}
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                     <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                           <th className="px-4 py-3 font-medium">Company</th>
                           <th className="px-4 py-3 font-medium">Sector</th>
                           <th className="px-4 py-3 font-medium text-right">Price</th>
                           <th className="px-4 py-3 font-medium text-right">P/E</th>
                           <th className="px-4 py-3 font-medium text-right">ROCE</th>
                           <th className="px-4 py-3 font-medium text-right">Rev YoY</th>
                           <th className="px-4 py-3 font-medium text-right">D/E</th>
                           <th className="px-4 py-3 font-medium text-right">Latest Qtr</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {result.items.length === 0 ? (
                           <tr>
                              <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                 No companies matched the current filters.
                              </td>
                           </tr>
                        ) : result.items.map((item) => (
                           <tr key={item.instrumentKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-3">
                                 <Link href={`/stocks/NSE/${item.symbol}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                                    {item.companyName}
                                 </Link>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{item.sector}</td>
                              <td className="px-4 py-3 text-right font-mono">
                                 {item.price !== null ? `₹${item.price.toFixed(1)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                 {item.pe !== null ? item.pe.toFixed(2) : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                 {item.roce !== null ? `${item.roce.toFixed(1)}%` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                 {item.revenueGrowthYoY !== null ? (
                                    <span className={item.revenueGrowthYoY > 0 ? 'text-emerald-600' : item.revenueGrowthYoY < 0 ? 'text-red-500' : ''}>
                                       {item.revenueGrowthYoY > 0 ? '+' : ''}{item.revenueGrowthYoY.toFixed(1)}%
                                    </span>
                                 ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                 {item.debtToEquity !== null ? item.debtToEquity.toFixed(2) : '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-xs text-slate-500">
                                 {item.latestReportingPeriod || '-'}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
