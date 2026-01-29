'use client';

// Nexorium Core - Core Capabilities Section (6 Pillars)

import { motion } from 'framer-motion';
import {
  Network,
  Map,
  Shield,
  Zap,
  Users,
  Camera,
} from 'lucide-react';
import GlassCard from './GlassCard';

const capabilities = [
  {
    icon: Network,
    title: 'Environment Graph',
    benefits: [
      'Structural topology visualization',
      'Version overlays across systems',
      'Drift detection and comparison',
    ],
    description:
      'See the complete architecture of each environment — every component, every connection, every version — in a single deterministic view.',
    gradient: 'from-[#5B5FEF]/20 to-[#5B5FEF]/5',
    iconColor: 'text-[#5B5FEF]',
  },
  {
    icon: Map,
    title: 'Flow Map',
    benefits: [
      'Stage modelling (DEV → SIT → UAT)',
      'Upstream/downstream branching',
      'Promotion path visibility',
    ],
    description:
      'Model the flow of changes through your environment pipeline. Understand dependencies and promotion paths before you promote.',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Shield,
    title: 'Governance Alignment',
    benefits: [
      'Blueprint vs Snapshot comparison',
      'Release validation gates',
      'Non-prod vs Prod drift detection',
    ],
    description:
      'Ensure environments match expected state. Validate against blueprints and release targets with deterministic alignment checks.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Impact Intelligence',
    benefits: [
      'Entry/exit path analysis',
      'Blast radius calculation',
      'Stability index scoring',
    ],
    description:
      'Understand the downstream impact of any change before it happens. Identify critical paths and calculate blast radius automatically.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
  },
  {
    icon: Users,
    title: 'Organisational Accountability',
    benefits: [
      'RACI mapping per environment',
      'Ownership coverage metrics',
      'Orphan detection alerts',
    ],
    description:
      'Know who owns what, who approves what, and who must be consulted. Surface orphaned assets without clear accountability.',
    gradient: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-400',
  },
  {
    icon: Camera,
    title: 'Deterministic Snapshot Engine',
    benefits: [
      'Immutable state capture',
      'Snapshot-to-snapshot diff',
      'Provenance tracking',
    ],
    description:
      'Capture and compare environment state with full provenance. Every snapshot is immutable, every diff is traceable.',
    gradient: 'from-rose-500/20 to-rose-500/5',
    iconColor: 'text-rose-400',
  },
];

export default function SolutionSection() {
  return (
    <section id="capabilities" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient accents */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#5B5FEF]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-[150px]" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            Core Capabilities
          </h2>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            Six integrated pillars that deliver structural truth, governance alignment,
            and impact visibility across your entire non-production landscape.
          </p>
        </motion.div>

        {/* Capabilities Grid - 2x3 */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {capabilities.map((capability, index) => (
            <GlassCard key={index} delay={index * 0.1} className="p-8">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${capability.gradient} border border-white/[0.08] mb-6`}
              >
                <capability.icon className={`h-6 w-6 ${capability.iconColor}`} />
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">{capability.title}</h3>

              <ul className="space-y-2 mb-4">
                {capability.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF] mt-1.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-slate-500 leading-relaxed">{capability.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
