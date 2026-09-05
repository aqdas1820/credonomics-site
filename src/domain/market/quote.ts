export function calculateQuoteChange(price: number | null, previousClose: number | null) {
  if (price === null || previousClose === null) return { change: null, changePercent: null };
  const change = price - previousClose;
  return { change, changePercent: previousClose === 0 ? null : (change / previousClose) * 100 };
}

export function resolvePreviousClose(
  price: number | null,
  netChange: number | null,
  ohlcClose: number | null,
) {
  if (price !== null && netChange !== null) return price - netChange;
  return ohlcClose;
}

export function resolveProviderQuote<T extends { instrument_token?: unknown }>(
  quotes: Record<string, T> | undefined,
  instrumentKey: string,
) {
  if (!quotes) return undefined;
  
  if (quotes[instrumentKey]) return quotes[instrumentKey];
  if (quotes[instrumentKey.replace("|", ":")]) return quotes[instrumentKey.replace("|", ":")];
  
  const lowerKey = instrumentKey.toLowerCase();
  const matchedKey = Object.keys(quotes).find(k => k.toLowerCase() === lowerKey || k.toLowerCase() === lowerKey.replace("|", ":"));
  if (matchedKey) return quotes[matchedKey];

  return Object.values(quotes).find(quote => 
    typeof quote.instrument_token === "string" && quote.instrument_token.toLowerCase() === lowerKey
  );
}
