import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { honestProjection, safePercent } from '../lib/finance';
import { inr } from '../lib/format';
import { DEFAULT_INFLATION } from '../data/reference-rates';

interface HeroProps {
  onNavigateToCalculators: (tabValue?: string) => void;
  onSectionChange: (section: string) => void;
}

// The same inputs the SIP calculator starts from, so the hero can never show
// a number the calculator would not.
const EXAMPLE = {
  monthly: 5000,
  years: 10,
  returnPct: 12,
  costPct: 1,
  tax: 'equity' as const,
  inflationPct: DEFAULT_INFLATION,
};

const CALCULATORS = [
  { tab: 'goal', name: 'Goal planner', description: 'How much to invest each month for a goal' },
  { tab: 'sip', name: 'Monthly SIP', description: 'What regular investing really becomes' },
  { tab: 'emi', name: 'Loan / EMI', description: 'The true cost of a loan, and how to cut it' },
  { tab: 'swp', name: 'Withdrawals', description: 'How long your savings will last' },
];

export function Hero({ onNavigateToCalculators, onSectionChange }: HeroProps) {
  const r = honestProjection(EXAMPLE);
  const realShare = safePercent(r.todaysMoney, r.headlineValue);

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-20 sm:px-8 md:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <h1 className="t-display text-ink">
              What your money
              <br />
              is really worth.
            </h1>
            <p className="measure t-body mt-6 text-[1.0625rem]">
              Most calculators show a big number and stop. MoneyGroww also takes out fund costs, tax and rising prices, so
              you can plan with the amount you will actually be able to spend. Free, no sign-up.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => onNavigateToCalculators('goal')}>
                Plan a goal
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigateToCalculators('sip')}>
                Open calculators
              </Button>
              <button
                type="button"
                onClick={() => onSectionChange('chat')}
                className="px-2 text-sm font-medium text-ink-2 underline-offset-4 hover:text-accent hover:underline"
              >
                Ask a question
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="t-label">Example SIP</span>
              <span className="text-[0.8125rem] text-ink-3 tabular">
                {inr(EXAMPLE.monthly)}/mo · {EXAMPLE.years} yrs · {EXAMPLE.returnPct}%
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-[0.8125rem] text-ink-3">What most calculators show</p>
                <div className="t-figure mt-1 text-2xl text-ink-3 line-through decoration-1">{inr(r.headlineValue)}</div>
              </div>
              <div>
                <p className="text-[0.8125rem] font-medium text-ink">What it is really worth</p>
                <div className="t-figure mt-1 text-[2.25rem] leading-none text-ink">{inr(r.todaysMoney)}</div>
              </div>
            </div>

            <div className="mt-6 flex h-2.5 gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
              <div className="rounded-l-full bg-accent" style={{ width: `${realShare}%` }} />
              <div className="rounded-r-full bg-secondary" style={{ width: `${100 - realShare}%` }} />
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">You put in</dt>
                <dd className="tabular text-ink">{inr(r.invested)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Fund costs (1% a year)</dt>
                <dd className="tabular text-neg">−{inr(r.costDrag)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Tax on withdrawal</dt>
                <dd className="tabular text-neg">−{inr(r.tax)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Prices rise {EXAMPLE.inflationPct}% a year</dt>
                <dd className="tabular text-neg">−{inr(r.inHand - r.todaysMoney)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-[0.75rem] leading-relaxed text-ink-3">
              Equity fund at an assumed {EXAMPLE.returnPct}% a year, FY 2026-27 tax rules. That gap is why costs, tax and
              inflation matter as much as the return itself. Returns are not guaranteed.
            </p>
          </div>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
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
