'use client';

// TelEnv IQ - Final CTA Section

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5B5FEF]/10 rounded-full blur-[128px]" />
      </div>

      {/* Top border gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5B5FEF]/30 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight text-white leading-tight">
          Bring Structure and Control to Your Non-Production Environments.
        </h2>

        <p className="mt-8 text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
          Make complexity visible. Align ownership. Detect risk early.
        </p>

        <div className="mt-12">
          <Link
            href="#"
            className="group inline-flex items-center justify-center rounded-lg bg-[#5B5FEF] px-8 py-4 text-lg font-medium text-white hover:bg-[#4B4FDF] transition-all shadow-lg shadow-[#5B5FEF]/25 hover:shadow-[#5B5FEF]/40"
          >
            Request Executive Briefing
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            No agents required
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Read-only access
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Enterprise security
          </span>
        </div>
      </div>
    </section>
  );
}
