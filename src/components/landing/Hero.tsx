'use client';

// TelEnv IQ - Premium Hero Section (Split Screen)

import { ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';
import ProductMockup from './ProductMockup';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#5B5FEF]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#7C3AED]/8 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[128px]" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-white leading-[1.1]">
              End-to-End Visibility Across Every Non-Production Environment.
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              TelEnv IQ delivers a continuously updated, cross-layer view of your development, test, and staging systems — from infrastructure and network dependencies to software versions and associated data — with governance embedded directly into the environment landscape.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center rounded-lg bg-[#5B5FEF] px-6 py-3.5 text-base font-medium text-white hover:bg-[#4B4FDF] transition-all shadow-lg shadow-[#5B5FEF]/25 hover:shadow-[#5B5FEF]/40 w-full sm:w-auto"
              >
                <Eye className="mr-2 h-5 w-5" />
                See the Control Cockpit
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-3.5 text-base font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto"
              >
                Request Executive Briefing
              </Link>
            </div>
          </div>

          {/* Right - Product Mockup */}
          <div className="relative">
            <ProductMockup />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs text-slate-500 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
      </div>
    </section>
  );
}
