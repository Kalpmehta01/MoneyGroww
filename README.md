# Personal Financial Growth Estimator (MoneyGroww)

A comprehensive web application designed to help users plan their financial future, track market trends, and make informed investment decisions. This tool offers interactive calculators, live market data, a real AI-powered financial assistant, and a pricing/subscription page — all within a modern, responsive interface.

![Project Overview](https://www.figma.com/design/2UokgwfADGxkFe9tCUYKZG/Personal-Financial-Growth-Estimator) <!-- Figma Link as Placeholder -->

## What changed in the October 2026 upgrade

Positioning: **"what your money is really worth."** Every projection walks from the usual headline number to what the money is actually worth: gross value → minus fund costs → minus tax → in today's rupees. It also shows a range instead of a single fixed return.

| Area | Change |
|---|---|
| Finance engine (`src/lib/finance.ts`) | `honestProjection` (costs, tax, inflation), per-instalment holding periods for LTCG/STCG, step-up SIP, `planGoal` (reverse-solves the monthly SIP that meets a goal *after* costs and tax), `simulatePrepayment`, `simulateSWP`, `projectionRange` (±3 points) |
| Reference data (`src/data/reference-rates.ts`) | FD and PPF rates, planning assumptions and FY 2026-27 tax rules in **one dated, sourced file**. Review it every quarter and after each Budget |
| Calculators | 5 tools: Monthly SIP, Goal planner, One-time, Loan / EMI (with prepayment), Withdrawals (SWP). Preset return chips (FD / PPF / Debt / Equity) instead of a blank % box. recharts replaced by a small SVG chart |
| Hero | Shows the honest figure (₹5,84,392) next to the headline figure (₹11,61,695) for the same SIP |
| Assistant | Receives the figures from the calculator in view (validated server-side) and is told to quote them, never compute. Hindi and Gujarati replies. Explainer-only suggestions. No product picks or allocations |
| Market data | Single-stock ticker removed. Tiles: NIFTY 50, SENSEX, gold in ₹/10 g, FD and PPF rates. Last good quote cached on the server and in the browser, with an "as of" time. No more "feed unavailable" banner |
| News | Headline and link only (no republished summaries), attributed |
| Pricing | Replaced by **Early access**: a Netlify Forms email sign-up with explicit consent and feature interest. No fake prices |
| Quality | 51 unit tests, including golden vectors that match public calculators. `npm run typecheck` is clean. JS bundle 706 kB → 342 kB |

### Assistant evals

`evals/assistant-cases.json` holds behaviour checks for the live model: no fund or stock picks, no allocations, no guarantees, correct LTCG/STCG figures, uses calculator figures, Hindi and Gujarati. Run them against `netlify dev` or a deploy preview after any prompt or model change:

```bash
BASE_URL=http://localhost:8888 npm run eval:assistant
```

### Still open (needs the client)

- Legal entity, grievance contact, data-retention period and privacy notice for the two forms (DPDP Act 2023)
- Whether the client holds an AMFI ARN or SEBI RIA registration. This decides how far personalised features can go
- A licensed, delayed market-data source to replace Yahoo's unofficial endpoint, and permission for headline use
- Trademark check on the "MoneyGroww" name (close to an existing fintech brand)
- Validating the return range against historical index (TRI) data, which needs a licensed data source
- Full-site Gujarati/Hindi translation. Today only the assistant replies in those languages

## Key Features

- **Calculators** (`src/components/calculators.tsx`, math in `src/lib/finance.ts`): goal planner, SIP with step-up, one-time, EMI with prepayment, SWP. All figures can be shown after costs, after tax and in today's money.
- **Market & insights** (`src/components/insights.tsx`): index and gold snapshot, reference rates, headlines, and habit cards that link into the calculators and assistant.
- **AI assistant** (`src/components/chat-section.tsx` + `netlify/functions/chat.js`, prompt in `netlify/functions/_lib/assistant.js`): Groq `llama-3.3-70b-versatile`, with a rule-based offline fallback (`src/lib/chat-fallback.ts`) that follows the same rules.
- **Early access** (`src/components/early-access.tsx`): demand capture via Netlify Forms.

## Technical Stack & Libraries

- **Framework:** React 18, Vite, TypeScript
- **Backend:** Netlify Functions (serverless, Node) for anything that needs a secret key or should not run in the browser
- **Styling:** Tailwind CSS integrated with Radix UI primitives for accessible, high-quality UI components (Accordion, Dialog, Slider, Tabs, etc.).
- **Data Visualization:** a small hand-written SVG chart (`src/components/growth-chart.tsx`).
- **Testing:** Vitest for the finance engine and assistant prompt safety (`npm test`), `npm run typecheck`, and live-model evals (`npm run eval:assistant`).

## Architecture: why there's now a `netlify/functions/` folder

The original version fetched market data and news **directly from the browser** through public, unauthenticated CORS-relay services (`allorigins.win`, `rss2json.com`), and the "AI assistant" was a hardcoded `if/else` keyword matcher. That had three problems: those relays are unreliable and can disappear or rate-limit at any time; there was nowhere safe to put an API key (anything shipped to the browser is public); and the assistant wasn't actually AI.

This version moves anything that needs a secret, or that benefits from being centralized/cached, into small serverless functions:

| Function | Purpose | Replaces |
|---|---|---|
| `netlify/functions/market-data.js` | Fetches Yahoo Finance chart data **server-side** (no CORS restriction between servers, so no relay needed at all) | Direct browser call through `allorigins.win` |
| `netlify/functions/news.js` | Fetches & parses Mint / Economic Times market RSS server-side | Direct browser call through `rss2json.com` |
| `netlify/functions/chat.js` | Proxies to the Groq API with the API key read from an environment variable | The rule-based `getBotResponse()` (still kept as an offline fallback) |

All three still ultimately rely on Yahoo Finance's *unofficial* endpoints, which have no published SLA or commercial license — fine for personal/demo use, but swap in a licensed market-data provider (a broker's API, or a paid vendor) before depending on this for a real business.

