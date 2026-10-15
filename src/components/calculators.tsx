import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { GrowthChart } from './growth-chart';
import {
  clampNumber,
  safePercent,
  calculateEMI,
  generateEMIChartData,
  honestProjection,
  projectionRange,
  planGoal,
  simulatePrepayment,
  simulateSWP,
  type TaxTreatment,
} from '../lib/finance';
import { inr, compactInr, wordsInr, yearsMonths } from '../lib/format';
import {
  REFERENCE_RATES,
  RATES_AS_OF,
  DEFAULT_INFLATION,
  EDUCATION_INFLATION,
  TAX_RULES,
  CATEGORY_RANGES,
  type ReferenceRate,
} from '../data/reference-rates';

/* -------------------------------------------------------------------------- */
/*  Snapshot shared with the assistant                                        */
/* -------------------------------------------------------------------------- */

export type CalculatorTool = 'sip' | 'goal' | 'lumpsum' | 'emi' | 'swp';

/** Figures computed by the tested finance code, passed to the assistant so it explains real numbers instead of inventing them. */
export interface CalcSnapshot {
  tool: CalculatorTool;
  figures: Record<string, number>;
}

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
  money?: boolean;
  hint?: string;
  onChange: (value: string | number) => void;
}

function Field({ id, label, value, min, max, step, suffix, money, hint, onChange }: FieldProps) {
  const fmt = (n: number) => (money ? inr(n) : `${n}${suffix ?? ''}`);

  // The text box keeps its own draft while the person types, so an
  // intermediate value like "2" (on the way to "25000") isn't clamped up to
  // the minimum mid-keystroke. In-range values apply live; the draft is
  // clamped and committed on blur or Enter.
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const parsed = parseFloat(draft);
  const outOfRange = draft.trim() !== '' && (!Number.isFinite(parsed) || parsed < min || parsed > max);

  const commit = () => {
    setEditing(false);
    onChange(draft);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id} className="text-sm text-ink-2">
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          {money && <span className="text-sm text-ink-3">₹</span>}
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            className="h-9 w-32 text-right font-medium tabular"
            value={draft}
            onFocus={() => setEditing(true)}
            onChange={(e) => {
              const next = e.target.value;
              setDraft(next);
              const n = parseFloat(next);
              if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            min={min}
            max={max}
            step={step}
            aria-invalid={outOfRange || undefined}
            aria-describedby={`${id}-range`}
          />
          <span aria-hidden={!suffix || undefined} className="w-4 text-sm text-ink-3">{suffix}</span>
        </div>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(val) => onChange(val[0])} aria-label={label} />
      <p id={`${id}-range`} className={`text-[0.75rem] tabular ${outOfRange ? 'text-neg' : 'text-ink-3'}`}>
        {outOfRange ? 'Enter a value between ' : ''}
        {fmt(min)} – {fmt(max)}
        {hint && !outOfRange ? <span className="text-ink-3"> · {hint}</span> : null}
      </p>
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm text-ink-2">{label}</span>
        {hint && <span className="mt-0.5 block text-[0.75rem] text-ink-3">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          checked ? 'border-accent bg-accent' : 'border-line-2 bg-secondary'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-3.5 w-3.5 rounded-full bg-surface shadow transition-transform duration-[120ms] ${
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="text-sm text-ink-2">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-line-2 bg-input-background px-2.5 text-sm text-ink outline-none focus-visible:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-surface p-6 sm:p-7 ${className}`}>
      {title && <h3 className="t-h3 text-ink">{title}</h3>}
      {children}
    </div>
  );
}

const TAX_OPTIONS: { value: TaxTreatment; label: string }[] = [
  { value: 'equity', label: 'Equity fund' },
  { value: 'debt', label: 'Debt fund' },
  { value: 'slab', label: 'FD / RD interest' },
  { value: 'exempt', label: 'Tax-free (PPF)' },
];

const SLAB_OPTIONS = TAX_RULES.slabRates.map((r) => ({ value: String(r), label: `${Math.round(r * 100)}%` }));

interface ReturnState {
  presetId: ReferenceRate['id'] | 'custom';
  returnPct: number;
  costPct: number;
  tax: TaxTreatment;
  slabRate: number;
}

/** "What will this earn?" — preset chips first, so nobody has to guess a number. */
function ReturnInputs({
  idPrefix,
  state,
  onChange,
  showCost = true,
}: {
  idPrefix: string;
  state: ReturnState;
  onChange: (next: ReturnState) => void;
  showCost?: boolean;
}) {
  const preset = REFERENCE_RATES.find((r) => r.id === state.presetId);
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm text-ink-2">Where will the money go?</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {REFERENCE_RATES.map((r) => {
            const active = state.presetId === r.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({ ...state, presetId: r.id, returnPct: r.rate, costPct: r.defaultCost, tax: r.tax })
                }
                className={`rounded-full border px-3 py-1.5 text-[0.8125rem] transition-colors duration-[120ms] ${
                  active ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line-2 text-ink-2 hover:border-accent hover:text-accent'
                }`}
              >
                {r.label} <span className="tabular text-ink-3">{r.kind === 'assumption' ? '~' : ''}{r.rate}%</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-3">
          {preset ? preset.note : 'Custom return. Make sure it is realistic for what you are investing in.'}
        </p>
      </fieldset>

      <Field
        id={`${idPrefix}-return`}
        label="Expected return per year"
        value={state.returnPct}
        min={1}
        max={20}
        step={0.1}
        suffix="%"
        onChange={(v) => onChange({ ...state, presetId: 'custom', returnPct: clampNumber(v, 1, 20, state.returnPct) })}
      />

      {showCost && state.tax !== 'slab' && state.tax !== 'exempt' && (
        <Field
          id={`${idPrefix}-cost`}
          label="Fund cost (expense ratio)"
          value={state.costPct}
          min={0}
          max={2.5}
          step={0.05}
          suffix="%"
          hint="direct plans ≈ 0.2–1%, regular ≈ 1–2.25%"
          onChange={(v) => onChange({ ...state, costPct: clampNumber(v, 0, 2.5, state.costPct) })}
        />
      )}

      <SelectField
        id={`${idPrefix}-tax`}
        label="Taxed as"
        value={state.tax}
        options={TAX_OPTIONS}
        onChange={(v) => onChange({ ...state, tax: v as TaxTreatment, costPct: v === 'slab' || v === 'exempt' ? 0 : state.costPct })}
      />
      {(state.tax === 'slab' || state.tax === 'debt') && (
        <SelectField
          id={`${idPrefix}-slab`}
          label="Your income-tax slab"
          value={String(state.slabRate)}
          options={SLAB_OPTIONS}
          onChange={(v) => onChange({ ...state, slabRate: Number(v) })}
        />
      )}
    </div>
  );
}

interface HonestToggles {
  costs: boolean;
  tax: boolean;
  inflation: boolean;
  inflationPct: number;
}

function HonestSwitches({ idPrefix, value, onChange }: { idPrefix: string; value: HonestToggles; onChange: (v: HonestToggles) => void }) {
  return (
    <div className="space-y-4 border-t border-line pt-6">
      <p className="t-label">Show the real picture</p>
      <Toggle id={`${idPrefix}-t-costs`} checked={value.costs} onChange={(costs) => onChange({ ...value, costs })} label="Subtract fund costs" />
      <Toggle
        id={`${idPrefix}-t-tax`}
        checked={value.tax}
        onChange={(tax) => onChange({ ...value, tax })}
        label="Subtract tax when you withdraw"
        hint={`Rules for ${TAX_RULES.asOf}, incl. 4% cess`}
      />
      <Toggle
        id={`${idPrefix}-t-infl`}
        checked={value.inflation}
        onChange={(inflation) => onChange({ ...value, inflation })}
        label="Show in today’s money"
        hint={`Adjusts for ${value.inflationPct}% yearly price rise`}
      />
      {value.inflation && (
        <Field
          id={`${idPrefix}-infl`}
          label="Inflation per year"
          value={value.inflationPct}
          min={2}
          max={12}
          step={0.5}
          suffix="%"
          onChange={(v) => onChange({ ...value, inflationPct: clampNumber(v, 2, 12, value.inflationPct) })}
        />
      )}
    </div>
  );
}

/** Walks from the usual headline figure to what the money is really worth. */
function HonestResult({
  result,
  toggles,
  range,
  returnPct,
  years,
}: {
  result: ReturnType<typeof honestProjection>;
  toggles: HonestToggles;
  range: ReturnType<typeof projectionRange>;
  returnPct: number;
  years: number;
}) {
  const label = toggles.inflation
    ? 'Worth in today’s money'
    : toggles.tax || toggles.costs
      ? 'In your hand'
      : 'Projected value';
  const multiple = result.invested > 0 ? result.bottomLine / result.invested : 0;

  const rows: { label: string; value: number; sign?: '−' | '='; strong?: boolean; show: boolean }[] = [
    { label: `Projected value at ${returnPct}%`, value: result.headlineValue, show: true },
    { label: 'Fund costs over the period', value: result.costDrag, sign: '−', show: toggles.costs && result.costDrag > 0 },
    { label: 'Tax', value: result.tax, sign: '−', show: toggles.tax },
    { label: 'In your hand', value: result.inHand, sign: '=', show: toggles.costs || toggles.tax },
    { label: `Same amount in today’s money (${toggles.inflationPct}% inflation)`, value: result.todaysMoney, strong: true, show: toggles.inflation },
  ];

  return (
    <Card>
      <span className="t-label">{label}</span>
      <div className="t-figure mt-2 text-[2.5rem] text-ink">{inr(result.bottomLine)}</div>
      <p className="mt-1.5 text-sm text-ink-2">
        You put in {inr(result.invested)} over {years} years
        {result.invested > 0 && (
          <>
            {' '}
            · {multiple >= 1 ? `${multiple.toFixed(2)}× your money` : `${Math.round((1 - multiple) * 100)}% less than you put in`}
            {toggles.inflation ? ' in real terms' : ''}
          </>
        )}
      </p>

      <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
        {rows
          .filter((r) => r.show)
          .map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className={r.strong ? 'font-medium text-ink' : 'text-ink-2'}>
                {r.sign && <span className="mr-1.5 inline-block w-3 text-ink-3">{r.sign}</span>}
                {r.label}
              </dt>
              <dd className={`tabular ${r.strong ? 'font-semibold text-ink' : r.sign === '−' ? 'text-neg' : 'text-ink'}`}>
                {inr(r.value)}
              </dd>
            </div>
          ))}
      </dl>

      <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-2">
        <span className="font-medium text-ink">Returns are never steady.</span> At {range.lowRate}% a year this would be about{' '}
        <span className="tabular font-medium text-ink">{wordsInr(range.low)}</span>; at {range.highRate}%, about{' '}
        <span className="tabular font-medium text-ink">{wordsInr(range.high)}</span>.
      </p>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-3">
        Assumes the same return every year, no missed instalments and full withdrawal in one financial year. Tax ignores
        surcharge and loss set-off. Illustration only, not a promise or investment advice.
      </p>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const equity = REFERENCE_RATES.find((r) => r.id === 'equity')!;
const DEFAULT_RETURN: ReturnState = {
  presetId: 'equity',
  returnPct: equity.rate,
  costPct: equity.defaultCost,
  tax: equity.tax,
  slabRate: TAX_RULES.defaultSlabRate,
};
const DEFAULT_TOGGLES: HonestToggles = { costs: true, tax: true, inflation: true, inflationPct: DEFAULT_INFLATION };

const GOAL_TEMPLATES = [
  { id: 'education', label: 'Child’s higher education', cost: 2500000, years: 15, inflation: EDUCATION_INFLATION },
  { id: 'house', label: 'House down payment', cost: 2000000, years: 7, inflation: DEFAULT_INFLATION },
  { id: 'car', label: 'Car', cost: 800000, years: 4, inflation: 5 },
  { id: 'custom', label: 'Something else', cost: 500000, years: 5, inflation: DEFAULT_INFLATION },
] as const;

/* -------------------------------------------------------------------------- */
/*  Main                                                                      */
/* -------------------------------------------------------------------------- */

interface CalculatorsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  onSnapshot?: (snapshot: CalcSnapshot) => void;
}

export function Calculators({ activeTab = 'sip', onTabChange, onSnapshot }: CalculatorsProps) {
  /* ------------------------------------------------------------ SIP state */
  const [sip, setSip] = useState({ monthly: 5000, years: 10, stepUpPct: 0 });
  const [sipReturn, setSipReturn] = useState<ReturnState>(DEFAULT_RETURN);
  const [sipToggles, setSipToggles] = useState<HonestToggles>(DEFAULT_TOGGLES);

  /* ------------------------------------------------------- lumpsum state */
  const [lump, setLump] = useState({ amount: 100000, years: 10 });
  const [lumpReturn, setLumpReturn] = useState<ReturnState>(DEFAULT_RETURN);
  const [lumpToggles, setLumpToggles] = useState<HonestToggles>(DEFAULT_TOGGLES);

  /* ---------------------------------------------------------- goal state */
  const [goalTemplate, setGoalTemplate] = useState<(typeof GOAL_TEMPLATES)[number]['id']>('education');
  const [goal, setGoal] = useState({ costToday: 2500000, years: 15, goalInflationPct: EDUCATION_INFLATION, alreadySaved: 0, stepUpPct: 10 });
  const [goalReturn, setGoalReturn] = useState<ReturnState>(DEFAULT_RETURN);

  /* ----------------------------------------------------------- EMI state */
  const [emiData, setEmiData] = useState({ loanAmount: 3000000, interestRate: 8.5, tenure: 20 });
  const [prepay, setPrepay] = useState({ extraMonthly: 0, lumpSum: 0, lumpSumYear: 3 });

  /* ----------------------------------------------------------- SWP state */
  const [swp, setSwp] = useState({ corpus: 5000000, monthlyWithdrawal: 25000, returnPct: 8, increasePct: 5, years: 25 });

  /* --------------------------------------------------------- computation */
  const sipInput = {
    monthly: sip.monthly,
    stepUpPct: sip.stepUpPct,
    years: sip.years,
    returnPct: sipReturn.returnPct,
    costPct: sipReturn.costPct,
    tax: sipReturn.tax,
    slabRate: sipReturn.slabRate,
    inflationPct: sipToggles.inflationPct,
    includeCosts: sipToggles.costs,
    includeTax: sipToggles.tax,
    includeInflation: sipToggles.inflation,
  };
  const sipResult = useMemo(() => honestProjection(sipInput), [JSON.stringify(sipInput)]); // eslint-disable-line react-hooks/exhaustive-deps
  const sipRange = useMemo(() => projectionRange(sipInput), [JSON.stringify(sipInput)]); // eslint-disable-line react-hooks/exhaustive-deps

  const lumpInput = {
    monthly: 0,
    initial: lump.amount,
    years: lump.years,
    returnPct: lumpReturn.returnPct,
    costPct: lumpReturn.costPct,
    tax: lumpReturn.tax,
    slabRate: lumpReturn.slabRate,
    inflationPct: lumpToggles.inflationPct,
    includeCosts: lumpToggles.costs,
    includeTax: lumpToggles.tax,
    includeInflation: lumpToggles.inflation,
  };
  const lumpResult = useMemo(() => honestProjection(lumpInput), [JSON.stringify(lumpInput)]); // eslint-disable-line react-hooks/exhaustive-deps
  const lumpRange = useMemo(() => projectionRange(lumpInput), [JSON.stringify(lumpInput)]); // eslint-disable-line react-hooks/exhaustive-deps

  const goalInput = {
    ...goal,
    returnPct: goalReturn.returnPct,
    costPct: goalReturn.costPct,
    tax: goalReturn.tax,
    slabRate: goalReturn.slabRate,
  };
  const goalResult = useMemo(() => planGoal(goalInput), [JSON.stringify(goalInput)]); // eslint-disable-line react-hooks/exhaustive-deps
  const goalPath = useMemo(
    () =>
      honestProjection({
        monthly: goalResult.monthlyNeeded,
        stepUpPct: goal.stepUpPct,
        initial: goal.alreadySaved,
        years: goal.years,
        returnPct: goalReturn.returnPct,
        costPct: goalReturn.costPct,
        tax: goalReturn.tax,
        slabRate: goalReturn.slabRate,
        inflationPct: 0,
        includeInflation: false,
      }),
    [goalResult.monthlyNeeded, JSON.stringify(goalInput)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const emi = calculateEMI(emiData);
  const prepayResult = simulatePrepayment({ ...emiData, ...prepay });
  const hasPrepay = prepay.extraMonthly > 0 || prepay.lumpSum > 0;

  const swpResult = simulateSWP(swp);
  const withdrawalRate = safePercent(swp.monthlyWithdrawal * 12, swp.corpus);

  /* ------------------------------------------------ share with assistant */
  useEffect(() => {
    if (!onSnapshot) return;
    const tool = (['sip', 'goal', 'lumpsum', 'emi', 'swp'].includes(activeTab) ? activeTab : 'sip') as CalculatorTool;
    const snapshots: Record<CalculatorTool, Record<string, number>> = {
      sip: {
        monthlyInvestment: sip.monthly,
        yearlyStepUpPct: sip.stepUpPct,
        years: sip.years,
        assumedReturnPct: sipReturn.returnPct,
        fundCostPct: sipToggles.costs ? sipReturn.costPct : 0,
        inflationPct: sipToggles.inflation ? sipToggles.inflationPct : 0,
        totalInvested: sipResult.invested,
        headlineValue: sipResult.headlineValue,
        lostToFundCosts: sipResult.costDrag,
        taxOnWithdrawal: sipResult.tax,
        inHand: sipResult.inHand,
        inTodaysMoney: sipResult.todaysMoney,
        lowCaseTodaysMoney: sipRange.low,
        highCaseTodaysMoney: sipRange.high,
      },
      lumpsum: {
        lumpsum: lump.amount,
        years: lump.years,
        assumedReturnPct: lumpReturn.returnPct,
        fundCostPct: lumpToggles.costs ? lumpReturn.costPct : 0,
        headlineValue: lumpResult.headlineValue,
        lostToFundCosts: lumpResult.costDrag,
        taxOnWithdrawal: lumpResult.tax,
        inHand: lumpResult.inHand,
        inTodaysMoney: lumpResult.todaysMoney,
      },
      goal: {
        goalCostToday: goal.costToday,
        years: goal.years,
        goalInflationPct: goal.goalInflationPct,
        goalCostOnDate: goalResult.targetFuture,
        alreadySaved: goal.alreadySaved,
        assumedReturnPct: goalReturn.returnPct,
        yearlyStepUpPct: goal.stepUpPct,
        startingMonthlySipNeeded: goalResult.monthlyNeeded,
        monthlySipNeededWithoutStepUp: goalResult.monthlyNeededFlat,
        totalYouWillInvest: goalResult.totalInvested,
      },
      emi: {
        loanAmount: emiData.loanAmount,
        interestRatePct: emiData.interestRate,
        tenureYears: emiData.tenure,
        monthlyEmi: emi.emi,
        totalInterest: emi.totalInterest,
        extraMonthlyPrepayment: prepay.extraMonthly,
        oneTimePrepayment: prepay.lumpSum,
        interestSavedByPrepaying: prepayResult.interestSaved,
        monthsSavedByPrepaying: prepayResult.monthsSaved,
      },
      swp: {
        corpus: swp.corpus,
        firstYearMonthlyWithdrawal: swp.monthlyWithdrawal,
        yearlyWithdrawalIncreasePct: swp.increasePct,
        assumedReturnPct: swp.returnPct,
        horizonYears: swp.years,
        monthsMoneyLasts: swpResult.monthsLasted,
        balanceAtEnd: swpResult.balanceAtEnd,
        totalWithdrawn: swpResult.totalWithdrawn,
      },
    };
    onSnapshot({ tool, figures: snapshots[tool] });
  }, [activeTab, sipResult, lumpResult, goalResult, emi.emi, prepayResult.interestSaved, swpResult.monthsLasted, swpResult.balanceAtEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const grid = 'grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]';

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <header className="max-w-2xl">
          <h2 className="t-h2 text-ink">Calculators</h2>
          <p className="t-body mt-3">
            Most calculators stop at the flattering number. These go on to subtract fund costs and tax, and show what the
            money is worth in today’s rupees, so you see what you will actually be able to buy.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={onTabChange} className="mt-10 w-full">
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <TabsList className="grid w-full min-w-[520px] max-w-2xl grid-cols-5">
              <TabsTrigger value="sip">Monthly SIP</TabsTrigger>
              <TabsTrigger value="goal">Goal planner</TabsTrigger>
              <TabsTrigger value="lumpsum">One-time</TabsTrigger>
              <TabsTrigger value="emi">Loan / EMI</TabsTrigger>
              <TabsTrigger value="swp">Withdrawals</TabsTrigger>
            </TabsList>
          </div>

          {/* ---------------------------------------------------------- SIP */}
          <TabsContent value="sip" className="mt-8">
            <div className={grid}>
              <Card title="Your monthly plan">
                <div className="mt-6 space-y-7">
                  <Field
                    id="sip-amount"
                    money
                    label="Invest every month"
                    value={sip.monthly}
                    min={500}
                    max={200000}
                    step={500}
                    onChange={(v) => setSip({ ...sip, monthly: clampNumber(v, 500, 200000, sip.monthly) })}
                  />
                  <Field
                    id="sip-duration"
                    label="For how many years"
                    value={sip.years}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(v) => setSip({ ...sip, years: clampNumber(v, 1, 40, sip.years) })}
                  />
                  <Field
                    id="sip-stepup"
                    label="Increase it each year by"
                    value={sip.stepUpPct}
                    min={0}
                    max={25}
                    step={1}
                    suffix="%"
                    hint="e.g. with each salary hike"
                    onChange={(v) => setSip({ ...sip, stepUpPct: clampNumber(v, 0, 25, sip.stepUpPct) })}
                  />
                  <ReturnInputs idPrefix="sip" state={sipReturn} onChange={setSipReturn} />
                  <HonestSwitches idPrefix="sip" value={sipToggles} onChange={setSipToggles} />
                </div>
              </Card>

              <div className="space-y-6">
                <HonestResult result={sipResult} toggles={sipToggles} range={sipRange} returnPct={sipReturn.returnPct} years={sip.years} />
                <GrowthChart
                  title="Growth over time"
                  subtitle="After fund costs, before tax"
                  data={sipResult.yearly}
                  xKey="year"
                  formatValue={inr}
                  formatAxis={compactInr}
                  series={[
                    { key: 'invested', name: 'You put in', color: 'var(--series-1)' },
                    { key: 'value', name: 'Value', color: 'var(--series-2)' },
                    ...(sipToggles.inflation ? [{ key: 'real', name: 'Value in today’s money', color: 'var(--accent)', dashed: true }] : []),
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          {/* --------------------------------------------------------- Goal */}
          <TabsContent value="goal" className="mt-8">
            <div className={grid}>
              <Card title="Your goal">
                <div className="mt-6 space-y-7">
                  <fieldset>
                    <legend className="text-sm text-ink-2">What are you saving for?</legend>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {GOAL_TEMPLATES.map((t) => {
                        const active = goalTemplate === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              setGoalTemplate(t.id);
                              setGoal({ ...goal, costToday: t.cost, years: t.years, goalInflationPct: t.inflation });
                              if (t.years < 5) {
                                const debt = REFERENCE_RATES.find((r) => r.id === 'debt')!;
                                setGoalReturn({ ...goalReturn, presetId: 'debt', returnPct: debt.rate, costPct: debt.defaultCost, tax: debt.tax });
                              } else {
                                setGoalReturn({ ...DEFAULT_RETURN, slabRate: goalReturn.slabRate });
                              }
                            }}
                            className={`rounded-full border px-3 py-1.5 text-[0.8125rem] transition-colors duration-[120ms] ${
                              active ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line-2 text-ink-2 hover:border-accent hover:text-accent'
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <Field
                    id="goal-cost"
                    money
                    label="What it costs today"
                    value={goal.costToday}
                    min={50000}
                    max={50000000}
                    step={50000}
                    onChange={(v) => setGoal({ ...goal, costToday: clampNumber(v, 50000, 50000000, goal.costToday) })}
                  />
                  <Field
                    id="goal-years"
                    label="Years until you need it"
                    value={goal.years}
                    min={1}
                    max={35}
                    step={1}
                    onChange={(v) => setGoal({ ...goal, years: clampNumber(v, 1, 35, goal.years) })}
                  />
                  <Field
                    id="goal-infl"
                    label="Its cost rises each year by"
                    value={goal.goalInflationPct}
                    min={0}
                    max={15}
                    step={0.5}
                    suffix="%"
                    hint={goalTemplate === 'education' ? 'education usually rises faster than prices' : undefined}
                    onChange={(v) => setGoal({ ...goal, goalInflationPct: clampNumber(v, 0, 15, goal.goalInflationPct) })}
                  />
                  <Field
                    id="goal-saved"
                    money
                    label="Already saved for it"
                    value={goal.alreadySaved}
                    min={0}
                    max={50000000}
                    step={10000}
                    onChange={(v) => setGoal({ ...goal, alreadySaved: clampNumber(v, 0, 50000000, goal.alreadySaved) })}
                  />
                  <Field
                    id="goal-stepup"
                    label="Increase your SIP each year by"
                    value={goal.stepUpPct}
                    min={0}
                    max={25}
                    step={1}
                    suffix="%"
                    onChange={(v) => setGoal({ ...goal, stepUpPct: clampNumber(v, 0, 25, goal.stepUpPct) })}
                  />
                  <ReturnInputs idPrefix="goal" state={goalReturn} onChange={setGoalReturn} />
                </div>
              </Card>

              <div className="space-y-6">
                <Card>
                  <span className="t-label">Start investing</span>
                  {goalResult.monthlyNeeded > 0 ? (
                    <>
                      <div className="t-figure mt-2 text-[2.5rem] text-ink">
                        {inr(goalResult.monthlyNeeded)}
                        <span className="text-xl text-ink-3"> / month</span>
                      </div>
                      <p className="mt-1.5 text-sm text-ink-2">
                        {goal.stepUpPct > 0
                          ? `and raise it by ${goal.stepUpPct}% every year. Without the yearly increase you would need ${inr(goalResult.monthlyNeededFlat)} a month from day one.`
                          : 'every month, the same amount throughout.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="t-figure mt-2 text-[2.5rem] text-pos">Covered</div>
                      <p className="mt-1.5 text-sm text-ink-2">What you have already saved should grow enough on its own, at these assumptions.</p>
                    </>
                  )}

                  <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-ink-2">Costs today</dt>
                      <dd className="tabular text-ink">{inr(goal.costToday)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-ink-2">Will cost in {goal.years} years ({goal.goalInflationPct}% a year)</dt>
                      <dd className="tabular font-semibold text-ink">{inr(goalResult.targetFuture)}</dd>
                    </div>
                    {goal.alreadySaved > 0 && (
                      <div className="flex items-baseline justify-between gap-4 py-2.5">
                        <dt className="text-ink-2">Your savings will grow to</dt>
                        <dd className="tabular text-ink">{inr(goalResult.savedGrowsTo)}</dd>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-ink-2">Total you will invest</dt>
                      <dd className="tabular text-ink">{inr(goalResult.totalInvested)}</dd>
                    </div>
                  </dl>
                  <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-3">
                    The amount is worked out so the goal is met <em>after</em> fund costs and tax at {goalReturn.returnPct}% a year.
                    {goal.years < 5 && goalReturn.tax === 'equity'
                      ? ' For goals under 5 years, equity funds can be well below their average when you need the money.'
                      : ''}{' '}
                    Illustration only, not investment advice.
                  </p>
                </Card>
                <GrowthChart
                  title="Path to your goal"
                  subtitle="Value after fund costs, before tax"
                  data={goalPath.yearly.map((row) => ({ ...row, target: goalResult.targetFuture }))}
                  xKey="year"
                  formatValue={inr}
                  formatAxis={compactInr}
                  series={[
                    { key: 'invested', name: 'You put in', color: 'var(--series-1)' },
                    { key: 'value', name: 'Value', color: 'var(--series-2)' },
                    { key: 'target', name: 'Goal', color: 'var(--accent)', dashed: true },
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          {/* ------------------------------------------------------ Lumpsum */}
          <TabsContent value="lumpsum" className="mt-8">
            <div className={grid}>
              <Card title="One-time investment">
                <div className="mt-6 space-y-7">
                  <Field
                    id="lump-amount"
                    money
                    label="Amount invested once"
                    value={lump.amount}
                    min={5000}
                    max={50000000}
                    step={5000}
                    onChange={(v) => setLump({ ...lump, amount: clampNumber(v, 5000, 50000000, lump.amount) })}
                  />
                  <Field
                    id="lump-years"
                    label="Left invested for (years)"
                    value={lump.years}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(v) => setLump({ ...lump, years: clampNumber(v, 1, 40, lump.years) })}
                  />
                  <ReturnInputs idPrefix="lump" state={lumpReturn} onChange={setLumpReturn} />
                  <HonestSwitches idPrefix="lump" value={lumpToggles} onChange={setLumpToggles} />
                </div>
              </Card>
              <div className="space-y-6">
                <HonestResult result={lumpResult} toggles={lumpToggles} range={lumpRange} returnPct={lumpReturn.returnPct} years={lump.years} />
                <GrowthChart
                  title="Growth over time"
                  subtitle="After fund costs, before tax"
                  data={lumpResult.yearly}
                  xKey="year"
                  formatValue={inr}
                  formatAxis={compactInr}
                  series={[
                    { key: 'invested', name: 'You put in', color: 'var(--series-1)' },
                    { key: 'value', name: 'Value', color: 'var(--series-2)' },
                    ...(lumpToggles.inflation ? [{ key: 'real', name: 'Value in today’s money', color: 'var(--accent)', dashed: true }] : []),
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          {/* ---------------------------------------------------------- EMI */}
          <TabsContent value="emi" className="mt-8">
            <div className={grid}>
              <div className="space-y-6">
                <Card title="Your loan">
                  <div className="mt-6 space-y-7">
                    <Field
                      id="emi-amount"
                      money
                      label="Loan amount"
                      value={emiData.loanAmount}
                      min={50000}
                      max={50000000}
                      step={50000}
                      onChange={(v) => setEmiData({ ...emiData, loanAmount: clampNumber(v, 50000, 50000000, emiData.loanAmount) })}
                    />
                    <Field
                      id="emi-rate"
                      label="Interest rate (per year)"
                      value={emiData.interestRate}
                      min={1}
                      max={36}
                      step={0.05}
                      suffix="%"
                      hint="home ≈ 7.5–9.5%, personal ≈ 11–24%"
                      onChange={(v) => setEmiData({ ...emiData, interestRate: clampNumber(v, 1, 36, emiData.interestRate) })}
                    />
                    <Field
                      id="emi-tenure"
                      label="Tenure (years)"
                      value={emiData.tenure}
                      min={1}
                      max={30}
                      step={1}
                      onChange={(v) => setEmiData({ ...emiData, tenure: clampNumber(v, 1, 30, emiData.tenure) })}
                    />
                  </div>
                  <div className="mt-8 border-t border-line pt-5">
                    <span className="t-label">Monthly EMI</span>
                    <div className="t-figure mt-1.5 text-3xl text-ink">{inr(emi.emi)}</div>
                  </div>
                </Card>

                <Card title="Pay it off faster">
                  <p className="mt-1.5 text-[0.8125rem] text-ink-3">Keeps the EMI the same and shortens the loan, which is how most lenders apply prepayments.</p>
                  <div className="mt-6 space-y-7">
                    <Field
                      id="prepay-monthly"
                      money
                      label="Extra every month"
                      value={prepay.extraMonthly}
                      min={0}
                      max={200000}
                      step={500}
                      onChange={(v) => setPrepay({ ...prepay, extraMonthly: clampNumber(v, 0, 200000, prepay.extraMonthly) })}
                    />
                    <Field
                      id="prepay-lump"
                      money
                      label="One-time prepayment"
                      value={prepay.lumpSum}
                      min={0}
                      max={emiData.loanAmount}
                      step={10000}
                      onChange={(v) => setPrepay({ ...prepay, lumpSum: clampNumber(v, 0, emiData.loanAmount, prepay.lumpSum) })}
                    />
                    {prepay.lumpSum > 0 && (
                      <Field
                        id="prepay-year"
                        label="Made at the start of year"
                        value={prepay.lumpSumYear}
                        min={1}
                        max={emiData.tenure}
                        step={1}
                        onChange={(v) => setPrepay({ ...prepay, lumpSumYear: clampNumber(v, 1, emiData.tenure, prepay.lumpSumYear) })}
                      />
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <span className="t-label">What this loan really costs</span>
                  <div className="t-figure mt-2 text-[2.5rem] text-ink">{inr(emi.totalInterest)}</div>
                  <p className="mt-1.5 text-sm text-ink-2">
                    in interest, on top of the {inr(emiData.loanAmount)} you borrow. That is{' '}
                    <span className="font-medium text-ink">{safePercent(emi.totalInterest, emiData.loanAmount).toFixed(0)}% extra</span>; you repay{' '}
                    {inr(emi.totalAmount)} in all.
                  </p>
                  <div className="mt-6 flex h-2.5 gap-[2px] overflow-hidden rounded-full">
                    <div className="rounded-l-full bg-series-1" style={{ width: `${safePercent(emiData.loanAmount, emi.totalAmount)}%` }} />
                    <div className="rounded-r-full bg-series-2" style={{ width: `${safePercent(emi.totalInterest, emi.totalAmount)}%` }} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-6 text-[0.8125rem]">
                    <div className="flex items-center gap-1.5 text-ink-3">
                      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-series-1" /> Principal {inr(emiData.loanAmount)}
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-3">
                      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-series-2" /> Interest {inr(emi.totalInterest)}
                    </div>
                  </dl>

                  {hasPrepay && (
                    <div className="mt-6 rounded-md bg-accent-soft p-4">
                      <p className="text-sm text-ink">
                        Prepaying saves <span className="font-semibold text-accent">{inr(prepayResult.interestSaved)}</span> in interest and ends the loan{' '}
                        <span className="font-semibold text-accent">{yearsMonths(prepayResult.monthsSaved)}</span> early, in{' '}
                        {yearsMonths(prepayResult.newMonths)} instead of {yearsMonths(prepayResult.baseMonths)}.
                      </p>
                    </div>
                  )}
                  <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-3">
                    Assumes a fixed rate for the whole tenure. Floating-rate loans change as rates move. Check your lender’s prepayment
                    terms; floating-rate home loans to individuals usually carry no prepayment charge.
                  </p>
                </Card>
                <GrowthChart
                  title="Principal vs interest paid each year"
                  data={generateEMIChartData(emiData).map((row, i) => ({ ...row, year: i + 1 }))}
                  xKey="year"
                  formatValue={inr}
                  formatAxis={compactInr}
                  series={[
                    { key: 'principal', name: 'Principal', color: 'var(--series-1)' },
                    { key: 'interest', name: 'Interest', color: 'var(--series-2)' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          {/* ---------------------------------------------------------- SWP */}
          <TabsContent value="swp" className="mt-8">
            <div className={grid}>
              <Card title="Living off your savings">
                <p className="mt-1.5 text-[0.8125rem] text-ink-3">For retirement or any regular payout: how long does a lump sum last if you withdraw every month?</p>
                <div className="mt-6 space-y-7">
                  <Field
                    id="swp-corpus"
                    money
                    label="Money you start with"
                    value={swp.corpus}
                    min={100000}
                    max={200000000}
                    step={100000}
                    onChange={(v) => setSwp({ ...swp, corpus: clampNumber(v, 100000, 200000000, swp.corpus) })}
                  />
                  <Field
                    id="swp-withdraw"
                    money
                    label="Withdraw every month"
                    value={swp.monthlyWithdrawal}
                    min={1000}
                    max={2000000}
                    step={1000}
                    onChange={(v) => setSwp({ ...swp, monthlyWithdrawal: clampNumber(v, 1000, 2000000, swp.monthlyWithdrawal) })}
                  />
                  <Field
                    id="swp-increase"
                    label="Raise the withdrawal each year by"
                    value={swp.increasePct}
                    min={0}
                    max={12}
                    step={0.5}
                    suffix="%"
                    hint="to keep up with prices"
                    onChange={(v) => setSwp({ ...swp, increasePct: clampNumber(v, 0, 12, swp.increasePct) })}
                  />
                  <Field
                    id="swp-return"
                    label="Return on what is left"
                    value={swp.returnPct}
                    min={0}
                    max={15}
                    step={0.1}
                    suffix="%"
                    hint="a cautious, mostly-debt mix is often 7–8%"
                    onChange={(v) => setSwp({ ...swp, returnPct: clampNumber(v, 0, 15, swp.returnPct) })}
                  />
                  <Field
                    id="swp-years"
                    label="Needs to last (years)"
                    value={swp.years}
                    min={1}
                    max={45}
                    step={1}
                    onChange={(v) => setSwp({ ...swp, years: clampNumber(v, 1, 45, swp.years) })}
                  />
                </div>
              </Card>
              <div className="space-y-6">
                <Card>
                  <span className="t-label">{swpResult.ranOut ? 'Runs out after' : `Lasts the full ${swp.years} years`}</span>
                  <div className={`t-figure mt-2 text-[2.5rem] ${swpResult.ranOut ? 'text-neg' : 'text-pos'}`}>
                    {swpResult.ranOut ? yearsMonths(swpResult.monthsLasted) : inr(swpResult.balanceAtEnd)}
                  </div>
                  <p className="mt-1.5 text-sm text-ink-2">
                    {swpResult.ranOut
                      ? `That is ${yearsMonths(swp.years * 12 - swpResult.monthsLasted)} short of the ${swp.years} years you need.`
                      : `left over at the end, after withdrawing ${inr(swpResult.totalWithdrawn)} in total.`}
                  </p>
                  <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-2">
                    You are taking out <span className="tabular font-medium text-ink">{withdrawalRate.toFixed(1)}%</span> of your savings in the first
                    year. {withdrawalRate > 6 ? 'Above roughly 4–5% a year, savings meant to last decades are at real risk of running out.' : 'Lower withdrawal rates leave room for bad market years.'}
                  </p>
                  <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-3">
                    Assumes the same return every year and ignores tax on withdrawals. A run of bad years early on shortens this.
                    Illustration only.
                  </p>
                </Card>
                <GrowthChart
                  title="What is left each year"
                  data={swpResult.yearly}
                  xKey="year"
                  formatValue={inr}
                  formatAxis={compactInr}
                  series={[
                    { key: 'balance', name: 'Money left', color: 'var(--series-1)' },
                    { key: 'withdrawn', name: 'Withdrawn so far', color: 'var(--series-2)' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reference figures used above */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="t-h3 text-ink">Where the rates come from</h3>
            <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
              {REFERENCE_RATES.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {r.label}{' '}
                      {r.kind === 'assumption' && (
                        <span className="ml-1 rounded-sm bg-secondary px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-3">Assumption</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-3">{r.source}</p>
                  </div>
                  <span className="t-figure text-base text-ink">{r.rate}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.75rem] text-ink-3">Last checked {new Date(RATES_AS_OF).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.</p>
          </div>
          <div>
            <h3 className="t-h3 text-ink">Equity fund categories over long periods</h3>
            <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
              {CATEGORY_RANGES.map((cat) => (
                <li key={cat.type} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{cat.type}</p>
                    <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-3">{cat.description}</p>
                  </div>
                  <span className="t-figure text-base text-ink">{cat.rate}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-3">
              Rough ranges over full market cycles, to sanity-check an assumption. Any single year can be far lower, including
              negative. Mutual fund investments are subject to market risks; read all scheme-related documents carefully.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

