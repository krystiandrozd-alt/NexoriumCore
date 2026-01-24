'use client';

// TelEnv IQ - Pricing Section + FAQ

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ArrowRight } from 'lucide-react';

const tiers = [
  {
    name: 'Growth',
    description: 'For teams getting started with environment visibility.',
    features: [
      'Up to 5 environments',
      'Basic topology mapping',
      'Version tracking',
      'Snapshot comparisons',
      'Email support',
    ],
    cta: 'Speak with Our Team',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    description: 'For organizations requiring full visibility and governance.',
    features: [
      'Unlimited environments',
      'Cross-layer dependency mapping',
      'Embedded governance & RACI',
      'Real-time drift detection',
      'API access',
      'SSO integration',
      'Dedicated support',
    ],
    cta: 'Speak with Our Team',
    highlighted: true,
    badge: 'Recommended',
  },
  {
    name: 'Strategic',
    description: 'For enterprises with complex, portfolio-scale requirements.',
    features: [
      'Everything in Enterprise',
      'Multi-region deployment',
      'Custom integrations',
      'Advanced analytics',
      'SLA guarantees',
      'Dedicated success manager',
      'Custom training',
    ],
    cta: 'Speak with Our Team',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Does TelEnv IQ modify infrastructure directly?',
    answer:
      'No. TelEnv IQ is a visibility and governance layer. It observes and maps your environments but does not make changes to infrastructure, deploy code, or modify configurations. All changes to your systems remain under your control through your existing tools and processes.',
  },
  {
    question: 'Is this limited to specific industries?',
    answer:
      'No. While TelEnv IQ handles the complexity common in telecommunications and large enterprise environments, it is designed for any organization managing complex non-production landscapes. Financial services, healthcare, retail, and technology companies all benefit from cross-layer environment visibility.',
  },
  {
    question: 'How is governance enforced?',
    answer:
      'Governance in TelEnv IQ is embedded directly into the environment model. This includes ownership definitions, policy alignment checks, exception tracking, and drift evaluation. Governance rules are configured to match your organizational policies and are continuously evaluated against the actual state of your environments.',
  },
  {
    question: 'Can it integrate with existing DevOps and infrastructure tooling?',
    answer:
      'Yes. TelEnv IQ integrates with common infrastructure tools including Kubernetes, Terraform, cloud providers (AWS, Azure, GCP), configuration management systems, and CI/CD pipelines. Data is ingested through connectors rather than agents, minimizing operational overhead.',
  },
  {
    question: 'Does it support multi-team environments?',
    answer:
      'Yes. TelEnv IQ is built for organizations where multiple teams share and depend on non-production environments. The platform includes ownership attribution, RACI mapping, and cross-project dependency tracking to coordinate work across teams.',
  },
];

export default function FutureSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#F5F7FA]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#0B1220]">
              Pricing
            </h2>
            <p className="mt-6 text-lg text-slate-600">
              Choose the plan that matches your organization&apos;s scale and requirements.
            </p>
          </div>

          {/* Pricing tiers */}
          <div className="mt-16 lg:mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl p-8 lg:p-10 ${
                    tier.highlighted
                      ? 'bg-[#0B1220] ring-2 ring-[#5B5FEF]'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-[#5B5FEF] text-white">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3
                      className={`text-xl font-semibold ${
                        tier.highlighted ? 'text-white' : 'text-[#0B1220]'
                      }`}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        tier.highlighted ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {tier.description}
                    </p>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check
                          className={`h-5 w-5 flex-shrink-0 ${
                            tier.highlighted ? 'text-[#5B5FEF]' : 'text-emerald-500'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            tier.highlighted ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      href="#contact"
                      className={`inline-flex items-center justify-center w-full rounded-lg px-5 py-3 text-sm font-medium transition-all ${
                        tier.highlighted
                          ? 'bg-[#5B5FEF] text-white hover:bg-[#4B4FDF]'
                          : 'bg-[#0B1220] text-white hover:bg-[#1a2436]'
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-white" />

        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#0B1220]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left"
                >
                  <span className="text-base font-medium text-[#0B1220]">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
