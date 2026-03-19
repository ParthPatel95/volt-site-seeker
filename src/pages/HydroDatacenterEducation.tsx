import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import HydroHeroSection from '@/components/hydro-education/HydroHeroSection';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { Droplets, Box, Thermometer, MapPin, Layout, Waves, Zap, Shield, HardHat, DollarSign, Flame, Volume2 } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';
import { NextModuleRecommendation } from '@/components/academy/NextModuleRecommendation';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { HYDRO_COOLING_QUIZZES } from '@/constants/quiz-data';
import { HYDRO_COOLING_FLASHCARDS } from '@/constants/flashcard-data';

const HydroAdvantagesSection = lazy(() => import('@/components/hydro-education/HydroAdvantagesSection'));
const HydroContainerProductsSection = lazy(() => import('@/components/hydro-education/HydroContainerProductsSection'));
const HydroCoolingMethodsSection = lazy(() => import('@/components/hydro-education/HydroCoolingMethodsSection'));
const HydroSiteSelectionSection = lazy(() => import('@/components/hydro-education/HydroSiteSelectionSection'));
const HydroLayoutSection = lazy(() => import('@/components/hydro-education/HydroLayoutSection'));
const HydroWaterSystemsSection = lazy(() => import('@/components/hydro-education/HydroWaterSystemsSection'));
const HydroElectricalSection = lazy(() => import('@/components/hydro-education/HydroElectricalSection'));
const HydroNetworkSecuritySection = lazy(() => import('@/components/hydro-education/HydroNetworkSecuritySection'));
const HydroConstructionSection = lazy(() => import('@/components/hydro-education/HydroConstructionSection'));
const HydroEconomicsSection = lazy(() => import('@/components/hydro-education/HydroEconomicsSection'));
const HydroWasteHeatSection = lazy(() => import('@/components/hydro-education/HydroWasteHeatSection'));
const HydroNoiseManagementSection = lazy(() => import('@/components/hydro-education/HydroNoiseManagementSection'));
const HydroCTASection = lazy(() => import('@/components/hydro-education/HydroCTASection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-watt-bitcoin border-t-transparent rounded-full animate-spin" />
  </div>
);

const navSections = [
  { id: 'advantages', icon: Droplets, label: 'Advantages', time: '5 min' },
  { id: 'containers', icon: Box, label: 'Containers', time: '7 min' },
  { id: 'cooling-methods', icon: Thermometer, label: 'Cooling Methods', time: '7 min' },
  { id: 'site-selection', icon: MapPin, label: 'Site Selection', time: '6 min' },
  { id: 'layout', icon: Layout, label: 'Layout', time: '5 min' },
  { id: 'water-systems', icon: Waves, label: 'Water Systems', time: '7 min' },
  { id: 'electrical', icon: Zap, label: 'Electrical', time: '6 min' },
  { id: 'network-security', icon: Shield, label: 'Network', time: '5 min' },
  { id: 'construction', icon: HardHat, label: 'Construction', time: '6 min' },
  { id: 'economics', icon: DollarSign, label: 'Economics', time: '7 min' },
  { id: 'waste-heat', icon: Flame, label: 'Waste Heat', time: '5 min' },
  { id: 'noise-management', icon: Volume2, label: 'Noise', time: '5 min' },
];

const coolingQuiz = HYDRO_COOLING_QUIZZES.find(q => q.sectionId === 'cooling-methods');
const waterQuiz = HYDRO_COOLING_QUIZZES.find(q => q.sectionId === 'water-systems');
const econQuiz = HYDRO_COOLING_QUIZZES.find(q => q.sectionId === 'economics');

const HydroDatacenterEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SmoothScroll />
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="blue-500" />
      
      <div>
        <HydroHeroSection />
        <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={HYDRO_COOLING_FLASHCARDS} /></div>

        <Suspense fallback={<SectionLoader />}><div id="advantages"><HydroAdvantagesSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="containers"><HydroContainerProductsSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="cooling-methods"><HydroCoolingMethodsSection /></div></Suspense>
        {coolingQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={coolingQuiz.title} questions={coolingQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><div id="site-selection"><HydroSiteSelectionSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="layout"><HydroLayoutSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="water-systems"><HydroWaterSystemsSection /></div></Suspense>
        {waterQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={waterQuiz.title} questions={waterQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><div id="electrical"><HydroElectricalSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="network-security"><HydroNetworkSecuritySection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="construction"><HydroConstructionSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="economics"><HydroEconomicsSection /></div></Suspense>
        {econQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={econQuiz.title} questions={econQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><div id="waste-heat"><HydroWasteHeatSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="noise-management"><HydroNoiseManagementSection /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><HydroCTASection /></Suspense>
      </div>
      <NextModuleRecommendation moduleId="hydro" />
      <LandingFooter />
      <PageTranslationButton pageId="hydro-datacenters-101" />
    </div>
  );
};

export default HydroDatacenterEducation;
