import { describe, it, expect } from 'vitest';
import {
  calculateSIP,
  calculateMF,
  calculateEMI,
  clampNumber,
  safePercent,
  generateSIPChartData,
  generateEMIChartData,
} from './finance';

describe('clampNumber', () => {
  it('clamps values within range', () => {
    expect(clampNumber(50, 0, 100)).toBe(50);
    expect(clampNumber(150, 0, 100)).toBe(100);
    expect(clampNumber(-10, 0, 100)).toBe(0);
  });

  it('falls back on NaN/empty input instead of propagating garbage', () => {
    expect(clampNumber('', 500, 100000)).toBe(500);
    expect(clampNumber('abc', 500, 100000)).toBe(500);
    expect(clampNumber(NaN, 1, 30, 12)).toBe(12);
  });

  it('parses numeric strings', () => {
    expect(clampNumber('42', 0, 100)).toBe(42);
  });
});

describe('safePercent', () => {
  it('returns 0 instead of NaN when dividing by zero', () => {
    expect(safePercent(10, 0)).toBe(0);
  });

  it('computes a normal percentage', () => {
    expect(safePercent(25, 100)).toBe(25);
  });
});

describe('calculateSIP', () => {
  it('matches the known closed-form annuity-due result', () => {
    const result = calculateSIP({ monthlyInvestment: 5000, returnRate: 12, duration: 10 });
    // Total invested is deterministic: 5000 * 120 months
    expect(result.totalInvested).toBe(600000);
    // Future value should exceed total invested when return > 0
    expect(result.finalAmount).toBeGreaterThan(result.totalInvested);
    expect(result.gains).toBe(result.finalAmount - result.totalInvested);
  });

  it('handles 0% return without dividing by zero', () => {
    const result = calculateSIP({ monthlyInvestment: 1000, returnRate: 0, duration: 5 });
    expect(result.finalAmount).toBe(60000);
    expect(result.gains).toBe(0);
  });

  it('handles a single-year duration', () => {
    const result = calculateSIP({ monthlyInvestment: 1000, returnRate: 10, duration: 1 });
    expect(result.totalInvested).toBe(12000);
    expect(result.finalAmount).toBeGreaterThan(12000);
  });
});

describe('calculateMF', () => {
  it('compounds a lumpsum correctly', () => {
    const result = calculateMF({ lumpsumAmount: 100000, growthRate: 10, time: 1 });
    expect(result.finalAmount).toBe(110000);
    expect(result.gains).toBe(10000);
  });

  it('handles 0% growth', () => {
    const result = calculateMF({ lumpsumAmount: 100000, growthRate: 0, time: 5 });
    expect(result.finalAmount).toBe(100000);
    expect(result.gains).toBe(0);
  });
});

describe('calculateEMI', () => {
  it('computes a sane EMI for a standard home-loan-shaped input', () => {
    const result = calculateEMI({ loanAmount: 1000000, interestRate: 9, tenure: 20 });
    expect(result.emi).toBeGreaterThan(0);
    expect(result.totalAmount).toBeGreaterThan(1000000);
    expect(result.totalInterest).toBe(result.totalAmount - 1000000);
  });

  it('handles 0% interest without dividing by zero', () => {
    const result = calculateEMI({ loanAmount: 120000, interestRate: 0, tenure: 10 });
    expect(result.emi).toBe(1000); // 120000 / 120 months
    expect(result.totalInterest).toBe(0);
  });

  it('total amount is consistent with the (unrounded) EMI times months', () => {
    const input = { loanAmount: 500000, interestRate: 8.5, tenure: 15 };
    const result = calculateEMI(input);
    // totalAmount is computed from the unrounded EMI before Math.round is applied
    // to `emi`, so allow for the small rounding delta rather than exact equality.
    expect(Math.abs(result.totalAmount - result.emi * input.tenure * 12)).toBeLessThan(input.tenure * 12);
  });
});

describe('chart data generators', () => {
  it('produces one SIP data point per year', () => {
    const data = generateSIPChartData({ monthlyInvestment: 5000, returnRate: 12, duration: 5 });
    expect(data).toHaveLength(5);
    expect(data[4].year).toBe('Year 5');
  });

  it('caps EMI amortization chart data at 10 years even for longer tenures', () => {
    const data = generateEMIChartData({ loanAmount: 1000000, interestRate: 9, tenure: 25 });
    expect(data).toHaveLength(10);
  });
});

/* ------------------------------------------------------------------------ */
/*  Golden vectors: figures cross-checked against widely used public        */
/*  calculators (same r/12 monthly convention, contributions at month start) */
/* ------------------------------------------------------------------------ */

import {
  toTodaysMoney,
  inflateCost,
  netAnnualReturn,
  growContributions,
  redemptionTax,
  honestProjection,
  projectionRange,
  planGoal,
  simulatePrepayment,
  simulateSWP,
} from './finance';

