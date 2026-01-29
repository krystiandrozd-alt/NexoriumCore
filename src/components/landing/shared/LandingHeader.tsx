'use client';

// Nexorium Core - Shared Landing Header Component

import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';
import Link from 'next/link';

interface LandingHeaderProps {
  variant?: 'glass' | 'minimal' | 'technical' | 'light' | 'executive';
}

export default function LandingHeader({ variant = 'glass' }: LandingHeaderProps) {
  const styles = {
    glass: 'bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06]',
    minimal: 'bg-transparent border-b border-white/[0.04]',
    technical: 'bg-[#0a0f18]/80 backdrop-blur-md border-b border-cyan-500/10',
    light: 'bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.08]',
    executive: 'bg-transparent border-b border-slate-700/30',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 ${styles[variant]}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Nexorium Core</span>
          </Link>

          {/* CTA */}
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
