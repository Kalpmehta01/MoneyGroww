<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { fetchMarketQuotes } from '../lib/market-api';
=======
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { INDIAN_COMPANIES, TICKER_POLL_INTERVAL_MS, API } from '../data/constants';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

interface TickerData {
    symbol: string;
    name: string;
    price: number | null;
    change: string;
    isPositive: boolean;
}

<<<<<<< HEAD
const indianCompanies = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'TCS' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { symbol: 'ITC.NS', name: 'ITC Ltd.' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro' }
];

export function LiveTicker() {
    const [tickerData, setTickerData] = useState<TickerData[]>([]);
    const [feedError, setFeedError] = useState<string | null>(null);
=======
type TickerStatus = 'loading' | 'success' | 'error';

export function LiveTicker() {
    const [tickerData, setTickerData] = useState<TickerData[]>([]);
    const [status, setStatus] = useState<TickerStatus>('loading');
    const [retryCount, setRetryCount] = useState(0);
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

    useEffect(() => {
        let mounted = true;

        const fetchTickerData = async () => {
            try {
<<<<<<< HEAD
                // Goes through our own serverless function in production, and falls
                // back to the Vite dev proxy under `npm run dev` — see src/lib/market-api.ts.
                const results = await fetchMarketQuotes(indianCompanies.map(c => c.symbol));
                const bySymbol = new Map(results.map((r) => [r.symbol, r]));

                if (mounted) {
                    const formattedData = indianCompanies.map((company) => {
                        const data = bySymbol.get(company.symbol);
                        if (data && !data.error && data.price != null && data.prevClose) {
                            const changeValue = ((data.price - data.prevClose) / data.prevClose) * 100;
                            const isPositive = changeValue >= 0;
                            return {
                                ...company,
                                price: data.price,
                                change: `${Math.abs(changeValue).toFixed(2)}%`,
                                isPositive,
=======
                const promises = INDIAN_COMPANIES.map(company =>
                    fetch(API.YAHOO_CHART_PROXY(company.symbol))
                        .then(res => res.json())
                        .catch(() => null)
                );

                const results = await Promise.all(promises);

                if (mounted) {
                    const formattedData = INDIAN_COMPANIES.map((company, index) => {
                        const data = results[index];
                        if (data && data.chart && data.chart.result && data.chart.result.length > 0) {
                            const result = data.chart.result[0];
                            const price = result.meta.regularMarketPrice;
                            const prevClose = result.meta.chartPreviousClose;
                            const changeValue = ((price - prevClose) / prevClose) * 100;
                            const isPositive = changeValue >= 0;

                            return {
                                ...company,
                                price,
                                change: `${Math.abs(changeValue).toFixed(2)}%`,
                                isPositive
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                            };
                        }
                        return { ...company, price: null, change: '0.00%', isPositive: true };
                    });

<<<<<<< HEAD
                    setFeedError(null);
                    setTickerData(formattedData);
                }
            } catch (e) {
                console.error("Failed to fetch ticker data", e);
                // Surface the failure instead of sitting on "Establishing..." forever,
                // but never wipe out prices we already have on a transient blip.
                if (mounted) {
                    setFeedError(e instanceof Error ? e.message : 'Market feed unavailable.');
=======
                    // Check if we actually got any valid prices
                    const hasValidData = formattedData.some(d => d.price !== null);
                    setTickerData(formattedData);
                    setStatus(hasValidData ? 'success' : 'error');
                    if (hasValidData) setRetryCount(0);
                }
            } catch (e) {
                console.error("Failed to fetch ticker data", e);
                if (mounted) {
                    setStatus(prev => prev === 'success' ? 'success' : 'error'); // Keep showing stale data if we had it
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                }
            }
        };

        fetchTickerData();
<<<<<<< HEAD
        const interval = setInterval(fetchTickerData, 10000);
=======
        const interval = setInterval(fetchTickerData, TICKER_POLL_INTERVAL_MS);
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

        return () => {
            mounted = false;
            clearInterval(interval);
        };
<<<<<<< HEAD
    }, []);

    if (tickerData.length === 0) {
        return (
            <div className="flex h-9 w-full items-center justify-center border-b border-line bg-surface-2 px-4">
                {feedError ? (
                    <span className="flex items-center gap-1.5 text-center text-xs text-ink-3">
                        <AlertCircle aria-hidden="true" className="h-3 w-3 flex-shrink-0" />
                        Live market feed unavailable right now
                    </span>
                ) : (
                    <span className="text-xs text-ink-3">Loading market data…</span>
                )}
=======
    }, [retryCount]);

    // Loading state
    if (status === 'loading' && tickerData.length === 0) {
        return (
            <div className="w-full bg-slate-900 border-b border-slate-800 text-white overflow-hidden py-2 flex items-center h-9 justify-center z-40 relative">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 text-slate-400 animate-spin" />
                    <span className="text-xs text-slate-400">Connecting to live market feed...</span>
                </div>
            </div>
        );
    }

    // Error state — no data at all
    if (status === 'error' && tickerData.every(d => d.price === null)) {
        return (
            <div className="w-full bg-slate-900 border-b border-slate-800 text-white overflow-hidden py-2 flex items-center h-9 justify-center z-40 relative">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-amber-400" />
                    <span className="text-xs text-slate-400">Market feed unavailable</span>
                    <button
                        onClick={() => setRetryCount(c => c + 1)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors ml-1"
                    >
                        Retry
                    </button>
                </div>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
            </div>
        );
    }

    return (
<<<<<<< HEAD
        <div
            className="relative flex w-full items-center overflow-hidden border-b border-line bg-surface-2 py-2"
            aria-label="Live market prices"
        >
            <div className="flex w-max animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                {/* Doubled so the marquee loops seamlessly. The second copy is
                    hidden from assistive tech to avoid reading every price twice. */}
                {[...tickerData, ...tickerData].map((item, index) => (
                    <div
                        key={index}
                        className="mx-5 flex items-center gap-2 text-[0.8125rem]"
                        aria-hidden={index >= tickerData.length ? 'true' : undefined}
                    >
                        <span className="font-medium text-ink-2">{item.name}</span>
                        <span className="tabular text-ink">
                            {item.price
                                ? `₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : '—'}
                        </span>
                        {/* Direction is carried by the arrow and the sign, not by color alone. */}
                        <span
                            className={`tabular flex items-center gap-0.5 ${item.isPositive ? 'text-pos' : 'text-neg'}`}
                        >
                            {item.isPositive ? (
                                <TrendingUp aria-hidden="true" className="h-3 w-3" />
                            ) : (
                                <TrendingDown aria-hidden="true" className="h-3 w-3" />
                            )}
                            {item.isPositive ? '+' : '−'}
=======
        <div className="w-full bg-slate-900 border-b border-slate-800 text-white overflow-hidden py-2 flex items-center relative z-40">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10" />

            <div className="flex animate-marquee whitespace-nowrap group hover:[animation-play-state:paused] w-max">
                {/* Double the array for seamless infinite scrolling */}
                {[...tickerData, ...tickerData].map((item, index) => (
                    <div key={index} className="flex items-center mx-6 text-sm">
                        <span className="font-semibold text-slate-200 mr-2">{item.name}</span>
                        <span className="font-mono text-slate-300 mr-2">
                            {item.price ? `₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
                        </span>
                        <span className={`flex items-center font-mono ${item.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {item.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                            {item.change}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
