import React, { useRef, useEffect } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { AdvisoryHero } from '@/components/advisory/AdvisoryHero';
import { AdvisoryAudience } from '@/components/advisory/AdvisoryAudience';
import { AdvisoryMarketContext } from '@/components/advisory/AdvisoryMarketContext';
import { AdvisoryServices } from '@/components/advisory/AdvisoryServices';
import { AdvisoryProcess } from '@/components/advisory/AdvisoryProcess';
import { AdvisoryDifferentiators } from '@/components/advisory/AdvisoryDifferentiators';
import { AdvisoryPipelineGlobe } from '@/components/advisory/AdvisoryPipelineGlobe';
import { PipelineFlowStrip } from '@/components/advisory/PipelineFlowStrip';
import { AdvisoryCaseStudies } from '@/components/advisory/AdvisoryCaseStudies';
import { AdvisoryFAQ } from '@/components/advisory/AdvisoryFAQ';
import { AdvisoryInquiryForm } from '@/components/advisory/AdvisoryInquiryForm';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const Advisory: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    document.title = 'Powered Land Advisory for AI, HPC & Bitcoin | WattByte';
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'WattByte Advisory helps AI/HPC, Bitcoin mining, and inference clients source, validate, and energize powered land. Operator-led consulting backed by a 1,429 MW global pipeline.');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://wattbyte.com/advisory';

    const ldId = 'advisory-jsonld';
    document.getElementById(ldId)?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = ldId;
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'WattByte Advisory',
      url: 'https://wattbyte.com/advisory',
      description: 'Operator-led powered land advisory for AI/HPC, Bitcoin mining, and inference clients.',
      areaServed: ['North America', 'Africa', 'South Asia', 'LATAM'],
      serviceType: ['Site sourcing', 'Power interconnection diligence', 'Energy procurement', 'Datacenter EPC'],
      provider: { '@type': 'Organization', name: 'WattByte', url: 'https://wattbyte.com' },
    });
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />

      <main className="pt-14 sm:pt-16 md:pt-20">
        <AdvisoryHero onContact={() => scrollTo(formRef)} onPipeline={() => scrollTo(pipelineRef)} />

        <SectionDivider color="cyan" />
        <AdvisoryAudience />

        <SectionDivider color="purple" />
        <AdvisoryMarketContext />

        <SectionDivider color="yellow" />
        <AdvisoryServices />

        <SectionDivider color="cyan" />
        <AdvisoryProcess />

        <SectionDivider color="purple" />
        <AdvisoryDifferentiators />

        <SectionDivider color="yellow" />

        {/* 3D pipeline showcase */}
        <section ref={pipelineRef} className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
                <div className="text-xs uppercase tracking-widest text-watt-bitcoin font-semibold mb-3">Live pipeline</div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">A global powered-land network</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Explore the sites we are advising on, building, or operating. Click a marker to inspect.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <AdvisoryPipelineGlobe />
            </ScrollReveal>
            <div className="mt-8">
              <PipelineFlowStrip />
            </div>
          </div>
        </section>

        <SectionDivider color="cyan" />
        <AdvisoryCaseStudies />

        <SectionDivider color="purple" />
        <AdvisoryFAQ />

        <AdvisoryInquiryForm ref={formRef} />
      </main>

      <LandingFooter />
    </div>
  );
};

export default Advisory;
