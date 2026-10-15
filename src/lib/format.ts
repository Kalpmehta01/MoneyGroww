/** Shared number formatting for Indian rupee figures. */

export const inr = (value: number) =>
  `₹${Math.round(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const compactInr = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(abs >= 100000000 ? 0 : 1)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${Math.round(value)}`;
};

/** Spoken-style amount: "₹5.8 lakh", "₹1.2 crore". */
export const wordsInr = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.?0+$/, '')} crore`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(1).replace(/\.0$/, '')} lakh`;
  return inr(value);
};

export const yearsMonths = (months: number) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const ys = y ? `${y} yr${y === 1 ? '' : 's'}` : '';
  const ms = m ? `${m} mo` : '';
  return [ys, ms].filter(Boolean).join(' ') || '0 mo';
};
