import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Shield, Target, BookOpen, BarChart3, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { fetchNews, fetchMarketQuotes } from '../lib/market-api';

interface NewsArticle {
  title: string;
  pubDate: string;
  link: string;
  thumbnail: string;
  description: string;
}

export function Insights() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true);
        // Goes through our own serverless function (netlify/functions/news.js) in
        // production, falling back to the Vite dev proxy under `npm run dev`.
        // See src/lib/market-api.ts.
        const items = await fetchNews();
        setNews(items.slice(0, 3));
      } catch (err) {
        console.error('Error fetching news:', err);
        setNewsError('Could not load latest news at this time.');
      } finally {
        setNewsLoading(false);
      }
    };

    loadNews();
  }, []);

  const savingsTips = [
    {
      title: "Start Small, Think Big",
      tip: "Begin with saving just â‚¹500 per month. Small consistent efforts compound over time.",
      impact: "High",
      link: "https://www.nerdwallet.com/article/banking/how-to-save-money"
    },
    {
      title: "Automate Your Savings",
      tip: "Set up automatic transfers to your savings account right after salary credit.",
      impact: "Medium",
      link: "https://www.nerdwallet.com/article/banking/automate-your-savings"
    },
    {
      title: "Track Your Expenses",
      tip: "Use apps or spreadsheets to monitor where your money goes each month.",
      impact: "High",
      link: "https://www.nerdwallet.com/article/finance/how-to-budget"
    },
    {
      title: "Use the 50-30-20 Rule",
      tip: "Allocate 50% for needs, 30% for wants, and 20% for savings and investments.",
      impact: "High",
      link: "https://www.nerdwallet.com/article/finance/nerdwallet-budget-calculator"
    },
    {
      title: "Build an Emergency Fund",
      tip: "Save 3-6 months of essential living expenses to protect against unexpected financial shocks.",
      impact: "High",
      link: "https://www.nerdwallet.com/article/banking/emergency-fund-why-it-matters"
    },
    {
      title: "Wait 24 Hours Before Big Purchases",
      tip: "Implement a cooling-off period to prevent impulse buying and ensure the purchase is truly needed.",
      impact: "Medium",
      link: "https://www.investopedia.com/articles/personal-finance/041415/5-ways-control-emotional-spending.asp"
    },
    {
      title: "Review Subscriptions Monthly",
      tip: "Cancel unused streaming services, gym memberships, or apps you haven't used in 30 days.",
      impact: "Medium",
      link: "https://www.nerdwallet.com/article/finance/subscription-services-budgeting"
    },
    {
      title: "Shop with a Grocery List",
      tip: "Plan meals and stick to a list to reduce food waste and avoid costly impulse items at the store.",
      impact: "Low",
      link: "https://www.nerdwallet.com/article/finance/how-to-save-money-on-groceries"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate items visible based on screen size (desktop: 4, tablet: 2, mobile: 1)
  // Auto-scroll logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % savingsTips.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [savingsTips.length]);

  const slideLeft = () => {
    setCurrentSlide((prev) => (prev === 0 ? savingsTips.length - 1 : prev - 1));
  };

  const slideRight = () => {
    setCurrentSlide((prev) => (prev + 1) % savingsTips.length);
  };

  type MarketTrend = {
    id: string;
    title: string;
    value: number | null;
    trend: string;
    change: string;
    description: string;
    color: string;
    prefix?: string;
    suffix?: string;
  };

  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([
    {
      id: '^NSEI',
      title: "Equity Markets",
      value: null,
      trend: "Loading...",
      change: "0.00%",
      description: "NIFTY 50 Index",
      color: "text-ink-3",
      prefix: "â‚¹"
    },
    {
      id: 'NIFTYBEES.NS',
      title: "Mutual Funds ETF",
      value: null,
      trend: "Loading...",
      change: "0.00%",
      description: "Nippon India Nifty 50 BeES",
      color: "text-ink-3",
      prefix: "â‚¹"
    },
    {
      id: 'GC=F',
      title: "Gold Futures",
      value: null,
      trend: "Loading...",
      change: "0.00%",
      description: "COMEX Gold Futures (USD)",
      color: "text-ink-3",
      prefix: "$"
    },
    {
      id: 'FD',
      title: "Fixed Deposits",
      value: 7.10,
      trend: "Stable",
      change: "0.00%",
      description: "Avg 1-Year Bank Rate (Static)",
      color: "text-accent",
      prefix: "",
      suffix: "%"
    }
  ]);
  const [isLiveBlinking, setIsLiveBlinking] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchMarketData = async () => {
      try {
        setIsLiveBlinking(true);
        const symbols = ['^NSEI', 'NIFTYBEES.NS', 'GC=F'];

        // Same transport as the ticker: our serverless function in production,
        // Vite dev proxy under `npm run dev`. (This used to call allorigins.win
        // directly from the browser.)
        const quotes = await fetchMarketQuotes(symbols);

        if (mounted) {
          setMarketTrends(prev => {
            const newTrends = [...prev];

            quotes.forEach((quote) => {
              if (quote.error || quote.price == null || !quote.prevClose) return;

              const changePercent = ((quote.price - quote.prevClose) / quote.prevClose) * 100;
              const trendIndex = newTrends.findIndex(t => t.id === quote.symbol);

              if (trendIndex !== -1) {
                newTrends[trendIndex] = {
                  ...newTrends[trendIndex],
                  value: quote.price,
                  change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                  trend: changePercent > 0.5 ? "Bullish" : changePercent < -0.5 ? "Bearish" : "Stable",
                  color: changePercent >= 0 ? "text-pos" : "text-neg"
                };
              }
            });

            return newTrends;
          });

          setTimeout(() => { if (mounted) setIsLiveBlinking(false); }, 1000);
        }
      } catch (e) {
        console.error("Failed to fetch market data", e);
        if (mounted) setIsLiveBlinking(false);
      }
    };

    // Initial fetch
    fetchMarketData();

    // Continuous updation every 10 seconds
    const interval = setInterval(fetchMarketData, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const growthVisuals = [
    {
      title: "Power of Compounding",
      description: "â‚¹5,000 monthly SIP at 12% annual return",
      years: [
        { year: 5, amount: "â‚¹4.1L" },
        { year: 10, amount: "â‚¹11.6L" },
        { year: 15, amount: "â‚¹25.0L" },
        { year: 20, amount: "â‚¹49.9L" }
      ]
    },
    {
      title: "Inflation Impact",
      description: "How â‚¹1,00,000 loses value over time at 6% inflation",
      years: [
        { year: 5, amount: "â‚¹74,726" },
        { year: 10, amount: "â‚¹55,839" },
        { year: 15, amount: "â‚¹41,727" },
        { year: 20, amount: "â‚¹31,180" }
      ]
    }
  ];

  return (
    <section className="px-5 py-20 sm:px-8 md:py-24 bg-surface-2">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="t-h2 text-ink mb-4">Financial Insights</h2>
          <p className="t-body">Stay informed and make smarter financial decisions</p>
        </div>

        {/* Live News Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-accent" />
              Live Market News
            </h3>

            {newsLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-3" />}
          </div>

          {newsError ? (
            <div className="bg-surface-2 dark:bg-surface-2 text-neg p-4 rounded-lg text-center border border-line dark:border-line">
              {newsError}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsLoading && news.length === 0 ? (
                // Loading Skeletons
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-3">
                      <div className="h-4 bg-muted dark:bg-secondary rounded w-1/3"></div>
                      <div className="h-6 bg-muted dark:bg-secondary rounded w-full"></div>
                      <div className="h-6 bg-muted dark:bg-secondary rounded w-5/6"></div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="h-4 bg-muted dark:bg-secondary rounded w-full"></div>
                      <div className="h-4 bg-muted dark:bg-secondary rounded w-4/5"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                news.map((article, index) => (
                  <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="bg-accent-soft text-accent dark:bg-accent-soft dark:text-accent">
                          {new Date(article.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2" title={article.title}>{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {/* Extract plain text from potentially HTML description */}
                      <CardDescription className="line-clamp-3">
                        {article.description.replace(/<[^>]*>?/gm, '')}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-line">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:text-accent dark:hover:text-accent font-medium flex items-center w-full justify-between"
                      >
                        Read Full Article
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Saving Tips Carousel */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-pos" />
              Smart Saving Tips
            </h3>
            <div className="flex gap-2">
              <button
                onClick={slideLeft}
                className="p-2 rounded-full hover:bg-muted dark:hover:bg-secondary transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={slideRight}
                className="p-2 rounded-full hover:bg-muted dark:hover:bg-secondary transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden w-full py-6 px-2" ref={carouselRef}>
            <div
              className="flex transition-transform duration-700 ease-in-out gap-6"
              style={{
                transform: `translateX(calc(-${currentSlide * (100 / 3)}% - ${currentSlide * 1.5}rem))`
              }}
            >
              {savingsTips.map((tip, index) => (
                <a
                  key={index}
                  href={tip.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-lg shrink-0 w-[calc(100%)] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                >
                  <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={tip.impact === 'High' ? 'default' : 'secondary'} className="bg-accent-soft text-pos dark:bg-accent-soft dark:text-pos">
                          {tip.impact} Impact
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2" title={tip.title}>{tip.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="line-clamp-3 text-sm text-foreground/80">
                        {tip.tip}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-line">
                      <div className="text-sm text-pos hover:text-pos dark:hover:text-pos font-medium flex items-center w-full justify-between">
                        Read Full Strategy
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </div>
                    </CardFooter>
                  </Card>
                </a>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {savingsTips.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentSlide
                  ? 'bg-accent w-8'
                  : 'bg-line-2 dark:bg-ink-3 hover:bg-pos'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Market Trends */}
        <div className="mb-16">
          <h3 className="text-2xl mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-ink-2" />
            Live Market Trends
            <span className="ml-3 flex h-3 w-3 relative">
              {isLiveBlinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neg opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neg"></span>
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketTrends.map((trend, index) => (
              <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={trend.trend === 'Bullish' || trend.trend === 'Positive' ? 'default' :
                      trend.trend === 'Stable' ? 'secondary' : trend.trend === 'Loading...' ? 'outline' : 'destructive'}
                      className="bg-secondary text-ink-2 dark:bg-secondary dark:text-ink-2">
                      {trend.trend}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{trend.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center">
                  <div className="flex flex-col items-start mb-2">
                    <span className="t-figure text-3xl text-ink">
                      {trend.value !== null
                        ? `${trend.prefix || ''}${trend.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${trend.suffix || ''}`
                        : '--'}
                    </span>
                    <span className={`text-sm font-medium flex items-center mt-1 ${trend.color}`}>
                      {trend.change} {trend.trend === 'Bullish' || trend.trend === 'Positive' ? 'â†‘' : trend.trend === 'Stable' || trend.trend === 'Loading...' ? 'âˆ’' : 'â†“'}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {trend.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-4 border-t border-line">
                  <div className="text-xs text-ink-3 flex items-center w-full justify-between">
                    Live Status
                    {isLiveBlinking && trend.id !== 'FD' ? (
                      <span className="flex items-center text-pos">
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pos opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-pos"></span>
                        </span>
                        Syncing...
                      </span>
                    ) : (
                      <span>Updated</span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Growth Visuals */}
        <div>
          <h3 className="text-2xl mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-ink-2" />
            Growth Scenarios
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {growthVisuals.map((visual, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>{visual.title}</CardTitle>
                  <CardDescription>{visual.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visual.years.map((data, yearIndex) => (
                      <div key={yearIndex} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                        <span className="font-medium">{data.year} Years</span>
                        <span className={`font-bold ${index === 0 ? 'text-pos' : 'text-neg'}`}>
                          {data.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}