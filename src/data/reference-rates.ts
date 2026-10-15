/**
 * Reference rates and tax rules, kept in ONE dated, sourced place.
 *
 * Nothing here is fetched live. Every figure carries the date it was last
 * checked and where it came from, so a stale number is visible rather than
 * silently wrong. Review this file every quarter (small-savings rates are
 * reset by the Ministry of Finance each quarter) and after every Union Budget.
 */

export interface ReferenceRate {
  id: 'fd' | 'ppf' | 'debt' | 'equity';
  label: string;
  /** Annual rate in percent. */
  rate: number;
  /** 'rate' = a published rate; 'assumption' = a planning assumption, not a promise. */
  kind: 'rate' | 'assumption';
  /** How returns are taxed, used by the "after tax" view. */
  tax: 'slab' | 'exempt' | 'equity' | 'debt';
  /** Typical annual fund cost (expense ratio) in percent. 0 for deposits. */
  defaultCost: number;
  note: string;
  source: string;
}

export const RATES_AS_OF = '2026-10-15';

export const REFERENCE_RATES: ReferenceRate[] = [
  {
    id: 'fd',
    label: 'Bank FD',
    rate: 6.8,
    kind: 'rate',
    tax: 'slab',
    defaultCost: 0,
    note: '1-year deposit at a large public-sector bank, general citizens.',
    source: 'SBI retail term-deposit card rate, as reported 14 Oct 2026. Verify on the bank’s site.',
  },
  {
    id: 'ppf',
    label: 'PPF',
    rate: 7.1,
    kind: 'rate',
    tax: 'exempt',
    defaultCost: 0,
    note: 'Government-backed, 15-year lock-in, interest is tax-free.',
    source: 'Ministry of Finance small-savings rates for Oct–Dec 2026 (unchanged from previous quarter).',
  },
  {
    id: 'debt',
    label: 'Debt fund',
    rate: 7,
    kind: 'assumption',
    tax: 'debt',
    defaultCost: 0.5,
    note: 'Planning assumption for short-to-medium duration debt funds. Not guaranteed.',
    source: 'MoneyGroww planning assumption, roughly in line with prevailing deposit rates.',
  },
  {
    id: 'equity',
    label: 'Equity fund (long term)',
    rate: 11,
    kind: 'assumption',
    tax: 'equity',
    defaultCost: 1,
    note: 'Planning assumption for a diversified equity fund held 7+ years. It can fall sharply in any single year.',
    source: 'MoneyGroww planning assumption. Long-run Indian equity returns have been around 10–13% a year, with large swings.',
  },
];

/** General inflation used for "today's money" views. */
export const DEFAULT_INFLATION = 6;
/** Education costs have historically risen faster than general prices. */
export const EDUCATION_INFLATION = 10;

/**
 * Capital-gains rules for equity-oriented mutual funds, FY 2026-27.
 * Unchanged by Union Budget 2026; same as the July 2024 overhaul.
 */
export const TAX_RULES = {
  asOf: 'FY 2026-27',
  source: 'Income-tax rules for equity-oriented funds as amended July 2024; not changed by Budget 2026.',
  /** Units held for more than this many months are long-term. */
  equityLongTermMonths: 12,
  equityLtcgRate: 0.125,
  /** Long-term equity gains up to this amount in a financial year are tax-free. */
  equityLtcgExemption: 125000,
  equityStcgRate: 0.2,
  /** Health & education cess, charged on the tax itself. */
  cess: 0.04,
  /** Default slab rate used for FD interest and debt-fund gains (editable in the UI). */
  defaultSlabRate: 0.2,
  slabRates: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3],
} as const;

/**
 * Indicative return ranges by equity-fund category (for sanity-checking an
 * assumption, not a forecast). Long-run ranges over full market cycles.
 */
export const CATEGORY_RANGES = [
  { type: 'Large cap', rate: '10–13%', description: 'Established, large companies. Smaller swings.' },
  { type: 'Flexi cap', rate: '11–14%', description: 'Mix of company sizes, chosen by the manager.' },
  { type: 'Mid cap', rate: '12–15%', description: 'Faster growth, bigger falls in bad years.' },
  { type: 'Small cap', rate: '12–16%', description: 'Highest swings. Can lose a third or more in a year.' },
];
