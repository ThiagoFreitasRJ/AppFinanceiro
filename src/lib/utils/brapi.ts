const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = process.env.NEXT_PUBLIC_BRAPI_TOKEN || '';

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
    const tokenParam = BRAPI_TOKEN ? `?token=${BRAPI_TOKEN}` : '';
    const res = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}${tokenParam}`, {
      next: { revalidate: 60 }
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
  try {
    const symbols = tickers.join(',');
    const tokenParam = BRAPI_TOKEN ? `?token=${BRAPI_TOKEN}` : '';
    const res = await fetch(`${BRAPI_BASE_URL}/quote/${symbols}${tokenParam}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data: BRAPIResponse = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function getHistory(ticker: string, range: string): Promise<BRAPIQuote | null> {
  try {
    const baseToken = BRAPI_TOKEN ? `token=${BRAPI_TOKEN}&` : '';
    const res = await fetch(
      `${BRAPI_BASE_URL}/quote/${ticker}?${baseToken}range=${range}&interval=1d`,
      { next: { revalidate: 3600 } }
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
    const tokenParam = BRAPI_TOKEN ? `?token=${BRAPI_TOKEN}&` : '?';
    const res = await fetch(`${BRAPI_BASE_URL}/available${tokenParam}search=${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.stocks?.slice(0, 10).map((s: string) => ({ symbol: s, shortName: s })) || [];
  } catch {
    return [];
  }
}
