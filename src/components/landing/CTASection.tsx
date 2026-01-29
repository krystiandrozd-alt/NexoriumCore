'use client';

// Nexorium Core - Final CTA Section

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Network } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#5B5FEF]/10 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-[150px]" />
      </div>

      {/* Top border gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5B5FEF]/30 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-white leading-tight">
            Bring Architectural Discipline to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED]">
              Your Test Environments.
            </span>
          </h2>

          <p className="mt-8 text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
            Stop guessing. Start governing. Know exactly what exists, what version is deployed,
            and whether your environments are ready.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#"
              className="group inline-flex items-center justify-center rounded-lg bg-[#5B5FEF] px-8 py-4 text-lg font-medium text-white hover:bg-[#4B4FDF] transition-all shadow-lg shadow-[#5B5FEF]/25 hover:shadow-[#5B5FEF]/40 w-full sm:w-auto"
            >
              Request Enterprise Preview
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 text-lg font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto"
            >
              <Network className="mr-3 h-5 w-5" />
              Explore the Architecture
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
              API-based connectors
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Enterprise security
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Deterministic modelling
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
