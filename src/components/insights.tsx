<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Shield, Target, BookOpen, BarChart3, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { fetchNews, fetchMarketQuotes } from '../lib/market-api';
=======
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Shield, Target, BookOpen, BarChart3, ChevronLeft, ChevronRight, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

interface NewsArticle {
  title: string;
  pubDate: string;
  link: string;
  thumbnail: string;
  description: string;
}

<<<<<<< HEAD
=======
const AnimatedCounter = ({ value, prefix = "", suffix = "", decimals = 2, locale = "en-IN" }: { value: number | null, prefix?: string, suffix?: string, decimals?: number, locale?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    if (value === null) return;
    
    let startTimestamp: number | null = null;
    const duration = 1500; 
    const startValue = displayRef.current;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const newValue = startValue + (value - startValue) * easeProgress;
      displayRef.current = newValue;
      setDisplayValue(newValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        displayRef.current = value;
        setDisplayValue(value); 
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value]);

  if (value === null) return <span>--</span>;

  return (
    <span>
      {prefix}{displayValue.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
};

>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
export function Insights() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

<<<<<<< HEAD
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
=======
  const [sipAmount, setSipAmount] = useState(5000);
  const [inflationRate, setInflationRate] = useState(6);

  const generateCompoundingData = (sip: number) => {
    const rate = 0.12;
    const monthlyRate = rate / 12;
    return [5, 10, 15, 20].map(years => {
      const months = years * 12;
      const invested = sip * months;
      const fv = sip * (Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate) / monthlyRate;
      return { years, invested, fv };
    });
  };

  const generateInflationData = (ratePct: number) => {
    const initial = 100000;
    const rate = ratePct / 100;
    return [5, 10, 15, 20].map(years => {
      const fv = initial / Math.pow(1 + rate, years);
      return { years, initial, fv };
    });
  };

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      // Using rss2json to convert Yahoo Finance RSS feed to JSON
      const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://finance.yahoo.com/news/rssindex');

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      if (data.status === 'ok' && data.items) {
        // Get top 6 articles
        setNews(data.items.slice(0, 6));
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setNewsError('Could not load latest news at this time.');
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
  }, []);

  const savingsTips = [
    {
      title: "Start Small, Think Big",
      tip: "Begin with saving just ₹500 per month. Small consistent efforts compound over time.",
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
<<<<<<< HEAD
      value: null,
      trend: "Loading...",
      change: "0.00%",
      description: "NIFTY 50 Index",
      color: "text-ink-3",
=======
      value: 22819.60,
      trend: "Bearish",
      change: "-2.09%",
      description: "NIFTY 50 Index",
      color: "text-red-600",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      prefix: "₹"
    },
    {
      id: 'NIFTYBEES.NS',
      title: "Mutual Funds ETF",
<<<<<<< HEAD
      value: null,
      trend: "Loading...",
      change: "0.00%",
      description: "Nippon India Nifty 50 BeES",
      color: "text-ink-3",
=======
      value: 258.89,
      trend: "Bearish",
      change: "-1.96%",
      description: "Nippon India Nifty 50 BeES",
      color: "text-red-600",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      prefix: "₹"
    },
    {
      id: 'GC=F',
      title: "Gold Futures",
<<<<<<< HEAD
      value: null,
      trend: "Loading...",
      change: "0.00%",
      description: "COMEX Gold Futures (USD)",
      color: "text-ink-3",
=======
      value: 4551.90,
      trend: "Bullish",
      change: "+3.24%",
      description: "COMEX Gold Futures (USD)",
      color: "text-green-600",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      prefix: "$"
    },
    {
      id: 'FD',
      title: "Fixed Deposits",
      value: 7.10,
      trend: "Stable",
      change: "0.00%",
      description: "Avg 1-Year Bank Rate (Static)",
<<<<<<< HEAD
      color: "text-accent",
=======
      color: "text-blue-600",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      prefix: "",
      suffix: "%"
    }
  ]);
  const [isLiveBlinking, setIsLiveBlinking] = useState(false);

  useEffect(() => {
    let mounted = true;
<<<<<<< HEAD
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
=======
    
    // Simulate real-time market fluctuations
    const simulateMarketTick = () => {
      setIsLiveBlinking(true);
      
      setMarketTrends(prev => prev.map(trend => {
        // Fixed deposits don't fluctuate randomly
        if (trend.id === 'FD') return trend;
        
        // Randomly decide if value changes this tick (60% chance)
        if (Math.random() > 0.6) return trend;

        const currentValue = trend.value || 100;
        
        // Random fluctuation between -0.15% and +0.15%
        const volatility = 0.0015;
        const changeFactor = 1 + (Math.random() * volatility * 2 - volatility);
        const newValue = currentValue * changeFactor;
        
        // Parse existing percentage to update it
        const currentChangePct = parseFloat(trend.change.replace('%', ''));
        const tickChangePct = (changeFactor - 1) * 100;
        const newChangePct = currentChangePct + tickChangePct;
        
        return {
          ...trend,
          value: newValue,
          change: `${newChangePct >= 0 ? '+' : ''}${newChangePct.toFixed(2)}%`,
          trend: newChangePct > 1.0 ? "Bullish" : newChangePct < -1.0 ? "Bearish" : "Stable",
          color: newChangePct >= 0 ? "text-green-600" : "text-red-600"
        };
      }));

      setTimeout(() => { if (mounted) setIsLiveBlinking(false); }, 500);
    };

    // Pulse every 2.5 seconds for a dynamic feel
    const interval = setInterval(simulateMarketTick, 2500);
    
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

<<<<<<< HEAD
  const growthVisuals = [
    {
      title: "Power of Compounding",
      description: "₹5,000 monthly SIP at 12% annual return",
      years: [
        { year: 5, amount: "₹4.1L" },
        { year: 10, amount: "₹11.6L" },
        { year: 15, amount: "₹25.0L" },
        { year: 20, amount: "₹49.9L" }
      ]
    },
    {
      title: "Inflation Impact",
      description: "How ₹1,00,000 loses value over time at 6% inflation",
      years: [
        { year: 5, amount: "₹74,726" },
        { year: 10, amount: "₹55,839" },
        { year: 15, amount: "₹41,727" },
        { year: 20, amount: "₹31,180" }
      ]
    }
  ];

  return (
    <section className="px-5 py-20 sm:px-8 md:py-24 bg-surface-2">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="t-h2 text-ink mb-4">Financial Insights</h2>
          <p className="t-body">Stay informed and make smarter financial decisions</p>
=======
  return (
    <section 
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
      style={{ marginTop: '30px' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-5xl mx-auto mb-16">
          <h2 className="font-bold text-center tracking-tight mb-4" style={{ fontSize: '50px', lineHeight: '1.2' }}>Financial Insights</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Stay informed and make smarter financial decisions</p>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
        </div>

        {/* Live News Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl flex items-center">
<<<<<<< HEAD
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
=======
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              Live Market News
            </h3>

            <button 
              onClick={fetchNews}
              disabled={newsLoading}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <RefreshCw className={`h-4 w-4 ${newsLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {newsLoading ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>

          {newsError ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center border border-red-200 dark:border-red-800">
              {newsError}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsLoading && news.length === 0 ? (
                // Loading Skeletons
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                    </CardContent>
                  </Card>
                ))
              ) : (
                news.map((article, index) => (
<<<<<<< HEAD
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
=======
                  <a
                    key={index}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block outline-none focus:ring-2 focus:ring-blue-500 rounded-xl group"
                  >
                    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {new Date(article.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={article.title}>{article.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {/* Extract plain text from potentially HTML description */}
                        <CardDescription className="line-clamp-3 text-sm text-foreground/80">
                          {article.description.replace(/<[^>]*>?/gm, '')}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center w-full justify-between">
                          Read Full Article
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </div>
                      </CardFooter>
                    </Card>
                  </a>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                ))
              )}
            </div>
          )}
        </div>

        {/* Saving Tips Carousel */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl flex items-center">
<<<<<<< HEAD
              <DollarSign className="h-6 w-6 mr-2 text-pos" />
=======
              <DollarSign className="h-6 w-6 mr-2 text-green-600" />
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
              Smart Saving Tips
            </h3>
            <div className="flex gap-2">
              <button
                onClick={slideLeft}
<<<<<<< HEAD
                className="p-2 rounded-full hover:bg-muted dark:hover:bg-secondary transition"
=======
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={slideRight}
<<<<<<< HEAD
                className="p-2 rounded-full hover:bg-muted dark:hover:bg-secondary transition"
=======
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
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
<<<<<<< HEAD
                  className="block outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-lg shrink-0 w-[calc(100%)] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
=======
                  className="block outline-none focus:ring-2 focus:ring-green-500 rounded-xl shrink-0 w-[calc(100%)] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                >
                  <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
<<<<<<< HEAD
                        <Badge variant={tip.impact === 'High' ? 'default' : 'secondary'} className="bg-accent-soft text-pos dark:bg-accent-soft dark:text-pos">
=======
                        <Badge variant={tip.impact === 'High' ? 'default' : 'secondary'} className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
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
<<<<<<< HEAD
                    <CardFooter className="pt-4 border-t border-line">
                      <div className="text-sm text-pos hover:text-pos dark:hover:text-pos font-medium flex items-center w-full justify-between">
=======
                    <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium flex items-center w-full justify-between">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
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
<<<<<<< HEAD
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentSlide
                  ? 'bg-accent w-8'
                  : 'bg-line-2 dark:bg-ink-3 hover:bg-pos'
=======
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide
                  ? 'bg-green-600 w-8'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-green-400'
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Market Trends */}
        <div className="mb-16">
          <h3 className="text-2xl mb-6 flex items-center">
