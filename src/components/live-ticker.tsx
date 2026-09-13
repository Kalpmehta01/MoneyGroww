import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { fetchMarketQuotes } from '../lib/market-api';

interface TickerData {
    symbol: string;
    name: string;
    price: number | null;
    change: string;
    isPositive: boolean;
}

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

    useEffect(() => {
        let mounted = true;

        const fetchTickerData = async () => {
            try {
                // Goes through our own serverless function in production, and falls
                // back to the Vite dev proxy under `npm run dev` â€” see src/lib/market-api.ts.
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
                            };
                        }
                        return { ...company, price: null, change: '0.00%', isPositive: true };
                    });

                    setFeedError(null);
                    setTickerData(formattedData);
                }
            } catch (e) {
                console.error("Failed to fetch ticker data", e);
                // Surface the failure instead of sitting on "Establishing..." forever,
                // but never wipe out prices we already have on a transient blip.
                if (mounted) {
                    setFeedError(e instanceof Error ? e.message : 'Market feed unavailable.');
                }
            }
        };

        fetchTickerData();
        const interval = setInterval(fetchTickerData, 10000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
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
                    <span className="text-xs text-ink-3">Loading market dataâ€¦</span>
                )}
            </div>
        );
    }

    return (
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
                                ? `â‚¹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : 'â€”'}
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
                            {item.isPositive ? '+' : 'âˆ’'}
                            {item.change}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
