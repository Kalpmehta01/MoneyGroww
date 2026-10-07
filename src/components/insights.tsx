import { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fetchNews, fetchMarketQuotes, type NewsArticleData } from '../lib/market-api';
import { calculateSIP } from '../lib/finance';

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

const POLL_MS = 15000;

/* -------------------------------------------------------------------------- */
/*  Market snapshot                                                           */
/* -------------------------------------------------------------------------- */

interface MarketTile {
  id: string;
  title: string;
  description: string;
  currency: 'INR' | 'USD' | null;
  suffix?: string;
  value: number | null;
  changePct: number | null;
  /** Static reference figure rather than a live quote. */
  reference?: boolean;
}

const INITIAL_TILES: MarketTile[] = [
  { id: '^NSEI', title: 'NIFTY 50', description: 'Benchmark index of 50 large NSE companies', currency: null, value: null, changePct: null },
  { id: 'NIFTYBEES.NS', title: 'Nifty BeES', description: 'Nippon India ETF tracking the NIFTY 50', currency: 'INR', value: null, changePct: null },
  { id: 'GC=F', title: 'Gold', description: 'COMEX gold futures, USD per troy ounce', currency: 'USD', value: null, changePct: null },
  { id: 'FD', title: 'Fixed deposit', description: 'Typical 1-year bank FD rate (reference)', currency: null, suffix: '%', value: 7.1, changePct: null, reference: true },
];

