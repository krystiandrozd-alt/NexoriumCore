'use client';

// TelEnv IQ - Landing Version A: Glass Architecture Hero
// Style: Modern glassmorphism over deep navy + violet mesh gradient
// Tone: Calm, controlled, architectural

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, GitBranch, Shield, Network, LayoutGrid, Users, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import LandingHeader from '@/components/landing/shared/LandingHeader';
import LandingFooter from '@/components/landing/shared/LandingFooter';

// Animated Environment Graph mockup
function EnvironmentGraphMockup() {
  const nodes = [
    { id: 1, x: 60, y: 40, label: 'CRM', layer: 'BSS' },
    { id: 2, x: 180, y: 30, label: 'Billing', layer: 'BSS' },
    { id: 3, x: 300, y: 50, label: 'CPQ', layer: 'BSS' },
    { id: 4, x: 120, y: 120, label: 'Order Mgmt', layer: 'OSS' },
    { id: 5, x: 240, y: 130, label: 'Inventory', layer: 'OSS' },
    { id: 6, x: 180, y: 200, label: 'Provisioning', layer: 'NETWORK' },
  ];

  const edges = [
    { from: 1, to: 4 }, { from: 2, to: 4 }, { from: 3, to: 5 },
    { from: 4, to: 6 }, { from: 5, to: 6 },
  ];

  return (
    <div className="relative w-full h-[320px] rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl overflow-hidden">
      {/* Drift overlay pulse */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 right-4 px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30"
      >
        <span className="text-[10px] text-amber-400 font-medium">2 DRIFT ALERTS</span>
      </motion.div>

      <svg className="w-full h-full">
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from)!;
          const to = nodes.find(n => n.id === edge.to)!;
          return (
            <motion.line
              key={i}
              x1={from.x + 40} y1={from.y + 20}
              x2={to.x + 40} y2={to.y + 20}
              stroke="rgba(91, 95, 239, 0.3)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <rect
              x={node.x} y={node.y}
              width="80" height="40"
              rx="6"
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(91, 95, 239, 0.4)"
              strokeWidth="1"
            />
            <text
              x={node.x + 40} y={node.y + 18}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="500"
            >
              {node.label}
            </text>
            <text
              x={node.x + 40} y={node.y + 30}
              textAnchor="middle"
              fill="rgba(148, 163, 184, 0.7)"
              fontSize="8"
            >
              {node.layer}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// Glass section card
function GlassSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function LandingVersionA() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const pillars = [
    { icon: Network, title: 'Environments', desc: 'Structural truth layer — graph, versions, topology' },
    { icon: Shield, title: 'Governance', desc: 'Blueprint alignment, drift detection, readiness' },
    { icon: GitBranch, title: 'Impact', desc: 'Dependency paths, blast radius, stability scoring' },
    { icon: LayoutGrid, title: 'Insight', desc: 'Deterministic reports, health dashboards' },
    { icon: Users, title: 'Organisation', desc: 'RACI mapping, ownership, accountability' },
    { icon: Settings, title: 'Configuration', desc: 'Connectors, flow templates, integration rules' },
  ];

  const steps = [
    { num: '01', title: 'Ingest', desc: 'Connect sources via API connectors — no agents required' },
    { num: '02', title: 'Model', desc: 'Build canonical model with 5-layer topology' },
    { num: '03', title: 'Snapshot', desc: 'Capture immutable point-in-time environment state' },
    { num: '04', title: 'Govern', desc: 'Align against blueprints, detect drift, score readiness' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <LandingHeader variant="glass" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated gradient mesh background */}
        <motion.div style={{ y: backgroundY }} className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#5B5FEF]/12 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-[#7C3AED]/10 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#06B6D4]/6 rounded-full blur-[140px]" />
        </motion.div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
                Technical Environment Readiness.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED]">
                  Without Guesswork.
                </span>
              </h1>

              <p className="mt-8 text-xl text-slate-400 leading-relaxed max-w-xl">
                TelEnv IQ delivers structural truth across non-production environments —
                versions, topology, drift, governance alignment, and flow modelling —
                in one deterministic control surface.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center rounded-lg bg-[#5B5FEF] px-6 py-3.5 text-base font-medium hover:bg-[#4B4FDF] transition-all shadow-lg shadow-[#5B5FEF]/25"
                >
                  Start Environment Discovery
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard/environments/flow-map"
                  className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-3.5 text-base font-medium hover:bg-white/10 transition-all"
                >
                  View Flow Map
                </Link>
              </div>
            </motion.div>

            {/* Right - Environment Graph mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            >
              <EnvironmentGraphMockup />
            </motion.div>
          </div>
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
            <h2 className="text-3xl font-semibold text-white">The Challenge</h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Enterprise non-production landscapes suffer from structural ambiguity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Version Drift', desc: 'No single source of truth for what version is deployed where, leading to failed promotions and unexpected behavior.' },
              { title: 'Topology Blindness', desc: 'Environment dependencies are tribal knowledge, making impact analysis guesswork rather than science.' },
              { title: 'Governance Gaps', desc: 'Readiness assessments are manual checklists, not deterministic evaluations against defined blueprints.' },
            ].map((item, i) => (
              <GlassSection key={i} className="p-8">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassSection>
            ))}
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold text-white">Six Pillars of Environment Intelligence</h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              A structured approach to non-production environment governance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <GlassSection key={i} className="p-6 group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-[#5B5FEF]/10 flex items-center justify-center mb-4 group-hover:bg-[#5B5FEF]/20 transition-colors">
                  <pillar.icon className="w-5 h-5 text-[#5B5FEF]" />
                </div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{pillar.desc}</p>
              </GlassSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold text-white">How It Works</h2>
            <p className="mt-4 text-lg text-slate-400">Four steps from discovery to governance</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-5xl font-bold text-[#5B5FEF]/20">{step.num}</div>
                <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
                {i < 3 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-3 w-6 h-6 text-slate-600" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <GlassSection className="p-12 text-center">
            <h2 className="text-2xl font-semibold text-white">Not a CMDB. Not CI/CD. Not Scheduling.</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              TelEnv IQ is the Technical Environment Readiness & Governance Layer —
              purpose-built for modelling, snapshotting, and aligning non-production landscapes.
            </p>
          </GlassSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-white">
              Ready to bring structural truth to your environments?
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
              Start modelling your non-production landscape today.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center rounded-lg bg-[#5B5FEF] px-8 py-4 text-lg font-medium hover:bg-[#4B4FDF] transition-all shadow-lg shadow-[#5B5FEF]/25"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter variant="glass" />
    </div>
  );
}
