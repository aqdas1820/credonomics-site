import Link from 'next/link';
import { screenerService } from '../../src/services/research/ScreenerService';

export const metadata = {
  title: 'Market Heatmap | CredoNomics',
  description: 'Factual visualization of Indian equity performance and valuation metrics.',
};

export default async function HeatmapPage() {
  // Fetch all available universe
  const result = await screenerService.screen({ filters: [], limit: 200 });

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 pb-20">
      <header className="mb-6">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Market Heatmap</h1>
         <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
           A factual, non-hallucinated view of metric performance across market leaders. Colors represent actual normalized values.
         </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
         <div className="mb-6 flex gap-4 text-sm font-medium">
            <span className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
               Metric: Revenue YoY
            </span>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
            {result.items.map(item => {
               const val = item.revenueGrowthYoY;
               let bg = 'bg-slate-100 dark:bg-slate-800 text-slate-500';
               let display = '-';
               
               if (val !== null) {
                  display = `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
                  if (val > 20) bg = 'bg-emerald-500 text-white';
                  else if (val > 5) bg = 'bg-emerald-400 text-white';
                  else if (val > 0) bg = 'bg-emerald-300 text-emerald-900';
                  else if (val > -5) bg = 'bg-red-300 text-red-900';
                  else if (val > -20) bg = 'bg-red-400 text-white';
                  else bg = 'bg-red-500 text-white';
               }

               return (
                  <Link 
                     key={item.instrumentKey} 
                     href={`/stocks/NSE/${item.symbol}`}
                     className={`aspect-square p-2 flex flex-col items-center justify-center text-center rounded-sm transition-transform hover:scale-105 hover:shadow-lg ${bg}`}
                     title={`${item.companyName}\nSector: ${item.sector}\nRevenue YoY: ${display}\nPeriod: ${item.latestReportingPeriod || 'Unknown'}`}
                  >
                     <span className="font-bold text-xs truncate w-full">{item.symbol}</span>
                     <span className="text-xs font-mono mt-1 opacity-90">{display}</span>
                  </Link>
               )
            })}
         </div>

         {result.items.length === 0 && (
            <div className="py-12 text-center text-slate-500">
               Data unavailable for heatmap rendering.
            </div>
         )}
         
         <div className="mt-6 flex flex-wrap items-center justify-between text-xs text-slate-500">
             <span>Evaluated {result.totalMatched} companies</span>
             <span title="Freshness">Data: {result.dataCoverage.financials}</span>
         </div>
      </div>
    </div>
  );
}
