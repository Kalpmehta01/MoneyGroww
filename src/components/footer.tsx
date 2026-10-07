interface FooterProps {
  onSectionChange: (section: string) => void;
  onNavigateToCalculators: (tabValue?: string) => void;
}

export function Footer({ onSectionChange, onNavigateToCalculators }: FooterProps) {
  const year = new Date().getFullYear();

  const columns: { heading: string; links: { label: string; onClick: () => void }[] }[] = [
    {
      heading: 'Calculators',
      links: [
        { label: 'SIP calculator', onClick: () => onNavigateToCalculators('sip') },
        { label: 'Mutual fund calculator', onClick: () => onNavigateToCalculators('mutual-fund') },
        { label: 'EMI calculator', onClick: () => onNavigateToCalculators('emi') },
      ],
    },
    {
      heading: 'Explore',
      links: [
        { label: 'Market & insights', onClick: () => onSectionChange('insights') },
        { label: 'Ask the assistant', onClick: () => onSectionChange('chat') },
        { label: 'Pricing', onClick: () => onSectionChange('pricing') },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', onClick: () => onSectionChange('about') },
        { label: 'Contact', onClick: () => onSectionChange('contact') },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-10 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <button
              onClick={() => onSectionChange('home')}
              className="flex items-center gap-2.5 rounded-md text-ink"
              aria-label="MoneyGroww — back to top"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-ink"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 14.5 7.5 9l3.5 3.5L17 5.5" />
                </svg>
              </span>
              <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">MoneyGroww</span>
            </button>
            <p className="mt-4 max-w-xs text-[0.8125rem] leading-relaxed text-ink-3">
              Clear calculators and live market context for Indian investors.
            </p>
            <a
              href="mailto:support@moneygroww.com"
              className="mt-4 inline-block text-[0.8125rem] font-medium text-ink-2 hover:text-accent"
            >
              support@moneygroww.com
            </a>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="t-label">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-sm text-ink-2 transition-colors duration-[120ms] hover:text-ink"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-[0.75rem] leading-relaxed text-ink-3">
            <span className="font-medium text-ink-2">Disclaimer.</span> Calculations and projections
            on MoneyGroww are for illustration only and are not investment advice. MoneyGroww is not a
            SEBI-registered investment adviser. Mutual fund investments are subject to market risks;
            read all scheme-related documents carefully. Past performance does not guarantee future
            results. Consult a qualified financial adviser before making investment decisions.
          </p>
          <p className="mt-4 text-[0.75rem] text-ink-3">© {year} MoneyGroww. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
