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
  return quotes[instrumentKey]
    ?? quotes[instrumentKey.replace("|", ":")]
    ?? Object.values(quotes).find(quote => quote.instrument_token === instrumentKey);
}