<<<<<<< HEAD
            <TrendingUp className="h-6 w-6 mr-2 text-ink-2" />
            Live Market Trends
            <span className="ml-3 flex h-3 w-3 relative">
              {isLiveBlinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neg opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neg"></span>
=======
            <TrendingUp className="h-6 w-6 mr-2 text-purple-600" />
            Live Market Trends
            <span className="ml-3 flex h-3 w-3 relative">
              {isLiveBlinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketTrends.map((trend, index) => (
              <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={trend.trend === 'Bullish' || trend.trend === 'Positive' ? 'default' :
                      trend.trend === 'Stable' ? 'secondary' : trend.trend === 'Loading...' ? 'outline' : 'destructive'}
<<<<<<< HEAD
                      className="bg-secondary text-ink-2 dark:bg-secondary dark:text-ink-2">
=======
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                      {trend.trend}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{trend.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center">
                  <div className="flex flex-col items-start mb-2">
<<<<<<< HEAD
                    <span className="t-figure text-3xl text-ink">
                      {trend.value !== null
                        ? `${trend.prefix || ''}${trend.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${trend.suffix || ''}`
                        : '--'}
=======
                    <span className="text-3xl font-bold tracking-tight">
                      <AnimatedCounter value={trend.value} prefix={trend.prefix} suffix={trend.suffix} />
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                    </span>
                    <span className={`text-sm font-medium flex items-center mt-1 ${trend.color}`}>
                      {trend.change} {trend.trend === 'Bullish' || trend.trend === 'Positive' ? '↑' : trend.trend === 'Stable' || trend.trend === 'Loading...' ? '−' : '↓'}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {trend.description}
                  </CardDescription>
                </CardContent>
<<<<<<< HEAD
                <CardFooter className="pt-4 border-t border-line">
                  <div className="text-xs text-ink-3 flex items-center w-full justify-between">
                    Live Status
                    {isLiveBlinking && trend.id !== 'FD' ? (
                      <span className="flex items-center text-pos">
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pos opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-pos"></span>
=======
                <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-muted-foreground flex items-center w-full justify-between">
                    Live Status
                    {isLiveBlinking && trend.id !== 'FD' ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
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
<<<<<<< HEAD
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
=======
            <BarChart3 className="h-6 w-6 mr-2 text-orange-600" />
            Dynamic Growth Scenarios
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Compounding Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-6 bg-slate-50/50 dark:bg-slate-800/30">
                <CardTitle className="text-xl text-green-700 dark:text-green-500">Power of Compounding</CardTitle>
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly SIP Amount</span>
                    <span className="text-2xl font-bold text-green-600">₹{sipAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="100000" 
                    step="1000" 
                    value={sipAmount} 
                    onChange={(e) => setSipAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-green-600"
                  />
                  <span className="text-xs text-slate-500 font-medium">Assuming 12% historical annual return</span>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <div className="overflow-x-auto h-full">
                  <table className="w-full h-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                      <tr>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Time Horizon</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Invested</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right border-b border-slate-200 dark:border-slate-700">Wealth Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {generateCompoundingData(sipAmount).map((data, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium">{data.years} Years</td>
                          <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{formatCurrency(data.invested)}</td>
                          <td className="py-4 px-6 text-base font-bold text-green-600 text-right group-hover:scale-105 transition-transform origin-right">
                            <AnimatedCounter value={data.fv} prefix="₹" decimals={0} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Inflation Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-6 bg-slate-50/50 dark:bg-slate-800/30">
                <CardTitle className="text-xl text-red-600 dark:text-red-500">Inflation Impact</CardTitle>
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected Inflation Rate</span>
                    <span className="text-2xl font-bold text-red-500">{inflationRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="3" 
                    max="12" 
                    step="0.5" 
                    value={inflationRate} 
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-red-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">How ₹1,00,000 degrades in purchasing power</span>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <div className="overflow-x-auto h-full">
                  <table className="w-full h-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                      <tr>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Time Horizon</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Initial Cash</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right border-b border-slate-200 dark:border-slate-700">Real Value Left</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {generateInflationData(inflationRate).map((data, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium">{data.years} Years</td>
                          <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">₹1,00,000</td>
                          <td className="py-4 px-6 text-base font-bold text-red-500 text-right group-hover:scale-105 transition-transform origin-right">
                            <AnimatedCounter value={data.fv} prefix="₹" decimals={0} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
          </div>
        </div>
      </div>
    </section>
  );
}