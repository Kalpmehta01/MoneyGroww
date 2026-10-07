import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const THEME_STORAGE_KEY = 'moneygroww-theme';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall through to system preference
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

const NAV_ITEMS = [
  { id: 'calculators', label: 'Calculators' },
  { id: 'insights', label: 'Insights' },
  { id: 'chat', label: 'Assistant' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'About' },
];

export function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore — theme just won't persist across reloads in this browser
    }
  }, [isDark]);

  const handleNavigate = (id: string) => {
    onSectionChange(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Wordmark. The mark is the only place the brand green appears as
            decoration — everywhere else it means "primary action". */}
        <button
          onClick={() => handleNavigate('home')}
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
          <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">
            MoneyGroww
          </span>
        </button>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`rounded-md px-3 py-2 text-sm transition-[color,background-color] duration-[120ms] ${
                      isActive
                        ? 'font-medium text-ink bg-secondary'
                        : 'text-ink-2 hover:text-ink hover:bg-secondary'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation — the previous version had no way to navigate at all
          below the md breakpoint. */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-line bg-surface md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-3 py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  aria-current={activeSection === item.id ? 'true' : undefined}
                  className={`flex min-h-[44px] w-full items-center rounded-md px-3 text-sm transition-colors duration-[120ms] ${
                    activeSection === item.id
                      ? 'font-medium text-ink bg-secondary'
                      : 'text-ink-2 hover:bg-secondary'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
