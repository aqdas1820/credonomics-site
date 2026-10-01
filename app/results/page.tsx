import Link from 'next/link';
import { getRecentResults } from '../../src/services/research/ResultsIntelligenceService';

export const metadata = {
  title: 'Results Center | CredoNomics',
  description: 'Factual earnings and financial results center for Indian equities.',
};

export default async function ResultsPage() {
  const results = await getRecentResults();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 pb-20">
      <header className="mb-6">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Results Center</h1>
         <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
           Track recently reported financial results with explicit reporting periods and provenance.
         </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
         <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium text-right">Reporting Period</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue (Cr)</th>
                  <th className="px-4 py-3 font-medium text-right">Rev YoY</th>
                  <th className="px-4 py-3 font-medium text-right">Net Profit (Cr)</th>
                  <th className="px-4 py-3 font-medium text-right">Profit YoY</th>
                  <th className="px-4 py-3 font-medium text-right">Op Margin</th>
                  <th className="px-4 py-3 font-medium">Source</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
               {results.map((item) => (
                  <tr key={item.instrumentKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="px-4 py-3">
                        <Link href={`/stocks/NSE/${item.symbol}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                           {item.companyName}
                        </Link>
                     </td>
                     <td className="px-4 py-3 text-right text-slate-500">
                        {item.reportingPeriod || '-'}
                     </td>
                     <td className="px-4 py-3 text-right font-mono">
                        {item.revenue !== null ? item.revenue.toFixed(2) : '-'}
                     </td>
                     <td className="px-4 py-3 text-right font-mono">
                        {item.revenueYoY !== null ? (
                           <span className={item.revenueYoY > 0 ? 'text-emerald-600' : item.revenueYoY < 0 ? 'text-red-500' : ''}>
                              {item.revenueYoY > 0 ? '+' : ''}{item.revenueYoY.toFixed(1)}%
                           </span>
                        ) : '-'}
                     </td>
                     <td className="px-4 py-3 text-right font-mono">
                        {item.profit !== null ? item.profit.toFixed(2) : '-'}
                     </td>
                     <td className="px-4 py-3 text-right font-mono">
                        {item.profitYoY !== null ? (
                           <span className={item.profitYoY > 0 ? 'text-emerald-600' : item.profitYoY < 0 ? 'text-red-500' : ''}>
                              {item.profitYoY > 0 ? '+' : ''}{item.profitYoY.toFixed(1)}%
                           </span>
                        ) : '-'}
                     </td>
                     <td className="px-4 py-3 text-right font-mono">
                        {item.operatingMargin !== null ? `${item.operatingMargin.toFixed(1)}%` : '-'}
                     </td>
                     <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate" title={item.source}>
                        {item.source}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
