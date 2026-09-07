<<<<<<< HEAD
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  calculateSIP,
  calculateMF,
  calculateEMI,
  clampNumber,
  safePercent,
  generateSIPChartData,
  generateMFChartData,
  generateEMIChartData,
} from '../lib/finance';

// Illustrative category benchmarks only — NOT tied to any specific platform
// or fund. Historical mutual fund category averages vary by data provider
// and time period; verify current figures with AMFI/a licensed data source
// before presenting these as real numbers to end users.
const CATEGORY_BENCHMARKS = [
  { type: 'Large Cap', rate: '10–13%', description: 'Established, blue-chip companies' },
  { type: 'Flexi Cap', rate: '11–15%', description: 'Invests across market caps' },
  { type: 'Mid Cap', rate: '13–17%', description: 'Higher growth, higher volatility' },
  { type: 'Small Cap', rate: '14–20%', description: 'Highest growth potential and risk' },
];

const inr = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const compactInr = (value: number) => {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
};

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                             */
/* -------------------------------------------------------------------------- */

interface FieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  /** Formats the stated range as currency rather than a bare number. */
  money?: boolean;
  onChange: (value: string | number) => void;
}

function Field({ id, label, value, min, max, step, suffix, money, onChange }: FieldProps) {
  const fmt = (n: number) => (money ? inr(n) : `${n}${suffix ?? ''}`);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id} className="text-sm text-ink-2">
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            className="h-9 w-32 text-right font-medium tabular"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            step={step}
            aria-describedby={`${id}-range`}
          />
          {suffix && <span className="w-4 text-sm text-ink-3">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(val) => onChange(val[0])}
        aria-label={label}
      />
      {/* The valid range is stated up front, not only after an invalid entry. */}
      <p id={`${id}-range`} className="text-[0.75rem] text-ink-3 tabular">
        {fmt(min)} – {fmt(max)}
      </p>
    </div>
  );
}

// Tailwind can only see class names that appear literally in the source, so
// these are looked up rather than built with string interpolation.
const SWATCH_BG = {
  'series-1': 'bg-series-1',
  'series-2': 'bg-series-2',
} as const;

interface ResultProps {
  headlineLabel: string;
  headlineValue: number;
  parts: {
    label: string;
    value: number;
    share: number;
    swatch: keyof typeof SWATCH_BG;
  }[];
  footnote: string;
}

function ResultPanel({ headlineLabel, headlineValue, parts, footnote }: ResultProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
      <span className="t-label">{headlineLabel}</span>
      <div className="t-figure mt-2 text-[2.5rem] text-ink">{inr(headlineValue)}</div>

      {/* Composition. A 2px gap separates the segments so the split is visible
          without relying on the hue difference alone. */}
      <div className="mt-6 flex h-2.5 gap-[2px] overflow-hidden rounded-full">
        {parts.map((part, i) => (
          <div
            key={part.label}
            className={`${SWATCH_BG[part.swatch]} ${i === 0 ? 'rounded-l-full' : 'rounded-r-full'}`}
            style={{ width: `${part.share}%` }}
          />
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6">
        {parts.map((part) => (
          <div key={part.label} className="border-t border-line pt-3">
            <dt className="flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${SWATCH_BG[part.swatch]}`}
              />
              {part.label}
              <span className="tabular">({part.share.toFixed(0)}%)</span>
            </dt>
            <dd className="t-figure mt-1 text-lg text-ink">{inr(part.value)}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-[0.75rem] leading-relaxed text-ink-3">{footnote}</p>
    </div>
  );
}

interface ChartProps {
  data: Record<string, string | number>[];
  series: { key: string; name: string; color: string }[];
  title: string;
}

function GrowthChart({ data, series, title }: ChartProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
      <h4 className="t-h3 text-ink">{title}</h4>

      {/* Legend is always present for 2+ series, so identity never rests on color. */}
      <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-[0.8125rem] text-ink-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.name}
          </li>
        ))}
      </ul>

      <div className="mt-5 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              stroke="var(--grid)"
              strokeDasharray="0"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fill: 'var(--ink-3)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--line)' }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: 'var(--ink-3)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => compactInr(Number(v))}
            />
            <Tooltip
              cursor={{ stroke: 'var(--line-2)', strokeWidth: 1 }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '13px',
                boxShadow: '0 4px 16px rgba(20,23,26,0.07)',
                color: 'var(--ink)',
              }}
              labelStyle={{ color: 'var(--ink-3)', marginBottom: 4 }}
              formatter={(value: number | string, name: string) => [inr(Number(value)), name]}
            />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#fill-${s.key})`}
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main                                                                      */
/* -------------------------------------------------------------------------- */

