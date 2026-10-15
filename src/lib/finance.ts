import { TAX_RULES } from '../data/reference-rates';

/**
 * Pure, unit-testable financial calculation helpers.
 *
 * Extracted out of components/calculators.tsx so the math can be tested in
 * isolation from React/UI concerns, and reused anywhere else (e.g. a future
 * backend, saved-scenario emails, etc.) without dragging in JSX.
 */

export interface SipInput {
  monthlyInvestment: number;
  returnRate: number; // annual %, e.g. 12 for 12%
  duration: number; // years
}

export interface SipResult {
  finalAmount: number;
  totalInvested: number;
  gains: number;
}

export interface MfInput {
  lumpsumAmount: number;
  growthRate: number; // annual %
  time: number; // years
}

export interface MfResult {
  finalAmount: number;
  gains: number;
}

export interface EmiInput {
  loanAmount: number;
  interestRate: number; // annual % p.a.
  tenure: number; // years
}

export interface EmiResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
}

/**
 * Clamp a numeric value into [min, max], falling back to `fallback`
 * (defaults to `min`) for NaN/undefined/empty input. Used to guard every
 * calculator input against blank fields, pasted text, or out-of-range
 * numbers silently producing NaN/garbage results.
 */
export function clampNumber(
  value: number | string,
  min: number,
  max: number,
  fallback: number = min
): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

/**
 * Safe percentage helper: returns 0 instead of NaN/Infinity when the
 * denominator is 0 (e.g. a still-loading or zeroed-out result).
 */
export function safePercent(part: number, whole: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) {
    return 0;
  }
  return (part / whole) * 100;
}

