// Shared security helpers for the Netlify functions.
// Files in an underscore-prefixed sub-folder without an index.js are bundled
// into the functions that require them but are NOT deployed as endpoints.

const SECURITY_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
  // API responses are JSON only; never let a browser render them as a page.
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

// Same-origin only: the site and its functions share one origin, so we send NO
// Access-Control-Allow-* headers at all (the strictest CORS policy). Browsers
// from other sites are blocked, and we additionally reject cross-site Origins
// server-side below. Add extra origins via the ALLOWED_ORIGINS env variable
// (comma separated), e.g. a custom domain.
function allowedOrigins() {
  const list = [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL]
    .concat((process.env.ALLOWED_ORIGINS || '').split(','))
    .map((s) => (s || '').trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (process.env.NETLIFY_DEV) list.push('http://localhost:8888', 'http://localhost:3000');
  return new Set(list);
}

function originAllowed(event) {
  const origin = event.headers?.origin || event.headers?.Origin;
  if (!origin) return true; // same-origin GETs and non-browser clients send none
  const allowed = allowedOrigins();
  if (allowed.size === 0) return true; // not configured (e.g. first deploy): do not lock yourself out
  return allowed.has(origin.replace(/\/$/, ''));
}

function json(statusCode, body, extraHeaders = {}) {
  return { statusCode, headers: { ...SECURITY_HEADERS, ...extraHeaders }, body: JSON.stringify(body) };
}

function clientIp(event) {
  const h = event.headers || {};
  return (
    h['x-nf-client-connection-ip'] ||
    (h['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown'
  );
}

// Best-effort sliding-window limiter. State lives in the warm function
// instance, so it blunts bursts and casual abuse but is NOT a hard global
// limit (instances don't share memory). For a hard limit also enable Netlify's
// platform rate limiting / WAF rules (see SECURITY.md).
const buckets = new Map();
function rateLimited(event, name, max, windowMs) {
  const now = Date.now();
  const key = `${name}:${clientIp(event)}`;
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
    if (buckets.size > 5000) buckets.clear();
  }
  return hits.length > max;
}

// Common gate: method, origin, rate limit. Returns a response to send, or null.
function guard(event, { methods, name, max, windowMs }) {
  if (!methods.includes(event.httpMethod)) {
    return json(405, { error: 'Method Not Allowed' }, { Allow: methods.join(', ') });
  }
  if (!originAllowed(event)) return json(403, { error: 'Forbidden' });
  if (rateLimited(event, name, max, windowMs)) {
    return json(429, { error: 'Too many requests. Please slow down.' }, { 'Retry-After': '60' });
  }
  return null;
}

async function fetchWithTimeout(url, options = {}, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

function safeHttpUrl(value) {
  try {
    const u = new URL(String(value));
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
  } catch {
    return '';
  }
}

module.exports = { json, guard, fetchWithTimeout, safeHttpUrl, SECURITY_HEADERS };
