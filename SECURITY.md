# MoneyGroww – Security audit & hardening (2026-10-07)

Scope: the code in the project folder (Vite + React front end, three Netlify
Functions: `chat`, `market-data`, `news`). Not scanned: git history (the folder has no
`.git`), the live Netlify account settings, and the deployed site.

## What the app actually is

A public, static marketing/calculator site plus three small serverless endpoints.
There are **no user accounts, no admin pages, no database, no passwords and no
sessions**. Items that only make sense for those are marked *N/A* below rather than
bolting on fake auth – adding login to a site with nothing private behind it would
only add attack surface. If you add accounts later, use a managed provider (Netlify
Identity / Auth0 / Clerk / Supabase Auth) instead of writing your own.

## Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Hide API keys | **OK** | The only secret (`GROQ_API_KEY`) is read server-side in `chat.js`. No key found in source, bundle or docs. |
| 2 | Env variables | **Fixed** | `.env.example` documents `GROQ_API_KEY`, `GROQ_MODEL`, new `ALLOWED_ORIGINS`. `.gitignore` now blocks `.env*`, keys, certs. Nothing uses `VITE_*`. |
| 3 | Protect admin routes | **N/A** | No admin routes exist. |
| 4 | Proper authentication | **N/A** | No login. Chat endpoint is protected by origin check + rate limit + size caps instead. |
| 5 | Multiple concurrent sessions | **N/A** | No sessions. (If you add auth: allow several refresh tokens per user, one per device, revocable individually.) |
| 6 | Access control | **Fixed** | Each function allows only the methods it needs (405 otherwise) and rejects cross-site `Origin` (403). |
| 7 | Sanitise forms | **Fixed** | Contact form: trimmed, length-capped (100/254/2000), re-validated in JS, honeypot field + Netlify spam filter. Chat input capped; server caps count, size and total characters. |
| 8 | XSS protection | **Fixed** | No `dangerouslySetInnerHTML` in used code; React escapes all text. Feed/tip links are forced to http(s) (a `javascript:` URL can no longer reach an `href`), both in `news.js` and in the UI. Strict CSP added. |
| 9 | Rate limiting | **Partly** | In-function limiter (chat 10/min, market 60/min, news 30/min per IP) – best effort only, because serverless instances don't share memory. **You should also turn on Netlify's platform rate limiting / WAF for `/.netlify/functions/chat`.** |
| 10 | Secure API endpoints | **Fixed** | Symbol allow-list on `market-data` (was a regex that allowed arbitrary tickers – and wrongly rejected `GC=F`); 8–20 s upstream timeouts; upstream error text no longer returned to browsers (logged server-side only); JSON-only responses with `nosniff`; `no-store` on chat. |
| 11 | CORS | **Fixed** | Same-origin only: no `Access-Control-Allow-*` headers are sent at all. |
| 12 | Security headers | **Fixed** | `netlify.toml`: CSP, HSTS (2 years, preload), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP. |
| 13 | Debug mode off | **OK** | No debug flags; production build has `sourcemap: false`; dev server now binds to `localhost` only. |
| 14 | Update dependencies | **Fixed** | `npm audit`: 1 high (lodash) + 5 dev-tool findings → **0 vulnerabilities**. Vite 6.4.4, Vitest 5, `@types/node` 22. `clsx`/`motion`/`tailwind-merge` were `"*"` – now pinned to caret ranges. `@types/react` 19 vs React 18 mismatch corrected. Node requirement raised to ≥20. |
| 15 | Remove unused packages | **Fixed** | 27 unused dependencies removed (20 Radix packages, cmdk, embla, input-otp, react-day-picker, react-hook-form, react-resizable-panels, vaul). |
| 16 | Unwanted files / folders / code | **Needs you** | See "Delete these" below – this session cannot delete files in your folder. |
| 17 | Exposed files | **OK** | Nothing sensitive in `public/`. Screenshot folder `Claude outputs/` should not be published (delete). |
| 18 | Secure the database | **N/A** | No database. |
| 19 | Hash passwords | **N/A** | No passwords stored. |
| 20 | Scan git for leaked secrets | **Needs you** | No `.git` in the folder, so history couldn't be scanned. Working tree: no real keys (only the text "gsk_…" in comments). Run the commands below on your repo. |

## Delete these (unused – build and tests verified without them)

- `src/components/chatbot.tsx` (old duplicate of the chat UI)
- `src/components/figma/` (whole folder)
- `src/data/constants.ts` (dead code; still references the old third-party relays allorigins.win / rss2json.com)
- `src/index.css` (60 kB, not imported anywhere)
- `src/guidelines/` and `src/Attributions.md` (template boilerplate)
- `Claude outputs/` (screenshots at the project root)
- `public/_redirects` (duplicate of the redirect already in `netlify.toml`)
- In `src/components/ui/` keep only: `badge, button, card, input, label, scroll-area, separator, slider, sonner, tabs, textarea, utils`. Delete the other ~37 files.

## Do these yourself (cannot be done from code)

1. **Rotate the Groq key** at console.groq.com if it was ever pasted into chat, a commit, a screenshot or a README. Set the new one only in Netlify → Site settings → Environment variables (scope: Functions).
2. Set `ALLOWED_ORIGINS` in Netlify to your custom domain(s) once you have one.
3. Netlify → turn on rate limiting / WAF rules for the chat function; set a spend cap in the Groq console.
4. On GitHub: enable Secret scanning + push protection, Dependabot alerts and updates.
5. Scan history:

```
npx gitleaks detect --source . --log-opts="--all" -v
git log --all --full-history -- .env
```

6. Re-run `npm install` then `npm audit` and `npm test` after pulling these changes.

## Notes / residual risks

- The CSP allows `style-src 'unsafe-inline'` because Tailwind/Radix/charts set inline styles; scripts are `'self'` only.
- Market data comes from Yahoo's unofficial chart endpoint and news from public publisher RSS feeds (no SLA or licence). Fine for a demo; replace with a licensed provider before relying on them commercially.
- The chat assistant is a public LLM endpoint: rate limits and a provider spend cap are your protection against cost abuse and prompt-injection spam.
