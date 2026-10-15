// Server-side market data proxy for the "Market snapshot" tiles.
//
// Fetches Yahoo Finance chart data server-to-server (no CORS relay needed)
// and caches the last good answer per symbol, so a brief upstream failure
// shows slightly older prices with their time instead of an error.
//
// NOTE: Yahoo's chart endpoint is unofficial: no SLA and no commercial
// licence. Exchange index data shown to the public may need a redistribution
// licence. Before relying on this commercially, switch to a licensed,
// delayed-data provider and keep the "as of" time visible (see README).

const { json, guard, fetchWithTimeout } = require('./_lib/security');

const TROY_OUNCE_GRAMS = 31.1034768;

// Only these can be requested, so the endpoint can't be used as an open proxy.
// GOLD_INR_10G is derived: COMEX gold (USD/oz) × USD/INR, per 10 grams.
const ALLOWED_SYMBOLS = new Set(['^NSEI', '^BSESN', 'GOLD_INR_10G']);

// Last good quote per symbol, kept while this function instance is warm.
const lastGood = new Map();

async function fetchYahoo(symbol) {
  const res = await fetchWithTimeout(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyGrowwBot/1.0)' } },
    6000
  );
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const price = num(meta?.regularMarketPrice);
  const prevClose = num(meta?.chartPreviousClose);
  const time = num(meta?.regularMarketTime);
  if (price == null) throw new Error('no price');
  return { price, prevClose, asOf: time ? new Date(time * 1000).toISOString() : new Date().toISOString() };
}

async function quote(symbol) {
  if (symbol === 'GOLD_INR_10G') {
    const [gold, fx] = await Promise.all([fetchYahoo('GC=F'), fetchYahoo('INR=X')]);
    const per10g = (usdPerOz, usdInr) => (usdPerOz * usdInr * 10) / TROY_OUNCE_GRAMS;
    return {
      price: per10g(gold.price, fx.price),
      prevClose: gold.prevClose && fx.prevClose ? per10g(gold.prevClose, fx.prevClose) : null,
      asOf: gold.asOf,
    };
  }
  return fetchYahoo(symbol);
}

exports.handler = async (event) => {
  const blocked = guard(event, { methods: ['GET'], name: 'market', max: 60, windowMs: 60_000 });
  if (blocked) return blocked;

  const symbolsParam = event.queryStringParameters?.symbols;
  if (!symbolsParam || symbolsParam.length > 200) {
    return json(400, { error: 'Missing or invalid "symbols" query parameter (comma-separated).' });
  }

  const symbols = [...new Set(symbolsParam.split(',').map((s) => s.trim()))].filter((s) => ALLOWED_SYMBOLS.has(s));
  if (symbols.length === 0) {
    return json(400, { error: 'No valid symbols provided.' });
  }

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const q = await quote(symbol);
        const fresh = { symbol, ...q, stale: false };
        lastGood.set(symbol, fresh);
        return fresh;
      } catch (err) {
        const cached = lastGood.get(symbol);
        if (cached) return { ...cached, stale: true };
        console.error('market-data failed', symbol, err && err.message);
        return { symbol, price: null, prevClose: null, error: true };
      }
    })
  );

  // Short CDN cache so bursts of visitors share one upstream fetch; serve a
  // stale copy for up to 10 minutes if a refresh fails.
  return json(
    200,
    { results, fetchedAt: new Date().toISOString() },
    { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=600' }
  );
};
