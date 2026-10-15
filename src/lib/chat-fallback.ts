/**
 * Offline, rule-based answers for the assistant.
 *
 * Used only when the AI backend (netlify/functions/chat.js -> Groq) cannot be
 * reached: plain `vite dev` without `netlify dev`, a missing GROQ_API_KEY,
 * rate limiting, or a network failure.
 *
 * Same rules as the AI: explain, never recommend a product or allocation,
 * and every rupee figure is computed by the tested finance code.
 */

import { honestProjection, calculateSIP } from './finance';
import { inr } from './format';
import type { CalcSnapshot } from '../components/calculators';

const compounding = calculateSIP({ monthlyInvestment: 5000, returnRate: 12, duration: 20 });
const honest20 = honestProjection({ monthly: 5000, years: 20, returnPct: 12, costPct: 1, tax: 'equity', inflationPct: 6 });

function explainSnapshot(s: CalcSnapshot): string {
  const f = s.figures;
  switch (s.tool) {
    case 'sip':
      return `Here is what your SIP numbers mean:\n\n- You put in **${inr(f.totalInvested)}** over ${f.years} years.\n- At an assumed ${f.assumedReturnPct}% a year, the usual headline figure is **${inr(f.headlineValue)}**.\n- Fund costs take about ${inr(f.lostToFundCosts)} and tax on withdrawal about ${inr(f.taxOnWithdrawal)}, leaving **${inr(f.inHand)}** in your hand.\n- Because prices rise, that buys what **${inr(f.inTodaysMoney)}** buys today.\n\nReturns are never steady: the calculator’s range shows roughly ${inr(f.lowCaseTodaysMoney)} to ${inr(f.highCaseTodaysMoney)} in today’s money.`;
    case 'goal':
      return `Your goal costs ${inr(f.goalCostToday)} today and about **${inr(f.goalCostOnDate)}** in ${f.years} years at ${f.goalInflationPct}% a year.\n\nTo get there you would start with **${inr(f.startingMonthlySipNeeded)} a month**${f.yearlyStepUpPct > 0 ? ` and raise it ${f.yearlyStepUpPct}% each year (without the yearly increase: ${inr(f.monthlySipNeededWithoutStepUp)} a month)` : ''}. That already allows for fund costs and tax at an assumed ${f.assumedReturnPct}% return.`;
    case 'lumpsum':
      return `Your one-time ${inr(f.lumpsum)} is shown growing to ${inr(f.headlineValue)} at ${f.assumedReturnPct}% over ${f.years} years. After fund costs and tax you would have about **${inr(f.inHand)}**, which buys what **${inr(f.inTodaysMoney)}** buys today.`;
    case 'emi':
      return `On a ${inr(f.loanAmount)} loan at ${f.interestRatePct}% for ${f.tenureYears} years, the EMI is **${inr(f.monthlyEmi)}** and you pay **${inr(f.totalInterest)}** in interest on top of the loan.${f.interestSavedByPrepaying > 0 ? `\n\nYour prepayment plan saves about **${inr(f.interestSavedByPrepaying)}** and ends the loan ${Math.floor(f.monthsSavedByPrepaying / 12)} years ${f.monthsSavedByPrepaying % 12} months early.` : '\n\nExtra payments early in the loan save the most interest. Try the “Pay it off faster” box.'}`;
    case 'swp':
      return f.monthsMoneyLasts >= f.horizonYears * 12
        ? `Withdrawing ${inr(f.firstYearMonthlyWithdrawal)} a month (rising ${f.yearlyWithdrawalIncreasePct}% a year) from ${inr(f.corpus)}, the money lasts the full ${f.horizonYears} years with about **${inr(f.balanceAtEnd)}** left, assuming a steady ${f.assumedReturnPct}% return.`
        : `Withdrawing ${inr(f.firstYearMonthlyWithdrawal)} a month (rising ${f.yearlyWithdrawalIncreasePct}% a year) from ${inr(f.corpus)}, the money runs out after about **${Math.floor(f.monthsMoneyLasts / 12)} years ${f.monthsMoneyLasts % 12} months**, short of the ${f.horizonYears} years you set. Lower withdrawals or a longer working life close the gap.`;
  }
}

