import { Suspense } from 'react';
import ScreenerClient from './ScreenerClient';

export const metadata = {
  title: 'Market Screener | CredoNomics',
  description: 'Factual Indian equity screener with explainable filters and accurate period semantics.',
};

export default function ScreenerPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 pb-20">
      <header className="mb-6">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Market Screener</h1>
         <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
           Filter companies using strictly normalized financial, valuation, and ownership data.
           All metrics preserve explicit reporting periods. No opaque investment scoring.
         </p>
      </header>

      <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500">Loading Screener Engine...</div>}>
         <ScreenerClient />
      </Suspense>
    </div>
  );
}
