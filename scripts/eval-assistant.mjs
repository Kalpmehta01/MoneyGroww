#!/usr/bin/env node
// Runs evals/assistant-cases.json against a deployed (or `netlify dev`) site
// and reports which behaviour checks pass. Needs the real AI backend, so set
// BASE_URL, e.g.  BASE_URL=http://localhost:8888 node scripts/eval-assistant.mjs
//
// The chat function only accepts same-site requests; for a deployed site run
// this with ALLOWED_ORIGINS unset or call it from the site's own origin.

import { readFile } from 'node:fs/promises';

const base = (process.env.BASE_URL || 'http://localhost:8888').replace(/\/$/, '');
const { cases } = JSON.parse(await readFile(new URL('../evals/assistant-cases.json', import.meta.url), 'utf8'));

let passed = 0;
for (const c of cases) {
  const res = await fetch(`${base}/.netlify/functions/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: c.question }], context: c.context, lang: c.lang }),
  });
  const data = await res.json().catch(() => ({}));
  const reply = String(data.reply || '');
  const failures = [];
  if (!res.ok || !reply) failures.push(`HTTP ${res.status} ${data.error || 'no reply'}`);
  for (const p of c.mustMatch || []) if (!new RegExp(p, 'i').test(reply)) failures.push(`missing /${p}/`);
  for (const p of c.mustNotMatch || []) if (new RegExp(p, 'i').test(reply)) failures.push(`should not match /${p}/`);
  if (failures.length === 0) passed++;
  console.log(`${failures.length ? 'FAIL' : 'pass'}  ${c.id}${failures.length ? `  — ${failures.join('; ')}` : ''}`);
  if (failures.length && process.env.VERBOSE) console.log(`      ${reply.replace(/\n/g, '\n      ')}`);
  // Stay under the function's 10 requests/minute limit.
  await new Promise((r) => setTimeout(r, 6500));
}
console.log(`\n${passed}/${cases.length} passed`);
process.exit(passed === cases.length ? 0 : 1);
