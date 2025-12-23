import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Volume2, VolumeX, Headphones, Calculator, Shield, Ruler, Layout, Activity, FileSearch, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

// Lazy load sections for performance
const NoiseBasicsSection = lazy(() => import('@/components/noise-education/NoiseBasicsSection').then(m => ({ default: m.NoiseBasicsSection })));
const NoiseSourcesSection = lazy(() => import('@/components/noise-education/NoiseSourcesSection').then(m => ({ default: m.NoiseSourcesSection })));
const CumulativeNoiseSection = lazy(() => import('@/components/noise-education/CumulativeNoiseSection').then(m => ({ default: m.CumulativeNoiseSection })));
const RegulatoryStandardsSection = lazy(() => import('@/components/noise-education/RegulatoryStandardsSection').then(m => ({ default: m.RegulatoryStandardsSection })));
const DistanceAttenuationSection = lazy(() => import('@/components/noise-education/DistanceAttenuationSection').then(m => ({ default: m.DistanceAttenuationSection })));
const MitigationTechniquesSection = lazy(() => import('@/components/noise-education/MitigationTechniquesSection').then(m => ({ default: m.MitigationTechniquesSection })));
const SiteLayoutSection = lazy(() => import('@/components/noise-education/SiteLayoutSection').then(m => ({ default: m.SiteLayoutSection })));
const NoiseMonitoringSection = lazy(() => import('@/components/noise-education/NoiseMonitoringSection').then(m => ({ default: m.NoiseMonitoringSection })));
const EnvironmentalImpactSection = lazy(() => import('@/components/noise-education/EnvironmentalImpactSection').then(m => ({ default: m.EnvironmentalImpactSection })));
const AlbertaHeartlandCaseStudy = lazy(() => import('@/components/noise-education/AlbertaHeartlandCaseStudy').then(m => ({ default: m.AlbertaHeartlandCaseStudy })));
const NoiseCTASection = lazy(() => import('@/components/noise-education/NoiseCTASection').then(m => ({ default: m.NoiseCTASection })));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-watt-bitcoin"></div>
  </div>
);

// Navigation sections config
const navSections = [
  { id: 'fundamentals', label: 'Sound Fundamentals', icon: Volume2, time: '6 min' },
  { id: 'noise-sources', label: 'Noise Sources', icon: Headphones, time: '5 min' },
  { id: 'cumulative', label: 'Cumulative Noise', icon: Calculator, time: '5 min' },
  { id: 'standards', label: 'Regulations', icon: Shield, time: '6 min' },
  { id: 'distance', label: 'Distance Attenuation', icon: Ruler, time: '5 min' },
  { id: 'mitigation', label: 'Mitigation', icon: VolumeX, time: '7 min' },
  { id: 'site-layout', label: 'Site Layout', icon: Layout, time: '5 min' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, time: '5 min' },
  { id: 'environmental', label: 'Environmental', icon: FileSearch, time: '5 min' },
  { id: 'case-study', label: 'Case Study', icon: Building2, time: '8 min' },
];

const NoiseManagementEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Section Navigation - hidden on mobile, toggleable on desktop */}
      <EducationSectionNav sections={navSections} accentColor="watt-bitcoin" />
      <LandingNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-watt-navy via-watt-navy to-watt-navy/95 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Sound Wave Animation */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute border-2 border-watt-bitcoin/50 rounded-full animate-ping"
              style={{
                width: `${100 + i * 60}px`,
                height: `${100 + i * 60}px`,
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                animationDelay: `${i * 0.4}s`,
                animationDuration: '3s',
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <Badge className="bg-watt-bitcoin/20 text-watt-bitcoin border-watt-bitcoin/30 mb-4">
                WattByte Academy • Module 6
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Noise Management
                <span className="block text-watt-bitcoin">& Mitigation 101</span>
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
                Comprehensive guide to managing sound in Bitcoin mining facilities. 
                Featuring our <strong className="text-watt-bitcoin">45MW Alberta Heartland</strong> facility 
                with 30 Bitmain Hydro containers and 1.7km setback as a real-world case study.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-watt-bitcoin" />
                  <span>10 Detailed Sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-watt-bitcoin" />
                  <span>Interactive Calculators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-watt-bitcoin" />
                  <span>Real Case Study</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<SectionLoader />}>
        <NoiseBasicsSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <NoiseSourcesSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <CumulativeNoiseSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <RegulatoryStandardsSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <DistanceAttenuationSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <MitigationTechniquesSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <SiteLayoutSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <NoiseMonitoringSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <EnvironmentalImpactSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <AlbertaHeartlandCaseStudy />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <NoiseCTASection />
      </Suspense>

      <LandingFooter />
    </div>
  );
};

export default NoiseManagementEducation;
