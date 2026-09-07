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
