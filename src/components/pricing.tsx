import { Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
      'No saved history',
    ],
    cta: 'Current Plan',
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

export function Pricing() {
  return (
    <section className="px-5 py-20 sm:px-8 md:py-24 bg-white dark:bg-canvas border-b border-line">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="t-h2 text-ink mb-4">
            Simple, transparent pricing
          </h2>
          <p className="t-body">
            Start free. Upgrade when you want to save your plans, track goals, or go deeper.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? 'border-2 border-accent shadow-md scale-100 md:scale-105'
                  : 'border-line dark:border-line'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-white border-none px-3 py-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="t-figure text-4xl text-ink">{plan.price}</span>
                  {plan.period && <span className="text-ink-3">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-ink-2">
                      <Check className="h-4 w-4 text-pos mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : ''
                  }`}
                  variant={plan.id === 'free' ? 'outline' : plan.highlighted ? 'default' : 'outline'}
                  disabled={plan.id === 'free'}
                  onClick={() => {
                    // TODO: wire up real checkout. This is UI scaffolding only —
                    // plug in Stripe Checkout / Razorpay Subscriptions here, and
                    // gate the features above behind the user's plan (see README
                    // "Subscriptions" section for the recommended architecture:
                    // auth + a `subscriptions` table + a server-side entitlement
                    // check, never a client-side-only flag).
                    alert(
                      `${plan.name} checkout isn't wired up yet — this is a UI placeholder. See README for how to connect Stripe/Razorpay.`
                    );
                  }}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-ink-3 mt-10 max-w-2xl mx-auto">
          Prices shown in INR, illustrative. Paid plans are not yet active — this pricing page is a
          design/UX placeholder pending payment integration.
        </p>
      </div>
    </section>
  );
}
