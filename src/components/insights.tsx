import { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fetchNews, fetchMarketQuotes, type MarketQuote, type NewsArticleData } from '../lib/market-api';
import { honestProjection } from '../lib/finance';
import { REFERENCE_RATES, RATES_AS_OF, DEFAULT_INFLATION } from '../data/reference-rates';

// Only http(s) URLs may reach an href. Anything else (e.g. "javascript:")
// from a feed or data file falls back to an inert "#".
function safeExternalUrl(value: string): string {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '#';
  } catch {
    return '#';
  }
}

function timeAgo(dateString: string): string {
  const then = new Date(dateString).getTime();
  if (!Number.isFinite(then)) return '';
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  return new Date(then).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const POLL_MS = 60000;
const CACHE_KEY = 'moneygroww-market-cache-v2';

/* -------------------------------------------------------------------------- */
/*  Market snapshot                                                           */
/* -------------------------------------------------------------------------- */

interface MarketTile {
  id: string;
  title: string;
  description: string;
  prefix?: string;
  suffix?: string;
  value: number | null;
  changePct: number | null;
  /** Static reference figure rather than a live quote. */
  reference?: boolean;
}

const fd = REFERENCE_RATES.find((r) => r.id === 'fd')!;
const ppf = REFERENCE_RATES.find((r) => r.id === 'ppf')!;

const LIVE_TILES: MarketTile[] = [
  { id: '^NSEI', title: 'NIFTY 50', description: 'India’s 50 largest listed companies on the NSE', value: null, changePct: null },
  { id: '^BSESN', title: 'SENSEX', description: '30 large companies on the BSE', value: null, changePct: null },
  {
    id: 'GOLD_INR_10G',
    title: 'Gold, per 10 g',
    description: 'International price in rupees. Jewellers add import duty, GST and making charges.',
    prefix: '₹',
    value: null,
    changePct: null,
  },
];

const REFERENCE_TILES: MarketTile[] = [
  { id: 'FD', title: 'Bank FD, 1 year', description: fd.note, suffix: '%', value: fd.rate, changePct: null, reference: true },
  { id: 'PPF', title: 'PPF', description: ppf.note, suffix: '%', value: ppf.rate, changePct: null, reference: true },
];

interface CachedQuotes {
  savedAt: string;
  quotes: MarketQuote[];
}

function readCache(): CachedQuotes | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedQuotes;
    return Array.isArray(parsed?.quotes) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(quotes: MarketQuote[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), quotes }));
  } catch {
    // Storage unavailable; the page still works without it.
  }
}

function applyQuotes(tiles: MarketTile[], quotes: MarketQuote[]): MarketTile[] {
  const bySymbol = new Map(quotes.map((q) => [q.symbol, q]));
  return tiles.map((tile) => {
    const q = bySymbol.get(tile.id);
    if (!q || q.error || q.price == null) return tile;
    return {
      ...tile,
      value: q.price,
      changePct: q.prevClose ? ((q.price - q.prevClose) / q.prevClose) * 100 : null,
    };
  });
}

function latestAsOf(quotes: MarketQuote[]): Date | null {
  const times = quotes.map((q) => (q.asOf ? new Date(q.asOf).getTime() : NaN)).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : null;
}

function formatTileValue(tile: MarketTile) {
  if (tile.value == null) return '—';
  const digits = tile.reference ? 1 : tile.prefix ? 0 : 2;
  const number = tile.value.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return `${tile.prefix ?? ''}${number}${tile.suffix ?? ''}`;
}

