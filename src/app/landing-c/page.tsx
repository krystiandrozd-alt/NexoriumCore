'use client';

// TelEnv IQ - Landing Version C: Technical Control Surface
// Style: Technical aesthetic, subtle grid background, fine-line accents, system-like typography
// Tone: Architectural intelligence, technical depth

import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Database, GitBranch, Shield, Network, Activity } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import LandingHeader from '@/components/landing/shared/LandingHeader';
import LandingFooter from '@/components/landing/shared/LandingFooter';

// Live-style topology animation
function TopologySimulation() {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const nodes = [
    { id: 1, x: 80, y: 50, label: 'CRM', type: 'BSS', status: 'healthy' },
    { id: 2, x: 200, y: 40, label: 'Billing', type: 'BSS', status: 'healthy' },
    { id: 3, x: 320, y: 55, label: 'CPQ', type: 'BSS', status: 'drift' },
    { id: 4, x: 140, y: 130, label: 'SOM', type: 'OSS', status: 'healthy' },
    { id: 5, x: 260, y: 140, label: 'Inventory', type: 'OSS', status: 'healthy' },
    { id: 6, x: 200, y: 210, label: 'Provisioning', type: 'NET', status: 'healthy' },
  ];

  const edges = [
    { from: 1, to: 4 }, { from: 2, to: 4 }, { from: 2, to: 5 },
    { from: 3, to: 5 }, { from: 4, to: 6 }, { from: 5, to: 6 },
  ];

  return (
    <div className="relative w-full h-[300px] rounded-lg bg-[#0a0f18] border border-cyan-500/10 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 px-4 py-2 border-b border-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[10px] font-mono text-cyan-500/70">TOPOLOGY.LIVE</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
          <span>NODES: {nodes.length}</span>
          <span>EDGES: {edges.length}</span>
          <span className="text-amber-500">DRIFT: 1</span>
        </div>
      </div>

      <svg className="w-full h-full pt-8">
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from)!;
          const to = nodes.find(n => n.id === edge.to)!;
          const isHighlighted = activeNode === edge.from || activeNode === edge.to;
          return (
            <motion.line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isHighlighted ? '#06B6D4' : 'rgba(6, 182, 212, 0.15)'}
              strokeWidth={isHighlighted ? '2' : '1'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            className="cursor-pointer"
          >
            <circle
              cx={node.x} cy={node.y} r="24"
              fill="#0a0f18"
              stroke={node.status === 'drift' ? '#F59E0B' : activeNode === node.id ? '#06B6D4' : 'rgba(6, 182, 212, 0.3)'}
              strokeWidth={activeNode === node.id ? '2' : '1'}
            />
            <text
              x={node.x} y={node.y - 4}
              textAnchor="middle"
              fill="white"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="500"
            >
              {node.label}
            </text>
            <text
              x={node.x} y={node.y + 8}
              textAnchor="middle"
              fill={node.status === 'drift' ? '#F59E0B' : 'rgba(6, 182, 212, 0.6)'}
              fontSize="7"
              fontFamily="monospace"
            >
              {node.type}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// Technical panel component
function TechPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="rounded-lg bg-[#0a0f18] border border-cyan-500/10 overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-cyan-500/10 bg-cyan-500/5">
        <span className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

export default function LandingVersionC() {
  const metrics = [
    { icon: Network, label: 'Environments', value: 'Multi-tier' },
    { icon: Database, label: 'Snapshots', value: 'Immutable' },
    { icon: GitBranch, label: 'Drift', value: 'Detected' },
    { icon: Shield, label: 'Governance', value: 'Aligned' },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <LandingHeader variant="technical" />

      {/* Grid background for entire page */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider">
                  Environment Intelligence Platform
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15]">
                Model. Snapshot.{' '}
                <span className="text-cyan-400">Govern.</span>
              </h1>

              <p className="mt-8 text-lg text-slate-400 leading-relaxed max-w-lg font-light">
                TelEnv IQ provides architectural visibility across non-production environments.
                Canonical topology. Version truth. Deterministic governance.
              </p>

              {/* Metrics row */}
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-3 rounded border border-cyan-500/10 bg-cyan-500/5"
                  >
                    <metric.icon className="w-4 h-4 text-cyan-500/50 mb-2" />
                    <div className="text-xs text-slate-500 font-mono">{metric.label}</div>
                    <div className="text-sm font-medium text-white">{metric.value}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  href="/login"
                  className="group inline-flex items-center rounded bg-cyan-500 px-6 py-3 text-sm font-medium text-black hover:bg-cyan-400 transition-colors"
                >
                  Access Control Surface
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Right - Topology simulation */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TopologySimulation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section - Panel style */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-white">System Challenges</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { code: 'ERR_VERSION_DRIFT', title: 'Version Drift', desc: 'Deployed versions diverge from expected state without detection mechanism.' },
              { code: 'ERR_TOPO_UNKNOWN', title: 'Topology Blindness', desc: 'Component dependencies undocumented. Impact analysis unreliable.' },
              { code: 'ERR_GOV_MANUAL', title: 'Governance Gaps', desc: 'Readiness assessments based on checklists, not deterministic rules.' },
            ].map((item, i) => (
              <TechPanel key={i} title={item.code}>
                <h3 className="text-base font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
              </TechPanel>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities - Technical grid */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-white">Core Modules</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Network, module: 'ENV.GRAPH', title: 'Environment Graph', desc: '5-layer canonical topology model' },
              { icon: Activity, module: 'FLOW.MAP', title: 'Flow Map', desc: 'Stage-based promotion path intelligence' },
              { icon: Shield, module: 'GOV.ALIGN', title: 'Governance', desc: 'Blueprint alignment and drift detection' },
              { icon: GitBranch, module: 'IMPACT.CALC', title: 'Impact Analysis', desc: 'Dependency path and blast radius' },
              { icon: Database, module: 'SNAP.STORE', title: 'Snapshots', desc: 'Immutable point-in-time captures' },
              { icon: Terminal, module: 'CONN.INGEST', title: 'Connectors', desc: 'API-based source ingestion' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}
                className="p-5 rounded-lg border border-cyan-500/10 bg-[#0a0f18]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-4 h-4 text-cyan-500/60" />
                  <span className="text-[10px] font-mono text-cyan-500/50 uppercase">{item.module}</span>
                </div>
                <h3 className="text-base font-medium text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process - Panel transitions */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-white">Execution Flow</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-0 border border-cyan-500/10 rounded-lg overflow-hidden">
            {[
              { step: '01', label: 'INGEST', desc: 'Connect source systems via API connectors' },
              { step: '02', label: 'MODEL', desc: 'Build canonical 5-layer topology' },
              { step: '03', label: 'SNAPSHOT', desc: 'Capture immutable environment state' },
              { step: '04', label: 'GOVERN', desc: 'Evaluate against blueprints' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 ${i < 3 ? 'border-r border-cyan-500/10' : ''} hover:bg-cyan-500/5 transition-colors`}
              >
                <div className="text-3xl font-mono text-cyan-500/30 mb-4">{item.step}</div>
                <div className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider mb-2">{item.label}</div>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <TechPanel title="SYSTEM.SCOPE">
            <div className="text-center py-6">
              <p className="text-slate-500 font-mono text-sm">
                ! NOT_CMDB && ! CI_CD && ! SCHEDULER
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">
                Technical Environment Readiness & Governance Layer
              </h2>
              <p className="mt-4 text-slate-400 max-w-lg mx-auto">
                Purpose-built for modelling, snapshotting, and aligning non-production landscapes.
              </p>
            </div>
          </TechPanel>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-white">
              Initialize environment discovery
            </h2>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center rounded bg-cyan-500 px-8 py-4 text-base font-medium text-black hover:bg-cyan-400 transition-colors"
            >
              Launch Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter variant="technical" />
    </div>
  );
}
