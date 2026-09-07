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

const ALLOWED_SYMBOL = /^[A-Za-z0-9.\^-]{1,20}$/;

exports.handler = async (event) => {
  const symbolsParam = event.queryStringParameters?.symbols;

  if (!symbolsParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required "symbols" query parameter (comma-separated).' }),
    };
  }

  const symbols = symbolsParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && ALLOWED_SYMBOL.test(s))
    .slice(0, 20); // hard cap so a malicious/huge query can't fan out unbounded requests

  if (symbols.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No valid symbols provided.' }) };
  }

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyGrowwBot/1.0)' } }
          );
          if (!res.ok) return { symbol, error: true };

          const data = await res.json();
          const result = data?.chart?.result?.[0];
          if (!result?.meta) return { symbol, error: true };

          const price = result.meta.regularMarketPrice ?? null;
          const prevClose = result.meta.chartPreviousClose ?? null;

          return { symbol, price, prevClose };
        } catch {
          return { symbol, error: true };
        }
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Short CDN cache so bursts of concurrent visitors share one upstream fetch
        // instead of each polling client re-hitting Yahoo individually.
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
      },
      body: JSON.stringify({ results, fetchedAt: new Date().toISOString() }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to fetch market data', detail: String(err) }) };
  }
};
