import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface Plan {
  id: 'free' | 'plus' | 'pro';
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    description: 'Everything you need to run the numbers.',
    features: [
      'SIP, Mutual Fund & EMI calculators',
      'Live market ticker & news',
      '5 AI assistant messages / day',
      'No account needed',
    ],
    cta: 'Start free',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '₹149',
    period: '/month',
    description: 'For people actively planning and tracking goals.',
    features: [
      'Everything in Free',
      'Unlimited AI assistant messages',
      'Save & revisit unlimited calculator scenarios',
      'Goal tracking (retirement, house, education)',
      'Monthly email summary of your plans',
    ],
    highlighted: true,
    cta: 'Upgrade to Plus',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹399',
    period: '/month',
    description: 'For power users who want deeper analysis.',
    features: [
      'Everything in Plus',
      'Portfolio import & consolidated tracking',
      'Advanced tax-planning worksheets',
      'Priority AI responses (faster model, longer context)',
      'Export reports as PDF',
    ],
    cta: 'Upgrade to Pro',
  },
];

interface PricingProps {
  onNavigateToCalculators: (tabValue?: string) => void;
}

export function Pricing({ onNavigateToCalculators }: PricingProps) {
  const handleSelect = (plan: Plan) => {
    if (plan.id === 'free') {
      onNavigateToCalculators('sip');
      return;
    }
    // Checkout isn't wired up yet. Plug in Stripe Checkout / Razorpay
    // Subscriptions here, and gate the features above behind the user's plan
    // with a server-side entitlement check (see README "Subscriptions").
    toast(`${plan.name} is coming soon`, {
      description: 'Paid plans are not open yet. Everything in Free is available now.',
    });
  };

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <header className="max-w-2xl">
          <h2 className="t-h2 text-ink">Simple, transparent pricing</h2>
          <p className="t-body mt-3">
            Start free. Upgrade when you want to save your plans, track goals, or go deeper.
          </p>
        </header>

        <ul className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <li
              key={plan.id}
              className={`relative flex flex-col rounded-lg border bg-surface p-7 ${
                plan.highlighted ? 'border-accent shadow-[var(--shadow-md)] ring-1 ring-accent' : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="t-h3 text-ink">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-sm bg-accent-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-accent">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-1.5 min-h-10 text-[0.8125rem] leading-relaxed text-ink-3">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="t-figure text-[2.5rem] text-ink">{plan.price}</span>
                <span className="text-sm text-ink-3">{plan.period ?? 'forever'}</span>
              </div>

              <Button
                className="mt-6 w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                onClick={() => handleSelect(plan)}
              >
                {plan.cta}
              </Button>

              <ul className="mt-7 flex-1 space-y-3 border-t border-line pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[0.75rem] text-ink-3">
          Prices in INR. Paid plans are not yet open for sign-up.
        </p>
      </div>
    </section>
  );
}
