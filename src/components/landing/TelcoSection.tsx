'use client';

// Nexorium Core - Differentiation Section
// "Not a CMDB. Not CI/CD. Not Test Scheduling."

import { motion } from 'framer-motion';
import { Database, GitBranch, Calendar, CheckCircle, X } from 'lucide-react';
import GlassCard from './GlassCard';

const comparisons = [
  {
    tool: 'CMDB',
    icon: Database,
    notFor: 'Asset inventory and IT service management',
    nexorium: 'Environment structure, topology, and version truth',
  },
  {
    tool: 'CI/CD Pipeline',
    icon: GitBranch,
    notFor: 'Build automation and deployment execution',
    nexorium: 'Pre-promotion readiness and alignment validation',
  },
  {
    tool: 'Test Scheduling',
    icon: Calendar,
    notFor: 'Test execution and booking coordination',
    nexorium: 'Environment structural readiness before booking',
  },
];

const focusPoints = [
  'Technical readiness verification',
  'Structural truth across environments',
  'Deterministic environment modelling',
  'Governance alignment validation',
  'Impact visibility and risk detection',
];

export default function TelcoSection() {
  return (
    <section id="differentiation" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#5B5FEF]/5 rounded-full blur-[128px]" />

      {/* Top line */}
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
            Not a CMDB. Not CI/CD.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED]">
              Not Test Scheduling.
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            Nexorium Core sits before environment booking and promotion — ensuring environments
            are structurally ready before they are used.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {comparisons.map((item, index) => (
            <GlassCard key={index} delay={index * 0.1} className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10">
                  <item.icon className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.tool}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Not for:</p>
                    <p className="text-sm text-slate-300">{item.notFor}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#5B5FEF]">Nexorium Core:</p>
                    <p className="text-sm text-slate-300">{item.nexorium}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Focus Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 lg:mt-20"
        >
          <GlassCard hover={false} className="p-8 lg:p-12">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-white">Nexorium Core focuses on:</h3>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {focusPoints.map((point, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5B5FEF]/10 border border-[#5B5FEF]/20"
                >
                  <CheckCircle className="h-4 w-4 text-[#5B5FEF]" />
                  <span className="text-sm text-slate-300">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/[0.05] text-center">
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Nexorium Core is the <span className="text-white font-medium">Technical Environment
                Readiness & Governance Layer</span> for non-production landscapes. It answers what
                exists, what version is deployed, and whether the environment is ready — before
                anyone books it, tests against it, or promotes through it.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
