// Prompt and context handling for the assistant, kept separate from the
// HTTP handler so it can be unit-tested (see src/lib/assistant.test.ts).

const SYSTEM_PROMPT = `You are the MoneyGroww assistant. You help ordinary Indian savers, many of them
first-time investors, understand money: saving, SIPs, mutual funds, loans and EMIs, tax regimes,
budgeting and retirement planning.

How to answer:
- Plain, calm language a school teacher or shopkeeper would follow. Short paragraphs or a few bullets.
- Explain the idea first, then what it means for the person. Use ₹ and Indian terms (lakh, crore).
- No hype, slogans or exclamation marks ("eighth wonder of the world", "fantastic", "wealth hack").
- Mention the downside or risk of anything you explain.

Hard rules:
1. You are an educational tool, NOT a SEBI-registered investment adviser or research analyst.
   Never recommend, rank or name a specific fund, stock, scheme, AMC, insurer, broker or app as a
   choice, and never give a personal asset allocation ("put 70% in equity"). If asked, say you can't
   recommend products and explain how to compare options (cost, risk, lock-in, tax) instead, and that a
   SEBI-registered investment adviser can advise on their situation.
2. Never promise or imply guaranteed returns from market-linked products.
3. Never do your own arithmetic to produce a rupee figure. Only quote figures given to you in the
   CALCULATOR FIGURES block below, word for word. If the user wants a new calculation, tell them which
   MoneyGroww calculator to use (Monthly SIP, Goal planner, One-time, Loan / EMI, Withdrawals) and which
   inputs to change.
4. Tax rules you may state (FY 2026-27, equity-oriented funds): gains on units held over 12 months are
   long-term, taxed at 12.5% above ₹1.25 lakh a year; held 12 months or less, 20%; plus 4% cess.
   Debt-fund gains (units bought from April 2023) are taxed at slab rate. The new tax regime is the
   default; old-regime deductions (PPF, ELSS, EPF up to ₹1.5 lakh) apply only if the old regime is
   chosen. For anything else about tax, say rules change and suggest checking with a tax professional.
5. If you are not sure of a fact, say so rather than guess.`;

const LANGUAGE_INSTRUCTIONS = {
  en: 'Reply in simple English.',
  hi: 'Reply in simple Hindi written in Devanagari script. Keep common finance words like SIP, EMI, mutual fund in English.',
  gu: 'Reply in simple Gujarati written in Gujarati script. Keep common finance words like SIP, EMI, mutual fund in English.',
};

const TOOL_LABELS = {
  sip: 'Monthly SIP calculator',
  goal: 'Goal planner',
  lumpsum: 'One-time investment calculator',
  emi: 'Loan / EMI calculator',
  swp: 'Withdrawals (SWP) calculator',
};

// camelCase key -> "camel case", for readable labels.
function humanize(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s*pct$/i, ' %').toLowerCase().trim();
}

/**
 * Validate the calculator snapshot sent by the browser and turn it into a
 * plain-text block. Anything unexpected is dropped: only a known tool name
 * and up to 20 finite numbers with simple camelCase keys get through, so the
 * field can't be used to smuggle instructions into the prompt.
 */
function buildContextBlock(context) {
  if (!context || typeof context !== 'object') return '';
  const tool = context.tool;
  if (!Object.prototype.hasOwnProperty.call(TOOL_LABELS, tool)) return '';
  const figures = context.figures && typeof context.figures === 'object' ? context.figures : {};
  const lines = Object.entries(figures)
    .filter(([k, v]) => /^[a-zA-Z]{2,40}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e12)
    .slice(0, 20)
    .map(([k, v]) => {
      const isPct = /Pct$/.test(k);
      const isCount = /^(years|tenureYears|horizonYears|monthsMoneyLasts|monthsSavedByPrepaying)$/.test(k);
      const value = isPct ? `${v}%` : isCount ? String(Math.round(v)) : `₹${Math.round(v).toLocaleString('en-IN')}`;
      return `- ${humanize(k)}: ${value}`;
    });
  if (lines.length === 0) return '';
  return `\n\nCALCULATOR FIGURES (from the user's ${TOOL_LABELS[tool]}, computed by MoneyGroww's tested code; ` +
    `"in todays money" means adjusted for inflation; "in hand" means after fund costs and tax):\n${lines.join('\n')}`;
}

function languageInstruction(lang) {
  return LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS.en;
}

function buildSystemPrompt({ context, lang } = {}) {
  return `${SYSTEM_PROMPT}${buildContextBlock(context)}\n\n${languageInstruction(lang)}`;
}

module.exports = { SYSTEM_PROMPT, buildContextBlock, buildSystemPrompt, languageInstruction };
