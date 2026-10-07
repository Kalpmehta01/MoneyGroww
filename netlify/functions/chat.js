// AI assistant backend, powered by Groq's OpenAI-compatible chat completions
// API (https://api.groq.com/openai/v1/chat/completions) — fast open-model
// inference, not to be confused with xAI's "Grok" model (different company,
// different API, different key format: xAI keys start with "xai-", Groq
// keys start with "gsk_"). The key supplied for this project is a Groq key,
// so that's what this function calls.
//
// The key lives ONLY here, read from the GROQ_API_KEY environment variable
// on the server. It must never be embedded in frontend code or committed to
// the repo — see .env.example / README for how it's wired up.

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const { json, guard, fetchWithTimeout } = require('./_lib/security');

const MAX_HISTORY_MESSAGES = 12; // keep request size/cost bounded
const MAX_BODY_BYTES = 16 * 1024; // reject oversized payloads before parsing
const MAX_TOTAL_CHARS = 8000;

const SYSTEM_PROMPT = `You are MoneyGroww's AI financial assistant, helping Indian retail users understand
personal finance concepts: SIPs, mutual funds, EMIs, tax saving, budgeting, and general investment
literacy. Be concise, practical, and use ₹ for currency examples.

Hard rules:
- You are NOT a SEBI-registered investment advisor. Never recommend a specific stock, fund, or
  platform, and never claim guaranteed returns.
- If asked for specific/personalized investment advice, explain the general concept and suggest
  the user consult a qualified financial advisor for their specific situation.
- When it's naturally relevant, you may suggest the user try MoneyGroww's SIP / Mutual Fund / EMI
  calculators to model their own numbers.
- Keep responses focused; avoid filler.`;

exports.handler = async (event) => {
  // method + same-site origin + rate limit (10 requests/minute/IP, best effort)
  const blocked = guard(event, { methods: ['POST'], name: 'chat', max: 10, windowMs: 60_000 });
  if (blocked) return blocked;

  const ctype = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
  if (!ctype.toLowerCase().includes('application/json')) {
    return json(415, { error: 'Content-Type must be application/json' });
  }
  if (Buffer.byteLength(event.body || '', 'utf8') > MAX_BODY_BYTES) {
    return json(413, { error: 'Request too large' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set');
    return json(500, { error: 'Assistant is temporarily unavailable.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { messages } = payload || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(400, { error: '"messages" array is required' });
  }

  // Only forward well-formed {role, content} pairs, and cap history length.
  let sanitized = messages
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  // Cap total prompt size (cost control) by dropping the oldest messages.
  while (sanitized.length > 1 && sanitized.reduce((n, m) => n + m.content.length, 0) > MAX_TOTAL_CHARS) {
    sanitized = sanitized.slice(1);
  }

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
    return json(400, { error: 'No valid messages provided' });
  }

  try {
    const response = await fetchWithTimeout(
      GROQ_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || DEFAULT_MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitized],
          temperature: 0.6,
          max_tokens: 600,
        }),
      },
      20000
    );

    if (!response.ok) {
      // Log details server-side only; never echo upstream error bodies to the browser.
      console.error('Groq API error', response.status, await response.text().catch(() => ''));
      return json(502, { error: 'The assistant is temporarily unavailable.' });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return json(502, { error: 'The assistant is temporarily unavailable.' });
    }

    return json(200, { reply }, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('Failed to reach Groq API', err);
    return json(502, { error: 'The assistant is temporarily unavailable.' });
  }
};
