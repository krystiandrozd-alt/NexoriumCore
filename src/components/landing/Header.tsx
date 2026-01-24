'use client';

// TelEnv IQ - Premium Landing Header (Sticky Navigation)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Platform', href: '#platform' },
  { name: 'Governance', href: '#governance' },
  { name: 'Intelligence', href: '#intelligence' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Resources', href: '#resources' },
  { name: 'Contact', href: '#contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0B1220]/95 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#5B5FEF]/20 group-hover:shadow-[#5B5FEF]/40 transition-shadow">
              <span className="text-white font-bold text-sm tracking-tight">TE</span>
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              TelEnv<span className="text-[#5B5FEF]">IQ</span>
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Dashboard
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center rounded-lg bg-[#5B5FEF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4B4FDF] transition-colors shadow-lg shadow-[#5B5FEF]/20"
          >
            Request Executive Briefing
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#0B1220]/98 backdrop-blur-xl border-t border-white/5 px-6 py-6 space-y-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block text-base font-medium text-slate-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link
              href="/dashboard"
              className="block text-base font-medium text-slate-400 hover:text-white transition-colors py-2"
            >
              Dashboard
            </Link>
            <Link
              href="#contact"
              className="block w-full text-center rounded-lg bg-[#5B5FEF] px-5 py-3 text-base font-medium text-white hover:bg-[#4B4FDF] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Request Executive Briefing
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
