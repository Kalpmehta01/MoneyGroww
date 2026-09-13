# Personal Financial Growth Estimator (MoneyGroww)

A comprehensive web application designed to help users plan their financial future, track market trends, and make informed investment decisions. This tool offers interactive calculators, live market data, a real AI-powered financial assistant, and a pricing/subscription page â€” all within a modern, responsive interface.

![Project Overview](https://www.figma.com/design/2UokgwfADGxkFe9tCUYKZG/Personal-Financial-Growth-Estimator) <!-- Figma Link as Placeholder -->

## Key Features

- **Interactive Financial Calculators (`/src/components/calculators.tsx`, math in `/src/lib/finance.ts`)**
  - **SIP Calculator:** Visualizes systematic investment plan returns over time, showing the power of compounding.
  - **Mutual Fund Calculator:** Estimates lumpsum investment growth.
  - **EMI Calculator:** Calculates monthly loan, interest, and principal amortization.
  - All calculator math lives in `src/lib/finance.ts` as pure, unit-tested functions (see `finance.test.ts`), separate from the UI. All numeric inputs are clamped/validated (`clampNumber`) so blank or out-of-range input can't produce `NaN` or nonsensical results.
  - *Includes insightful visualizations using Recharts (Pie, Line, and Area charts).*

- **Live Market Feed & News (`/src/components/live-ticker.tsx` & `/src/components/insights.tsx`)**
  - **Live Ticker:** Infinitely scrolling marquee showing real-time stock prices and daily changes for top Indian companies (e.g., Reliance, TCS, HDFC Bank).
  - **Financial News:** Latest headlines pulled from Yahoo Finance's RSS feed.
  - Both are now served through this project's own serverless functions (see below) instead of calling third-party CORS-relay services directly from the browser.

- **AI Financial Assistant (`/src/components/chat-section.tsx` + `netlify/functions/chat.js`)**
  - Real AI responses via the **Groq API** (`llama-3.3-70b-versatile` by default â€” fast, OpenAI-compatible chat completions). The API key is kept server-side only; it is never bundled into the frontend.
  - Falls back to the original rule-based canned responses if the API call fails (offline, running plain `vite dev` without functions, rate-limited, etc.), so the assistant never just errors out.

- **Pricing / Subscriptions (`/src/components/pricing.tsx`)**
  - A Free / Plus / Pro tier comparison UI. **This is a design placeholder only** â€” no payment processor is wired up yet. See "Subscriptions" below for how to actually implement billing.

## Technical Stack & Libraries

- **Framework:** React 18, Vite, TypeScript
- **Backend:** Netlify Functions (serverless, Node) for anything that needs a secret key or should not run in the browser
- **Styling:** Tailwind CSS integrated with Radix UI primitives for accessible, high-quality UI components (Accordion, Dialog, Slider, Tabs, etc.).
- **Data Visualization:** Recharts.
- **Animations:** Framer Motion (`motion/react`), Embla Carousel.
- **Form Handling:** React Hook Form.
- **Testing:** Vitest, for the calculator math in `src/lib/finance.ts`.

## Architecture: why there's now a `netlify/functions/` folder

The original version fetched market data and news **directly from the browser** through public, unauthenticated CORS-relay services (`allorigins.win`, `rss2json.com`), and the "AI assistant" was a hardcoded `if/else` keyword matcher. That had three problems: those relays are unreliable and can disappear or rate-limit at any time; there was nowhere safe to put an API key (anything shipped to the browser is public); and the assistant wasn't actually AI.

This version moves anything that needs a secret, or that benefits from being centralized/cached, into small serverless functions:

| Function | Purpose | Replaces |
|---|---|---|
| `netlify/functions/market-data.js` | Fetches Yahoo Finance chart data **server-side** (no CORS restriction between servers, so no relay needed at all) | Direct browser call through `allorigins.win` |
| `netlify/functions/news.js` | Fetches & parses Yahoo Finance's RSS feed server-side | Direct browser call through `rss2json.com` |
| `netlify/functions/chat.js` | Proxies to the Groq API with the API key read from an environment variable | The rule-based `getBotResponse()` (still kept as an offline fallback) |

All three still ultimately rely on Yahoo Finance's *unofficial* endpoints, which have no published SLA or commercial license â€” fine for personal/demo use, but swap in a licensed market-data provider (a broker's API, or a paid vendor) before depending on this for a real business.

