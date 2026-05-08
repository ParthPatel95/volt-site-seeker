import React, { useRef, useEffect, lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { AdvisoryHero } from '@/components/advisory/AdvisoryHero';
import { AdvisoryInquiryForm } from '@/components/advisory/AdvisoryInquiryForm';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { SectionLoader } from '@/components/LazyErrorBoundary';

const AdvisoryAudience = lazy(() => import('@/components/advisory/AdvisoryAudience').then(m => ({ default: m.AdvisoryAudience })));
const AdvisoryMarketContext = lazy(() => import('@/components/advisory/AdvisoryMarketContext').then(m => ({ default: m.AdvisoryMarketContext })));
const AdvisoryServices = lazy(() => import('@/components/advisory/AdvisoryServices').then(m => ({ default: m.AdvisoryServices })));
const AdvisoryProcess = lazy(() => import('@/components/advisory/AdvisoryProcess').then(m => ({ default: m.AdvisoryProcess })));
const AdvisoryDifferentiators = lazy(() => import('@/components/advisory/AdvisoryDifferentiators').then(m => ({ default: m.AdvisoryDifferentiators })));
const PipelineFlowStrip = lazy(() => import('@/components/advisory/PipelineFlowStrip').then(m => ({ default: m.PipelineFlowStrip })));

const AdvisoryPipelineMap = lazy(() =>
  import('@/components/advisory/AdvisoryPipelineMap').then(m => ({ default: m.AdvisoryPipelineMap }))
);
const AdvisoryCaseStudies = lazy(() =>
  import('@/components/advisory/AdvisoryCaseStudies').then(m => ({ default: m.AdvisoryCaseStudies }))
);
const AdvisoryFAQ = lazy(() =>
  import('@/components/advisory/AdvisoryFAQ').then(m => ({ default: m.AdvisoryFAQ }))
);

const MapPlaceholder: React.FC = () => (
  <div className="w-full h-[420px] sm:h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border bg-[hsl(var(--watt-navy))] flex items-center justify-center">
    <div className="text-center text-white/60">
      <div className="w-12 h-12 rounded-full border-2 border-watt-bitcoin/40 border-t-watt-bitcoin animate-spin mx-auto mb-3" />
      <div className="text-sm">Loading pipeline map…</div>
    </div>
  </div>
);

const Advisory: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    document.title = 'WattByte Advisory — Powered Land for AI, HPC & Bitcoin';
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'Operator-led advisory turning powered land into operating MW for AI/HPC, Bitcoin miners, and inference clouds. 1,429 MW pipeline, in-house EPC, institutional discipline.');

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
        <Suspense fallback={<SectionLoader />}><AdvisoryAudience /></Suspense>

        <SectionDivider color="purple" />
        <Suspense fallback={<SectionLoader />}><AdvisoryMarketContext /></Suspense>

        <SectionDivider color="yellow" />
        <Suspense fallback={<SectionLoader />}><AdvisoryServices /></Suspense>

        <SectionDivider color="cyan" />
        <Suspense fallback={<SectionLoader />}><AdvisoryProcess /></Suspense>

        <SectionDivider color="purple" />
        <Suspense fallback={<SectionLoader />}><AdvisoryDifferentiators /></Suspense>

        <SectionDivider color="yellow" />

        {/* 3D pipeline showcase */}
        <section ref={pipelineRef} className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
              <div className="text-xs uppercase tracking-widest text-watt-bitcoin font-semibold mb-3">Live pipeline</div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Live, advised, or operating</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">1,429 MW across four countries — every site below is one we are actively advising on, building, or running. Click a marker to inspect.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Suspense fallback={<MapPlaceholder />}>
                <AdvisoryPipelineMap />
              </Suspense>
            </ScrollReveal>
            <div className="mt-8">
              <Suspense fallback={<SectionLoader />}><PipelineFlowStrip /></Suspense>
            </div>
          </div>
        </section>

        <SectionDivider color="cyan" />
        <Suspense fallback={<div className="py-24" />}>
          <AdvisoryCaseStudies />
        </Suspense>

        <SectionDivider color="purple" />
        <Suspense fallback={<div className="py-24" />}>
          <AdvisoryFAQ />
        </Suspense>

        <AdvisoryInquiryForm ref={formRef} />
      </main>

      <LandingFooter />
    </div>
  );
};

export default Advisory;
