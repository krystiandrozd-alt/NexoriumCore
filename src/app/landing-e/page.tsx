'use client';

// TelEnv IQ - Landing Version E: Structured Executive Brief
// Style: High-end consulting aesthetic, very structured, muted color palette
// Tone: Board-level, strategic, polished

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import LandingHeader from '@/components/landing/shared/LandingHeader';
import LandingFooter from '@/components/landing/shared/LandingFooter';

// Executive summary card
function ExecutiveCard({
  number,
  title,
  children
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-l-2 border-slate-700 pl-8 py-2"
    >
      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{number}</span>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <div className="text-slate-400 leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

// Structured list item
function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-slate-400">
      <CheckCircle2 className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export default function LandingVersionE() {
  const capabilities = [
    { id: '01', name: 'Environment Graph', desc: 'Canonical topology with version tracking across all non-production tiers' },
    { id: '02', name: 'Flow Map', desc: 'Stage-based promotion path visualization with dependency awareness' },
    { id: '03', name: 'Governance Alignment', desc: 'Blueprint comparison and deterministic readiness scoring' },
    { id: '04', name: 'Drift Detection', desc: 'Snapshot-to-snapshot differential analysis with audit trail' },
    { id: '05', name: 'Impact Analysis', desc: 'Dependency path and blast radius calculation for change risk' },
    { id: '06', name: 'RACI Accountability', desc: 'Ownership mapping with orphan detection and escalation paths' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <LandingHeader variant="executive" />

      {/* Hero Section - Typography-driven, consulting style */}
      <section className="min-h-screen flex items-center pt-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Eyebrow */}
            <div className="mb-8">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">
                Enterprise Environment Intelligence
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.15] text-white">
              Structural Truth for<br />
              Non-Production Landscapes
            </h1>

            {/* Subhead */}
            <p className="mt-8 text-xl text-slate-400 max-w-2xl leading-relaxed font-light">
              TelEnv IQ delivers deterministic environment intelligence —
              enabling enterprises to model, snapshot, govern, and align
              complex technical landscapes with confidence.
            </p>

            {/* CTA */}
            <div className="mt-12">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-white text-lg font-medium border-b border-white pb-1 hover:border-slate-400 hover:text-slate-300 transition-colors"
              >
                Access Platform
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Executive Summary Section */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">
              Executive Summary
            </span>
            <h2 className="mt-4 text-3xl font-light text-white">
              The Challenge & Our Response
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <ExecutiveCard number="I" title="The Problem">
                <p>
                  Enterprise non-production environments suffer from structural ambiguity.
                  Version drift goes untracked. Topology exists only as tribal knowledge.
                  Readiness assessments remain manual checklists rather than deterministic evaluations.
                </p>
              </ExecutiveCard>

              <ExecutiveCard number="II" title="The Impact">
                <p>
                  This ambiguity leads to failed promotions, unexpected behavior in testing,
                  governance gaps, and extended release cycles. The cost is measured in
                  delayed time-to-market and increased operational risk.
                </p>
              </ExecutiveCard>
            </div>

            <div className="space-y-12">
              <ExecutiveCard number="III" title="The Solution">
                <p>
                  TelEnv IQ provides the Technical Environment Readiness & Governance Layer —
                  a canonical model of environment state with immutable snapshots,
                  deterministic diff analysis, and blueprint alignment scoring.
                </p>
              </ExecutiveCard>

              <ExecutiveCard number="IV" title="The Outcome">
                <p>
                  Structural truth across all non-production tiers.
                  Deterministic readiness assessments. Auditable change history.
                  Clear accountability through RACI mapping. Reduced risk in release execution.
                </p>
              </ExecutiveCard>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Capabilities Table */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">
              Core Capabilities
            </span>
            <h2 className="mt-4 text-3xl font-light text-white">
              Six Pillars of Environment Intelligence
            </h2>
          </motion.div>

          <div className="border-t border-slate-800">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 gap-6 py-6 border-b border-slate-800/50 items-baseline"
              >
                <div className="col-span-1">
                  <span className="text-sm text-slate-600 font-medium">{cap.id}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-white font-medium">{cap.name}</span>
                </div>
                <div className="col-span-7">
                  <span className="text-slate-400 text-sm">{cap.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Differentiation */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-16"
          >
            <div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">
                Positioning
              </span>
              <h2 className="mt-4 text-3xl font-light text-white">
                What TelEnv IQ Is Not
              </h2>
              <ul className="mt-8 space-y-4">
                <ListItem>Not a CMDB — we model environments, not assets</ListItem>
                <ListItem>Not CI/CD — we assess readiness, not deploy code</ListItem>
                <ListItem>Not scheduling — we govern state, not timelines</ListItem>
                <ListItem>Not monitoring — we snapshot structure, not runtime</ListItem>
              </ul>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">
                Value Proposition
              </span>
              <h2 className="mt-4 text-3xl font-light text-white">
                What TelEnv IQ Delivers
              </h2>
              <ul className="mt-8 space-y-4">
                <ListItem>Canonical environment model as single source of truth</ListItem>
                <ListItem>Immutable snapshots with full audit trail</ListItem>
                <ListItem>Deterministic governance alignment scoring</ListItem>
                <ListItem>Clear RACI accountability for all components</ListItem>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Architecture Principles */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">
              Architecture
            </span>
            <h2 className="mt-4 text-3xl font-light text-white">
              Foundational Principles
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Ingestion',
                items: [
                  'API-connector based',
                  'No agents required',
                  'Provenance tracking',
                  'Idempotent operations',
                ],
              },
              {
                title: 'Integrity',
                items: [
                  'Canonical data model',
                  'Immutable snapshots',
                  'Audit-trailed changes',
                  'Deterministic diffs',
                ],
              },
              {
                title: 'Governance',
                items: [
                  'Blueprint definitions',
                  'Alignment scoring',
                  'PROD_RO protection',
                  'RACI enforcement',
                ],
              },
            ].map((principle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-lg font-medium text-white mb-6">{principle.title}</h3>
                <ul className="space-y-3">
                  {principle.items.map((item, j) => (
                    <li key={j} className="text-sm text-slate-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* CTA */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">
              Next Steps
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-light text-white">
              Begin Your Environment Discovery
            </h2>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
              Model your non-production landscape. Establish structural truth.
              Enable deterministic governance.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-flex items-center gap-2 text-white text-lg font-medium border-b border-white pb-1 hover:border-slate-400 hover:text-slate-300 transition-colors"
            >
              Access Platform
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter variant="executive" />
    </div>
  );
}
