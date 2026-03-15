const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = process.env.EXPO_PUBLIC_BRAPI_TOKEN || '';

function tokenParam(prefix: '?' | '&' = '?') {
  return BRAPI_TOKEN ? `${prefix}token=${BRAPI_TOKEN}` : '';
}

export interface BRAPIQuote {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  logourl: string | null;
}

export async function getQuote(ticker: string): Promise<BRAPIQuote | null> {
  try {
    const res = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}${tokenParam('?')}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<BRAPIQuote[]> {
  if (!tickers.length) return [];
  const results = await Promise.all(tickers.map(t => getQuote(t)));
  return results.filter((q): q is BRAPIQuote => q !== null);
}

export async function searchTicker(query: string): Promise<Array<{ symbol: string }>> {
  try {
    const tp = tokenParam('?');
    const sep = tp ? '&' : '?';
    const res = await fetch(`${BRAPI_BASE_URL}/available${tp}${sep}search=${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.stocks?.slice(0, 10).map((s: string) => ({ symbol: s })) || [];
  } catch {
    return [];
  }
}