describe('golden vectors', () => {
  it('SIP ₹5,000 × 10 yrs @ 12% = ₹11,61,695', () => {
    expect(calculateSIP({ monthlyInvestment: 5000, returnRate: 12, duration: 10 }).finalAmount).toBe(1161695);
  });
  it('EMI on ₹10 lakh @ 9% for 20 yrs = ₹8,997', () => {
    expect(calculateEMI({ loanAmount: 1000000, interestRate: 9, tenure: 20 }).emi).toBe(8997);
  });
  it('lumpsum ₹1 lakh @ 10% for 10 yrs = ₹2,59,374', () => {
    expect(calculateMF({ lumpsumAmount: 100000, growthRate: 10, time: 10 }).finalAmount).toBe(259374);
  });
});

describe('inflation helpers', () => {
  it('round-trips between future and today’s money', () => {
    const future = inflateCost(100000, 6, 10);
    expect(Math.round(future)).toBe(179085);
    expect(Math.round(toTodaysMoney(future, 6, 10))).toBe(100000);
  });
});

describe('netAnnualReturn', () => {
  it('subtracts the expense ratio', () => {
    expect(netAnnualReturn(12, 1)).toBe(11);
  });
  it('applies slab tax plus cess every year for FDs', () => {
    // 7% taxed at 20% + 4% cess = 7 × (1 − 0.208)
    expect(netAnnualReturn(7, 0, 'slab', 0.2)).toBeCloseTo(5.544, 6);
  });
});

describe('growContributions', () => {
  it('matches calculateSIP when there is no step-up', () => {
    const g = growContributions({ monthly: 5000, years: 10 }, 12);
    expect(Math.round(g.finalValue)).toBe(1161695);
    expect(g.invested).toBe(600000);
  });
  it('step-up invests more and ends higher', () => {
    const flat = growContributions({ monthly: 5000, years: 10 }, 12);
    const step = growContributions({ monthly: 5000, stepUpPct: 10, years: 10 }, 12);
    expect(step.invested).toBeGreaterThan(flat.invested);
    expect(step.finalValue).toBeGreaterThan(flat.finalValue);
    // Year-2 instalments are 10% larger: 12 × 5000 + 12 × 5500 after two years
    expect(Math.round(step.yearly[1].invested)).toBe(126000);
  });
  it('splits gains into long- and short-term that add up', () => {
    const g = growContributions({ monthly: 5000, years: 3 }, 12);
    expect(g.longTermGains + g.shortTermGains).toBeCloseTo(g.gains, 4);
    expect(g.shortTermGains).toBeGreaterThan(0);
  });
  it('includes an initial lumpsum', () => {
    const g = growContributions({ monthly: 0, initial: 100000, years: 10 }, 12);
    expect(Math.round(g.finalValue)).toBe(Math.round(100000 * Math.pow(1.01, 120)));
  });
});

describe('redemptionTax', () => {
  it('charges nothing on long-term equity gains under ₹1.25 lakh', () => {
    expect(redemptionTax({ longTermGains: 120000, shortTermGains: 0, gains: 120000 }, 'equity')).toBe(0);
  });
  it('charges 12.5% + cess above the exemption and 20% + cess on short-term', () => {
    const tax = redemptionTax({ longTermGains: 225000, shortTermGains: 10000, gains: 235000 }, 'equity');
    expect(tax).toBeCloseTo((100000 * 0.125 + 10000 * 0.2) * 1.04, 6);
  });
  it('taxes debt-fund gains at slab rate', () => {
    expect(redemptionTax({ longTermGains: 0, shortTermGains: 0, gains: 50000 }, 'debt', 0.3)).toBeCloseTo(15600, 6);
  });
  it('charges nothing for tax-free instruments', () => {
    expect(redemptionTax({ longTermGains: 9e6, shortTermGains: 0, gains: 9e6 }, 'exempt')).toBe(0);
  });
});

describe('honestProjection', () => {
  const base = {
    monthly: 5000,
    years: 10,
    returnPct: 12,
    costPct: 1,
    inflationPct: 6,
    tax: 'equity' as const,
  };

  it('walks from headline to today’s money in the right order', () => {
    const r = honestProjection(base);
    expect(r.headlineValue).toBe(1161695);
    expect(r.costDrag).toBeGreaterThan(0);
    expect(r.inHand).toBe(r.headlineValue - r.costDrag - r.tax);
    expect(r.todaysMoney).toBeLessThan(r.inHand);
    expect(r.bottomLine).toBe(r.todaysMoney);
  });

  it('the hero example is worth about ₹5.9–6.0 lakh in today’s money', () => {
    const r = honestProjection(base);
    expect(r.todaysMoney).toBeGreaterThan(580000);
    expect(r.todaysMoney).toBeLessThan(605000);
  });

  it('with every toggle off it equals the plain SIP figure', () => {
    const r = honestProjection({ ...base, includeCosts: false, includeTax: false, includeInflation: false });
    expect(r.bottomLine).toBe(1161695);
    expect(r.tax).toBe(0);
    expect(r.costDrag).toBe(0);
  });

  it('PPF is tax-free and has no cost', () => {
    const r = honestProjection({ ...base, returnPct: 7.1, costPct: 0, tax: 'exempt', includeInflation: false });
    expect(r.tax).toBe(0);
    expect(r.inHand).toBe(r.headlineValue);
  });

  it('range brackets the central estimate', () => {
    const central = honestProjection(base).bottomLine;
    const range = projectionRange(base, 3);
    expect(range.low).toBeLessThan(central);
    expect(range.high).toBeGreaterThan(central);
  });
});

