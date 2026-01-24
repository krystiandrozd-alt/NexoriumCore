'use client';

// TelEnv IQ - Premium Feature Sections (Zig-Zag Layout) + How It Works

import {
  Layers,
  Shield,
  Network,
  Plug,
  Box,
  Settings,
  Eye,
} from 'lucide-react';

// Zig-zag feature sections data
const features = [
  {
    badge: 'Traceability',
    title: 'From Hardware to Data — Connected.',
    description:
      'Trace dependencies across every layer: from virtual machines and containers through APIs and services to databases and data pipelines. Understand exactly how components connect, what depends on what, and where boundaries exist.',
    points: [
      'Infrastructure-to-application mapping',
      'API dependency tracking',
      'Data lineage visualization',
      'Version correlation across layers',
    ],
    icon: Layers,
    visual: 'layers',
  },
  {
    badge: 'Governance',
    title: 'Governance Without Bureaucracy.',
    description:
      'Embed policy checks, RACI clarity, exception management, and drift evaluation directly into your environment model. No separate governance documentation that falls out of sync. Governance that is actionable, not theoretical.',
    points: [
      'Embedded ownership and RACI',
      'Policy alignment checks',
      'Exception tracking with audit trail',
      'Real-time drift evaluation',
    ],
    icon: Shield,
    visual: 'governance',
  },
  {
    badge: 'Portfolio Scale',
    title: 'Clarity at Portfolio Scale.',
    description:
      'Understand cross-project dependencies and environment-level health across your entire non-production landscape. See how changes in one area ripple across environments. Prevent collisions before they happen.',
    points: [
      'Cross-project dependency detection',
      'Environment health scoring',
      'Change impact prediction',
      'Portfolio-wide risk visibility',
    ],
    icon: Network,
    visual: 'portfolio',
  },
];

// How it works steps
const steps = [
  {
    number: '1',
    title: 'Connect Your Environment Sources',
    description: 'Link your infrastructure, cloud providers, container orchestrators, and configuration management tools.',
    icon: Plug,
  },
  {
    number: '2',
    title: 'Build a Structured Cross-Layer Model',
    description: 'Automatically map relationships from infrastructure through applications to data.',
    icon: Box,
  },
  {
    number: '3',
    title: 'Apply Governance & Ownership Logic',
    description: 'Define policies, assign ownership, and establish alignment criteria.',
    icon: Settings,
  },
  {
    number: '4',
    title: 'Operate with Continuous Insight',
    description: 'Monitor health, detect drift, and anticipate risk in real-time.',
    icon: Eye,
  },
];

// Visual placeholder component for feature sections
function FeatureVisual({ type }: { type: string }) {
  return (
    <div className="relative h-[300px] lg:h-[400px] rounded-xl border border-white/10 bg-[#0f1629]/60 backdrop-blur-sm overflow-hidden">
      {/* Gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5B5FEF]/10 via-transparent to-[#06B6D4]/10" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content based on type */}
      <div className="absolute inset-0 flex items-center justify-center">
        {type === 'layers' && (
          <div className="space-y-3 w-full max-w-[280px]">
            {['Application', 'API', 'Data', 'Infrastructure'].map((layer, i) => (
              <div
                key={layer}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10"
                style={{ marginLeft: `${i * 16}px` }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  i === 0 ? 'bg-cyan-400' :
                  i === 1 ? 'bg-[#5B5FEF]' :
                  i === 2 ? 'bg-emerald-400' :
                  'bg-slate-400'
                }`} />
                <span className="text-sm text-white/70">{layer} Layer</span>
              </div>
            ))}
          </div>
        )}

        {type === 'governance' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
              <Shield className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">Compliant</span>
                <span className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400">3 Exceptions</span>
              </div>
              <p className="text-sm text-slate-500">Last audit: 12 hours ago</p>
            </div>
          </div>
        )}

        {type === 'portfolio' && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative">
              {/* Central hub */}
              <div className="w-16 h-16 rounded-xl bg-[#5B5FEF]/20 border border-[#5B5FEF]/30 flex items-center justify-center">
                <Network className="w-8 h-8 text-[#5B5FEF]" />
              </div>
              {/* Orbiting nodes */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <div
                  key={i}
                  className="absolute w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle}deg) translateX(80px) rotate(-${angle}deg)`,
                    top: '50%',
                    left: '50%',
                    marginTop: '-16px',
                    marginLeft: '-16px',
                  }}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    i % 3 === 0 ? 'bg-emerald-400' :
                    i % 3 === 1 ? 'bg-amber-400' :
                    'bg-cyan-400'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <>
      {/* Zig-Zag Feature Sections */}
      <section id="intelligence" className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1220]" />

        {/* Gradient accents */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#5B5FEF]/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[128px]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                index !== 0 ? 'mt-24 lg:mt-32' : ''
              }`}
            >
              {/* Content - alternating sides */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#5B5FEF]/10 text-[#5B5FEF] border border-[#5B5FEF]/20 mb-6">
                  {feature.badge}
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-white">
                  {feature.title}
                </h3>

                <p className="mt-6 text-lg text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="mt-8 space-y-3">
                  {feature.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5B5FEF]/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF]" />
                      </div>
                      <span className="text-sm text-slate-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <FeatureVisual type={feature.visual} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#F5F7FA]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16 lg:mb-20">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#0B1220]">
              How It Works
            </h2>
            <p className="mt-6 text-lg text-slate-600">
              Four steps from connection to continuous insight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-slate-300 to-transparent z-0" />
                )}

                <div className="relative">
                  {/* Number badge */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0B1220] text-white text-lg font-semibold mb-6">
                    {step.number}
                  </div>

                  <h3 className="text-lg font-semibold text-[#0B1220] mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
