'use client';

// TelEnvIQ - How It Works Section

import { Plug, Search, Clock, AlertCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Plug,
    title: 'Connect',
    subtitle: 'Kubernetes, GitOps, YAML',
    description: 'Point TelEnvIQ at your Kubernetes clusters, GitOps repositories, or import topology via YAML. No agents required.',
    color: 'indigo',
  },
  {
    number: '02',
    icon: Search,
    title: 'Discover',
    subtitle: 'Components & Dependencies',
    description: 'Automatically discover services, databases, message queues, and their interconnections. Evidence-based mapping with confidence scores.',
    color: 'blue',
  },
  {
    number: '03',
    icon: Clock,
    title: 'Track',
    subtitle: 'Test Data Refresh & Lineage',
    description: 'Monitor test data freshness, masking policy versions, and downstream consumers. Never lose track of when data was last refreshed.',
    color: 'emerald',
  },
  {
    number: '04',
    icon: AlertCircle,
    title: 'Detect',
    subtitle: 'Drift & Stale Data',
    description: 'Get alerted when topology changes, integrations drift, or test data becomes stale. Compare snapshots to understand what changed.',
    color: 'amber',
  },
];

const colorClasses = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-100' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-100' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-100' },
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From Connection to Intelligence in Four Steps
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            A simple, non-invasive approach to gaining visibility into your test environment topology and data lifecycle.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 hidden lg:block" />

            <div className="space-y-12 lg:space-y-0">
              {steps.map((step, index) => {
                const colors = colorClasses[step.color as keyof typeof colorClasses];
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={index}
                    className={`relative lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center ${
                      index !== 0 ? 'lg:pt-12' : ''
                    }`}
                  >
                    {/* Content */}
                    <div
                      className={`${
                        isEven ? 'lg:pr-8' : 'lg:pl-8 lg:col-start-2'
                      }`}
                    >
                      <div
                        className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-200 ${
                          isEven ? 'lg:text-right' : ''
                        }`}
                      >
                        <div
                          className={`inline-flex items-center gap-2 ${
                            isEven ? 'lg:flex-row-reverse' : ''
                          }`}
                        >
                          <span
                            className={`text-sm font-bold ${colors.text}`}
                          >
                            {step.number}
                          </span>
                          <div
                            className={`inline-flex rounded-lg p-2 ${colors.light}`}
                          >
                            <step.icon className={`h-5 w-5 ${colors.text}`} />
                          </div>
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-slate-900">
                          {step.title}
                        </h3>
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {step.subtitle}
                        </p>
                        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Circle indicator on timeline */}
                    <div
                      className={`hidden lg:flex lg:items-center lg:justify-center ${
                        isEven ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1'
                      }`}
                    >
                      <div className="absolute left-1/2 -translate-x-1/2">
                        <div
                          className={`h-12 w-12 rounded-full ${colors.bg} flex items-center justify-center shadow-lg`}
                        >
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
