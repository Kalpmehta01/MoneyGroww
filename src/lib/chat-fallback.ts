/**
 * Offline, rule-based answers for the assistant.
 *
 * Used only when the AI backend (netlify/functions/chat.js -> Groq) cannot be
 * reached: plain `vite dev` without `netlify dev`, a missing GROQ_API_KEY,
 * rate limiting, or a network failure. Keeps the assistant useful instead of
 * showing an error.
 */

export function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (/\b(hello|hi|hey)\b/.test(lowerMessage)) {
    return "Hello! Great to see you're taking charge of your financial future! I can help you with investment strategies, financial planning, calculator usage, and much more. What specific topic would you like to explore?";
  } else if (lowerMessage.includes('sip')) {
    return 'SIP (Systematic Investment Plan) is a fantastic way to build wealth!\n\nKey benefits:\n• Rupee cost averaging reduces market volatility impact\n• Disciplined investing builds long-term wealth\n• Start with as little as ₹500 per month\n• Power of compounding works in your favor\n\nWould you like me to guide you to our SIP calculator to see potential returns?';
  } else if (lowerMessage.includes('compound')) {
    return "Compound interest is truly the eighth wonder of the world!\n\nHere's how it works:\n• You earn returns on your initial investment\n• You also earn returns on previous returns\n• Time is your biggest ally - start early!\n• Even small amounts can grow significantly\n\nExample: ₹5,000 monthly SIP at 12% for 20 years = ₹49.9 lakhs (you invest only ₹12 lakhs)!";
  } else if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
    return "Perfect time to start your investment journey!\n\nBeginner-friendly steps:\n1. Build emergency fund (6-12 months expenses)\n2. Start SIP in diversified equity mutual funds\n3. Begin with amount you're comfortable with\n4. Increase SIP by 10-15% annually\n5. Stay invested for long term (5+ years)\n\nRecommended allocation:\n• 70% Equity funds (growth)\n• 20% Debt funds (stability)\n• 10% Gold/REIT (diversification)";
  } else if (lowerMessage.includes('emi')) {
    return 'EMI planning is crucial for healthy finances!\n\nKey points:\n• EMI should not exceed 40% of monthly income\n• Choose appropriate tenure (longer = lower EMI, higher interest)\n• Compare interest rates from different lenders\n• Consider prepayment options\n\nOur EMI calculator can help you:\n• Calculate monthly payments\n• Compare different loan options\n• Plan prepayment strategies\n\nWould you like to try our EMI calculator?';
  } else if (lowerMessage.includes('tax')) {
    return 'Smart tax planning can boost your wealth!\n\nSection 80C options (₹1.5L limit):\n• ELSS Mutual Funds (3-year lock, growth potential)\n• PPF (15-year lock, tax-free returns)\n• EPF (retirement planning)\n• Tax-saving FDs (5-year lock)\n\nELSS is often preferred because:\n• Shortest lock-in period\n• Market-linked returns\n• Professional management\n• Beat inflation over time';
  } else if (lowerMessage.includes('emergency')) {
    return "Emergency fund is your financial safety net!\n\nIdeal emergency fund:\n• 6-12 months of monthly expenses\n• Keep in liquid instruments\n• Easily accessible without penalties\n\nWhere to park emergency fund:\n• Savings account (instant access)\n• Liquid mutual funds (1-day access)\n• Short-term FDs (higher returns)\n\nDon't invest emergency fund in:\n• Equity markets (volatile)\n• Long-term FDs (penalty on early withdrawal)\n• Real estate (illiquid)";
  } else if (lowerMessage.includes('goal') || lowerMessage.includes('planning')) {
    return "Goal-based investing is the key to success!\n\nStep-by-step planning:\n1. List your goals (house, education, retirement)\n2. Estimate required amount\n3. Set timeline for each goal\n4. Calculate monthly investment needed\n5. Choose appropriate investment instruments\n\nGoal timeline strategy:\n• Short-term (1-3 years): Debt funds, FDs\n• Medium-term (3-7 years): Balanced funds\n• Long-term (7+ years): Equity funds\n\nWhat's your primary financial goal? I can help you plan for it!";
  } else if (lowerMessage.includes('mutual fund')) {
    return 'Mutual funds are excellent wealth-building tools!\n\nTypes of mutual funds:\n• Equity funds (growth potential, higher risk)\n• Debt funds (stability, lower risk)\n• Hybrid funds (balanced approach)\n• Index funds (market returns, low cost)\n\nAdvantages:\n• Professional management\n• Diversification\n• Low minimum investment\n• Liquidity\n• Transparency\n\nFor beginners, start with:\n• Large-cap funds (stability)\n• Diversified equity funds\n• SIP mode for rupee cost averaging';
  } else if (lowerMessage.includes('risk')) {
    return "Understanding and managing risk is crucial!\n\nTypes of investment risks:\n• Market risk (price fluctuations)\n• Inflation risk (reduced purchasing power)\n• Credit risk (default by borrower)\n• Liquidity risk (unable to sell quickly)\n\nRisk management strategies:\n• Diversify across asset classes\n• Don't put all eggs in one basket\n• Invest for appropriate time horizon\n• Regular portfolio review and rebalancing\n• Never invest money you need in next 5 years in equity";
  } else if (lowerMessage.includes('50-30-20') || lowerMessage.includes('rule')) {
    return "The 50-30-20 rule is a simple budgeting framework!\n\nHere's the breakdown:\n• 50% for NEEDS (rent, groceries, utilities, EMIs)\n• 30% for WANTS (entertainment, dining out, shopping)\n• 20% for SAVINGS & INVESTMENTS\n\nThe 20% savings should be further divided:\n• Emergency fund building\n• Goal-based investments\n• Retirement planning\n• Insurance premiums\n\nThis rule ensures balanced financial life while building wealth systematically!";
  } else if (lowerMessage.includes('retirement')) {
    return 'Retirement planning should start early!\n\nRetirement corpus calculation:\n• Current monthly expenses × 12 × 25-30\n• Account for inflation (6-8% annually)\n• Consider healthcare costs\n\nExample: ₹50,000 monthly expenses today\n• In 30 years: ₹3.24 lakhs monthly (at 6% inflation)\n• Required corpus: ₹9.7 crores\n• Monthly SIP needed: ₹25,000 (at 12% returns)\n\nStart early to benefit from compounding! Our calculators can help you plan better.';
  } else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
    return "You're absolutely welcome! I'm here to support your financial journey. Remember:\n\n• Start early, stay consistent\n• Every small step counts\n• Focus on long-term wealth building\n• Review and adjust regularly\n\nFeel free to ask anything about investments, financial planning, or use our calculators. Your financial success is my priority!";
  } else if (lowerMessage.includes('calculator')) {
    return 'Our calculators are powerful tools for financial planning!\n\nAvailable calculators:\n• SIP Calculator - Plan systematic investments\n• Mutual Fund Calculator - Lumpsum returns\n• EMI Calculator - Loan planning\n\nEach calculator provides:\n• Accurate projections\n• Visual charts for better understanding\n• Different scenarios comparison\n\nWould you like me to guide you to a specific calculator?';
  } else if (/\b(little|small)\b.*\b(amount|anount)\b/.test(lowerMessage) && lowerMessage.includes('high return')) {
    return "Aiming for high returns with a small amount requires a strategic approach!\n\nWhile higher returns naturally come with higher risk, you can maximize your small investments through:\n1. Small Cap Mutual Funds: Historically offer higher growth potential over 7+ years.\n2. Micro-SIPs: Start with just ₹100 or ₹500/month consistently.\n3. Direct Equity (Fractional Shares/Penny Stocks): High risk, requires deep research.\n\nRecommended Resources:\n• Check out our SIP Calculator to see the power of compounding on small amounts over time.\n• Read 'The Psychology of Money' for mindset strategies on small compounding.\n\n*Note: Never fall for 'get-rich-quick' schemes promising guaranteed high returns.*";
  } else {
    // Removed 'capital' to avoid false positives with cities/countries
    const financeKeywords = [
      'invest',
      'return',
      'sip',
      'mutual fund',
      'emi',
      'loan',
      'tax',
      'save',
      'money',
      'finance',
      'retirement',
      'compound',
      'stock',
      'market',
      'goal',
      'budget',
      'emergency',
      'portfolio',
      'asset',
      'wealth',
      'bank',
      'interest',
      'share',
      'dividend',
      'nifty',
      'sensex',
      'trading',
      'crypto',
      'amount',
      'rupee',
    ];

    const isFinanceRelated = financeKeywords.some((keyword) => new RegExp(`\\b${keyword}`).test(lowerMessage));

    if (!isFinanceRelated && !/\b(help|calculator)\b/.test(lowerMessage)) {
      return "I am MoneyGroww's specialized AI Financial Assistant. I am programmed strictly to assist with personal finance, investments, calculators, and money management. Please ask me a finance-related question!";
    }

    const responses = [
      "That's an interesting question! Let me help you with that. Financial planning involves understanding your goals, risk appetite, and time horizon. What specific aspect would you like to explore?",
      'Great question! In personal finance, the key principles are: start early, invest regularly, diversify wisely, and stay patient. Which area would you like to dive deeper into?',
      "I'd love to help you with that! Financial success comes from consistent planning and smart decisions. Could you be more specific about what you'd like to learn?",
      "Excellent! Every financial journey is unique. The best approach depends on your goals, timeline, and risk tolerance. What's your primary financial concern right now?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
