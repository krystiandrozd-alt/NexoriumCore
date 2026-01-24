'use client';

// TelEnvIQ - Landing Page Header

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TE</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">
              Tel<span className="text-indigo-600">EnvIQ</span>
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
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

        <div className="hidden lg:flex lg:gap-x-8">
          <a href="#problem" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Problem
          </a>
          <a href="#solution" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Solution
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            How It Works
          </a>
          <a href="#telco" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            For Telco
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Button size="sm">
            Request Early Access
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <a
              href="#problem"
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Problem
            </a>
            <a
              href="#solution"
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Solution
            </a>
            <a
              href="#how-it-works"
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#telco"
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Telco
            </a>
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Dashboard
                </Button>
              </Link>
              <Button className="w-full">
                Request Early Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
