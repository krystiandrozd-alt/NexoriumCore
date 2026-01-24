// TelEnvIQ - Landing Page

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
    <div className="min-h-screen bg-white">
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
