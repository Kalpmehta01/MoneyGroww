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

// Illustrative category benchmarks only â€” NOT tied to any specific platform
// or fund. Historical mutual fund category averages vary by data provider
// and time period; verify current figures with AMFI/a licensed data source
// before presenting these as real numbers to end users.
const CATEGORY_BENCHMARKS = [
  { type: 'Large Cap', rate: '10â€“13%', description: 'Established, blue-chip companies' },
  { type: 'Flexi Cap', rate: '11â€“15%', description: 'Invests across market caps' },
  { type: 'Mid Cap', rate: '13â€“17%', description: 'Higher growth, higher volatility' },
  { type: 'Small Cap', rate: '14â€“20%', description: 'Highest growth potential and risk' },
];

const inr = (value: number) =>
  `â‚¹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const compactInr = (value: number) => {
  if (Math.abs(value) >= 10000000) return `â‚¹${(value / 10000000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100000) return `â‚¹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `â‚¹${Math.round(value / 1000)}k`;
  return `â‚¹${value}`;
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
        {fmt(min)} â€“ {fmt(max)}
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

interface CalculatorsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export function Calculators({ activeTab = 'sip', onTabChange }: CalculatorsProps) {
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
            calculated from the standard formulas â€” nothing is rounded away or
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
            investments are subject to market risks â€” read all scheme-related
            documents carefully.
          </p>
        </div>
      </div>
    </section>
  );
}
