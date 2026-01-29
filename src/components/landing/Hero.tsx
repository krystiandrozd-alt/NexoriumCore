'use client';

// Nexorium Core - Hero Section

import { motion } from 'framer-motion';
import { ArrowRight, Map } from 'lucide-react';
import Link from 'next/link';
import ProductMockup from './ProductMockup';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[#5B5FEF]/12 rounded-full blur-[150px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#7C3AED]/10 rounded-full blur-[150px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#06B6D4]/6 rounded-full blur-[150px]"
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
              The Control Plane for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED]">
                Non-Production Architecture.
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Model, govern, and align your test environments with structural precision.
              From 36,000ft overview to detailed topology — one authoritative view.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/dashboard/environments"
                className="group inline-flex items-center justify-center rounded-lg bg-[#5B5FEF] px-6 py-3.5 text-base font-medium text-white hover:bg-[#4B4FDF] transition-all shadow-lg shadow-[#5B5FEF]/25 hover:shadow-[#5B5FEF]/40 w-full sm:w-auto"
              >
                Explore Environment Canvas
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard/environments/flow-map"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-3.5 text-base font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto"
              >
                <Map className="mr-2 h-4 w-4" />
                View Flow Map
              </Link>
            </div>
          </motion.div>

          {/* Right - Product Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            <ProductMockup />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-500 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
      </motion.div>
    </section>
  );
}
