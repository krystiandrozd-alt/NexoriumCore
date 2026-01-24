// TelEnv IQ - Premium Landing Page

import {
  Header,
  Hero,
  ProblemSection,
  SolutionSection,
  HowItWorksSection,
  TelcoSection,
  FutureSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1220]">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <TelcoSection />
        <FutureSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