import { useState } from 'react';

=======
import { useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Info, ExternalLink } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981']; // Blue for Invested, Green for Gains
const EMI_COLORS = ['#10b981', '#ef4444']; // Green for Principal, Red for Interest

const COMPETITOR_RATES = [
  { platform: "Groww", fund: "Nifty 50 Index", rate: "12-14%", type: "Large Cap", color: "bg-emerald-500", link: "https://groww.in/mutual-funds", logo: "https://www.google.com/s2/favicons?domain=groww.in&sz=128" },
  { platform: "Zerodha Coin", fund: "Small Cap Discovery", rate: "18-22%", type: "Small Cap", color: "bg-blue-600", link: "https://coin.zerodha.com/", logo: "https://www.google.com/s2/favicons?domain=zerodha.com&sz=128" },
  { platform: "Upstox", fund: "Flexi-cap Growth", rate: "15-17%", type: "Flexi Cap", color: "bg-purple-600", link: "https://upstox.com/mutual-funds/", logo: "https://www.google.com/s2/favicons?domain=upstox.com&sz=128" },
  { platform: "Angel One", fund: "Mid Cap Opportunities", rate: "16-19%", type: "Mid Cap", color: "bg-orange-500", link: "https://www.angelone.in/mutual-funds", logo: "https://www.google.com/s2/favicons?domain=angelone.in&sz=128" }
];

>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
interface CalculatorsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export function Calculators({ activeTab = 'sip', onTabChange }: CalculatorsProps) {
<<<<<<< HEAD
  const [sipData, setSipData] = useState({
    monthlyInvestment: 5000,
    returnRate: 12,
    duration: 10,
  });
  const [mfData, setMfData] = useState({
    lumpsumAmount: 100000,
    growthRate: 15,
    time: 5,
  });
  const [emiData, setEmiData] = useState({
    loanAmount: 1000000,
    interestRate: 9,
    tenure: 20,
  });

  // Parse + clamp so blank fields, pasted text, or out-of-range numbers can't
  // silently produce NaN or nonsensical results.
  const setSip = (field: keyof typeof sipData, v: string | number, min: number, max: number) =>
    setSipData({ ...sipData, [field]: clampNumber(v, min, max, sipData[field]) });
  const setMf = (field: keyof typeof mfData, v: string | number, min: number, max: number) =>
    setMfData({ ...mfData, [field]: clampNumber(v, min, max, mfData[field]) });
  const setEmi = (field: keyof typeof emiData, v: string | number, min: number, max: number) =>
    setEmiData({ ...emiData, [field]: clampNumber(v, min, max, emiData[field]) });

  const sip = calculateSIP(sipData);
  const mf = calculateMF(mfData);
  const emi = calculateEMI(emiData);

