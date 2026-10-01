import { Metadata } from 'next';
import PortfolioClient from './PortfolioClient';
import styles from './portfolio.module.css';

export const metadata: Metadata = {
  title: 'Portfolio Intelligence | CredoNomics',
  description: 'Factual portfolio analytics and research desk. Privacy-preserving local analysis.',
};

export default function PortfolioPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-3xl font-bold mb-2">Portfolio Intelligence</h1>
        <p className="text-gray-400">
          Analyze your portfolio factually. 
          <span className="text-yellow-500 ml-2 text-sm font-semibold">
            (Authentication deferred — local session mode only)
          </span>
        </p>
      </header>

      <main className={styles.main}>
        <PortfolioClient />
      </main>
    </div>
  );
}
