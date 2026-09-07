<<<<<<< HEAD
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { calculateSIP, safePercent } from '../lib/finance';
=======
import { useState, useEffect } from 'react';
import { ArrowRight, Calculator, TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

interface HeroProps {
  onNavigateToCalculators: (tabValue?: string) => void;
  onSectionChange: (section: string) => void;
}

<<<<<<< HEAD
// A real worked example, computed with the same functions the calculators use —
// not a decorative mockup with invented numbers.
const EXAMPLE = { monthlyInvestment: 5000, returnRate: 12, duration: 10 };

const inr = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CALCULATORS = [
  { tab: 'sip', name: 'SIP', description: 'Monthly investing, compounded over time' },
  { tab: 'mutual-fund', name: 'Mutual Fund', description: 'Growth on a one-time lumpsum' },
  { tab: 'emi', name: 'EMI', description: 'Loan repayment, principal vs interest' },
];

export function Hero({ onNavigateToCalculators, onSectionChange }: HeroProps) {
  const example = calculateSIP(EXAMPLE);
  const gainsShare = safePercent(example.gains, example.finalAmount);

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-20 sm:px-8 md:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* Left: the argument */}
          <div>
            <h1 className="t-display text-ink">
              Know what your
              <br />
              money becomes.
            </h1>

            <p className="measure t-body mt-6 text-[1.0625rem]">
              SIP, mutual fund and loan calculators that show the full picture —
              what you put in, what compounding adds, and what it costs you.
              Built for Indian investors, with live market data alongside.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => onNavigateToCalculators('sip')}>
                Open calculators
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onSectionChange('chat')}
              >
                Ask the assistant
              </Button>
            </div>
          </div>

          {/* Right: the product doing its job */}
          <div className="rounded-lg border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="t-label">Example SIP</span>
              <span className="text-[0.8125rem] text-ink-3 tabular">
                {inr(EXAMPLE.monthlyInvestment)}/mo · {EXAMPLE.duration} yrs ·{' '}
                {EXAMPLE.returnRate}%
              </span>
            </div>

            <div className="mt-6">
              <div className="t-figure text-[2.75rem] text-ink">
                {inr(example.finalAmount)}
              </div>
              <p className="mt-1.5 text-sm text-ink-3">
                Projected value after {EXAMPLE.duration} years
              </p>
            </div>

            {/* Composition bar — a 2px surface gap separates the segments so the
                boundary reads without relying on hue alone. */}
            <div className="mt-7 flex h-2.5 gap-[2px] overflow-hidden rounded-full">
              <div
                className="rounded-l-full bg-series-1"
                style={{ width: `${100 - gainsShare}%` }}
              />
              <div
                className="rounded-r-full bg-series-2"
                style={{ width: `${gainsShare}%` }}
              />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1">
              <div className="border-t border-line pt-3">
                <dt className="flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-series-1"
                  />
                  You invest
                </dt>
                <dd className="t-figure mt-1 text-lg text-ink">
                  {inr(example.totalInvested)}
                </dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-series-2"
                  />
                  Compounding adds
                </dt>
                <dd className="t-figure mt-1 text-lg text-ink">
                  {inr(example.gains)}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-[0.75rem] leading-relaxed text-ink-3">
              Illustration at an assumed {EXAMPLE.returnRate}% annual return. Actual
              returns vary and are not guaranteed.
=======
export function Hero({ onNavigateToCalculators, onSectionChange }: HeroProps) {
  const [titleText, setTitleText] = useState('');
  const fullText = 'Welcome to Money Grow';

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let currentText = '';
    let index = 0;

    const timeout = setTimeout(() => {
      intervalId = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setTitleText(currentText);
          index++;
        } else {
          if (intervalId) clearInterval(intervalId);
        }
      }, 100);
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const features = [
    {
      icon: Calculator,
      title: 'SIP Calculator',
      description: 'Plan your systematic investment strategy with flexible options',
      action: () => onNavigateToCalculators('sip')
    },
    {
      icon: TrendingUp,
      title: 'Mutual Fund Estimator',
      description: 'Estimate returns on your investments accurately',
      action: () => onNavigateToCalculators('mutual-fund')
    },
    {
      icon: PiggyBank,
      title: 'EMI Calculator',
      description: 'Calculate loan EMIs and plan payments smartly',
      action: () => onNavigateToCalculators('emi')
    },
    {
      icon: BarChart3,
      title: 'Financial Insights',
      description: 'Get personalized growth recommendations for you',
      action: () => onSectionChange('insights')
    }
  ];

  return (
    <section className="relative min-h-screen py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-green-200 dark:bg-green-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div
        className="max-w-7xl mx-auto w-full relative z-10"
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Main Welcome Heading - Centered */}
        <div className="text-center pt-6 md:pt-10 hero-intro">
          <div className="max-w-5xl mx-auto">
            <h1
              className="font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent hero-title"
              style={{ fontSize: 'clamp(28px, 6vw, 80px)', lineHeight: '1.05', minHeight: '1.1em' }}
            >
              {titleText || '\u00A0'}
              <span className="animate-pulse">|</span>
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: 'clamp(1rem, 2.4vw, 1.5rem)' }}>
              Your complete financial planning companion
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* The three tools, as a plain index rather than four identical cards */}
        <ul className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {CALCULATORS.map((calc) => (
            <li key={calc.tab}>
              <button
                onClick={() => onNavigateToCalculators(calc.tab)}
                className="group flex h-full w-full flex-col items-start bg-surface p-6 text-left transition-colors duration-[120ms] hover:bg-surface-2"
              >
                <span className="flex w-full items-center justify-between">
                  <span className="t-h3 text-ink">{calc.name}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 text-ink-3 transition-colors duration-[120ms] group-hover:text-accent"
                  />
                </span>
                <span className="mt-1.5 text-sm text-ink-3">{calc.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
=======
        {/* Feature Cards Section */}
        <div className="max-w-6xl mx-auto pb-6">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                onClick={feature.action}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)] dark:hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all duration-500 hover:-translate-y-4 cursor-pointer group overflow-hidden relative rounded-2xl"
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-green-50/50 to-transparent dark:from-blue-900/10 dark:via-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardContent className="p-8 text-center flex flex-col items-center relative z-10 h-full">
                  {/* Icon Container */}
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
                    <div className="relative bg-white dark:bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                      <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-500" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-green-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-1 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-500 mt-auto translate-y-4 group-hover:translate-y-0">
                    Explore Tracker
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Spacing Divider */}
        <div
          className="pt-10 mt-6 border-t border-slate-200 dark:border-slate-700"
          style={{ maxWidth: '72rem', margin: '0 auto' }}
        ></div>

        {/* Get Started CTA */}
        <div className="text-center pt-12 pb-10">
          <div
            className="bg-white/90 dark:bg-slate-900/60 p-8 md:p-12"
            style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Ready to Start Your Financial Journey?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Begin planning your financial future today with our comprehensive tools and calculators.
            </p>
            <Button
              onClick={onNavigateToCalculators}
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white px-10 py-6 text-lg font-bold shadow-lg hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)] hover:scale-110 transition-all duration-300 rounded-full group border border-transparent hover:border-white/20"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></span>
              <span className="relative flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
