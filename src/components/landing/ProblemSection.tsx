'use client';

// TelEnv IQ - Premium Problem Section

import {
  Server,
  Code,
  Database,
  FileText,
  GitBranch,
  AlertCircle,
  Clock,
} from 'lucide-react';

const problemAreas = [
  {
    icon: Server,
    title: 'Infrastructure teams',
    description: 'manage hardware and network configurations in isolation.',
  },
  {
    icon: Code,
    title: 'Application teams',
    description: 'manage versions and APIs without cross-system visibility.',
  },
  {
    icon: Database,
    title: 'Data teams',
    description: 'manage refresh cycles and masking with limited coordination.',
  },
  {
    icon: FileText,
    title: 'Governance',
    description: 'sits in documentation, disconnected from reality.',
  },
  {
    icon: GitBranch,
    title: 'Cross-project dependencies',
    description: 'go unnoticed until they cause failures.',
  },
  {
    icon: Clock,
    title: 'Drift accumulates',
    description: 'silently across environments over time.',
  },
  {
    icon: AlertCircle,
    title: 'Risk is discovered',
    description: 'late, often during critical release windows.',
  },
];

export default function ProblemSection() {
  return (
    <section id="platform" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white">
            Modern Non-Production Environments Are Fragmented.
          </h2>
        </div>

        {/* Problem grid */}
        <div className="mt-16 lg:mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {problemAreas.map((problem, index) => (
              <div
                key={index}
                className="group relative rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-white/5">
                    <problem.icon className="h-5 w-5 text-slate-400 group-hover:text-white/70 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white/90 leading-snug">
                      {problem.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary statement */}
        <div className="mt-16 lg:mt-20 mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 lg:p-10">
            <div className="absolute -top-3 left-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                The Result
              </span>
            </div>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
              Without a unified view, organizations operate blind. Environment health degrades incrementally. Risk surfaces too late. And teams spend more time investigating issues than building.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
