import { TrendingUp, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
<<<<<<< HEAD
=======
import { QUICK_LINKS, SOCIAL_LINKS, RESOURCE_LINKS, LEGAL_LINKS, BRAND } from '../data/constants';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

interface FooterProps {
  onSectionChange: (section: string) => void;
}

export function Footer({ onSectionChange }: FooterProps) {
<<<<<<< HEAD
  const quickLinks = [
    { label: 'Home', id: 'home' },
    { label: 'SIP Calculator', id: 'calculators' },
    { label: 'Mutual Fund Calculator', id: 'calculators' },
    { label: 'EMI Calculator', id: 'calculators' },
    { label: 'Insights', id: 'insights' },
    { label: 'About Us', id: 'about' },
    { label: 'Contact', id: 'contact' }
  ];

  const socialLinks = [
    { name: 'LinkedIn', href: '#' },
    { name: 'Twitter', href: '#' },
    { name: 'Facebook', href: '#' },
    { name: 'Instagram', href: '#' }
  ];

  const resources = [
    'Investment Guide',
    'Financial Planning',
    'Tax Planning',
    'Retirement Planning',
    'Insurance Guide',
    'Market Analysis'
  ];

  const legalLinks = [
    'Privacy Policy',
    'Terms of Service',
    'Cookie Policy',
    'Disclaimer',
    'SEBI Guidelines',
    'Risk Disclosure'
  ];

  return (
<footer className="bg-surface dark:bg-canvas text-white">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
<div className="space-y-4">
<div className="flex items-center space-x-2">
<TrendingUp className="h-8 w-8 text-pos" />
<span className="text-xl font-bold">MoneyGroww</span>
</div>
<p className="text-ink-2 text-sm">
              Empowering your financial journey with smart calculators and insights.
              Plan, invest, and grow your wealth with confidence.
</p>
<div className="space-y-2">
<div className="flex items-center space-x-2 text-sm text-ink-2">
<Mail className="h-4 w-4" />
<span>support@moneygroww.com</span>
</div>
<div className="flex items-center space-x-2 text-sm text-ink-2">
<Phone className="h-4 w-4" />
<span>+91 98765 43210</span>
</div>
<div className="flex items-center space-x-2 text-sm text-ink-2">
<MapPin className="h-4 w-4" />
<span>Mumbai, Maharashtra</span>
</div>
</div>
</div>

          {/* Quick Links */}
<div className="space-y-4">
<h3 className="text-lg font-semibold">Quick Links</h3>
<ul className="space-y-2">
              {quickLinks.map((link, index) => (
<li key={index}>
<button
                    onClick={() => onSectionChange(link.id)}
                    className="text-sm text-ink-2 hover:text-pos transition-colors"
                  >
                    {link.label}
</button>
</li>
              ))}
</ul>
</div>

          {/* Resources */}
<div className="space-y-4">
<h3 className="text-lg font-semibold">Resources</h3>
<ul className="space-y-2">
              {resources.map((resource, index) => (
<li key={index}>
<a
                    href="#"
                    className="text-sm text-ink-2 hover:text-pos transition-colors"
                  >
                    {resource}
</a>
</li>
              ))}
</ul>
</div>

          {/* Legal & Newsletter */}
<div className="space-y-4">
<h3 className="text-lg font-semibold">Legal</h3>
<ul className="space-y-2">
              {legalLinks.map((link, index) => (
<li key={index}>
<a
                    href="#"
                    className="text-sm text-ink-2 hover:text-pos transition-colors"
                  >
                    {link}
</a>
</li>
              ))}
</ul>
</div>
</div>

<Separator className="bg-secondary mb-8" />

        {/* Bottom Footer */}
<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
<div className="text-sm text-ink-3">
            © 2024 MoneyGroww. All rights reserved. | Made with ️ for your financial growth
</div>

          {/* Social Media */}
<div className="flex items-center space-x-4">
<span className="text-sm text-ink-3">Follow us:</span>
            {socialLinks.map((social, index) => (
<Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-ink-2 hover:text-pos hover:bg-surface-2 h-8 px-3"
                asChild
              >
<a href={social.href} target="_blank" rel="noopener noreferrer">
                  {social.name}
</a>
</Button>
            ))}
</div>
</div>

        {/* Disclaimer */}
<div className="mt-8 pt-8 border-t border-line">
<div className="bg-surface-2 rounded-lg p-4">
<h4 className="text-sm font-semibold mb-2 text-yellow-400">Important Disclaimer</h4>
<p className="text-xs text-ink-2 leading-relaxed">
              The calculations and projections provided by MoneyGroww are for illustrative purposes only and
              should not be considered as investment advice. Past performance does not guarantee future results.
              Mutual fund investments are subject to market risks. Please read all scheme related documents
              carefully before investing. We recommend consulting with a qualified financial advisor before
              making any investment decisions.
</p>
</div>
</div>
</div>
</footer>
=======

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold">MoneyGroww</span>
            </div>
            <p className="text-slate-300 text-sm">
              Empowering your financial journey with smart calculators and insights. 
              Plan, invest, and grow your wealth with confidence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Mail className="h-4 w-4" />
                <span>{BRAND.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Phone className="h-4 w-4" />
                <span>{BRAND.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <MapPin className="h-4 w-4" />
                <span>{BRAND.location}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => onSectionChange(link.id)}
                    className="text-sm text-slate-300 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map((resource, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-slate-300 hover:text-green-400 transition-colors"
                  >
                    {resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-slate-300 hover:text-green-400 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} MoneyGroww. All rights reserved. | Made with ❤️ for your financial growth
          </div>

          {/* Social Media */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">Follow us:</span>
            {SOCIAL_LINKS.map((social, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-green-400 hover:bg-slate-800 h-8 px-3"
                asChild
              >
                <a href={social.href} target="_blank" rel="noopener noreferrer">
                  {social.name}
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 text-yellow-400">Important Disclaimer</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The calculations and projections provided by MoneyGroww are for illustrative purposes only and 
              should not be considered as investment advice. Past performance does not guarantee future results. 
              Mutual fund investments are subject to market risks. Please read all scheme related documents 
              carefully before investing. We recommend consulting with a qualified financial advisor before 
              making any investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
  );
}