### Environment variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
# then edit .env and set GROQ_API_KEY=your_own_key
```

Get a key from [console.groq.com](https://console.groq.com). **Note:** this is the Groq API (fast open-model inference) — a `gsk_...` key — not xAI's "Grok" model, which is a different company with a different API and key format (`xai-...`). If you actually want xAI's Grok model instead, `netlify/functions/chat.js` would need its endpoint and auth changed to xAI's API; ask if you want that swapped in.

**Never commit `.env`**, and never prefix a secret with `VITE_` — any `VITE_`-prefixed variable gets bundled into the public JS bundle and is visible to every visitor.

For production, set `GROQ_API_KEY` (and optionally `GROQ_MODEL`) in **Netlify → Site settings → Environment variables**, not in a committed file.

### Running locally

```bash
npm run dev      # UI + live market data + news (via the Vite dev proxy)
```

**Important gotcha:** `npm run dev` runs Vite alone, which does **not** run the serverless
functions in `netlify/functions/`. Worse, a request to `/.netlify/functions/market-data` under
Vite doesn't 404 — Vite's SPA fallback answers it with `index.html` and **HTTP 200**, so naive
code sees a "successful" response and only fails when it tries to parse HTML as JSON.

To handle that, `vite.config.ts` defines dev-only proxies (`/yahoo-api`, `/news-rss`) and
`src/lib/market-api.ts` tries the real serverless function first, then falls back to those
proxies when running under plain `vite dev` (it checks the response's `content-type`, not just
`response.ok`). So the ticker and news work in `npm run dev` too.

The **AI chat** is the exception — it needs the real function because the Groq API key must stay
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

## Subscriptions (later)

There is no billing. The Early access form collects demand first. If paid features follow (saved plans, monthly check-ins), add auth, a database, and Razorpay or Stripe subscriptions, and gate features server-side. Before charging for anything plan-specific, confirm the regulatory position (see "Still open").
---
*Developed for personal finance exploration and educational planning.*
