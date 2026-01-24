'use client';

// TelEnvIQ - Landing Page Hero Section

import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import NetworkVisualization from './NetworkVisualization';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradient */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-100 to-blue-100 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300 transition-all">
              <span className="font-medium text-indigo-600">New</span>
              {' '}Purpose-built for Telco OSS/BSS environments
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            See Your Telco Test Environments{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Clearly
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
            TelEnvIQ automatically discovers, maps, and monitors your test environments
            and their test data lifecycle — eliminating topology drift and data blind spots.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" className="w-full sm:w-auto">
              Request Early Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              See How It Works
            </Button>
          </div>
        </div>

        {/* Visual - Network Graph */}
        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative -m-2 rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="rounded-lg bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
              <NetworkVisualization />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-100 to-indigo-100 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  );
}
