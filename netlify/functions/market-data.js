// Server-side market data proxy.
//
// Why this exists: the previous implementation called Yahoo Finance's chart
// API directly from the browser through a public, unauthenticated CORS relay
// (allorigins.win). That's unreliable (rate-limited, can disappear any time)
// and pointless from a security standpoint since Yahoo's endpoint has no
// CORS restriction against *server-to-server* calls in the first place —
// the proxy was only ever needed because a browser was asking. Fetching it
// here removes the third-party dependency entirely and lets us cache/rate
// limit centrally instead of every visitor hammering Yahoo independently.
//
// NOTE: this still uses Yahoo Finance's unofficial chart endpoint, which has
// no published SLA or commercial license. Fine for a personal project/demo;
// swap this out for a licensed provider (e.g. a broker's market data API,
// or a paid vendor like Twelve Data / Alpha Vantage) before relying on it
// for a real product.

const { json, guard, fetchWithTimeout } = require('./_lib/security');

// Strict allow-list: only the symbols the site actually displays can be
// requested, so this endpoint can't be used as an open proxy to Yahoo.
const ALLOWED_SYMBOLS = new Set([
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
  'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'HINDUNILVR.NS', 'LT.NS',
  '^NSEI', 'NIFTYBEES.NS', 'GC=F',
]);

exports.handler = async (event) => {
  const blocked = guard(event, { methods: ['GET'], name: 'market', max: 60, windowMs: 60_000 });
  if (blocked) return blocked;

  const symbolsParam = event.queryStringParameters?.symbols;
  if (!symbolsParam || symbolsParam.length > 400) {
    return json(400, { error: 'Missing or invalid "symbols" query parameter (comma-separated).' });
  }

  const symbols = [...new Set(symbolsParam.split(',').map((s) => s.trim()))]
    .filter((s) => ALLOWED_SYMBOLS.has(s))
    .slice(0, ALLOWED_SYMBOLS.size);

  if (symbols.length === 0) {
    return json(400, { error: 'No valid symbols provided.' });
  }

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const res = await fetchWithTimeout(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyGrowwBot/1.0)' } },
            6000
          );
          if (!res.ok) return { symbol, error: true };

          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) return { symbol, error: true };

          const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
          return { symbol, price: num(meta.regularMarketPrice), prevClose: num(meta.chartPreviousClose) };
        } catch {
          return { symbol, error: true };
        }
      })
    );

    // Short CDN cache so bursts of visitors share one upstream fetch.
    return json(
      200,
      { results, fetchedAt: new Date().toISOString() },
      { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=30' }
    );
  } catch (err) {
    console.error('market-data failed', err);
    return json(502, { error: 'Failed to fetch market data' });
  }
};
