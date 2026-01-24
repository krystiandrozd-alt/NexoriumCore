'use client';

// TelEnvIQ - Problem Section

import { AlertTriangle, FileQuestion, GitBranch, Database, Users } from 'lucide-react';

const problems = [
  {
    icon: FileQuestion,
    title: 'Static diagrams that are outdated within days',
    description: 'Manual architecture documentation becomes stale the moment it is created.',
  },
  {
    icon: GitBranch,
    title: 'Unknown integration drift across SIT/UAT',
    description: 'Service dependencies change silently, causing unexpected failures.',
  },
  {
    icon: AlertTriangle,
    title: 'No clear view of service-to-service dependencies',
    description: 'Teams operate without understanding the full integration landscape.',
  },
  {
    icon: Database,
    title: 'Stale or misaligned test data causing instability',
    description: 'Data refresh cycles are invisible, leading to test environment failures.',
  },
  {
    icon: Users,
    title: 'No ownership transparency',
    description: 'When issues arise, finding the responsible team takes precious time.',
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="py-20 lg:py-28 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-red-600">
            The Problem
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Test Environments Are Failing — Not Because of Code,{' '}
            <span className="text-red-600">But Because of Visibility</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Integration failures, data misalignment, and topology drift are symptoms of a
            deeper issue: you cannot manage what you cannot see.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <problem.icon className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-10 sm:px-12">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">67%</div>
                <div className="mt-1 text-sm text-slate-400">of test failures are environment-related</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.5h</div>
                <div className="mt-1 text-sm text-slate-400">average time to diagnose integration issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">83%</div>
                <div className="mt-1 text-sm text-slate-400">of architecture docs are outdated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">2.3x</div>
                <div className="mt-1 text-sm text-slate-400">longer release cycles due to environment issues</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