export function calculateSIP(input: SipInput): SipResult {
  const { monthlyInvestment, returnRate, duration } = input;
  const monthlyRate = returnRate / 100 / 12;
  const months = duration * 12;

  const futureValue =
    monthlyRate === 0
      ? monthlyInvestment * months
      : monthlyInvestment *
        (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

  const totalInvested = monthlyInvestment * months;
  const gains = futureValue - totalInvested;

  return {
    finalAmount: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    gains: Math.round(gains),
  };
}

export function calculateMF(input: MfInput): MfResult {
  const { lumpsumAmount, growthRate, time } = input;
  const finalAmount = lumpsumAmount * Math.pow(1 + growthRate / 100, time);
  const gains = finalAmount - lumpsumAmount;

  return {
    finalAmount: Math.round(finalAmount),
    gains: Math.round(gains),
  };
}

export function calculateEMI(input: EmiInput): EmiResult {
  const { loanAmount, interestRate, tenure } = input;
  const principal = loanAmount;
  const monthlyRate = interestRate / 100 / 12;
  const months = tenure * 12;

  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;

  return {
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
  };
}

export function generateSIPChartData(input: SipInput) {
  const data: { year: string; invested: number; value: number }[] = [];
  const monthlyRate = input.returnRate / 100 / 12;

  for (let year = 1; year <= input.duration; year++) {
    const totalInvested = input.monthlyInvestment * year * 12;
    const months = year * 12;
    const currentValue =
      monthlyRate === 0
        ? totalInvested
        : input.monthlyInvestment *
          (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

    data.push({
      year: `Year ${year}`,
      invested: Math.round(totalInvested),
      value: Math.round(currentValue),
    });
  }
  return data;
}

export function generateMFChartData(input: MfInput) {
  const data: { year: string; value: number }[] = [];
  for (let year = 1; year <= input.time; year++) {
    const value = input.lumpsumAmount * Math.pow(1 + input.growthRate / 100, year);
    data.push({ year: `Year ${year}`, value: Math.round(value) });
  }
  return data;
}

export function generateEMIChartData(input: EmiInput) {
  const { emi } = calculateEMI(input);
  const data: { year: string; principal: number; interest: number }[] = [];
  const monthlyRate = input.interestRate / 100 / 12;
  let balance = input.loanAmount;

  for (let year = 1; year <= Math.min(input.tenure, 10); year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;
      balance -= principalPayment;
    }

    data.push({
      year: `Year ${year}`,
      principal: Math.round(yearlyPrincipal),
      interest: Math.round(yearlyInterest),
    });
  }
  return data;
}

/* ========================================================================== */
/*  Honest projections: costs, tax, inflation, step-ups, goals, SWP, prepay   */
/* ========================================================================== */


export type TaxTreatment = 'equity' | 'debt' | 'slab' | 'exempt' | 'none';

/** Value of a future amount in today's rupees. */
export function toTodaysMoney(amount: number, inflationPct: number, years: number): number {
  if (!Number.isFinite(amount)) return 0;
  return amount / Math.pow(1 + inflationPct / 100, Math.max(0, years));
}

/** What something costing `todayCost` now will cost after `years` of inflation. */
export function inflateCost(todayCost: number, inflationPct: number, years: number): number {
  return todayCost * Math.pow(1 + inflationPct / 100, Math.max(0, years));
}

/**
 * Annual return after the fund's yearly cost (expense ratio), and after
 * yearly slab tax for instruments taxed every year (bank FD interest).
 */
export function netAnnualReturn(
  grossPct: number,
  costPct: number,
  tax: TaxTreatment = 'none',
  slabRate: number = TAX_RULES.defaultSlabRate
): number {
  const afterCost = grossPct - Math.max(0, costPct);
  if (tax === 'slab' && afterCost > 0) {
    return afterCost * (1 - slabRate * (1 + TAX_RULES.cess));
  }
  return afterCost;
}

export interface ContributionSchedule {
  /** First-year monthly contribution. */
  monthly: number;
  /** Yearly increase of the monthly contribution, in percent. */
  stepUpPct?: number;
  /** One-time amount invested at the start. */
  initial?: number;
  years: number;
}

export interface GrowthResult {
  finalValue: number;
  invested: number;
  gains: number;
  /** Gains on money held more than 12 months (long-term for equity funds). */
  longTermGains: number;
  /** Gains on money held 12 months or less. */
  shortTermGains: number;
  yearly: { year: number; invested: number; value: number }[];
}

/**
 * Month-by-month growth with contributions at the START of each month
 * (annuity-due, the same convention as calculateSIP). Each instalment is
 * tracked separately so its holding period, and therefore its tax
 * treatment, is known exactly at redemption.
 */
export function growContributions(schedule: ContributionSchedule, annualReturnPct: number): GrowthResult {
  const years = Math.max(0, Math.round(schedule.years));
  const months = years * 12;
  const i = annualReturnPct / 100 / 12;
  const step = (schedule.stepUpPct ?? 0) / 100;
  const initial = Math.max(0, schedule.initial ?? 0);

  let value = initial;
  let invested = initial;
  const yearly: GrowthResult['yearly'] = [];

  for (let m = 1; m <= months; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const contribution = schedule.monthly * Math.pow(1 + step, yearIndex);
    value = (value + contribution) * (1 + i);
    invested += contribution;
    if (m % 12 === 0) yearly.push({ year: m / 12, invested, value });
  }

  // Split gains by holding period. Instalment k (1-indexed) is held for
  // months - k + 1 months at the end of the final month.
  let shortTermGains = 0;
  let longTermGains = 0;
  const longTermMonths = TAX_RULES.equityLongTermMonths;
  for (let k = 1; k <= months; k++) {
    const yearIndex = Math.floor((k - 1) / 12);
    const contribution = schedule.monthly * Math.pow(1 + step, yearIndex);
    const held = months - k + 1;
    const gain = contribution * (Math.pow(1 + i, held) - 1);
    if (held > longTermMonths) longTermGains += gain;
    else shortTermGains += gain;
  }
  if (initial > 0) {
    const gain = initial * (Math.pow(1 + i, months) - 1);
    if (months > longTermMonths) longTermGains += gain;
    else shortTermGains += gain;
  }

  return { finalValue: value, invested, gains: value - invested, longTermGains, shortTermGains, yearly };
}

/**
 * Tax payable if the whole amount is redeemed at the end, in one financial
 * year. Includes 4% cess; ignores surcharge and loss set-off.
 */
export function redemptionTax(
  growth: Pick<GrowthResult, 'longTermGains' | 'shortTermGains' | 'gains'>,
  tax: TaxTreatment,
  slabRate: number = TAX_RULES.defaultSlabRate
): number {
  const cess = 1 + TAX_RULES.cess;
  if (tax === 'equity') {
    const ltcg = Math.max(0, growth.longTermGains - TAX_RULES.equityLtcgExemption) * TAX_RULES.equityLtcgRate;
    const stcg = Math.max(0, growth.shortTermGains) * TAX_RULES.equityStcgRate;
    return (ltcg + stcg) * cess;
  }
  if (tax === 'debt') {
    // Debt-fund gains on units bought after 1 April 2023 are taxed at slab rate.
    return Math.max(0, growth.gains) * slabRate * cess;
  }
  // 'slab' is already taxed year by year via netAnnualReturn; 'exempt'/'none' pay nothing.
  return 0;
}

export interface HonestInput extends ContributionSchedule {
  /** Gross expected annual return, %. */
  returnPct: number;
  /** Annual fund cost (expense ratio), %. Ignored when includeCosts is false. */
  costPct: number;
  inflationPct: number;
  tax: TaxTreatment;
  slabRate?: number;
  includeCosts?: boolean;
  includeTax?: boolean;
  includeInflation?: boolean;
}

export interface HonestResult {
  invested: number;
  /** What the usual calculator shows: gross return, no costs, no tax. */
  headlineValue: number;
  /** Lost to fund costs over the period. */
  costDrag: number;
  /** Tax paid on redemption (or yearly, for FDs). */
  tax: number;
  /** In your hand after costs and tax, in future rupees. */
  inHand: number;
  /** inHand expressed in today's rupees. */
  todaysMoney: number;
  /** The figure to show first, given the toggles. */
  bottomLine: number;
  yearly: { year: number; invested: number; value: number; real: number }[];
}

/**
 * The full chain from the flattering headline number to what the money is
 * really worth: gross → minus fund costs → minus tax → in today's rupees.
 */
export function honestProjection(input: HonestInput): HonestResult {
  const includeCosts = input.includeCosts ?? true;
  const includeTax = input.includeTax ?? true;
  const includeInflation = input.includeInflation ?? true;
  const slab = input.slabRate ?? TAX_RULES.defaultSlabRate;
  const schedule: ContributionSchedule = {
    monthly: input.monthly,
    stepUpPct: input.stepUpPct,
    initial: input.initial,
    years: input.years,
  };

  const gross = growContributions(schedule, input.returnPct);
  const costPct = includeCosts ? input.costPct : 0;
  const afterCostsRate = netAnnualReturn(input.returnPct, costPct, 'none');
  const afterCosts = growContributions(schedule, afterCostsRate);

  let inHand: number;
  let tax: number;
  let valueSeries: GrowthResult;
  if (includeTax && input.tax === 'slab') {
    // Interest taxed every year compounds at a lower rate.
    valueSeries = growContributions(schedule, netAnnualReturn(input.returnPct, costPct, 'slab', slab));
    inHand = valueSeries.finalValue;
    tax = afterCosts.finalValue - inHand;
  } else {
    valueSeries = afterCosts;
    tax = includeTax ? redemptionTax(afterCosts, input.tax, slab) : 0;
    inHand = afterCosts.finalValue - tax;
  }

  const todaysMoney = toTodaysMoney(inHand, input.inflationPct, input.years);
  const yearly = valueSeries.yearly.map((row) => ({
    year: row.year,
    invested: Math.round(row.invested),
    value: Math.round(row.value),
    real: Math.round(toTodaysMoney(row.value, input.inflationPct, row.year)),
  }));

  return {
    invested: Math.round(gross.invested),
    headlineValue: Math.round(gross.finalValue),
    costDrag: Math.round(gross.finalValue - afterCosts.finalValue),
    tax: Math.round(Math.max(0, tax)),
    inHand: Math.round(inHand),
    todaysMoney: Math.round(todaysMoney),
    bottomLine: Math.round(includeInflation ? todaysMoney : inHand),
    yearly,
  };
}

/**
 * Same projection at the assumed return ± `spreadPct` points, so a single
 * fixed rate is never presented as the only possible outcome.
 */
export function projectionRange(input: HonestInput, spreadPct = 3) {
  const low = honestProjection({ ...input, returnPct: Math.max(0, input.returnPct - spreadPct) });
  const high = honestProjection({ ...input, returnPct: input.returnPct + spreadPct });
  return { low: low.bottomLine, high: high.bottomLine, lowRate: Math.max(0, input.returnPct - spreadPct), highRate: input.returnPct + spreadPct };
}

/* ------------------------------------------------------------ goal planner */

export interface GoalInput {
  /** What the goal costs in today's rupees. */
  costToday: number;
  years: number;
  /** How fast this goal's cost rises each year, %. */
  goalInflationPct: number;
  /** Already saved towards this goal; keeps growing at the same return. */
  alreadySaved: number;
  returnPct: number;
  costPct: number;
  tax: TaxTreatment;
  stepUpPct: number;
  slabRate?: number;
  /** General inflation, used only for the today's-money view of results. */
  inflationPct?: number;
}

export interface GoalResult {
  /** Rupees needed on the goal date. */
  targetFuture: number;
  /** What already-saved money will grow to (after costs and tax). */
  savedGrowsTo: number;
  /** First-year monthly SIP needed (after costs and tax). 0 if already covered. */
  monthlyNeeded: number;
  /** Monthly SIP needed with no yearly step-up, for comparison. */
  monthlyNeededFlat: number;
  totalInvested: number;
}

function solveMonthly(input: GoalInput, stepUpPct: number, target: number): number {
  const valueFor = (monthly: number) =>
    honestProjection({
      monthly,
      stepUpPct,
      initial: input.alreadySaved,
      years: input.years,
      returnPct: input.returnPct,
      costPct: input.costPct,
      inflationPct: input.inflationPct ?? 0,
      tax: input.tax,
      slabRate: input.slabRate,
      includeInflation: false,
    }).inHand;

  if (valueFor(0) >= target) return 0;
  let lo = 0;
  let hi = Math.max(1000, target / Math.max(1, input.years * 12));
  while (valueFor(hi) < target && hi < 1e9) hi *= 2;
  for (let n = 0; n < 60; n++) {
    const mid = (lo + hi) / 2;
    if (valueFor(mid) >= target) hi = mid;
    else lo = mid;
  }
  return hi;
}

/**
 * Reverse of the SIP calculation: how much to invest each month to have
 * the goal's future cost IN HAND (after fund costs and tax) on the date.
 */
export function planGoal(input: GoalInput): GoalResult {
  const years = Math.max(1, Math.round(input.years));
  const normalized = { ...input, years };
  const targetFuture = inflateCost(input.costToday, input.goalInflationPct, years);
  const savedGrowsTo = honestProjection({
    monthly: 0,
    initial: input.alreadySaved,
    years,
    returnPct: input.returnPct,
    costPct: input.costPct,
    inflationPct: 0,
    tax: input.tax,
    slabRate: input.slabRate,
    includeInflation: false,
  }).inHand;

  const monthlyNeeded = solveMonthly(normalized, input.stepUpPct, targetFuture);
  const monthlyNeededFlat = solveMonthly(normalized, 0, targetFuture);
  const totalInvested = growContributions({ monthly: monthlyNeeded, stepUpPct: input.stepUpPct, years }, 0).invested;

  return {
    targetFuture: Math.round(targetFuture),
    savedGrowsTo: Math.round(savedGrowsTo),
    monthlyNeeded: Math.ceil(monthlyNeeded),
    monthlyNeededFlat: Math.ceil(monthlyNeededFlat),
    totalInvested: Math.round(totalInvested),
  };
}

/* ------------------------------------------------------ loan prepayment */

export interface PrepaymentInput extends EmiInput {
  /** Extra amount paid every month on top of the EMI. */
  extraMonthly: number;
  /** One-time part-prepayment. */
  lumpSum: number;
  /** Year (1-based) in which the one-time prepayment is made, at the start of that year. */
  lumpSumYear: number;
}

export interface PrepaymentResult {
  emi: number;
  baseMonths: number;
  baseInterest: number;
  newMonths: number;
  newInterest: number;
  interestSaved: number;
  monthsSaved: number;
}

/**
 * Prepayment that keeps the EMI unchanged and shortens the tenure (what most
 * Indian lenders do by default for floating-rate home loans).
 */
export function simulatePrepayment(input: PrepaymentInput): PrepaymentResult {
  const { emi } = calculateEMI(input);
  const exactEmi = (() => {
    const r = input.interestRate / 100 / 12;
    const n = input.tenure * 12;
    return r === 0 ? input.loanAmount / n : (input.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();
  const r = input.interestRate / 100 / 12;
  const baseMonths = input.tenure * 12;
  const baseInterest = exactEmi * baseMonths - input.loanAmount;

  let balance = input.loanAmount;
  let interestPaid = 0;
  let month = 0;
  const lumpMonth = Math.max(1, Math.round(input.lumpSumYear - 1) * 12 + 1);
  while (balance > 0.5 && month < baseMonths) {
    month++;
    if (input.lumpSum > 0 && month === lumpMonth) balance = Math.max(0, balance - input.lumpSum);
    if (balance <= 0.5) break;
    const interest = balance * r;
    interestPaid += interest;
    const principal = Math.min(balance, exactEmi - interest + Math.max(0, input.extraMonthly));
    balance -= principal;
  }

  return {
    emi,
    baseMonths,
    baseInterest: Math.round(baseInterest),
    newMonths: month,
    newInterest: Math.round(interestPaid),
    interestSaved: Math.round(Math.max(0, baseInterest - interestPaid)),
    monthsSaved: Math.max(0, baseMonths - month),
  };
}

/* ---------------------------------------------- systematic withdrawal */

export interface SwpInput {
  corpus: number;
  /** First-year monthly withdrawal. */
  monthlyWithdrawal: number;
  returnPct: number;
  /** Yearly increase in the withdrawal, to keep up with prices, %. */
  increasePct: number;
  years: number;
}

export interface SwpResult {
  /** Months the money lasts within the horizon (equals years*12 if it never runs out). */
  monthsLasted: number;
  ranOut: boolean;
  totalWithdrawn: number;
  balanceAtEnd: number;
  yearly: { year: number; balance: number; withdrawn: number }[];
}

/** Monthly withdrawals at the start of each month; the rest keeps earning. */
export function simulateSWP(input: SwpInput): SwpResult {
  const months = Math.max(1, Math.round(input.years)) * 12;
  const i = input.returnPct / 100 / 12;
  const g = input.increasePct / 100;
  let balance = input.corpus;
  let withdrawn = 0;
  let monthsLasted = 0;
  let ranOut = false;
  const yearly: SwpResult['yearly'] = [];

  for (let m = 1; m <= months; m++) {
    const want = input.monthlyWithdrawal * Math.pow(1 + g, Math.floor((m - 1) / 12));
    const take = Math.min(want, balance);
    balance -= take;
    withdrawn += take;
    if (take < want - 0.5) {
      ranOut = true;
    } else {
      monthsLasted = m;
    }
    balance *= 1 + i;
    if (ranOut) break;
    if (m % 12 === 0) yearly.push({ year: m / 12, balance: Math.round(balance), withdrawn: Math.round(withdrawn) });
  }
  if (ranOut) {
    // Keep one row per year so charts span the whole horizon.
    for (let y = yearly.length + 1; y <= months / 12; y++) {
      yearly.push({ year: y, balance: 0, withdrawn: Math.round(withdrawn) });
    }
  }

  return {
    monthsLasted,
    ranOut,
    totalWithdrawn: Math.round(withdrawn),
    balanceAtEnd: Math.round(Math.max(0, balance)),
    yearly,
  };
}