export function getFallbackResponse(userMessage: string, snapshot?: CalcSnapshot | null): string {
  const q = userMessage.toLowerCase();

  if (snapshot && /(my|this|result|number|calculator|explain)/.test(q) && /(explain|mean|result|number|why)/.test(q)) {
    return explainSnapshot(snapshot);
  }
  if (/today.?s money|lower|inflation/.test(q)) {
    return `Prices rise every year, so a rupee later buys less than a rupee now. At 6% inflation, ₹1,00,000 in 10 years buys what about ₹55,800 buys today.\n\nThat is why the calculators show a “today’s money” figure: it tells you what the future amount can actually pay for.`;
  }
  if (/step.?up/.test(q)) {
    return 'A step-up SIP raises your monthly investment by a fixed percentage each year, often in line with salary hikes. Because the larger instalments still have years to compound, a 10% yearly step-up can lift the final amount a lot while starting small. Try the “Increase it each year by” slider.';
  }
  if (/expense ratio|fund cost|ter\b/.test(q)) {
    return 'The expense ratio is the yearly fee a mutual fund charges, taken out of the fund’s value every day. It looks small, but it compounds: on a 10-year SIP, 1% a year can take roughly 5–6% of the final value. The same fund’s direct plan usually costs less than its regular plan.';
  }
  if (/emergency/.test(q)) {
    return 'An emergency fund covers about 6 months of essential expenses (rent, food, EMIs, insurance, school fees). Keep it somewhere safe and quick to reach, such as a savings account, sweep FD or liquid fund, and build it before taking market risk. The Goal planner can tell you how much to set aside each month.';
  }
  if (/regime|80c|tax/.test(q)) {
    return 'India has two income-tax regimes. The **new regime** (the default) has lower slab rates but almost no deductions. The **old regime** has higher rates but lets you deduct things like PPF, ELSS and EPF (up to ₹1.5 lakh), home-loan interest and health insurance.\n\nWhich is better depends on how many deductions you actually use. Most salaried people with few deductions pay less under the new regime. A tax professional can compare both for your exact income.';
  }
  if (/compound/.test(q)) {
    return `Compounding means your returns start earning returns of their own. ₹5,000 a month for 20 years is ₹12 lakh put in; at an assumed 12% a year the usual calculator shows ${inr(compounding.finalAmount)}.\n\nAfter a 1% fund cost, tax and 6% inflation, that is about ${inr(honest20.todaysMoney)} in today’s money. Still far more than you put in, but less dramatic than the headline. Time does most of the work, so starting early matters more than starting big.`;
  }
  if (/sip/.test(q)) {
    return 'A SIP (systematic investment plan) invests a fixed amount in a mutual fund every month. Buying regularly means you buy more units when prices are low and fewer when high, and it builds the habit. A SIP is just a way of paying in; the fund you choose decides the risk.';
  }
  if (/emi|loan|prepay/.test(q)) {
    return 'An EMI repays a loan in equal monthly amounts. Early EMIs are mostly interest, so prepayments in the first few years save the most. A common rule of thumb is to keep all EMIs below about 40% of take-home pay. The Loan / EMI calculator shows the total interest and what prepaying saves.';
  }
  if (/50-30-20|budget/.test(q)) {
    return 'The 50-30-20 rule splits take-home pay into roughly 50% for needs (rent, groceries, EMIs), 30% for wants (eating out, shopping, trips) and 20% for saving and investing. On ₹40,000 that is about ₹20,000, ₹12,000 and ₹8,000. Treat it as a starting point and adjust to your city and family.';
  }
  if (/retire|swp|withdraw/.test(q)) {
    return 'For retirement, two numbers matter: how much you will spend each month (rising with prices), and how long the money must last. The Withdrawals calculator shows how long a given sum lasts at a chosen withdrawal. Withdrawing more than about 4–5% a year of your savings puts decades-long plans at risk.';
  }
  if (/best|which fund|recommend|should i (buy|invest)|stock/.test(q)) {
    return 'I can’t recommend a specific fund, stock or product, as that is personalised investment advice, which needs a SEBI-registered adviser. I can explain how to compare options: their costs, risk, lock-in and tax. Ask me about any of those.';
  }
  if (/\b(hello|hi|hey|namaste)\b/.test(q)) {
    return 'Hello. Ask me about saving, SIPs, loans, tax regimes or budgeting, or tap “Explain my calculator result” after using a calculator.';
  }
  return 'I can explain SIPs, step-ups, fund costs, loans and prepayment, tax regimes, emergency funds and budgeting. The AI service is offline right now, so try one of those topics, or open the calculators to run your own numbers.';
}
