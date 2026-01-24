'use client';

// TelEnvIQ - Call to Action Section

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-600 to-blue-700">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to See Your Test Environments Clearly?
          </h2>
          <p className="mt-6 text-lg leading-8 text-indigo-100">
            Join the early access program and be among the first to eliminate
            topology drift and data blind spots in your telco test environments.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              className="bg-white text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto"
            >
              Request Early Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-indigo-200">
            No credit card required. Free tier available for small teams.
          </p>
        </div>
      </div>
    </section>
  );
}
