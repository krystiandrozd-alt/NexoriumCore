'use client';

// TelEnv IQ - Premium Value Proposition (Three Pillars)

import { Layers, Shield, AlertTriangle } from 'lucide-react';

const pillars = [
  {
    icon: Layers,
    title: 'Cross-Layer Visibility',
    description:
      'See infrastructure, network, APIs, software versions, and associated data in one structured model. From VMs to containers, from databases to message queues — every layer, every connection.',
    gradient: 'from-[#5B5FEF] to-[#7C3AED]',
    iconBg: 'bg-[#5B5FEF]/10',
    iconColor: 'text-[#5B5FEF]',
  },
  {
    icon: Shield,
    title: 'Embedded Governance',
    description:
      'Ownership, policy alignment, approvals, and exception tracking directly within the environment landscape. Governance that lives where the work happens, not in separate documentation.',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    icon: AlertTriangle,
    title: 'Proactive Risk Detection',
    description:
      'Identify coupling, drift, collisions, and dependency impact before disruption occurs. Know what will break before you make changes, not after.',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
];

export default function SolutionSection() {
  return (
    <section id="governance" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#F5F7FA]" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0B1220 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#0B1220]">
            A Unified Visibility & Governance Layer.
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            One platform to see everything, govern everything, and anticipate everything across your non-production landscape.
          </p>
        </div>

        {/* Pillars */}
        <div className="mt-16 lg:mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Glass card */}
                <div className="relative h-full rounded-2xl bg-white border border-slate-200/80 p-8 lg:p-10 shadow-sm hover:shadow-xl hover:border-slate-300/80 transition-all duration-300">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${pillar.iconBg}`}>
                    <pillar.icon className={`h-7 w-7 ${pillar.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-xl font-semibold text-[#0B1220]">
                    {pillar.title}
                  </h3>

                  <p className="mt-4 text-base text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Decorative gradient line */}
                  <div className="absolute bottom-0 left-8 right-8 h-1 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`h-full w-full bg-gradient-to-r ${pillar.gradient}`} />
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
