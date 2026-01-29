'use client';

// Nexorium Core - How It Works Section (4-Step Process)

import { motion } from 'framer-motion';
import { Plug, Boxes, Camera, Shield } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Ingest',
    subtitle: 'API-based connectors',
    description:
      'Connect to your infrastructure, cloud providers, and configuration management systems through API-based connectors. Data flows into a canonical internal model.',
    icon: Plug,
    gradient: 'from-cyan-500 to-cyan-400',
  },
  {
    number: '02',
    title: 'Model',
    subtitle: 'Structured representation',
    description:
      'Build a structured model of hosts, components, deployed versions, and interfaces. Every relationship is explicit, every connection is traced.',
    icon: Boxes,
    gradient: 'from-[#5B5FEF] to-[#7C3AED]',
  },
  {
    number: '03',
    title: 'Snapshot',
    subtitle: 'Immutable state capture',
    description:
      'Capture immutable snapshots of environment state. Compare snapshots over time. Track drift with full provenance and audit trail.',
    icon: Camera,
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    number: '04',
    title: 'Govern',
    subtitle: 'Alignment & readiness',
    description:
      'Apply governance alignment checks, readiness validation, and risk visibility. Know if your environment is structurally ready before promotion.',
    icon: Shield,
    gradient: 'from-emerald-500 to-teal-400',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#5B5FEF]/5 rounded-full blur-[150px]" />

      {/* Top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            How It Works
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Four steps from ingestion to governance. No agents, no complexity, no guesswork.
          </p>
        </motion.div>

        {/* Steps - Horizontal Layout */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-white/5 via-white/20 to-white/5" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step card */}
                <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 h-full hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300">
                  {/* Number + Icon */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg`}
                    >
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-white/10">{step.number}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-[#5B5FEF] font-medium mb-4">{step.subtitle}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>

                {/* Connector arrow for large screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-[60px] w-6 h-6 items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-[#5B5FEF]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
