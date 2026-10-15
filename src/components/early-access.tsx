import { useState } from 'react';
import { Check, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * Replaces the old placeholder pricing page. There is no login, database or
 * payment system yet, so no prices are shown. Instead, people who want the
 * next features leave an email (Netlify Forms, no backend needed) and say
 * which features they want: real demand data before anything is built.
 */

const FEATURES = [
  { id: 'save-plans', title: 'Save your plans', body: 'Keep your goals and calculator scenarios and come back to them.' },
  { id: 'monthly-checkin', title: 'Monthly goal check-in', body: 'A short email each month: are you on track for each goal, and what changed.' },
  { id: 'family-report', title: 'Family money report', body: 'A one-page PDF of your goals to share with your spouse or parents.' },
  { id: 'gujarati-hindi', title: 'Gujarati and Hindi', body: 'The whole site in your language, not only the assistant.' },
];

export function EarlyAccess() {
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState<string[]>(['monthly-checkin']);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'invalid' | 'error'>('idle');

  const toggle = (id: string) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const clean = email.trim().slice(0, 254);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || !consent) {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'early-access',
          email: clean,
          interests: interests.join(', '),
          consent: 'yes',
          'bot-field': honeypot,
        }).toString(),
      });
      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
      setStatus('sent');
      setEmail('');
    } catch (err) {
      console.error('Early-access sign-up failed:', err);
      setStatus('error');
    }
  };

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <h2 className="t-h2 text-ink">Everything here is free</h2>
            <p className="t-body mt-3 max-w-xl">
              All calculators, the goal planner and the assistant work now with no account. We are deciding what to build
              next. Tell us what you would use and we will email you when it is ready.
            </p>

            <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {FEATURES.map((f) => {
                const on = interests.includes(f.id);
                return (
                  <li key={f.id} className="bg-surface">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(f.id)}
                      className={`flex h-full w-full items-start gap-3 p-5 text-left transition-colors duration-[120ms] ${on ? 'bg-accent-soft' : 'hover:bg-surface-2'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${on ? 'border-accent bg-accent text-accent-ink' : 'border-line-2'}`}
                      >
                        {on && <Check className="h-3 w-3" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-ink">{f.title}</span>
                        <span className="mt-1 block text-[0.8125rem] leading-relaxed text-ink-3">{f.body}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[0.75rem] text-ink-3">Tick the ones you want. It decides what gets built first.</p>
          </div>

          <div className="rounded-lg border border-line bg-surface-2 p-6 sm:p-8">
            {status === 'sent' ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Check aria-hidden="true" className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-ink">You are on the list.</p>
                <p className="mt-1 text-[0.8125rem] text-ink-3">We will only email you about these features.</p>
              </div>
            ) : (
              <form
                name="early-access"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={submit}
                className="space-y-5"
              >
                <input type="hidden" name="form-name" value="early-access" />
                <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
                  <label>
                    Leave this field empty
                    <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </label>
                </div>
                <h3 className="t-h3 flex items-center gap-2 text-ink">
                  <Mail aria-hidden="true" className="h-4 w-4 text-accent" /> Get early access
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="ea-email" className="text-sm text-ink-2">Email address</Label>
                  <Input
                    id="ea-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                    required
                  />
                  <span>
                    Email me when the features I ticked are ready. My email is used only for this, never sold, and deleted if I
                    ask at support@moneygroww.com.
                  </span>
                </label>
                <Button type="submit" className="w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Notify me'}
                </Button>
                <p aria-live="polite" className="min-h-4 text-[0.8125rem]">
                  {status === 'invalid' && <span className="text-neg">Please enter a valid email and tick the consent box.</span>}
                  {status === 'error' && <span className="text-neg">Couldn’t send that. Email support@moneygroww.com instead.</span>}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
