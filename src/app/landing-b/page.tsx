'use client';

// TelEnv IQ - Landing Version B: Dark Minimal Enterprise
// Style: Ultra-minimal dark theme, flat structured sections, high contrast typography
// Tone: CIO-level, serious, minimal, confident

import { motion } from 'framer-motion';
import { ArrowRight, Minus } from 'lucide-react';
import Link from 'next/link';
import LandingHeader from '@/components/landing/shared/LandingHeader';
import LandingFooter from '@/components/landing/shared/LandingFooter';

// Minimal line-based diagram
function MinimalDiagram() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 200" className="w-full h-auto">
        {/* Horizontal lines representing layers */}
        <motion.line
          x1="40" y1="40" x2="360" y2="40"
          stroke="#374151" strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.line
          x1="40" y1="100" x2="360" y2="100"
          stroke="#374151" strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
        <motion.line
          x1="40" y1="160" x2="360" y2="160"
          stroke="#374151" strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Layer labels */}
        <text x="20" y="44" fill="#6B7280" fontSize="10" textAnchor="end">BSS</text>
        <text x="20" y="104" fill="#6B7280" fontSize="10" textAnchor="end">OSS</text>
        <text x="20" y="164" fill="#6B7280" fontSize="10" textAnchor="end">NET</text>

        {/* Nodes on lines */}
        {[
          { x: 80, y: 40 }, { x: 160, y: 40 }, { x: 280, y: 40 },
          { x: 120, y: 100 }, { x: 240, y: 100 },
          { x: 180, y: 160 },
        ].map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x} cy={node.y} r="6"
            fill="#1F2937"
            stroke="#5B5FEF"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
          />
        ))}

        {/* Vertical connectors */}
        {[
          { x1: 120, y1: 46, x2: 120, y2: 94 },
          { x1: 160, y1: 46, x2: 180, y2: 154 },
          { x1: 240, y1: 106, x2: 180, y2: 154 },
        ].map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke="#5B5FEF"
            strokeWidth="1"
            strokeDasharray="4 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
}

// Divider component
function Divider() {
  return <div className="h-px bg-white/[0.04] my-0" />;
}

export default function LandingVersionB() {
  const capabilities = [
    { title: 'Environment Graph', desc: 'Canonical topology with version tracking' },
    { title: 'Flow Map', desc: 'Stage-based promotion path visualization' },
    { title: 'Governance Alignment', desc: 'Blueprint comparison and readiness scoring' },
    { title: 'Drift Detection', desc: 'Snapshot-to-snapshot differential analysis' },
    { title: 'Impact Analysis', desc: 'Dependency path and blast radius calculation' },
    { title: 'RACI Accountability', desc: 'Ownership mapping and orphan detection' },
  ];

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      <LandingHeader variant="minimal" />

      {/* Hero Section - Centered, typography-driven */}
      <section className="min-h-screen flex items-center justify-center pt-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
              Structural Truth for<br />
              <span className="text-slate-500">Non-Production Landscapes</span>
            </h1>

            <p className="mt-10 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Model. Snapshot. Govern.
            </p>

            <div className="mt-12">
              <Link
                href="/login"
                className="inline-flex items-center text-lg text-white border-b-2 border-white pb-1 hover:border-[#5B5FEF] hover:text-[#5B5FEF] transition-colors"
              >
                Enter Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20"
          >
            <MinimalDiagram />
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* Problem Statement - Flat blocks */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-3 gap-0 border border-white/[0.04]">
              {[
                { label: 'Version Drift', stat: 'Untracked', desc: 'No canonical record of deployed versions across environment tiers.' },
                { label: 'Topology Ambiguity', stat: 'Undocumented', desc: 'Component dependencies exist only as tribal knowledge.' },
                { label: 'Governance Gaps', stat: 'Manual', desc: 'Readiness assessments are checklists, not deterministic evaluations.' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-10 ${i < 2 ? 'border-r border-white/[0.04]' : ''}`}
                >
                  <span className="text-xs uppercase tracking-widest text-slate-600">{item.label}</span>
                  <div className="mt-4 text-3xl font-semibold text-white">{item.stat}</div>
                  <p className="mt-4 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* Capabilities - Clean list */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-16"
          >
            <div>
              <h2 className="text-3xl font-semibold text-white">Core Capabilities</h2>
              <p className="mt-4 text-slate-500">
                Six pillars of environment intelligence, built for enterprise scale.
              </p>
            </div>

            <div className="space-y-0">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="py-5 border-b border-white/[0.04] flex items-start gap-4"
                >
                  <Minus className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-medium text-white">{cap.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{cap.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* Process - Linear steps */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold text-white text-center mb-20"
          >
            Process
          </motion.h2>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {[
              { step: 'Ingest', desc: 'API connectors' },
              { step: 'Model', desc: '5-layer topology' },
              { step: 'Snapshot', desc: 'Immutable state' },
              { step: 'Govern', desc: 'Blueprint alignment' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 flex items-center gap-8"
              >
                <div className="text-center flex-1">
                  <div className="text-sm text-slate-600 uppercase tracking-widest mb-2">0{i + 1}</div>
                  <div className="text-xl font-semibold text-white">{item.step}</div>
                  <div className="text-sm text-slate-500 mt-1">{item.desc}</div>
                </div>
                {i < 3 && (
                  <div className="hidden md:block w-16 h-px bg-white/[0.08]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* Differentiation */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-medium text-slate-500">
              Not a CMDB. Not CI/CD. Not Scheduling.
            </h2>
            <p className="mt-6 text-4xl font-semibold text-white leading-tight">
              The Technical Environment Readiness<br />& Governance Layer.
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* CTA */}
      <section className="py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-white">
              Begin modelling your environment landscape.
            </h2>
            <Link
              href="/login"
              className="mt-10 inline-flex items-center text-lg text-white border-b-2 border-white pb-1 hover:border-[#5B5FEF] hover:text-[#5B5FEF] transition-colors"
            >
              Access Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter variant="minimal" />
    </div>
  );
}
