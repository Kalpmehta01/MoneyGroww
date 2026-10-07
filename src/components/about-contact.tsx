import { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function AboutContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Submits to Netlify Forms. The previous version showed a success toast
  // without sending anything anywhere — the message was silently discarded.
  // Netlify picks this up via the hidden static form in index.html; the
  // form-name field below must match its name attribute.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    // Trim and re-validate on submit (HTML attributes alone can be bypassed).
    const name = formData.name.trim().slice(0, 100);
    const email = formData.email.trim().slice(0, 254);
    const message = formData.message.trim().slice(0, 2000);
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      toast.error('Please check your name, email and message.');
      return;
    }
    setStatus('sending');

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          name,
          email,
          message,
          'bot-field': honeypot,
        }).toString(),
      });

      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);

      setStatus('sent');
      toast.success('Message sent. We\'ll get back to you by email.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact form submission failed:', err);
      setStatus('error');
      toast.error('Could not send your message.');
    }
  };

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        {/* ----------------------------------------------------------- About */}
        <header className="max-w-2xl">
          <h2 className="t-h2 text-ink">About MoneyGroww</h2>
          <p className="t-body mt-3">
            MoneyGroww exists to make financial planning understandable. Clear calculators, honest
            assumptions and live market context, so you can make decisions with the full picture
            in front of you, whatever your experience.
          </p>
        </header>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Full picture, always',
              body: 'Every projection splits what you put in from what compounding adds, or what a loan really costs.',
            },
            {
              title: 'Live Indian market data',
              body: 'Index, ETF and large-cap prices refresh continuously while you plan.',
            },
            {
              title: 'No account required',
              body: 'Every calculator works immediately, with nothing to sign up for.',
            },
            {
              title: 'Assumptions stated',
              body: 'Each projection names the return rate it assumes and what it cannot promise.',
            },
          ].map((item) => (
            <li key={item.title} className="bg-surface p-6">
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-3">{item.body}</p>
            </li>
          ))}
        </ul>

        {/* NOTE: earlier versions listed invented team members and traction
            figures ("100K+ Happy Users"). Add your real team here when there
            is one; until then, how the numbers are produced is the more useful
            and more honest thing to show. */}
        <div className="mt-16">
          <h3 className="t-h3 text-ink">How the numbers are produced</h3>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {[
              {
                title: 'Standard formulas',
                body: 'SIP uses the annuity-due future-value formula; lumpsum uses annual compounding; EMI uses the standard reducing-balance formula.',
              },
              {
                title: 'Covered by tests',
                body: 'The calculation layer is unit-tested, including zero-rate and boundary cases, so a refactor cannot silently change a result.',
              },
              {
                title: 'Sources, attributed',
                body: 'Prices come from Yahoo Finance and headlines from Mint, fetched server-side and refreshed continuously.',
              },
            ].map((item) => (
              <li key={item.title} className="bg-surface p-6">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-3">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* --------------------------------------------------------- Contact */}
        <div id="contact" className="mt-24 scroll-mt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <h2 className="t-h2 text-ink">Get in touch</h2>
              <p className="t-body mt-3">
                Questions, feedback or a calculator you would like to see? Send a message and we will
                reply by email.
              </p>

              <dl className="mt-8 space-y-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                    <Mail aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-[0.8125rem] text-ink-3">Email</dt>
                    <dd>
                      <a href="mailto:support@moneygroww.com" className="text-sm font-medium text-ink hover:text-accent">
                        support@moneygroww.com
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-ink-2">
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-[0.8125rem] text-ink-3">Based in</dt>
                    <dd className="text-sm font-medium text-ink">Mumbai, India</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
              <form
                onSubmit={handleSubmit}
                name="contact"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                className="space-y-5"
              >
                <input type="hidden" name="form-name" value="contact" />
                {/* Honeypot: invisible to people, tempting to bots. */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
                  <label>
                    Leave this field empty
                    <input
                      type="text"
                      name="bot-field"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-ink-2">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-ink-2">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm text-ink-2">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    maxLength={2000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help?"
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Status is announced, and the failure case says what to do
                      instead rather than only that something went wrong. */}
                  <p aria-live="polite" className="text-[0.8125rem]">
                    {status === 'sent' && <span className="text-pos">Sent. We'll reply to the address you gave.</span>}
                    {status === 'error' && (
                      <span className="text-neg">
                        Couldn't send that. Email support@moneygroww.com directly instead.
                      </span>
                    )}
                    {(status === 'idle' || status === 'sending') && (
                      <span className="text-ink-3">All fields are required.</span>
                    )}
                  </p>
                  <Button type="submit" disabled={status === 'sending'}>
                    <Send aria-hidden="true" className="h-4 w-4" />
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