  const mfChartData = generateMFChartData(mfData).map((row) => ({
    ...row,
    invested: mfData.lumpsumAmount,
  }));

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <header className="max-w-2xl">
          <h2 className="t-h2 text-ink">Calculators</h2>
          <p className="t-body mt-3">
            Adjust the inputs and watch the projection update. Every figure below is
            calculated from the standard formulas — nothing is rounded away or
            estimated.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={onTabChange} className="mt-10 w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="sip">SIP</TabsTrigger>
            <TabsTrigger value="mutual-fund">Mutual Fund</TabsTrigger>
            <TabsTrigger value="emi">EMI</TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------------------- SIP */}
          <TabsContent value="sip" className="mt-8">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
                <h3 className="t-h3 text-ink">Your plan</h3>
                <div className="mt-6 space-y-7">
                  <Field
                    id="sip-amount"
                    money
                    label="Monthly investment"
                    value={sipData.monthlyInvestment}
                    min={500}
                    max={100000}
                    step={500}
                    onChange={(v) => setSip('monthlyInvestment', v, 500, 100000)}
                  />
                  <Field
                    id="sip-return"
                    label="Expected annual return"
                    value={sipData.returnRate}
                    min={1}
                    max={30}
                    step={0.5}
                    suffix="%"
                    onChange={(v) => setSip('returnRate', v, 1, 30)}
                  />
                  <Field
                    id="sip-duration"
                    label="Duration (years)"
                    value={sipData.duration}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(v) => setSip('duration', v, 1, 40)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <ResultPanel
                  headlineLabel="Projected value"
                  headlineValue={sip.finalAmount}
                  parts={[
                    {
                      label: 'You invest',
                      value: sip.totalInvested,
                      share: safePercent(sip.totalInvested, sip.finalAmount),
                      swatch: 'series-1',
                    },
                    {
                      label: 'Gains',
                      value: sip.gains,
                      share: safePercent(sip.gains, sip.finalAmount),
                      swatch: 'series-2',
                    },
                  ]}
                  footnote={`Assumes a steady ${sipData.returnRate}% annual return and no missed instalments. Real market returns vary year to year and are not guaranteed.`}
                />
                <GrowthChart
                  title="Growth over time"
                  data={generateSIPChartData(sipData)}
                  series={[
                    { key: 'invested', name: 'Invested', color: 'var(--series-1)' },
                    { key: 'value', name: 'Portfolio value', color: 'var(--series-2)' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          {/* -------------------------------------------------- Mutual fund */}
          <TabsContent value="mutual-fund" className="mt-8">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
                <h3 className="t-h3 text-ink">Your investment</h3>
                <div className="mt-6 space-y-7">
                  <Field
                    id="mf-amount"
                    money
                    label="Lumpsum amount"
                    value={mfData.lumpsumAmount}
                    min={5000}
                    max={5000000}
                    step={5000}
                    onChange={(v) => setMf('lumpsumAmount', v, 5000, 5000000)}
                  />
                  <Field
                    id="mf-growth"
                    label="Expected annual growth"
                    value={mfData.growthRate}
                    min={1}
                    max={30}
                    step={0.5}
                    suffix="%"
                    onChange={(v) => setMf('growthRate', v, 1, 30)}
                  />
                  <Field
                    id="mf-time"
                    label="Holding period (years)"
                    value={mfData.time}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(v) => setMf('time', v, 1, 40)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <ResultPanel
                  headlineLabel="Projected value"
                  headlineValue={mf.finalAmount}
                  parts={[
                    {
                      label: 'Initial investment',
                      value: mfData.lumpsumAmount,
                      share: safePercent(mfData.lumpsumAmount, mf.finalAmount),
                      swatch: 'series-1',
                    },
                    {
                      label: 'Gains',
                      value: mf.gains,
                      share: safePercent(mf.gains, mf.finalAmount),
                      swatch: 'series-2',
                    },
                  ]}
                  footnote={`Compounded annually at an assumed ${mfData.growthRate}%. Mutual fund investments are subject to market risk; past performance does not predict future returns.`}
                />
                <GrowthChart
                  title="Growth over time"
                  data={mfChartData}
                  series={[
                    { key: 'invested', name: 'Invested', color: 'var(--series-1)' },
                    { key: 'value', name: 'Fund value', color: 'var(--series-2)' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          {/* ---------------------------------------------------------- EMI */}
          <TabsContent value="emi" className="mt-8">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
                <h3 className="t-h3 text-ink">Your loan</h3>
                <div className="mt-6 space-y-7">
                  <Field
                    id="emi-amount"
                    money
                    label="Loan amount"
                    value={emiData.loanAmount}
                    min={50000}
                    max={50000000}
                    step={50000}
                    onChange={(v) => setEmi('loanAmount', v, 50000, 50000000)}
                  />
                  <Field
                    id="emi-rate"
                    label="Interest rate (p.a.)"
                    value={emiData.interestRate}
                    min={1}
                    max={20}
                    step={0.1}
                    suffix="%"
                    onChange={(v) => setEmi('interestRate', v, 1, 20)}
                  />
                  <Field
                    id="emi-tenure"
                    label="Tenure (years)"
                    value={emiData.tenure}
                    min={1}
                    max={30}
                    step={1}
                    onChange={(v) => setEmi('tenure', v, 1, 30)}
                  />
                </div>

                <div className="mt-8 border-t border-line pt-5">
                  <span className="t-label">Monthly EMI</span>
                  <div className="t-figure mt-1.5 text-3xl text-ink">{inr(emi.emi)}</div>
                </div>
              </div>

              <div className="space-y-6">
                <ResultPanel
                  headlineLabel="Total you repay"
                  headlineValue={emi.totalAmount}
                  parts={[
                    {
                      label: 'Principal',
                      value: emiData.loanAmount,
                      share: safePercent(emiData.loanAmount, emi.totalAmount),
                      swatch: 'series-1',
                    },
                    {
                      label: 'Interest',
                      value: emi.totalInterest,
                      share: safePercent(emi.totalInterest, emi.totalAmount),
                      swatch: 'series-2',
                    },
                  ]}
                  footnote="Assumes a fixed rate for the full tenure and no prepayment. Floating-rate loans will differ as rates change."
                />
                <GrowthChart
                  title="Principal vs interest paid each year"
                  data={generateEMIChartData(emiData)}
                  series={[
                    { key: 'principal', name: 'Principal', color: 'var(--series-1)' },
                    { key: 'interest', name: 'Interest', color: 'var(--series-2)' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Category benchmarks */}
        <div className="mt-16">
          <h3 className="t-h3 text-ink">Typical return ranges by fund category</h3>
          <p className="t-body measure mt-2 text-sm">
            Rough historical ranges to sanity-check the return assumption above.
          </p>

          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_BENCHMARKS.map((cat) => (
              <li key={cat.type} className="bg-surface p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{cat.type}</span>
                  <span className="t-figure text-base text-ink">{cat.rate}</span>
                </div>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-3">
                  {cat.description}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-3">
            For illustration only, not investment advice. Figures are approximate
            historical category ranges and are not guaranteed; verify current data
            with AMFI or a licensed source before relying on them. Mutual fund
            investments are subject to market risks — read all scheme-related
            documents carefully.
          </p>
        </div>
      </div>
    </section>
  );
}
=======
  const tabOrder = ['sip', 'mutual-fund', 'emi'];
  const activeTabIndex = Math.max(0, tabOrder.indexOf(activeTab));
  const tabIndicatorStyle: CSSProperties & { ['--tab-offset']?: string; ['--tab-count']?: number } = {
    '--tab-offset': `${activeTabIndex * 100}%`,
    '--tab-count': tabOrder.length
  };
  const [sipData, setSipData] = useState({
    monthlyInvestment: 5000,
    returnRate: 12,
    duration: 10
  });

  const [mfData, setMfData] = useState({
    lumpsumAmount: 100000,
    growthRate: 15,
    time: 5
  });

  const [emiData, setEmiData] = useState({
    loanAmount: 1000000,
    interestRate: 9,
    tenure: 20
  });

  // Input clamping helper
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  // SIP Calculator Logic
  const calculateSIP = () => {
    const investment = clamp(sipData.monthlyInvestment, 500, 100000);
    const rate = clamp(sipData.returnRate, 0, 30);
    const years = clamp(sipData.duration, 1, 40);
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const totalInvested = investment * months;

    // Guard: if rate is 0, no compounding — just total invested
    if (monthlyRate === 0) {
      return { finalAmount: totalInvested, totalInvested, gains: 0 };
    }

    const futureValue = investment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const gains = futureValue - totalInvested;

    return {
      finalAmount: Math.round(futureValue),
      totalInvested,
      gains: Math.round(gains)
    };
  };

  // Mutual Fund Calculator Logic
  const calculateMF = () => {
    const amount = clamp(mfData.lumpsumAmount, 5000, 5000000);
    const rate = clamp(mfData.growthRate, 0, 30);
    const years = clamp(mfData.time, 1, 40);
    const finalAmount = amount * Math.pow(1 + rate / 100, years);
    const gains = finalAmount - amount;

    return {
      finalAmount: Math.round(finalAmount),
      gains: Math.round(gains)
    };
  };

  // EMI Calculator Logic
  const calculateEMI = () => {
    const principal = clamp(emiData.loanAmount, 50000, 50000000);
    const rate = clamp(emiData.interestRate, 0, 20);
    const years = clamp(emiData.tenure, 1, 30);
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    // Guard: if interest rate is 0, EMI is simply principal / months
    if (monthlyRate === 0) {
      const emi = Math.round(principal / months);
      return { emi, totalAmount: principal, totalInterest: 0 };
    }

    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest)
    };
  };

  // Generate chart data for SIP
  const generateSIPChartData = () => {
    const data = [];
    const monthlyRate = sipData.returnRate / 100 / 12;
    let totalInvested = 0;
    let currentValue = 0;

    for (let year = 1; year <= sipData.duration; year++) {
      totalInvested = sipData.monthlyInvestment * year * 12;
      const months = year * 12;
      currentValue = sipData.monthlyInvestment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

      data.push({
        year: `Year ${year}`,
        invested: totalInvested,
        value: Math.round(currentValue)
      });
    }
    return data;
  };

  // Generate chart data for Mutual Fund
  const generateMFChartData = () => {
    const data = [];
    for (let year = 1; year <= mfData.time; year++) {
      const value = mfData.lumpsumAmount * Math.pow(1 + mfData.growthRate / 100, year);
      data.push({
        year: `Year ${year}`,
        value: Math.round(value)
      });
    }
    return data;
  };

  // Generate chart data for EMI
  const generateEMIChartData = () => {
    const { emi } = calculateEMI();
    const data = [];
    const monthlyRate = emiData.interestRate / 100 / 12;
    let balance = emiData.loanAmount;

    for (let year = 1; year <= Math.min(emiData.tenure, 10); year++) {
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
        interest: Math.round(yearlyInterest)
      });
    }
    return data;
  };

  const sipResult = calculateSIP();
  const mfResult = calculateMF();
  const emiResult = calculateEMI();

  return (
    <section
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50/60 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950"
      style={{ marginTop: '30px' }}
    >
      <div className="space-y-12 max-w-7xl mx-auto" id="calculators">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">Financial Calculators</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">Plan your investments and loans with our interactive, precision-driven tools designed for your financial growth.</p>
        </div>

        <div className="space-y-12">
          {/* Main Calculators Area */}
          <div className="max-w-5xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={onTabChange}
              className="w-full"
            >
              <TabsList
                className="grid w-full grid-cols-3 mb-10 rounded-full bg-slate-100/80 dark:bg-slate-900/60 p-1 shadow-sm relative overflow-hidden"
                style={tabIndicatorStyle}
              >
                <span className="tabs-indicator" aria-hidden="true" />
                <TabsTrigger value="sip" className="rounded-full data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent">
                  SIP Calculator
                </TabsTrigger>
                <TabsTrigger value="mutual-fund" className="rounded-full data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent">
                  Mutual Fund Calculator
                </TabsTrigger>
                <TabsTrigger value="emi" className="rounded-full data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent">
                  EMI Calculator
                </TabsTrigger>
              </TabsList>

              {/* SIP Calculator */}
              <TabsContent value="sip">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  <Card className="h-full rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>SIP Calculator</CardTitle>
                      <CardDescription>Calculate your systematic investment plan returns</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 h-full">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="monthly-investment">Monthly Investment (₹)</Label>
                          <Input
                            id="monthly-investment"
                            type="number"
                            className="w-32 text-right font-semibold text-blue-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={sipData.monthlyInvestment}
                            onChange={(e) => setSipData({ ...sipData, monthlyInvestment: Number(e.target.value) })}
                            min={500} max={100000} step={500}
                          />
                        </div>
                        <Slider
                          value={[sipData.monthlyInvestment]}
                          min={500}
                          max={100000}
                          step={500}
                          onValueChange={(val) => setSipData({ ...sipData, monthlyInvestment: val[0] })}
                          trackColor="bg-blue-500 dark:bg-blue-500"
                          thumbColor="border-blue-500 dark:border-blue-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="return-rate">Expected Annual Return (%)</Label>
                          <Input
                            id="return-rate"
                            type="number"
                            className="w-32 text-right font-semibold text-green-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={sipData.returnRate}
                            onChange={(e) => setSipData({ ...sipData, returnRate: Number(e.target.value) })}
                            min={1} max={30} step={0.5}
                          />
                        </div>
                        <Slider
                          value={[sipData.returnRate]}
                          min={1}
                          max={30}
                          step={0.5}
                          onValueChange={(val) => setSipData({ ...sipData, returnRate: val[0] })}
                          trackColor="bg-green-500 dark:bg-green-500"
                          thumbColor="border-green-500 dark:border-green-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="duration">Investment Duration (Years)</Label>
                          <Input
                            id="duration"
                            type="number"
                            className="w-32 text-right font-semibold text-purple-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={sipData.duration}
                            onChange={(e) => setSipData({ ...sipData, duration: Number(e.target.value) })}
                            min={1} max={40} step={1}
                          />
                        </div>
                        <Slider
                          value={[sipData.duration]}
                          min={1}
                          max={40}
                          step={1}
                          onValueChange={(val) => setSipData({ ...sipData, duration: val[0] })}
                          trackColor="bg-purple-500 dark:bg-purple-400"
                          thumbColor="border-purple-500 dark:border-purple-400"
                        />
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                        <div className="flex justify-between">
                          <span>Total Invested:</span>
                          <span className="font-semibold">₹{sipResult.totalInvested.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Gains:</span>
                          <span className="font-semibold text-green-600">₹{sipResult.gains.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span>Final Amount:</span>
                          <span className="font-bold text-blue-600">₹{sipResult.finalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">⚠️ Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance is not indicative of future returns. The calculator provides estimates for illustrative purposes only.</p>
                    </CardContent>
                  </Card>

                  <Card className="h-full rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Investment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 h-full">
                      <div className="h-[260px] min-h-[260px] w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-4 shadow-inner">
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Total Invested', value: sipResult.totalInvested },
                                { name: 'Estimated Gains', value: sipResult.gains }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                              cornerRadius={6}
                              isAnimationActive
                              animationDuration={800}
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>Invested ({(sipResult.totalInvested / sipResult.finalAmount * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Gains ({(sipResult.gains / sipResult.finalAmount * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Mutual Fund Calculator */}
              <TabsContent value="mutual-fund">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  <Card className="h-full rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Mutual Fund Calculator</CardTitle>
                      <CardDescription>Calculate lumpsum investment returns</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 h-full">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="lumpsum-amount">Lumpsum Amount (₹)</Label>
                          <Input
                            id="lumpsum-amount"
                            type="number"
                            className="w-32 text-right font-semibold text-blue-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={mfData.lumpsumAmount}
                            onChange={(e) => setMfData({ ...mfData, lumpsumAmount: Number(e.target.value) })}
                            min={5000} max={5000000} step={5000}
                          />
                        </div>
                        <Slider
                          value={[mfData.lumpsumAmount]}
                          min={5000}
                          max={5000000}
                          step={5000}
                          onValueChange={(val) => setMfData({ ...mfData, lumpsumAmount: val[0] })}
                          trackColor="bg-blue-500 dark:bg-blue-500"
                          thumbColor="border-blue-500 dark:border-blue-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="growth-rate">Expected Annual Growth (%)</Label>
                          <Input
                            id="growth-rate"
                            type="number"
                            className="w-32 text-right font-semibold text-green-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={mfData.growthRate}
                            onChange={(e) => setMfData({ ...mfData, growthRate: Number(e.target.value) })}
                            min={1} max={30} step={0.5}
                          />
                        </div>
                        <Slider
                          value={[mfData.growthRate]}
                          min={1}
                          max={30}
                          step={0.5}
                          onValueChange={(val) => setMfData({ ...mfData, growthRate: val[0] })}
                          trackColor="bg-green-500 dark:bg-green-500"
                          thumbColor="border-green-500 dark:border-green-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="time">Investment Time (Years)</Label>
                          <Input
                            id="time"
                            type="number"
                            className="w-32 text-right font-semibold text-purple-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={mfData.time}
                            onChange={(e) => setMfData({ ...mfData, time: Number(e.target.value) })}
                            min={1} max={40} step={1}
                          />
                        </div>
                        <Slider
                          value={[mfData.time]}
                          min={1}
                          max={40}
                          step={1}
                          onValueChange={(val) => setMfData({ ...mfData, time: val[0] })}
                          trackColor="bg-purple-500 dark:bg-purple-400"
                          thumbColor="border-purple-500 dark:border-purple-400"
                        />
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                        <div className="flex justify-between">
                          <span>Initial Investment:</span>
                          <span className="font-semibold">₹{mfData.lumpsumAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Gains:</span>
                          <span className="font-semibold text-green-600">₹{mfResult.gains.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span>Final Amount:</span>
                          <span className="font-bold text-blue-600">₹{mfResult.finalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">⚠️ Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance is not indicative of future returns. The calculator provides estimates for illustrative purposes only.</p>
                    </CardContent>
                  </Card>

                  <Card className="h-full rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Investment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 h-full">
                      <div className="h-[260px] min-h-[260px] w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-4 shadow-inner">
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Initial Investment', value: mfData.lumpsumAmount },
                                { name: 'Estimated Gains', value: mfResult.gains }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                              cornerRadius={6}
                              isAnimationActive
                              animationDuration={800}
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>Invested ({(mfData.lumpsumAmount / mfResult.finalAmount * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Gains ({(mfResult.gains / mfResult.finalAmount * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* EMI Calculator */}
              <TabsContent value="emi">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  <Card className="h-full rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>EMI Calculator</CardTitle>
                      <CardDescription>Calculate your loan EMI and payment breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 h-full">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
                          <Input
                            id="loan-amount"
                            type="number"
                            className="w-32 text-right font-semibold text-blue-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={emiData.loanAmount}
                            onChange={(e) => setEmiData({ ...emiData, loanAmount: Number(e.target.value) })}
                            min={50000} max={50000000} step={50000}
                          />
                        </div>
                        <Slider
                          value={[emiData.loanAmount]}
                          min={50000}
                          max={50000000}
                          step={50000}
                          onValueChange={(val) => setEmiData({ ...emiData, loanAmount: val[0] })}
                          trackColor="bg-blue-500 dark:bg-blue-500"
                          thumbColor="border-blue-500 dark:border-blue-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="interest-rate">Interest Rate (% p.a.)</Label>
                          <Input
                            id="interest-rate"
                            type="number"
                            className="w-32 text-right font-semibold text-red-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={emiData.interestRate}
                            onChange={(e) => setEmiData({ ...emiData, interestRate: Number(e.target.value) })}
                            min={1} max={20} step={0.1}
                          />
                        </div>
                        <Slider
                          value={[emiData.interestRate]}
                          min={1}
                          max={20}
                          step={0.1}
                          onValueChange={(val) => setEmiData({ ...emiData, interestRate: val[0] })}
                          trackColor="bg-red-500 dark:bg-red-500"
                          thumbColor="border-red-500 dark:border-red-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="tenure">Loan Tenure (Years)</Label>
                          <Input
                            id="tenure"
                            type="number"
                            className="w-32 text-right font-semibold text-purple-600 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
                            value={emiData.tenure}
                            onChange={(e) => setEmiData({ ...emiData, tenure: Number(e.target.value) })}
                            min={1} max={30} step={1}
                          />
                        </div>
                        <Slider
                          value={[emiData.tenure]}
                          min={1}
                          max={30}
                          step={1}
                          onValueChange={(val) => setEmiData({ ...emiData, tenure: val[0] })}
                          trackColor="bg-purple-500 dark:bg-purple-400"
                          thumbColor="border-purple-500 dark:border-purple-400"
                        />
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-950 dark:to-red-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                        <div className="flex justify-between text-lg">
                          <span>Monthly EMI:</span>
                          <span className="font-bold text-blue-600">₹{emiResult.emi.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Interest:</span>
                          <span className="font-semibold text-red-600">₹{emiResult.totalInterest.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-semibold">₹{emiResult.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">⚠️ EMI calculations are approximate. Actual EMIs may vary based on lender terms, processing fees, and other charges. Please verify with your financial institution before making decisions.</p>
                    </CardContent>
                  </Card>

                  <Card className="h-full rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Payment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 h-full">
                      <div className="h-[260px] min-h-[260px] w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-4 shadow-inner">
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Principal Amount', value: emiData.loanAmount },
                                { name: 'Total Interest', value: emiResult.totalInterest }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                              cornerRadius={6}
                              isAnimationActive
                              animationDuration={800}
                            >
                              {EMI_COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Principal ({(emiData.loanAmount / emiResult.totalAmount * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>Interest ({(emiResult.totalInterest / emiResult.totalAmount * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Competitor / Benchmark Rates Horizontal Layout */}
          <div className="max-w-5xl mx-auto px-1" style={{ marginTop: '30px' }}>
            <Card className="border-0 bg-gradient-to-b from-blue-50/30 to-white dark:from-slate-900 dark:to-slate-900 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
              <CardHeader className="pb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-2xl font-bold">Platform Averages</CardTitle>
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription className="text-base max-w-2xl mx-auto">
                  Expected annual returns for popular mutual fund categories frequently bought on top Indian platforms.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 w-full">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.15 } }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mx-auto w-full items-stretch"
                >
                  {COMPETITOR_RATES.map((comp, idx) => (
                    <motion.div 
                      key={idx} 
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                      }}
                      whileHover={{ scale: 1.05, y: -12, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                      className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] hover:z-10 transition-all duration-300 flex flex-col items-center text-center h-full w-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>

                      {/* Top Section: Logo */}
                      <div className="relative mb-4 z-10 w-full flex justify-center shrink-0">
                        <div className="relative w-16 h-16 rounded-full bg-white shadow-xs flex items-center justify-center overflow-hidden z-10 p-2">
                          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700 animate-pulse blur-md opacity-20"></div>
                          <img src={comp.logo} alt={comp.platform} className="w-full h-full object-contain relative z-10" />
                        </div>
                      </div>

                      {/* Name & Return */}
                      <div className="z-10 w-full flex-grow flex flex-col items-center justify-center space-y-3 my-2">
                        <span className="font-bold text-slate-800 dark:text-white text-base tracking-tight block">{comp.platform}</span>
                        <div className="bg-green-50 dark:bg-green-900/20 py-1.5 px-4 rounded-full">
                          <span className="font-extrabold text-green-600 dark:text-green-400 text-lg">{comp.rate}</span>
                        </div>
                      </div>

                      {/* Bottom Section: Type */}
                      <div className="flex flex-col items-center gap-3 mt-auto pt-4 z-10 w-full shrink-0">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                          <div className={`w-2 h-2 rounded-full ${comp.color}`} />
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[100px] sm:max-w-none">
                            {comp.type}
                          </span>
                        </div>
                        <a href={comp.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-full">
                          View details <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-2 p-3 bg-blue-50/50 dark:bg-slate-800/50 rounded-lg flex justify-center text-center">
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                    * Note: Returns are estimated Historical Category Averages. Mutual funds are subject to market risks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div></section>
  );
}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