function Change({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-[0.8125rem] text-ink-3">—</span>;
  const flat = Math.abs(pct) < 0.005;
  const up = pct > 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  // Direction is carried by the icon and the sign as well as the color.
  return (
    <span className={`tabular inline-flex items-center gap-1 text-[0.8125rem] font-medium ${flat ? 'text-ink-3' : up ? 'text-pos' : 'text-neg'}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {flat ? '0.00%' : `${up ? '+' : '−'}${Math.abs(pct).toFixed(2)}%`}
      <span className="sr-only"> since previous close</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Static content                                                            */
/* -------------------------------------------------------------------------- */

type TipAction = { kind: 'calc'; tab: string; label: string } | { kind: 'chat'; label: string; question: string } | { kind: 'link'; href: string; label: string };

const MONEY_HABITS: { title: string; tip: string; impact: 'High' | 'Medium' | 'Low'; action: TipAction }[] = [
  {
    title: 'Build an emergency fund first',
    tip: 'Keep about 6 months of essential expenses in a savings account or liquid fund before taking market risk.',
    impact: 'High',
    action: { kind: 'calc', tab: 'goal', label: 'Plan it as a goal' },
  },
  {
    title: 'Raise your SIP every year',
    tip: 'Increase it by 10% with each salary hike. It barely dents take-home pay and sharply lifts what you end up with.',
    impact: 'High',
    action: { kind: 'calc', tab: 'sip', label: 'Try a yearly step-up' },
  },
  {
    title: 'Automate on payday',
    tip: 'Schedule SIPs and savings transfers for the day after salary arrives, before spending starts.',
    impact: 'High',
    action: { kind: 'chat', label: 'Ask how to set it up', question: 'How do I automate my SIPs and savings on payday?' },
  },
  {
    title: 'Watch fund costs',
    tip: 'A 1% yearly expense ratio can take 5–6% of a 10-year result. Direct plans of the same fund cost less than regular plans.',
    impact: 'High',
    action: { kind: 'calc', tab: 'sip', label: 'See the cost of costs' },
  },
  {
    title: 'Follow 50-30-20',
    tip: 'Roughly 50% of take-home pay for needs, 30% for wants and 20% for saving and investing.',
    impact: 'Medium',
    action: { kind: 'chat', label: 'Ask about budgeting', question: 'Explain the 50-30-20 rule with an example for ₹40,000 take-home pay.' },
  },
  {
    title: 'Prepay costly loans',
    tip: 'Extra payments early in a loan save the most interest. Clear credit cards and personal loans before investing more.',
    impact: 'Medium',
    action: { kind: 'calc', tab: 'emi', label: 'See what prepaying saves' },
  },
  {
    title: 'Know your tax regime',
    tip: 'The new regime is the default for most salaried people. Deductions such as PPF, ELSS and EPF (up to ₹1.5 lakh) count only under the old regime.',
    impact: 'Medium',
    action: { kind: 'chat', label: 'Ask: old vs new regime', question: 'Old vs new tax regime: what is the difference and how do I tell which suits me?' },
  },
  {
    title: 'Cancel idle subscriptions',
    tip: 'Audit OTT, app and gym memberships every quarter and cancel anything unused for 30 days.',
    impact: 'Low',
    action: { kind: 'link', href: 'https://www.investopedia.com/terms/d/discretionaryincome.asp', label: 'Learn more' },
  },
];

const IMPACT_STYLE: Record<string, string> = {
  High: 'bg-accent-soft text-accent',
  Medium: 'bg-secondary text-ink-2',
  Low: 'bg-secondary text-ink-3',
};

const lakh = (v: number) => `₹${(v / 100000).toFixed(1)}L`;
const SCENARIO_YEARS = [5, 10, 15, 20];

// Same honest engine as the calculators: equity fund at an assumed 12%, 1% cost, tax and inflation applied.
const COMPOUNDING_ROWS = SCENARIO_YEARS.map((years) => {
  const r = honestProjection({ monthly: 5000, years, returnPct: 12, costPct: 1, tax: 'equity', inflationPct: DEFAULT_INFLATION });
  return { years, invested: lakh(r.invested), value: lakh(r.headlineValue), real: lakh(r.todaysMoney) };
});

const INFLATION_ROWS = SCENARIO_YEARS.map((years) => ({
  years,
  value: `₹${Math.round(100000 / Math.pow(1 + DEFAULT_INFLATION / 100, years)).toLocaleString('en-IN')}`,
}));

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

interface InsightsProps {
  onNavigateToCalculators: (tabValue?: string) => void;
  onAsk: (question?: string) => void;
}

export function Insights({ onNavigateToCalculators, onAsk }: InsightsProps) {
  const [news, setNews] = useState<NewsArticleData[]>([]);
  const [newsState, setNewsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const cached = typeof window !== 'undefined' ? readCache() : null;
  const [tiles, setTiles] = useState<MarketTile[]>(() => (cached ? applyQuotes(LIVE_TILES, cached.quotes) : LIVE_TILES));
  const [asOf, setAsOf] = useState<Date | null>(() => (cached ? latestAsOf(cached.quotes) ?? new Date(cached.savedAt) : null));
  const [marketState, setMarketState] = useState<'loading' | 'live' | 'cached' | 'unavailable'>(cached ? 'cached' : 'loading');

  useEffect(() => {
    let mounted = true;
    fetchNews()
      .then((items) => {
        if (!mounted) return;
        setNews(items.slice(0, 5));
        setNewsState('ready');
      })
      .catch((err) => {
        console.error('Error fetching news:', err);
        if (mounted) setNewsState('error');
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const quotes = await fetchMarketQuotes(LIVE_TILES.map((t) => t.id));
        if (!mounted) return;
        const good = quotes.filter((q) => !q.error && q.price != null);
        if (good.length === 0) throw new Error('no quotes');
        setTiles((prev) => applyQuotes(prev, good));
        setAsOf(latestAsOf(good) ?? new Date());
        setMarketState(good.some((q) => q.stale) ? 'cached' : 'live');
        writeCache(good);
      } catch (e) {
        console.warn('Market data unavailable', e);
        // Keep showing the last good figures with their time.
        if (mounted) setMarketState((s) => (s === 'loading' ? 'unavailable' : s === 'live' ? 'cached' : s));
      }
    };

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const asOfText = asOf
    ? asOf.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  const runAction = (action: TipAction) => {
    if (action.kind === 'calc') onNavigateToCalculators(action.tab);
    else if (action.kind === 'chat') onAsk(action.question);
  };

  const tileList = [...tiles, ...REFERENCE_TILES];

  return (
    <section className="border-b border-line bg-surface-2">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <header className="max-w-2xl">
          <h2 className="t-h2 text-ink">Market &amp; insights</h2>
          <p className="t-body mt-3">
            Where markets and safe rates stand, and the habits that matter more than either over the long run.
          </p>
        </header>

        {/* ------------------------------------------------- Market snapshot */}
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="t-h3 text-ink">Market snapshot</h3>
            <p className="flex items-center gap-2 text-[0.8125rem] text-ink-3" aria-live="polite">
              {marketState === 'live' && (
                <span aria-hidden="true" className="relative flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-pos" />
                </span>
              )}
              {marketState === 'loading' && 'Loading prices…'}
              {(marketState === 'live' || marketState === 'cached') && asOfText && `Prices as of ${asOfText}`}
              {marketState === 'unavailable' && 'Prices will appear when the market feed responds'}
            </p>
          </div>

          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {tileList.map((tile) => (
              <li key={tile.id} className="flex flex-col bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{tile.title}</span>
                  {tile.reference && (
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-3">Rate</span>
                  )}
                </div>
                <div
                  className={`t-figure mt-3 text-[1.625rem] text-ink ${
                    tile.value == null && marketState === 'loading' ? 'animate-pulse text-ink-3' : ''
                  }`}
                >
                  {formatTileValue(tile)}
                </div>
                <div className="mt-1.5 min-h-5">
                  {tile.reference ? <span className="text-[0.8125rem] text-ink-3">Per year</span> : <Change pct={tile.changePct} />}
                </div>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">{tile.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.75rem] text-ink-3">
            Index and gold prices may be delayed; change is since the previous close. Rates last checked{' '}
            {new Date(RATES_AS_OF).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
          </p>
        </div>

        {/* ------------------------------------- Headlines + growth scenarios */}
        <div className="mt-16 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-lg border border-line bg-surface">
            <div className="flex items-baseline justify-between gap-3 border-b border-line px-6 py-5">
              <h3 className="t-h3 text-ink">Latest market headlines</h3>
              {newsState === 'ready' && news[0]?.source && <span className="text-[0.8125rem] text-ink-3">from {news[0].source}</span>}
            </div>

            {newsState === 'loading' && (
              <ul aria-label="Loading headlines" className="divide-y divide-line">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="animate-pulse space-y-2.5 px-6 py-5">
                    <div className="h-3 w-24 rounded bg-secondary" />
                    <div className="h-4 w-11/12 rounded bg-secondary" />
                  </li>
                ))}
              </ul>
            )}

            {newsState === 'error' && (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-ink-2">Headlines could not be loaded right now.</p>
                <p className="mt-1 text-[0.8125rem] text-ink-3">The rest of the page works normally.</p>
              </div>
            )}

            {newsState === 'ready' && (
              <ul className="divide-y divide-line">
                {news.map((article) => (
                  <li key={article.link}>
                    <a
                      href={safeExternalUrl(article.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block px-6 py-4 transition-colors duration-[120ms] hover:bg-surface-2"
                    >
                      <span className="text-[0.75rem] text-ink-3">{timeAgo(article.pubDate)}</span>
                      <span className="mt-1 flex items-start justify-between gap-4">
                        <span className="text-[0.9375rem] font-medium leading-snug text-ink group-hover:text-accent">{article.title}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-colors duration-[120ms] group-hover:text-accent"
                        />
                      </span>
                      <span className="sr-only"> (opens on the publisher’s site)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-line bg-surface p-6">
              <h3 className="t-h3 text-ink">Compounding, honestly</h3>
              <p className="mt-1 text-[0.8125rem] text-ink-3">
                ₹5,000 a month in an equity fund at an assumed 12%, after 1% fund cost, tax and {DEFAULT_INFLATION}% inflation
              </p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="t-label pb-2 text-left font-semibold">After</th>
                    <th scope="col" className="t-label pb-2 text-right font-semibold">Put in</th>
                    <th scope="col" className="t-label pb-2 text-right font-semibold">Shown</th>
                    <th scope="col" className="t-label pb-2 text-right font-semibold">Real worth</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPOUNDING_ROWS.map((row) => (
                    <tr key={row.years} className="border-b border-line last:border-0">
                      <td className="py-2.5 text-ink-2">{row.years} yrs</td>
                      <td className="py-2.5 text-right text-ink-3 tabular">{row.invested}</td>
                      <td className="py-2.5 text-right text-ink-3 tabular">{row.value}</td>
                      <td className="py-2.5 text-right font-semibold text-pos tabular">{row.real}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-3">“Put in” is spread over the years, so it is not directly comparable with “real worth”. Time still does most of the work.</p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-6">
              <h3 className="t-h3 text-ink">What ₹1,00,000 will buy</h3>
              <p className="mt-1 text-[0.8125rem] text-ink-3">If prices rise {DEFAULT_INFLATION}% a year and the money just sits</p>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {INFLATION_ROWS.map((row) => (
                    <tr key={row.years} className="border-b border-line last:border-0">
                      <td className="py-2.5 text-ink-2">In {row.years} years</td>
                      <td className="py-2.5 text-right font-semibold text-neg tabular">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------- Money habits */}
        <div className="mt-16">
          <h3 className="t-h3 text-ink">Money habits that compound</h3>
          <p className="t-body measure mt-2 text-sm">Small, repeatable decisions that do more for your wealth than picking the right fund.</p>

          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {MONEY_HABITS.map((tip) => {
              const inner = (
                <>
                  <span className={`w-fit rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-medium ${IMPACT_STYLE[tip.impact]}`}>{tip.impact} impact</span>
                  <span className="mt-3 text-sm font-medium text-ink">{tip.title}</span>
                  <span className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-ink-3">{tip.tip}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-medium text-ink-2 group-hover:text-accent">
                    {tip.action.label}
                    {tip.action.kind === 'link' ? (
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                  </span>
                </>
              );
              const cls = 'group flex h-full w-full flex-col p-5 text-left transition-colors duration-[120ms] hover:bg-surface-2';
              return (
                <li key={tip.title} className="bg-surface">
                  {tip.action.kind === 'link' ? (
                    <a href={safeExternalUrl(tip.action.href)} target="_blank" rel="noopener noreferrer" className={cls}>
                      {inner}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <button type="button" onClick={() => runAction(tip.action)} className={cls}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
