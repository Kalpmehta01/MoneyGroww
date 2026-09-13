import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { calculateSIP, safePercent } from '../lib/finance';

interface HeroProps {
  onNavigateToCalculators: (tabValue?: string) => void;
  onSectionChange: (section: string) => void;
}

const EXAMPLE = { monthlyInvestment: 5000, returnRate: 12, duration: 10 };
const CALCULATORS = [
  { tab: 'sip', name: 'SIP', description: 'Monthly investing, compounded over time' },
  { tab: 'mutual-fund', name: 'Mutual Fund', description: 'Growth on a one-time lumpsum' },
  { tab: 'emi', name: 'EMI', description: 'Loan repayment, principal vs interest' },
];

const inr = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export function Hero({ onNavigateToCalculators, onSectionChange }: HeroProps) {
  const example = calculateSIP(EXAMPLE);
  const gainsShare = safePercent(example.gains, example.finalAmount);

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-20 sm:px-8 md:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <h1 className="t-display text-ink">Know what your<br />money becomes.</h1>
            <p className="measure t-body mt-6 text-[1.0625rem]">
              SIP, mutual fund and loan calculators that show the full picture - what
              you put in, what compounding adds, and what it costs you. Built for
              Indian investors, with live market data alongside.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => onNavigateToCalculators('sip')}>
                Open calculators
              </Button>
              <Button size="lg" variant="outline" onClick={() => onSectionChange('chat')}>
                Ask the assistant
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="t-label">Example SIP</span>
              <span className="text-[0.8125rem] text-ink-3 tabular">
                {inr(EXAMPLE.monthlyInvestment)}/mo · {EXAMPLE.duration} yrs · {EXAMPLE.returnRate}%
              </span>
            </div>
            <div className="mt-6">
              <div className="t-figure text-[2.75rem] text-ink">{inr(example.finalAmount)}</div>
              <p className="mt-1.5 text-sm text-ink-3">Projected value after {EXAMPLE.duration} years</p>
            </div>
            <div className="mt-7 flex h-2.5 gap-[2px] overflow-hidden rounded-full">
              <div className="rounded-l-full bg-series-1" style={{ width: `${100 - gainsShare}%` }} />
              <div className="rounded-r-full bg-series-2" style={{ width: `${gainsShare}%` }} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1">
              <div className="border-t border-line pt-3">
                <dt className="flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-series-1" /> You invest
                </dt>
                <dd className="t-figure mt-1 text-lg text-ink">{inr(example.totalInvested)}</dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-series-2" /> Compounding adds
                </dt>
                <dd className="t-figure mt-1 text-lg text-ink">{inr(example.gains)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-[0.75rem] leading-relaxed text-ink-3">
              Illustration at an assumed {EXAMPLE.returnRate}% annual return. Actual returns vary and are not guaranteed.
            </p>
          </div>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {CALCULATORS.map((calculator) => (
            <li key={calculator.tab}>
              <button
                onClick={() => onNavigateToCalculators(calculator.tab)}
                className="group flex h-full w-full flex-col items-start bg-surface p-6 text-left transition-colors duration-[120ms] hover:bg-surface-2"
              >
                <span className="flex w-full items-center justify-between">
                  <span className="t-h3 text-ink">{calculator.name}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 text-ink-3 transition-colors duration-[120ms] group-hover:text-accent" />
                </span>
                <span className="mt-1.5 text-sm text-ink-3">{calculator.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
