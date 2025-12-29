import { lazy, Suspense } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

// Lazy load the academic components
const Glossary = lazy(() => import('./Glossary'));
const PortersFiveForces = lazy(() => import('./PortersFiveForces'));
const MonteCarloSimulator = lazy(() => import('./MonteCarloSimulator'));
const SWOTBuilder = lazy(() => import('./SWOTBuilder'));
const GameTheorySection = lazy(() => import('./GameTheorySection'));
const MiningProfitabilitySensitivity = lazy(() => import('./SensitivityTable').then(m => ({ default: m.MiningProfitabilitySensitivity })));
const BreakEvenSensitivity = lazy(() => import('./SensitivityTable').then(m => ({ default: m.BreakEvenSensitivity })));

const SectionLoader = () => (
  <div className="py-12 flex items-center justify-center">
    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

interface AcademicEnhancementsSectionProps {
  variant: 'strategic-frameworks' | 'quantitative-tools' | 'glossary';
  className?: string;
}

export default function AcademicEnhancementsSection({ variant, className = '' }: AcademicEnhancementsSectionProps) {
  if (variant === 'strategic-frameworks') {
    return (
      <section className={`py-16 bg-muted/30 ${className}`}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Strategic Analysis Tools
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Academic Frameworks
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Apply proven strategic analysis frameworks to evaluate competitive dynamics and build your mining strategy
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            <ScrollReveal delay={100}>
              <Suspense fallback={<SectionLoader />}>
                <PortersFiveForces />
              </Suspense>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Suspense fallback={<SectionLoader />}>
                <GameTheorySection />
              </Suspense>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Suspense fallback={<SectionLoader />}>
                <SWOTBuilder />
              </Suspense>
            </ScrollReveal>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'quantitative-tools') {
    return (
      <section className={`py-16 bg-background ${className}`}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Quantitative Analysis
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Advanced Modeling Tools
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Use Monte Carlo simulations and sensitivity analysis to model mining profitability under uncertainty
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            <ScrollReveal delay={100}>
              <Suspense fallback={<SectionLoader />}>
                <MonteCarloSimulator />
              </Suspense>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="grid lg:grid-cols-2 gap-6">
                <Suspense fallback={<SectionLoader />}>
                  <MiningProfitabilitySensitivity />
                </Suspense>
                <Suspense fallback={<SectionLoader />}>
                  <BreakEvenSensitivity />
                </Suspense>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    );
  }

  // Glossary variant
  return (
    <section className={`py-16 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Reference
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mining Glossary
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive definitions of key terms in Bitcoin mining, energy markets, and financial analysis
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<SectionLoader />}>
              <Glossary />
            </Suspense>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
