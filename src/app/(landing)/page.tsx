// Nexorium Core - Landing Page

import {
  Header,
  Hero,
  ProblemSection,
  SolutionSection,
  HowItWorksSection,
  TelcoSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1220]">
      <Header />
      <main>
        {/* Section 1: Hero - Architectural Tone */}
        <Hero />

        {/* Section 2: The Problem - Enterprise Framing */}
        <ProblemSection />

        {/* Section 3: Core Capabilities - 6 Pillars */}
        <SolutionSection />

        {/* Section 4: How It Works - 4-Step Process */}
        <HowItWorksSection />

        {/* Section 5: Differentiation */}
        <TelcoSection />

        {/* Section 6: Final CTA */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
