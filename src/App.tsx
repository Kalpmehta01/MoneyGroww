import { useEffect, useState } from 'react';
import { Navbar } from './components/navbar';
import { LiveTicker } from './components/live-ticker';
import { Hero } from './components/hero';
import { Calculators } from './components/calculators';
import { Insights } from './components/insights';
import { Pricing } from './components/pricing';
import { AboutContact } from './components/about-contact';
import { Footer } from './components/footer';
import { ChatSection } from './components/chat-section';
import { Toaster } from './components/ui/sonner';

const SECTION_IDS = ['home', 'calculators', 'insights', 'chat', 'pricing', 'about'];

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [activeCalculatorTab, setActiveCalculatorTab] = useState('sip');

  // Highlight the nav item for whichever section is in view while scrolling,
  // not only after a nav click.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      // A band across the upper-middle of the viewport decides "current".
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section === 'contact' ? 'about' : section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigateToCalculators = (tabValue = 'sip') => {
    setActiveSection('calculators');
    setActiveCalculatorTab(tabValue);
    document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#calculators"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-[var(--shadow-md)]"
      >
        Skip to calculators
      </a>

      <Navbar activeSection={activeSection} onSectionChange={handleSectionChange} />

      <LiveTicker />

      <main>
        <section id="home">
          <Hero
            onNavigateToCalculators={handleNavigateToCalculators}
            onSectionChange={handleSectionChange}
          />
        </section>

        <section id="calculators">
          <Calculators activeTab={activeCalculatorTab} onTabChange={setActiveCalculatorTab} />
        </section>

        <section id="insights">
          <Insights />
        </section>

        <section id="chat">
          <ChatSection onNavigateToCalculators={handleNavigateToCalculators} />
        </section>

        <section id="pricing">
          <Pricing onNavigateToCalculators={handleNavigateToCalculators} />
        </section>

        {/* Holds both About and Contact (#contact is inside it). */}
        <section id="about">
          <AboutContact />
        </section>
      </main>

      <Footer onSectionChange={handleSectionChange} onNavigateToCalculators={handleNavigateToCalculators} />

      <Toaster />
    </div>
  );
}