describe('planGoal', () => {
  const goal = {
    costToday: 1000000,
    years: 15,
    goalInflationPct: 10,
    alreadySaved: 0,
    returnPct: 11,
    costPct: 1,
    tax: 'equity' as const,
    stepUpPct: 10,
  };

  it('the monthly amount it suggests actually reaches the goal after tax', () => {
    const plan = planGoal(goal);
    expect(plan.targetFuture).toBe(Math.round(1000000 * Math.pow(1.1, 15)));
    const check = honestProjection({
      monthly: plan.monthlyNeeded,
      stepUpPct: goal.stepUpPct,
      years: goal.years,
      returnPct: goal.returnPct,
      costPct: goal.costPct,
      inflationPct: 0,
      tax: goal.tax,
      includeInflation: false,
    });
    expect(check.inHand).toBeGreaterThanOrEqual(plan.targetFuture - 1);
    const under = honestProjection({
      monthly: plan.monthlyNeeded * 0.97,
      stepUpPct: goal.stepUpPct,
      years: goal.years,
      returnPct: goal.returnPct,
      costPct: goal.costPct,
      inflationPct: 0,
      tax: goal.tax,
      includeInflation: false,
    });
    expect(under.inHand).toBeLessThan(plan.targetFuture);
  });

  it('a step-up lowers the starting amount', () => {
    const plan = planGoal(goal);
    expect(plan.monthlyNeeded).toBeLessThan(plan.monthlyNeededFlat);
  });

  it('needs nothing more when savings already cover the goal', () => {
    const plan = planGoal({ ...goal, alreadySaved: 10000000 });
    expect(plan.monthlyNeeded).toBe(0);
  });
});

describe('simulatePrepayment', () => {
  const loan = { loanAmount: 3000000, interestRate: 8.5, tenure: 20 };

  it('with no prepayment the schedule matches the plain EMI', () => {
    const r = simulatePrepayment({ ...loan, extraMonthly: 0, lumpSum: 0, lumpSumYear: 1 });
    expect(r.newMonths).toBe(240);
    expect(r.interestSaved).toBeLessThanOrEqual(1);
    expect(Math.abs(r.newInterest - r.baseInterest)).toBeLessThanOrEqual(1);
  });

  it('paying extra each month cuts tenure and interest', () => {
    const r = simulatePrepayment({ ...loan, extraMonthly: 5000, lumpSum: 0, lumpSumYear: 1 });
    expect(r.newMonths).toBeLessThan(240);
    expect(r.interestSaved).toBeGreaterThan(0);
  });

  it('an early lump sum saves more than the same lump sum late', () => {
    const early = simulatePrepayment({ ...loan, extraMonthly: 0, lumpSum: 500000, lumpSumYear: 2 });
    const late = simulatePrepayment({ ...loan, extraMonthly: 0, lumpSum: 500000, lumpSumYear: 15 });
    expect(early.interestSaved).toBeGreaterThan(late.interestSaved);
  });
});

describe('simulateSWP', () => {
  it('a small withdrawal lasts the whole horizon', () => {
    const r = simulateSWP({ corpus: 5000000, monthlyWithdrawal: 15000, returnPct: 8, increasePct: 0, years: 20 });
    expect(r.ranOut).toBe(false);
    expect(r.monthsLasted).toBe(240);
    expect(r.balanceAtEnd).toBeGreaterThan(0);
  });

  it('a large withdrawal runs out and says when', () => {
    const r = simulateSWP({ corpus: 1000000, monthlyWithdrawal: 20000, returnPct: 6, increasePct: 6, years: 20 });
    expect(r.ranOut).toBe(true);
    expect(r.monthsLasted).toBeLessThan(240);
    expect(r.balanceAtEnd).toBe(0);
    expect(r.yearly).toHaveLength(20);
  });

  it('with 0% return the money lasts exactly corpus ÷ withdrawal months', () => {
    const r = simulateSWP({ corpus: 120000, monthlyWithdrawal: 10000, returnPct: 0, increasePct: 0, years: 5 });
    expect(r.monthsLasted).toBe(12);
  });
});
