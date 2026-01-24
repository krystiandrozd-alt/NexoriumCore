'use client';

// TelEnv IQ - Social Proof Section

import { Quote } from 'lucide-react';

// Enterprise logo placeholders - using generic shapes for now
const logos = [
  { name: 'Enterprise Corp', width: 'w-28' },
  { name: 'Global Systems', width: 'w-32' },
  { name: 'Tech Industries', width: 'w-24' },
  { name: 'Scale Solutions', width: 'w-30' },
  { name: 'Digital Group', width: 'w-28' },
  { name: 'Innovation Labs', width: 'w-26' },
];

export default function TelcoSection() {
  return (
    <section id="resources" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#5B5FEF]/5 rounded-full blur-[128px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white">
            Built for Organizations Operating at Scale.
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Trusted by enterprises managing complex non-production landscapes across multiple teams and environments.
          </p>
        </div>

        {/* Logo grid */}
        <div className="mt-16 lg:mt-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {logos.map((logo, index) => (
              <div
                key={index}
                className={`${logo.width} h-12 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center`}
              >
                <span className="text-sm text-slate-500 font-medium">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 lg:mt-24 mx-auto max-w-4xl">
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 lg:p-12">
            {/* Quote icon */}
            <div className="absolute -top-4 left-8">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#5B5FEF]">
                <Quote className="w-4 h-4 text-white" />
              </div>
            </div>

            <blockquote className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
              TelEnv IQ gave us complete visibility across our non-production landscape for the first time. We finally understand what is deployed where, who owns what, and how changes in one environment affect others.
            </blockquote>

            <div className="mt-8 flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <div>
                <p className="text-white font-medium">Director of Platform Engineering</p>
                <p className="text-sm text-slate-500">Enterprise Technology Organization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 lg:mt-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '50+', label: 'Environments managed' },
              { value: '500+', label: 'Systems tracked' },
              { value: '99.9%', label: 'Data freshness' },
              { value: '<5min', label: 'To detect drift' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-semibold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
