import Link from 'next/link';
import { getCorporateActions } from '../../src/services/research/CorporateActionScanner';

export const metadata = {
  title: 'Corporate Actions Calendar | CredoNomics',
  description: 'Factual corporate actions calendar tracking dividends, splits, bonuses, and rights issues.',
};

export default async function CorporateActionsPage() {
  const results = await getCorporateActions();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 pb-20">
      <header className="mb-6">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Corporate Actions Calendar</h1>
         <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
           Track factual corporate actions across Indian equities. All dates are verified.
         </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
         <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Event Type</th>
                  <th className="px-4 py-3 font-medium text-right">Announcement Date</th>
                  <th className="px-4 py-3 font-medium text-right">Event Date</th>
                  <th className="px-4 py-3 font-medium text-right">Record Date</th>
                  <th className="px-4 py-3 font-medium text-right">Ex-Date</th>
                  <th className="px-4 py-3 font-medium">Source</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
               {results.map((item, idx) => (
                  <tr key={`${item.instrumentKey}-${item.type}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="px-4 py-3">
                        <Link href={`/stocks/NSE/${item.symbol}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                           {item.companyName}
                        </Link>
                     </td>
                     <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                           {item.type}
                        </span>
                     </td>
                     <td className="px-4 py-3 text-right text-slate-500">{item.announcementDate || '-'}</td>
                     <td className="px-4 py-3 text-right text-slate-500 font-medium">{item.eventDate || '-'}</td>
                     <td className="px-4 py-3 text-right text-slate-500">{item.recordDate || '-'}</td>
                     <td className="px-4 py-3 text-right text-slate-500">{item.exDate || '-'}</td>
                     <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate" title={item.source}>
                        {item.source}
                     </td>
                  </tr>
               ))}
               {results.length === 0 && (
                  <tr>
                     <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No upcoming or recent corporate actions found in the current tracking universe.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
