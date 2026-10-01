import Link from 'next/link';
import { getCorporateActions } from '../../src/services/research/CorporateActionScanner';
import { getRecentResults } from '../../src/services/research/ResultsIntelligenceService';

export const metadata = {
  title: 'Event Discovery | CredoNomics',
  description: 'Factual event-driven discovery for Indian equities.',
};

export default async function EventDiscoveryPage() {
  const actions = await getCorporateActions();
  const results = await getRecentResults();

  // Combine results into an Event stream
  const events = [];
  
  for (const a of actions) {
     events.push({
        id: `${a.instrumentKey}-${a.type}`,
        instrumentKey: a.instrumentKey,
        symbol: a.symbol,
        companyName: a.companyName,
        eventType: a.type,
        date: a.eventDate || a.announcementDate || '-',
        source: a.source
     });
  }

  for (const r of results) {
     events.push({
        id: `${r.instrumentKey}-result`,
        instrumentKey: r.instrumentKey,
        symbol: r.symbol,
        companyName: r.companyName,
        eventType: 'Quarterly Results',
        date: r.reportedDate || r.reportingPeriod || '-',
        source: r.source
     });
  }

  // Sort events by date if possible (string sort for now)
  events.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 pb-20">
      <header className="mb-6">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Event Discovery</h1>
         <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
           Track recent and upcoming events driving factual changes across the market.
         </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
         <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex gap-4 text-sm">
            <select className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5">
               <option>All Event Types</option>
               <option>Quarterly Results</option>
               <option>Dividends</option>
               <option>Splits</option>
               <option>Bonus</option>
            </select>
            <select className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5">
               <option>All Sectors</option>
            </select>
         </div>
         
         <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Event Type</th>
                  <th className="px-4 py-3 font-medium text-right">Relevant Date</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
               {events.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="px-4 py-3">
                        <Link href={`/stocks/NSE/${item.symbol}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                           {item.companyName}
                        </Link>
                     </td>
                     <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                           {item.eventType}
                        </span>
                     </td>
                     <td className="px-4 py-3 text-right text-slate-500 font-mono">{item.date}</td>
                     <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate" title={item.source}>
                        {item.source}
                     </td>
                     <td className="px-4 py-3 text-right">
                        <Link href={`/stocks/NSE/${item.symbol}#timeline`} className="text-emerald-600 hover:underline">
                           View Timeline &rarr;
                        </Link>
                     </td>
                  </tr>
               ))}
               {events.length === 0 && (
                  <tr>
                     <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No events found in the current tracking universe.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