function formatTileValue(tile: MarketTile) {
  if (tile.value == null) return '—';
  const number = tile.value.toLocaleString(tile.currency === 'USD' ? 'en-US' : 'en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = tile.currency === 'INR' ? '₹' : tile.currency === 'USD' ? '$' : '';
  return `${prefix}${number}${tile.suffix ?? ''}`;
}

function Change({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-[0.8125rem] text-ink-3">—</span>;
  const flat = Math.abs(pct) < 0.005;
  const up = pct > 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  // Direction is carried by the icon and the sign as well as the color.
  return (
    <span
      className={`tabular inline-flex items-center gap-1 text-[0.8125rem] font-medium ${
        flat ? 'text-ink-3' : up ? 'text-pos' : 'text-neg'
      }`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {flat ? '0.00%' : `${up ? '+' : '−'}${Math.abs(pct).toFixed(2)}%`}
      <span className="sr-only"> today</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Static content                                                            */
/* -------------------------------------------------------------------------- */

const SAVINGS_TIPS = [
  {
    title: 'Start small, stay consistent',
    tip: 'A ₹500 monthly SIP started early can outgrow a larger one started late. Consistency matters more than size.',
    impact: 'High',
    link: 'https://www.investopedia.com/terms/s/systematicinvestmentplan.asp',
  },
  {
    title: 'Automate on payday',
    tip: 'Schedule SIPs and savings transfers for the day after your salary credit, before spending starts.',
    impact: 'High',
    link: 'https://www.investopedia.com/terms/p/payyourselffirst.asp',
  },
  {
    title: 'Follow 50-30-20',
    tip: 'Allocate 50% of take-home pay to needs, 30% to wants and 20% to savings and investments.',
    impact: 'High',
    link: 'https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp',
  },
  {
    title: 'Build an emergency fund',
    tip: 'Keep 6 months of essential expenses in a savings account or liquid fund before taking market risk.',
    impact: 'High',
    link: 'https://www.investopedia.com/terms/e/emergency_fund.asp',
  },
  {
    title: 'Track where it goes',
    tip: 'Review a month of UPI and card statements. Most people find 10–15% of spending they did not plan.',
    impact: 'Medium',
    link: 'https://www.investopedia.com/terms/b/budget.asp',
  },
  {
    title: 'Step up every year',
    tip: 'Raise your SIP by 10% with each increment. It barely dents take-home pay and sharply lifts the end corpus.',
    impact: 'Medium',
    link: 'https://www.investopedia.com/terms/c/compounding.asp',
  },
  {
    title: 'Use your 80C limit',
    tip: 'ELSS, PPF and EPF contributions can reduce taxable income by up to ₹1.5 lakh under the old regime.',
    impact: 'Medium',
    link: 'https://cleartax.in/s/80c-80-deductions',
  },
  {
    title: 'Cancel idle subscriptions',
    tip: 'Audit OTT, app and gym memberships every quarter and cancel anything unused for 30 days.',
    impact: 'Low',
    link: 'https://www.investopedia.com/terms/d/discretionaryincome.asp',
  },
];

const IMPACT_STYLE: Record<string, string> = {
  High: 'bg-accent-soft text-accent',
  Medium: 'bg-secondary text-ink-2',
  Low: 'bg-secondary text-ink-3',
};

const lakh = (v: number) => `₹${(v / 100000).toFixed(1)}L`;
const SCENARIO_YEARS = [5, 10, 15, 20];

const COMPOUNDING_ROWS = SCENARIO_YEARS.map((years) => {
  const r = calculateSIP({ monthlyInvestment: 5000, returnRate: 12, duration: years });
  return { years, invested: lakh(r.totalInvested), value: lakh(r.finalAmount) };
});

const INFLATION_ROWS = SCENARIO_YEARS.map((years) => ({
  years,
  value: `₹${Math.round(100000 / Math.pow(1.06, years)).toLocaleString('en-IN')}`,
}));

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function Insights() {
  const [news, setNews] = useState<NewsArticleData[]>([]);
  const [newsState, setNewsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [tiles, setTiles] = useState<MarketTile[]>(INITIAL_TILES);
  const [marketState, setMarketState] = useState<'loading' | 'live' | 'error'>('loading');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

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
        const quotes = await fetchMarketQuotes(['^NSEI', 'NIFTYBEES.NS', 'GC=F']);
        if (!mounted) return;
        const bySymbol = new Map(quotes.map((q) => [q.symbol, q]));
        let gotAny = false;
        setTiles((prev) =>
          prev.map((tile) => {
            const q = bySymbol.get(tile.id);
            if (!q || q.error || q.price == null || !q.prevClose) return tile;
            gotAny = true;
            return { ...tile, value: q.price, changePct: ((q.price - q.prevClose) / q.prevClose) * 100 };
          })
        );
        if (gotAny || quotes.some((q) => q.price != null)) {
          setMarketState('live');
          setUpdatedAt(new Date());
        }
      } catch (e) {
        console.error('Failed to fetch market data', e);
        // Keep showing the last good figures on a transient failure.
        if (mounted) setMarketState((s) => (s === 'live' ? s : 'error'));
      }
    };

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="border-b border-line bg-surface-2">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <header className="max-w-2xl">
          <h2 className="t-h2 text-ink">Market &amp; insights</h2>
          <p className="t-body mt-3">
            Where the market stands today, what is moving it, and the habits that matter more
            than either over the long run.
          </p>
        </header>

        {/* ------------------------------------------------- Market snapshot */}
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="t-h3 text-ink">Market snapshot</h3>
            <p className="flex items-center gap-2 text-[0.8125rem] text-ink-3" aria-live="polite">
              {marketState === 'live' && (
                <>
                  <span aria-hidden="true" className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pos opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-pos" />
                  </span>
                  Live · updated{' '}
                  {updatedAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </>
              )}
              {marketState === 'loading' && 'Loading prices…'}
              {marketState === 'error' && 'Live prices unavailable right now'}
            </p>
          </div>

          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((tile) => (
              <li key={tile.id} className="flex flex-col bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{tile.title}</span>
                  {tile.reference && (
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-3">
                      Reference
                    </span>
                  )}
                </div>
                <div
                  className={`t-figure mt-3 text-[1.75rem] text-ink ${
                    tile.value == null && marketState === 'loading' ? 'animate-pulse text-ink-3' : ''
                  }`}
                >
                  {formatTileValue(tile)}
                </div>
                <div className="mt-1.5 min-h-5">
                  {tile.reference ? (
                    <span className="text-[0.8125rem] text-ink-3">Per annum</span>
                  ) : (
                    <Change pct={tile.changePct} />
                  )}
                </div>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">{tile.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.75rem] text-ink-3">
            Quotes via Yahoo Finance; may be delayed. Change is versus the previous close.
          </p>
        </div>

        {/* ------------------------------------- Headlines + growth scenarios */}
        <div className="mt-16 grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="rounded-lg border border-line bg-surface">
            <div className="flex items-baseline justify-between gap-3 border-b border-line px-6 py-5">
              <h3 className="t-h3 text-ink">Latest market headlines</h3>
              {newsState === 'ready' && news[0]?.source && (
                <span className="text-[0.8125rem] text-ink-3">via {news[0].source}</span>
              )}
            </div>

            {newsState === 'loading' && (
              <ul aria-label="Loading headlines" className="divide-y divide-line">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="animate-pulse space-y-2.5 px-6 py-5">
                    <div className="h-3 w-24 rounded bg-secondary" />
                    <div className="h-4 w-11/12 rounded bg-secondary" />
                    <div className="h-3 w-3/4 rounded bg-secondary" />
                  </li>
                ))}
              </ul>
            )}

            {newsState === 'error' && (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-ink-2">Headlines could not be loaded right now.</p>
                <p className="mt-1 text-[0.8125rem] text-ink-3">The rest of the page works normally. Try again in a few minutes.</p>
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
                      className="group block px-6 py-5 transition-colors duration-[120ms] hover:bg-surface-2"
                    >
                      <span className="text-[0.75rem] text-ink-3">{timeAgo(article.pubDate)}</span>
                      <span className="mt-1 flex items-start justify-between gap-4">
                        <span className="text-[0.9375rem] font-medium leading-snug text-ink group-hover:text-accent">
                          {article.title}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-colors duration-[120ms] group-hover:text-accent"
                        />
                      </span>
                      {article.description && (
                        <span className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-3">
                          {article.description}
                        </span>
                      )}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-line bg-surface p-6">
              <h3 className="t-h3 text-ink">Power of compounding</h3>
              <p className="mt-1 text-[0.8125rem] text-ink-3">₹5,000 a month at an assumed 12% a year</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="t-label pb-2 text-left font-semibold">After</th>
                    <th scope="col" className="t-label pb-2 text-right font-semibold">Invested</th>
                    <th scope="col" className="t-label pb-2 text-right font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPOUNDING_ROWS.map((row) => (
                    <tr key={row.years} className="border-b border-line last:border-0">
                      <td className="py-2.5 text-ink-2">{row.years} years</td>
                      <td className="py-2.5 text-right text-ink-3">{row.invested}</td>
                      <td className="py-2.5 text-right font-semibold text-pos">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-line bg-surface p-6">
              <h3 className="t-h3 text-ink">Cost of inflation</h3>
              <p className="mt-1 text-[0.8125rem] text-ink-3">What ₹1,00,000 buys at 6% annual inflation</p>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {INFLATION_ROWS.map((row) => (
                    <tr key={row.years} className="border-b border-line last:border-0">
                      <td className="py-2.5 text-ink-2">In {row.years} years</td>
                      <td className="py-2.5 text-right font-semibold text-neg">{row.value}</td>
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
          <p className="t-body measure mt-2 text-sm">
            Small, repeatable decisions that do more for your net worth than picking the right fund.
          </p>

          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {SAVINGS_TIPS.map((tip) => (
              <li key={tip.title} className="bg-surface">
                <a
                  href={safeExternalUrl(tip.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col p-5 transition-colors duration-[120ms] hover:bg-surface-2"
                >
                  <span
                    className={`w-fit rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-medium ${IMPACT_STYLE[tip.impact]}`}
                  >
                    {tip.impact} impact
                  </span>
                  <span className="mt-3 text-sm font-medium text-ink">{tip.title}</span>
                  <span className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-ink-3">{tip.tip}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-medium text-ink-2 group-hover:text-accent">
                    Learn more
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only"> about {tip.title.toLowerCase()} (opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
