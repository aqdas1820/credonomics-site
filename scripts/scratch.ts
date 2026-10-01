import { upstoxGet } from '../src/lib/upstox/client';

async function main() {
  const stock = 'NSE_EQ|INE002A01018'; // Reliance
  const competitors = await upstoxGet(`/v2/fundamentals/${encodeURIComponent(stock)}/competitors`, { ttlMs: 1 });
  console.log(JSON.stringify(competitors, null, 2));
}

main().catch(console.error);