### Environment variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
# then edit .env and set GROQ_API_KEY=your_own_key
```

Get a key from [console.groq.com](https://console.groq.com). **Note:** this is the Groq API (fast open-model inference) â€” a `gsk_...` key â€” not xAI's "Grok" model, which is a different company with a different API and key format (`xai-...`). If you actually want xAI's Grok model instead, `netlify/functions/chat.js` would need its endpoint and auth changed to xAI's API; ask if you want that swapped in.

**Never commit `.env`**, and never prefix a secret with `VITE_` â€” any `VITE_`-prefixed variable gets bundled into the public JS bundle and is visible to every visitor.

For production, set `GROQ_API_KEY` (and optionally `GROQ_MODEL`) in **Netlify â†’ Site settings â†’ Environment variables**, not in a committed file.

### Running locally

```bash
npm run dev      # UI + live market data + news (via the Vite dev proxy)
```

**Important gotcha:** `npm run dev` runs Vite alone, which does **not** run the serverless
functions in `netlify/functions/`. Worse, a request to `/.netlify/functions/market-data` under
Vite doesn't 404 â€” Vite's SPA fallback answers it with `index.html` and **HTTP 200**, so naive
code sees a "successful" response and only fails when it tries to parse HTML as JSON.

To handle that, `vite.config.ts` defines dev-only proxies (`/yahoo-api`, `/yahoo-rss`) and
`src/lib/market-api.ts` tries the real serverless function first, then falls back to those
proxies when running under plain `vite dev` (it checks the response's `content-type`, not just
`response.ok`). So the ticker and news work in `npm run dev` too.

The **AI chat** is the exception â€” it needs the real function because the Groq API key must stay
server-side. Under `npm run dev` it falls back to the old rule-based canned answers. To exercise
the real Groq-powered assistant locally, run the functions too:

```bash
npm install -g netlify-cli   # one-time
netlify dev
```

### Testing

```bash
npm test          # run the calculator math test suite once
npm run test:watch
```

### Building for Production

```bash
npm run build
```

Netlify picks up `netlify.toml` automatically (build command, publish dir, and functions dir are all configured there).

## Subscriptions (business model notes)

The Pricing page (`src/components/pricing.tsx`) currently shows three illustrative tiers â€” **Free**, **Plus (â‚¹149/mo)**, **Pro (â‚¹399/mo)** â€” but has no real billing behind it yet. To make it real:

1. **Add auth** (e.g. Supabase Auth, or any provider) so a "user" exists to attach a plan to.
2. **Add a `subscriptions` table** (user id, plan, status, renewal date) â€” Supabase/Postgres is a natural fit here since it's already available as a connected tool in this environment.
3. **Add a payment processor**: Razorpay or Stripe both support recurring subscriptions and work with INR; Razorpay is generally the simpler choice for an India-only audience.
4. **Gate features server-side**, not just in the UI â€” e.g. the `chat.js` function should check the caller's plan before allowing unlimited messages, and any "save my scenario" feature should check plan server-side too. A client-side-only `isPremium` flag can be trivially bypassed.
5. Wire the `onClick` handlers in `pricing.tsx` (currently a placeholder `alert(...)`) to the payment processor's checkout flow.

This is intentionally left as scaffolding rather than a live integration, since it requires your own Stripe/Razorpay account and keys.

---
*Developed for personal finance exploration and educational planning.*
