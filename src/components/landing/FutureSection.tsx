'use client';

// TelEnvIQ - Future Vision Section

import { Sparkles, Target, GitMerge, Ticket } from 'lucide-react';

const futureFeatures = [
  {
    icon: Sparkles,
    title: 'AI-Assisted Impact Analysis',
    description: 'Leverage AI to predict the impact of changes across your environment topology.',
  },
  {
    icon: Target,
    title: 'Blast Radius Tracing',
    description: 'Instantly visualize which services and data sets will be affected by a change.',
  },
  {
    icon: GitMerge,
    title: 'Controlled Refresh Orchestration',
    description: 'Automate and orchestrate test data refresh operations across environments.',
  },
  {
    icon: Ticket,
    title: 'ITSM Integration',
    description: 'Connect with ServiceNow, Jira, and other ITSM tools for change management.',
  },
];

export default function FutureSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm bg-indigo-100 text-indigo-700 mb-6">
            <Sparkles className="h-4 w-4" />
            Coming Soon
          </div>
          <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            The Future of Environment Intelligence
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            We are constantly evolving TelEnvIQ to provide deeper insights and more
            powerful automation capabilities.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {futureFeatures.map((feature, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-dashed border-slate-300 bg-white/50 p-6 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <feature.icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-700">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
