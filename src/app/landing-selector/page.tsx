'use client';

// TelEnv IQ - Landing Page Selector
// Preview and navigate between all landing page variants

import { motion } from 'framer-motion';
import { Map, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface LandingVariant {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  bgClass: string;
  accentColor: string;
  features: string[];
}

const variants: LandingVariant[] = [
  {
    id: 'a',
    title: 'Glass Architecture Hero',
    subtitle: 'Version A',
    description: 'Modern glassmorphism over deep navy + violet mesh gradient. Animated environment graph mockup in hero.',
    audience: 'Technical decision-makers, solution architects, engineering leads',
    bgClass: 'bg-gradient-to-br from-[#0B1220] via-[#0d1729] to-[#0B1220]',
    accentColor: '#5B5FEF',
    features: ['Animated gradient mesh', 'Glass morphism cards', 'Interactive graph preview', 'Pillar grid layout'],
  },
  {
    id: 'b',
    title: 'Dark Minimal Enterprise',
    subtitle: 'Version B',
    description: 'Ultra-minimal dark theme with flat structured sections and high contrast typography. CIO-level serious tone.',
    audience: 'Senior executives, CIOs, enterprise buyers who prefer minimal aesthetics',
    bgClass: 'bg-[#050810]',
    accentColor: '#5B5FEF',
    features: ['Typography-driven', 'Flat section blocks', 'Minimal line diagram', 'High contrast'],
  },
  {
    id: 'c',
    title: 'Technical Control Surface',
    subtitle: 'Version C',
    description: 'Grid background with fine-line accents and system-like typography. Live topology simulation in hero.',
    audience: 'Technical architects, platform engineers, DevOps leads',
    bgClass: 'bg-[#04080f]',
    accentColor: '#22D3EE',
    features: ['Grid overlay', 'Terminal aesthetic', 'Simulated topology', 'Technical terminology'],
  },
  {
    id: 'd',
    title: 'Diagram-First Experience',
    subtitle: 'Version D',
    description: 'Full-width Flow Map hero showing DEV → SIT → UAT → PREPROD → PROD with animated data flow.',
    audience: 'Environment managers, release coordinators, test managers',
    bgClass: 'bg-[#070b14]',
    accentColor: '#5B5FEF',
    features: ['Full-width flow diagram', 'Animated data particles', 'Stage visualization', 'Process-oriented'],
  },
  {
    id: 'e',
    title: 'Structured Executive Brief',
    subtitle: 'Version E',
    description: 'High-end consulting aesthetic with very structured layout and muted color palette. Board-level presentation.',
    audience: 'Board members, C-suite executives, enterprise procurement',
    bgClass: 'bg-[#0a0f1a]',
    accentColor: '#64748B',
    features: ['Consulting aesthetic', 'Structured sections', 'Executive summary', 'Muted palette'],
  },
];

function VariantCard({ variant, index }: { variant: LandingVariant; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <Link href={`/landing-${variant.id}`}>
        {/* Preview thumbnail */}
        <div className={`relative rounded-xl overflow-hidden border border-white/10 ${variant.bgClass} aspect-[16/10]`}>
          {/* Simplified preview visualization */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            {/* Header preview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded"
                  style={{ background: `linear-gradient(135deg, ${variant.accentColor}, #7C3AED)` }}
                />
                <div className="w-16 h-2 bg-white/20 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-2 bg-white/10 rounded" />
                <div className="w-8 h-2 bg-white/10 rounded" />
              </div>
            </div>

            {/* Content preview */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-3/4 h-3 bg-white/30 rounded mb-2" />
              <div className="w-1/2 h-3 bg-white/15 rounded mb-4" />
              <div className="w-1/3 h-2 bg-white/10 rounded" />
            </div>

            {/* Feature indicators */}
            <div className="flex gap-2">
              {variant.features.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-6 rounded bg-white/5 border border-white/10"
                />
              ))}
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="flex items-center gap-2 text-white font-medium">
              View Page <ExternalLink className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Card content */}
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: `${variant.accentColor}20`, color: variant.accentColor }}
            >
              {variant.subtitle}
            </span>
            <h3 className="text-lg font-semibold text-white group-hover:text-slate-300 transition-colors">
              {variant.title}
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            {variant.description}
          </p>
          <div className="mt-3">
            <span className="text-xs text-slate-500">Best for: </span>
            <span className="text-xs text-slate-400">{variant.audience}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {variant.features.map((feature, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function LandingSelectorPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0B1220]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">TelEnv IQ</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white bg-[#5B5FEF] px-4 py-2 rounded-lg hover:bg-[#4B4FDF] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-semibold text-white">Landing Page Variants</h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Five distinct landing page designs for TelEnv IQ, each tailored to different audiences
              and presentation contexts. Click any variant to view the full page.
            </p>
          </motion.div>

          {/* Variant grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {variants.map((variant, index) => (
              <VariantCard key={variant.id} variant={variant} index={index} />
            ))}
          </div>

          {/* Summary section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 pt-12 border-t border-white/[0.06]"
          >
            <h2 className="text-2xl font-semibold text-white mb-8">Comparison Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Variant</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Style</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Primary Audience</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Key Differentiator</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { v: 'A', style: 'Glassmorphism', audience: 'Technical leads', diff: 'Animated graph mockup' },
                    { v: 'B', style: 'Dark minimal', audience: 'C-suite', diff: 'Typography-driven' },
                    { v: 'C', style: 'Technical grid', audience: 'Architects', diff: 'Terminal aesthetic' },
                    { v: 'D', style: 'Diagram-first', audience: 'Env managers', diff: 'Full-width flow map' },
                    { v: 'E', style: 'Consulting', audience: 'Board/Exec', diff: 'Structured brief' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-white font-medium">Version {row.v}</td>
                      <td className="py-3 px-4 text-slate-400">{row.style}</td>
                      <td className="py-3 px-4 text-slate-400">{row.audience}</td>
                      <td className="py-3 px-4 text-slate-400">{row.diff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-sm text-slate-500">
          TelEnv IQ Landing Page Selector — Internal Preview Tool
        </div>
      </footer>
    </div>
  );
}
