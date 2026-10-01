import Link from 'next/link';
import { getOwnershipChanges } from '../../src/services/research/OwnershipScannerService';

export const metadata = {
  title: 'Ownership Scanner | CredoNomics',
  description: 'Factual shareholding change intelligence across Indian equities.',
};

export default async function OwnershipScannerPage() {
  const results = await getOwnershipChanges();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 pb-20">
      <header className="mb-6">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ownership Scanner</h1>
         <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
           Track factual quarter-on-quarter changes in Promoter, FII, and DII holding across market leaders.
         </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
         <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Previous Period</th>
                  <th className="px-4 py-3 font-medium text-right">Previous %</th>
                  <th className="px-4 py-3 font-medium text-right">Current Period</th>
                  <th className="px-4 py-3 font-medium text-right">Current %</th>
                  <th className="px-4 py-3 font-medium text-right">Change</th>
                  <th className="px-4 py-3 font-medium">Source</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
               {results.map((item, idx) => (
                  <tr key={`${item.instrumentKey}-${item.category}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="px-4 py-3">
                        <Link href={`/stocks/NSE/${item.symbol}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                           {item.companyName}
                        </Link>
                     </td>
                     <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                           {item.category}
                        </span>
                     </td>
                     <td className="px-4 py-3 text-right text-slate-500">{item.previousPeriod}</td>
                     <td className="px-4 py-3 text-right font-mono">{item.previousPercent.toFixed(2)}%</td>
                     <td className="px-4 py-3 text-right text-slate-500">{item.currentPeriod}</td>
                     <td className="px-4 py-3 text-right font-mono font-medium">{item.currentPercent.toFixed(2)}%</td>
                     <td className="px-4 py-3 text-right font-mono">
                        <span className={item.change > 0 ? 'text-emerald-600' : 'text-red-500'}>
                           {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                        </span>
                     </td>
                     <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate" title={item.source}>
                        {item.source}
                     </td>
                  </tr>
               ))}
               {results.length === 0 && (
                  <tr>
                     <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        No significant ownership changes detected in the current universe.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
