'use client';

// TelEnv IQ - Shared Landing Footer

import { Map } from 'lucide-react';
import Link from 'next/link';

interface LandingFooterProps {
  variant?: 'glass' | 'minimal' | 'technical' | 'light' | 'executive';
}

export default function LandingFooter({ variant = 'glass' }: LandingFooterProps) {
  const styles = {
    glass: 'border-t border-white/[0.06] bg-[#070b14]',
    minimal: 'border-t border-white/[0.04] bg-[#050810]',
    technical: 'border-t border-cyan-500/10 bg-[#04080f]',
    light: 'border-t border-white/[0.08] bg-[#080d18]',
    executive: 'border-t border-slate-700/30 bg-[#0a0f1a]',
  };

  return (
    <footer className={`py-12 ${styles[variant]}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center">
              <Map className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-medium text-white">TelEnv IQ</span>
          </div>

          <p className="text-sm text-slate-500">
            Environment Intelligence for Enterprise Telco & IT
          </p>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Platform
            </Link>
            <span className="text-slate-700">|</span>
            <span>2026 TelEnv IQ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
