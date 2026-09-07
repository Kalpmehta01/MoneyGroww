import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
=======
import { Moon, Sun, User, TrendingUp, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { NAV_ITEMS } from '../data/constants';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

<<<<<<< HEAD
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
=======
export function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('moneygroww-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('moneygroww-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  const handleNavClick = (id: string) => {
    onSectionChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
          >
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-foreground">MoneyGroww</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm transition-colors hover:text-primary ${
                  activeSection === item.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:inline-flex" aria-label="User account">
              <User className="h-4 w-4" />
            </Button>

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
