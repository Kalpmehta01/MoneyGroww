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
