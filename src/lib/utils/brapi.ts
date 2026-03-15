const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = process.env.NEXT_PUBLIC_BRAPI_TOKEN || '';

function tokenParam(prefix: '?' | '&' = '?') {
  return BRAPI_TOKEN ? `${prefix}token=${BRAPI_TOKEN}` : '';
}

export interface BRAPIQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  priceEarnings: number | null;
  earningsPerShare: number | null;
  logourl: string | null;
  historicalDataPrice?: Array<{
    date: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjustedClose: number;
  }>;
}

export interface BRAPIResponse {
  results: BRAPIQuote[];
}

export async function getQuote(ticker: string): Promise<BRAPIQuote | null> {
  try {
    const res = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}${tokenParam('?')}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data: BRAPIResponse = await res.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<BRAPIQuote[]> {
  if (!tickers.length) return [];
  // Fetch each ticker individually so FIIs, ETFs and BDRs all work reliably.
  // BRAPI batch calls can silently drop non-stock assets on free plans.
  const results = await Promise.all(tickers.map(t => getQuote(t)));
  return results.filter((q): q is BRAPIQuote => q !== null);
}

export async function getHistory(ticker: string, range: string): Promise<BRAPIQuote | null> {
  try {
    const tp = BRAPI_TOKEN ? `token=${BRAPI_TOKEN}&` : '';
    const res = await fetch(
      `${BRAPI_BASE_URL}/quote/${ticker}?${tp}range=${range}&interval=1d`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data: BRAPIResponse = await res.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

export async function searchTicker(query: string): Promise<Array<{ symbol: string; shortName: string }>> {
  try {
    const tp = tokenParam('?');
    const sep = tp ? '&' : '?';
    const res = await fetch(`${BRAPI_BASE_URL}/available${tp}${sep}search=${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.stocks?.slice(0, 10).map((s: string) => ({ symbol: s, shortName: s })) || [];
  } catch {
    return [];
  }
}
