'use client';

// TelEnvIQ - Built for Telco Complexity Section

import { Building2, Layers, Workflow, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'OSS/BSS Integration Landscapes',
    description: 'Purpose-built for complex telecom systems. Handles billing, provisioning, CRM, network management, and service orchestration platforms.',
  },
  {
    icon: Layers,
    title: 'Multi-Vendor Stacks',
    description: 'Works seamlessly with mixed technology stacks. Supports legacy systems, modern microservices, and everything in between.',
  },
  {
    icon: Workflow,
    title: 'SIT, UAT, NFT, PreProd',
    description: 'Designed for the full test environment lifecycle. Track topology and data freshness across all environment tiers.',
  },
  {
    icon: ArrowUpRight,
    title: 'Transformation Programs',
    description: 'Built for high-change environments. Continuous discovery keeps pace with rapid deployment cycles and modernization efforts.',
  },
];

export default function TelcoSection() {
  return (
    <section id="telco" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                For Telco
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built for Telco Complexity
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Telecommunications environments are among the most complex integration
                landscapes in existence. TelEnvIQ is designed from the ground up to handle
                this complexity.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                        <feature.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual */}
            <div className="relative lg:pl-8">
              <div className="aspect-square max-w-lg mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-8 border border-indigo-100">
                <div className="h-full w-full relative">
                  {/* OSS/BSS visualization */}
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Central hub */}
                    <circle cx="150" cy="150" r="40" fill="#6366F1" opacity="0.1" />
                    <circle cx="150" cy="150" r="30" fill="#6366F1" opacity="0.2" />
                    <circle cx="150" cy="150" r="20" fill="#6366F1" />
                    <text x="150" y="155" textAnchor="middle" className="text-[8px] font-bold fill-white">
                      TelEnvIQ
                    </text>

                    {/* Surrounding systems */}
                    {[
                      { x: 75, y: 75, label: 'Billing' },
                      { x: 225, y: 75, label: 'CRM' },
                      { x: 75, y: 225, label: 'Network' },
                      { x: 225, y: 225, label: 'Provisioning' },
                      { x: 50, y: 150, label: 'OSS' },
                      { x: 250, y: 150, label: 'BSS' },
                      { x: 150, y: 50, label: 'Portal' },
                      { x: 150, y: 250, label: 'Analytics' },
                    ].map((system, i) => (
                      <g key={i}>
                        <line
                          x1="150"
                          y1="150"
                          x2={system.x}
                          y2={system.y}
                          stroke="#6366F1"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                          opacity="0.3"
                        />
                        <circle cx={system.x} cy={system.y} r="24" fill="white" stroke="#6366F1" strokeWidth="1.5" />
                        <text x={system.x} y={system.y + 4} textAnchor="middle" className="text-[8px] font-medium fill-slate-700">
                          {system.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
