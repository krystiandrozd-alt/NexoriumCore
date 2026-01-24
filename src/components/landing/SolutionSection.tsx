'use client';

// TelEnvIQ - Solution Section

import { Scan, Network, RefreshCw } from 'lucide-react';

const pillars = [
  {
    icon: Scan,
    title: 'Auto-Discovery',
    description: 'Continuously discover and map services, runtimes, endpoints, and integrations from Kubernetes, GitOps, and manual imports.',
    color: 'indigo',
    features: [
      'Kubernetes namespace scanning',
      'GitOps manifest parsing',
      'Environment variable detection',
      'Service mesh integration',
    ],
  },
  {
    icon: Network,
    title: 'Evidence-Driven Topology',
    description: 'Generate dynamic, confidence-scored environment graphs that reflect the true state of your test environments.',
    color: 'blue',
    features: [
      'Confidence-based edge scoring',
      'Staleness detection',
      'Dependency visualization',
      'Owner attribution',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Test Data Lifecycle Intelligence',
    description: 'Track refresh dates, masking policies, lineage, and staleness across all environments and databases.',
    color: 'emerald',
    features: [
      'Refresh tracking',
      'Masking policy versions',
      'Downstream consumer mapping',
      'Staleness alerts',
    ],
  },
];

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-600',
    border: 'border-indigo-200',
    check: 'text-indigo-500',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    border: 'border-blue-200',
    check: 'text-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-200',
    check: 'text-emerald-500',
  },
};

export default function SolutionSection() {
  return (
    <section id="solution" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            The Solution
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            TelEnvIQ: Living Environment Intelligence
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            A platform that treats topology auto-discovery and test data lifecycle tracking
            as first-class capabilities, purpose-built for complex integration landscapes.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pillars.map((pillar, index) => {
              const colors = colorClasses[pillar.color as keyof typeof colorClasses];

              return (
                <div
                  key={index}
                  className={`relative rounded-2xl border ${colors.border} ${colors.bg} p-8 transition-all hover:shadow-lg`}
                >
                  <div className={`inline-flex rounded-xl p-3 ${colors.icon}`}>
                    <pillar.icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-slate-900">
                    {pillar.title}
                  </h3>

                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {pillar.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <svg
                          className={`h-5 w-5 flex-shrink-0 ${colors.check}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
