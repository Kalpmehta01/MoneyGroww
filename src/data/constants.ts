// ─────────────────────────────────────────────────
// Centralized constants & data for MoneyGroww
// ─────────────────────────────────────────────────

// ── Navigation ──────────────────────────────────
export const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'calculators', label: 'Calculators' },
  { id: 'insights', label: 'Insights' },
  { id: 'chat', label: 'AI Assistant' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

// ── Live Ticker — Indian Companies ──────────────
export const INDIAN_COMPANIES = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'TCS' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
  { symbol: 'ITC.NS', name: 'ITC Ltd.' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro' },
] as const;

export const TICKER_POLL_INTERVAL_MS = 10_000;

// ── Hero Feature Cards ──────────────────────────
export const HERO_FEATURES = [
  {
    id: 'sip',
    iconName: 'Calculator' as const,
    title: 'SIP Calculator',
    description: 'Plan your systematic investment strategy with flexible options',
    navigateTo: 'sip',
  },
  {
    id: 'mutual-fund',
    iconName: 'TrendingUp' as const,
    title: 'Mutual Fund Estimator',
    description: 'Estimate returns on your investments accurately',
    navigateTo: 'mutual-fund',
  },
  {
    id: 'emi',
    iconName: 'PiggyBank' as const,
    title: 'EMI Calculator',
    description: 'Calculate loan EMIs and plan payments smartly',
    navigateTo: 'emi',
  },
  {
    id: 'insights',
    iconName: 'BarChart3' as const,
    title: 'Financial Insights',
    description: 'Get personalized growth recommendations for you',
    navigateTo: 'insights',
  },
] as const;

// ── Team Members ────────────────────────────────
export const TEAM_MEMBERS = [
  {
    name: 'Rahul Sharma',
    role: 'Financial Advisor',
    description: '10+ years experience in investment planning',
  },
  {
    name: 'Priya Patel',
    role: 'Product Manager',
    description: 'Expert in fintech product development',
  },
  {
    name: 'Amit Kumar',
    role: 'Data Analyst',
    description: 'Specialist in financial modeling and analysis',
  },
] as const;

// ── Footer ──────────────────────────────────────
export const QUICK_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'SIP Calculator', id: 'calculators' },
  { label: 'Mutual Fund Calculator', id: 'calculators' },
  { label: 'EMI Calculator', id: 'calculators' },
  { label: 'Insights', id: 'insights' },
  { label: 'About Us', id: 'about' },
  { label: 'Contact', id: 'contact' },
] as const;

export const SOCIAL_LINKS = [
  { name: 'LinkedIn', href: '#' },
  { name: 'Twitter', href: '#' },
  { name: 'Facebook', href: '#' },
  { name: 'Instagram', href: '#' },
] as const;

export const RESOURCE_LINKS = [
  'Investment Guide',
  'Financial Planning',
  'Tax Planning',
  'Retirement Planning',
  'Insurance Guide',
  'Market Analysis',
] as const;

export const LEGAL_LINKS = [
  'Privacy Policy',
  'Terms of Service',
  'Cookie Policy',
  'Disclaimer',
  'SEBI Guidelines',
  'Risk Disclosure',
] as const;

// ── Calculator Defaults & Limits ────────────────
export const CALCULATOR_LIMITS = {
  sip: {
    monthlyInvestment: { min: 500, max: 100_000, default: 5000 },
    returnRate: { min: 1, max: 30, default: 12 },
    duration: { min: 1, max: 40, default: 10 },
  },
  mutualFund: {
    lumpsumAmount: { min: 5_000, max: 5_000_000, default: 100_000 },
    growthRate: { min: 1, max: 30, default: 12 },
    time: { min: 1, max: 40, default: 10 },
  },
  emi: {
    loanAmount: { min: 50_000, max: 50_000_000, default: 1_000_000 },
    interestRate: { min: 1, max: 20, default: 8.5 },
    tenure: { min: 1, max: 30, default: 20 },
  },
} as const;

// ── Disclaimers ─────────────────────────────────
export const DISCLAIMERS = {
  investment:
    '⚠️ Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance is not indicative of future returns. The calculator provides estimates for illustrative purposes only.',
  emi:
    '⚠️ EMI calculations are approximate. Actual EMIs may vary based on lender terms, processing fees, and other charges. Please verify with your financial institution before making decisions.',
  footer:
    'The calculations and projections provided by MoneyGroww are for illustrative purposes only and should not be considered as investment advice. Past performance does not guarantee future results. Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing. We recommend consulting with a qualified financial advisor before making any investment decisions.',
} as const;

// ── API Endpoints ───────────────────────────────
export const API = {
  YAHOO_CHART_PROXY: (symbol: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`,
  NEWS_RSS:
    'https://api.rss2json.com/v1/api.json?rss_url=https://finance.yahoo.com/news/rssindex',
} as const;

// ── Branding ────────────────────────────────────
export const BRAND = {
  name: 'MoneyGroww',
  tagline: 'Your complete financial planning companion',
  email: 'support@moneygroww.com',
  phone: '+91 98765 43210',
  location: 'Mumbai, Maharashtra',
} as const;
