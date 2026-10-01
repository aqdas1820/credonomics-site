export const SECTORS = [
  { slug: 'information-technology', name: 'Information Technology' },
  { slug: 'financial-services', name: 'Financial Services' },
  { slug: 'automobiles', name: 'Automobiles' },
  { slug: 'fmcg', name: 'Fast Moving Consumer Goods' },
  { slug: 'pharmaceuticals', name: 'Pharmaceuticals' },
  { slug: 'telecommunication', name: 'Telecommunication' },
  { slug: 'metals-and-mining', name: 'Metals & Mining' }
];

export const SECTOR_CONSTITUENTS: Record<string, string[]> = {
  'information-technology': ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM', 'LTIM'],
  'financial-services': ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'BAJFINANCE'],
  'automobiles': ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'EICHERMOT'],
  'fmcg': ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'TATACONSUM'],
  'pharmaceuticals': ['SUNPHARMA', 'CIPLA', 'DRREDDY', 'DIVISLAB'],
  'telecommunication': ['BHARTIARTL', 'IDEA'],
  'metals-and-mining': ['TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'COALINDIA']
};
