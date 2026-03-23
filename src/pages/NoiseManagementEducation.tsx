import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { RealWorldInsight } from '@/components/academy/RealWorldInsight';
import { NOISE_QUIZZES } from '@/constants/quiz-data';
import { NOISE_FLASHCARDS } from '@/constants/flashcard-data';

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

const fundQuiz = NOISE_QUIZZES.find(q => q.sectionId === 'fundamentals');
const regQuiz = NOISE_QUIZZES.find(q => q.sectionId === 'standards');
const mitQuiz = NOISE_QUIZZES.find(q => q.sectionId === 'mitigation');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const NoiseManagementEducation = () => {
  return (
    <ModuleLayout moduleId="noise">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={NOISE_FLASHCARDS} /></div>

      <div id="fundamentals"><Suspense fallback={<SectionLoader />}><NoiseBasicsSection /></Suspense></div>
      {fundQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={fundQuiz.title} questions={fundQuiz.questions} /></div>}

      <div id="noise-sources"><Suspense fallback={<SectionLoader />}><NoiseSourcesSection /></Suspense></div>
      <div id="cumulative"><Suspense fallback={<SectionLoader />}><CumulativeNoiseSection /></Suspense></div>
      <div id="standards"><Suspense fallback={<SectionLoader />}><RegulatoryStandardsSection /></Suspense></div>
      {regQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={regQuiz.title} questions={regQuiz.questions} /></div>}

      <div id="distance"><Suspense fallback={<SectionLoader />}><DistanceAttenuationSection /></Suspense></div>
      <div id="mitigation"><Suspense fallback={<SectionLoader />}><MitigationTechniquesSection /></Suspense></div>
      {mitQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={mitQuiz.title} questions={mitQuiz.questions} /></div>}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RealWorldInsight insight="Sound walls combined with directional exhaust orientation can reduce perceived noise at the property line by 15-20 dBA. This is often the difference between passing and failing Alberta PSL limits." source="Acoustic Engineering Practice" />
      </div>

      <div id="site-layout"><Suspense fallback={<SectionLoader />}><SiteLayoutSection /></Suspense></div>
      <div id="monitoring"><Suspense fallback={<SectionLoader />}><NoiseMonitoringSection /></Suspense></div>
      <div id="environmental"><Suspense fallback={<SectionLoader />}><EnvironmentalImpactSection /></Suspense></div>
      <div id="case-study"><Suspense fallback={<SectionLoader />}><AlbertaHeartlandCaseStudy /></Suspense></div>
      <Suspense fallback={<SectionLoader />}><NoiseCTASection /></Suspense>
    </ModuleLayout>
  );
};

export default NoiseManagementEducation;
