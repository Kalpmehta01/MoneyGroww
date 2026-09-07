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
const MAX_HISTORY_MESSAGES = 12; // keep request size/cost bounded

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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is not configured with a GROQ_API_KEY.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { messages } = payload;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: '"messages" array is required' }) };
  }

  // Only forward well-formed {role, content} pairs, and cap history length.
  const sanitized = messages
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (sanitized.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No valid messages provided' }) };
  }

  try {
    const response = await fetch(GROQ_ENDPOINT, {
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
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Groq API error', status: response.status, detail }),
      };
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Empty response from model' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to reach Groq API', detail: String(err) }) };
  }
};
