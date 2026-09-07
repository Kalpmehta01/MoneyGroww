import { useState } from 'react';
import { Navbar } from './components/navbar';
import { LiveTicker } from './components/live-ticker';
import { Hero } from './components/hero';
import { Calculators } from './components/calculators';
import { Insights } from './components/insights';
<<<<<<< HEAD
import { Pricing } from './components/pricing';
=======
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
import { AboutContact } from './components/about-contact';
import { Footer } from './components/footer';
import { ChatSection } from './components/chat-section';
import { Toaster } from './components/ui/sonner';
<<<<<<< HEAD
=======
import { ErrorBoundary } from './components/ErrorBoundary';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [activeCalculatorTab, setActiveCalculatorTab] = useState('sip');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);

<<<<<<< HEAD
    // Smooth scroll to section
    const element = document.getElementById(section);
=======
    // Map 'contact' to 'about' since they share a section
    const scrollTarget = section === 'contact' ? 'about' : section;
    const element = document.getElementById(scrollTarget);
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToCalculators = (tabValue = 'sip') => {
    setActiveSection('calculators');
    setActiveCalculatorTab(tabValue);
    const element = document.getElementById('calculators');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Live Market Ticker */}
      <LiveTicker />

      {/* Main Content */}
      <main>
        {/* Home Section */}
        <section id="home">
          <Hero
            onNavigateToCalculators={handleNavigateToCalculators}
            onSectionChange={handleSectionChange}
          />
        </section>

        {/* Calculators Section */}
        <section id="calculators">
          <Calculators
            activeTab={activeCalculatorTab}
            onTabChange={setActiveCalculatorTab}
          />
        </section>

        {/* Insights Section */}
        <section id="insights">
          <Insights />
        </section>

        {/* Chat Section */}
        <section id="chat">
          <ChatSection onNavigateToCalculators={handleNavigateToCalculators} />
        </section>

        {/* Pricing Section */}
        <section id="pricing">
          <Pricing />
        </section>

        {/* About Section */}
        <section id="about">
          <AboutContact />
        </section>

        {/* Contact Section - Same component as About */}
        <section id="contact">
          {/* AboutContact component handles both about and contact */}
        </section>
      </main>

      {/* Footer */}
      <Footer onSectionChange={handleSectionChange} />

      {/* Toast Notifications */}
      <Toaster />
    </div>
=======
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Pinned Header */}
        <header className="sticky top-0 z-50">
          <Navbar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
          <LiveTicker />
        </header>

        {/* Main Content */}
        <main>
          {/* Home Section */}
          <section id="home">
            <ErrorBoundary>
              <Hero
                onNavigateToCalculators={handleNavigateToCalculators}
                onSectionChange={handleSectionChange}
              />
            </ErrorBoundary>
          </section>

          {/* Calculators Section */}
          <section id="calculators">
            <ErrorBoundary>
              <Calculators
                activeTab={activeCalculatorTab}
                onTabChange={setActiveCalculatorTab}
              />
            </ErrorBoundary>
          </section>

          {/* Insights Section */}
          <section id="insights">
            <ErrorBoundary>
              <Insights />
            </ErrorBoundary>
          </section>

          {/* AI Assistant Section */}
          <ErrorBoundary>
            <ChatSection onNavigateToCalculators={handleNavigateToCalculators} />
          </ErrorBoundary>

          {/* About & Contact Section */}
          <section id="about">
            <ErrorBoundary>
              <AboutContact />
            </ErrorBoundary>
          </section>
        </main>

        {/* Footer */}
        <Footer onSectionChange={handleSectionChange} />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ErrorBoundary>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
  );
}