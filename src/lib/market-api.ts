/**
 * Data-fetching layer for market quotes and news.
 *
 * There are two possible transports, tried in order:
 *
 *  1. The serverless functions in netlify/functions/ (`/.netlify/functions/...`).
 *     This is the real path — used in production and under `netlify dev`.
 *
 *  2. A dev-only Vite proxy (`/yahoo-api`, `/yahoo-rss`, configured in
 *     vite.config.ts). This exists because `npm run dev` runs Vite alone and
 *     does NOT run the serverless functions, so path 1 returns Vite's
 *     index.html fallback instead of JSON.
 *
 * Important detail: a missing function under `vite dev` responds 200 + HTML,
 * not 404 — so `response.ok` is true and only the JSON parse fails. That's why
 * we explicitly check the content-type rather than trusting the status code.
 */

export interface MarketQuote {
  symbol: string;
  price: number | null;
  prevClose: number | null;
  error?: boolean;
}

export interface NewsArticleData {
  title: string;
  pubDate: string;
  link: string;
  thumbnail: string;
  description: string;
}

const isDev = Boolean(import.meta.env?.DEV);

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json');
}

// ---------------------------------------------------------------- quotes ---

async function fetchQuotesViaFunction(symbols: string[]): Promise<MarketQuote[] | null> {
  try {
    const response = await fetch(
      `/.netlify/functions/market-data?symbols=${encodeURIComponent(symbols.join(','))}`
    );
    if (!response.ok || !isJsonResponse(response)) return null;

    const data = await response.json();
    return Array.isArray(data?.results) ? (data.results as MarketQuote[]) : null;
  } catch {
    return null;
  }
}

async function fetchQuotesViaDevProxy(symbols: string[]): Promise<MarketQuote[]> {
  return Promise.all(
    symbols.map(async (symbol): Promise<MarketQuote> => {
      try {
        const response = await fetch(`/yahoo-api/v8/finance/chart/${encodeURIComponent(symbol)}`);
        if (!response.ok) return { symbol, price: null, prevClose: null, error: true };

        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return { symbol, price: null, prevClose: null, error: true };

        return {
          symbol,
          price: meta.regularMarketPrice ?? null,
          prevClose: meta.chartPreviousClose ?? null,
        };
      } catch {
        return { symbol, price: null, prevClose: null, error: true };
      }
    })
  );
}

/**
 * Fetch latest quotes for the given Yahoo symbols (e.g. "RELIANCE.NS").
 * Throws only if every transport fails, so callers can show an error state.
 */
export async function fetchMarketQuotes(symbols: string[]): Promise<MarketQuote[]> {
  const viaFunction = await fetchQuotesViaFunction(symbols);
  if (viaFunction) return viaFunction;

  if (isDev) {
    const viaProxy = await fetchQuotesViaDevProxy(symbols);
    if (viaProxy.some((q) => q.price != null)) return viaProxy;
  }

  throw new Error(
    'Market data unavailable. In local development run `netlify dev` (not `npm run dev`) to enable the serverless functions, or check the Vite dev proxy in vite.config.ts.'
  );
}

// ------------------------------------------------------------------ news ---

async function fetchNewsViaFunction(): Promise<NewsArticleData[] | null> {
  try {
    const response = await fetch('/.netlify/functions/news');
    if (!response.ok || !isJsonResponse(response)) return null;

    const data = await response.json();
    return Array.isArray(data?.items) && data.items.length > 0 ? (data.items as NewsArticleData[]) : null;
  } catch {
    return null;
  }
}

async function fetchNewsViaDevProxy(): Promise<NewsArticleData[] | null> {
  try {
    const response = await fetch('/yahoo-rss/news/rssindex');
    if (!response.ok) return null;

    const xml = await response.text();
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 6);

    const parsed = items.map((item) => ({
      title: item.querySelector('title')?.textContent?.trim() ?? '',
      link: item.querySelector('link')?.textContent?.trim() ?? '',
      pubDate: item.querySelector('pubDate')?.textContent?.trim() ?? '',
      description: (item.querySelector('description')?.textContent ?? '')
        .replace(/<[^>]+>/g, '')
        .trim(),
      thumbnail: '',
    }));

    const withTitles = parsed.filter((a) => a.title);
    return withTitles.length > 0 ? withTitles : null;
  } catch {
    return null;
  }
}

/** Fetch latest finance headlines. Throws if every transport fails. */
export async function fetchNews(): Promise<NewsArticleData[]> {
  const viaFunction = await fetchNewsViaFunction();
  if (viaFunction) return viaFunction;

  if (isDev) {
    const viaProxy = await fetchNewsViaDevProxy();
    if (viaProxy) return viaProxy;
  }

  throw new Error('News feed unavailable.');
}
