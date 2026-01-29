'use client';

// Nexorium Core - Problem Section (Enterprise Framing)

import { motion } from 'framer-motion';
import { HelpCircle, GitCompare, Workflow } from 'lucide-react';
import GlassCard from './GlassCard';

const problems = [
  {
    icon: HelpCircle,
    title: 'Version Uncertainty',
    question: 'What version is actually deployed?',
    description:
      'Teams lack confidence in version state across environments. Documentation lags behind reality. Promotion decisions are based on incomplete information.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: GitCompare,
    title: 'Drift Blindness',
    question: 'Has this environment diverged from baseline?',
    description:
      'Configuration drift accumulates silently. Environments that were once identical diverge without visibility. Snapshot comparison is manual and incomplete.',
    color: 'from-red-500/20 to-red-500/5',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/20',
  },
  {
    icon: Workflow,
    title: 'Flow Ambiguity',
    question: 'Which upstream change impacts downstream?',
    description:
      'Promotion paths are undocumented or inconsistent. Cross-environment dependencies are discovered through failure. Impact analysis is reactive, not proactive.',
    color: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
  },
];

export default function ProblemSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient accent */}
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
            Non-Production Environments Lack{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED]">
              Structural Truth
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            Enterprise teams operate with incomplete visibility into their non-production
            landscape. The result is delayed releases, unexpected failures, and governance gaps.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <GlassCard key={index} delay={index * 0.1} className="p-8">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${problem.color} ${problem.borderColor} border mb-6`}
              >
                <problem.icon className={`h-6 w-6 ${problem.iconColor}`} />
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{problem.title}</h3>

              <p className="text-[#5B5FEF] font-medium mb-4 italic">
                &ldquo;{problem.question}&rdquo;
              </p>

              <p className="text-slate-400 leading-relaxed">{problem.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
