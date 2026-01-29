'use client';

// Nexorium Core - Landing Version D: Diagram-First Experience
// Style: Clean enterprise with white-glass hybrid look (dark mode dominant)
// Tone: Portfolio-level intelligence, system-of-systems feel

import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import LandingHeader from '@/components/landing/shared/LandingHeader';
import LandingFooter from '@/components/landing/shared/LandingFooter';

// Full-width animated Flow Map hero
function FlowMapHero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stages = [
    { key: 'DEV', label: 'Development', envs: ['DEV-1', 'DEV-2'], color: '#3B82F6' },
    { key: 'SIT', label: 'System Integration', envs: ['SIT-1', 'SIT-2', 'SIT-3'], color: '#8B5CF6' },
    { key: 'UAT', label: 'User Acceptance', envs: ['UAT-1', 'UAT-2'], color: '#EC4899' },
    { key: 'PREPROD', label: 'Pre-Production', envs: ['PREPROD'], color: '#F59E0B' },
    { key: 'PROD', label: 'Production', envs: ['PROD-RO'], color: '#10B981', readonly: true },
  ];

  return (
    <div ref={ref} className="relative w-full overflow-hidden py-8">
      {/* Stage lanes */}
      <div className="flex items-stretch gap-0">
        {stages.map((stage, stageIdx) => (
          <motion.div
            key={stage.key}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: stageIdx * 0.1 }}
            className="flex-1 min-w-0"
          >
            {/* Stage header */}
            <div
              className="py-2 px-4 text-center border-b-2"
              style={{ borderColor: stage.color }}
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{stage.key}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stage.label}</div>
            </div>

            {/* Environment nodes */}
            <div className="p-4 space-y-3">
              {stage.envs.map((env, envIdx) => (
                <motion.div
                  key={env}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: stageIdx * 0.1 + envIdx * 0.05 + 0.3 }}
                  className="relative"
                >
                  <div
                    className="p-3 rounded-lg border bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors"
                    style={{ borderColor: `${stage.color}30` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{env}</span>
                      {stage.readonly ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">RO</span>
                      ) : env === 'SIT-2' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
                      )}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      {stage.readonly ? 'Read-only mirror' : `${8 + envIdx * 3} systems`}
                    </div>
                  </div>

                  {/* Connection line to next stage */}
                  {stageIdx < stages.length - 1 && envIdx === 0 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.6, delay: stageIdx * 0.1 + 0.5 }}
                      className="absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-slate-600 to-transparent origin-left"
                      style={{ transform: 'translateY(-50%)' }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Flow arrows overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {/* Animated flow indicators */}
          {[1, 2, 3, 4].map((i) => (
            <motion.circle
              key={i}
              r="3"
              fill="#5B5FEF"
              initial={{ opacity: 0 }}
              animate={isInView ? {
                opacity: [0, 1, 1, 0],
                cx: [`${i * 20}%`, `${(i + 1) * 20}%`],
                cy: ['50%', '50%'],
              } : {}}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

// Capability card with glass effect
function CapabilityCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:border-white/[0.15] transition-all cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function LandingVersionD() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <LandingHeader variant="light" />

      {/* Hero Section with Flow Map */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-violet-300">Flow Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              Portfolio-Level Environment{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Intelligence
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto">
              Visualize promotion paths, detect collisions, and understand
              cross-environment dependencies at a glance.
            </p>
          </motion.div>

          {/* Flow Map visualization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">Environment Flow Map</span>
                <span className="text-xs text-slate-500">DEV → SIT → UAT → PREPROD → PROD</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Aligned
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Drift
                </span>
              </div>
            </div>
            <FlowMapHero />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-center"
          >
            <Link
              href="/login"
              className="group inline-flex items-center rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3.5 text-base font-medium hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/25"
            >
              Explore Flow Map Intelligence
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold text-white">The Multi-Environment Challenge</h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Managing promotion paths across complex landscapes requires structural visibility
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Flow Blindness', desc: 'Promotion paths exist only as tribal knowledge. No structural understanding of how environments connect.' },
              { title: 'Collision Risk', desc: 'Parallel projects promoting to shared environments without visibility into contention or timing conflicts.' },
              { title: 'Convergence Gaps', desc: 'Critical systems touched by multiple flows go untracked, creating hidden dependencies and stability risks.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]"
              >
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold text-white">Complete Environment Intelligence</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CapabilityCard
              icon={({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>}
              title="Environment Graph"
              desc="Canonical 5-layer topology model with version tracking across all tiers."
            />
            <CapabilityCard
              icon={({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 17h6m-3-3v6"/></svg>}
              title="Flow Map"
              desc="Visual promotion path intelligence with stage-based lane visualization."
            />
            <CapabilityCard
              icon={({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
              title="Governance Alignment"
              desc="Blueprint comparison, drift detection, and promotion readiness scoring."
            />
            <CapabilityCard
              icon={({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
              title="Snapshots"
              desc="Immutable point-in-time captures for deterministic comparison."
            />
            <CapabilityCard
              icon={({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v12M18 9a3 3 0 100 6 3 3 0 000-6zM6 21a3 3 0 100-6 3 3 0 000 6z"/><path d="M18 9a9 9 0 01-9 9"/></svg>}
              title="Impact Analysis"
              desc="Dependency path tracing and blast radius calculation."
            />
            <CapabilityCard
              icon={({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
              title="RACI Accountability"
              desc="Ownership mapping, responsibility assignment, orphan detection."
            />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold text-white">From Discovery to Governance</h2>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-violet-500/50" />

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 'Ingest', desc: 'Connect sources via API connectors. No agents.' },
                { step: 'Model', desc: 'Build canonical 5-layer topology automatically.' },
                { step: 'Snapshot', desc: 'Capture immutable point-in-time state.' },
                { step: 'Govern', desc: 'Align against blueprints. Score readiness.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-4">
                    <span className="text-xl font-bold text-white">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.step}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20 text-center"
          >
            <p className="text-slate-400 uppercase tracking-wider text-sm mb-4">
              Not a CMDB. Not CI/CD. Not Scheduling.
            </p>
            <h2 className="text-3xl font-semibold text-white">
              The Technical Environment Readiness<br />& Governance Layer
            </h2>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-white">
              Ready for portfolio-level visibility?
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
              Start mapping your environment flows today.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-medium hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/25"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter variant="light" />
    </div>
  );
}
