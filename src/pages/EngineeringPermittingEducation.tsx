import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BookOpen, MapPin, Building2, FileCheck, Zap, Scale, CircuitBoard, Volume2, HardHat, Calendar } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ENGINEERING_PERMITTING_QUIZZES } from '@/constants/quiz-data';
import { ENGINEERING_PERMITTING_FLASHCARDS } from '@/constants/flashcard-data';

const EPIntroSection = lazy(() => import('@/components/engineering-permitting/EPIntroSection'));
const RegulatoryLandscapeSection = lazy(() => import('@/components/engineering-permitting/RegulatoryLandscapeSection'));
const MunicipalPermitsSection = lazy(() => import('@/components/engineering-permitting/MunicipalPermitsSection'));
const SafetyCodesSection = lazy(() => import('@/components/engineering-permitting/SafetyCodesSection'));
const AESOConnectionSection = lazy(() => import('@/components/engineering-permitting/AESOConnectionSection'));
const AUCApprovalSection = lazy(() => import('@/components/engineering-permitting/AUCApprovalSection'));
const ElectricalEngineeringSection = lazy(() => import('@/components/engineering-permitting/ElectricalEngineeringSection'));
const EnvironmentalComplianceSection = lazy(() => import('@/components/engineering-permitting/EnvironmentalComplianceSection'));
const SiteEngineeringSection = lazy(() => import('@/components/engineering-permitting/SiteEngineeringSection'));
const TimelineCostSection = lazy(() => import('@/components/engineering-permitting/TimelineCostSection'));
const EPCTASection = lazy(() => import('@/components/engineering-permitting/EPCTASection'));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[hsl(var(--watt-purple))] border-t-transparent rounded-full animate-spin" />
  </div>
);

const navSections = [
  { id: 'intro', icon: BookOpen, label: 'Introduction', time: '5 min' },
  { id: 'regulatory', icon: Scale, label: 'Regulatory Bodies', time: '8 min' },
  { id: 'municipal', icon: MapPin, label: 'Municipal Permits', time: '10 min' },
  { id: 'safety-codes', icon: Building2, label: 'Safety Codes', time: '8 min' },
  { id: 'aeso', icon: Zap, label: 'AESO Connection', time: '12 min' },
  { id: 'auc', icon: FileCheck, label: 'AUC Approval', time: '10 min' },
  { id: 'electrical', icon: CircuitBoard, label: 'Electrical Engineering', time: '10 min' },
  { id: 'environmental', icon: Volume2, label: 'Environmental', time: '8 min' },
  { id: 'site', icon: HardHat, label: 'Site Engineering', time: '8 min' },
  { id: 'timeline', icon: Calendar, label: 'Timeline & Costs', time: '10 min' },
];

const regQuiz = ENGINEERING_PERMITTING_QUIZZES.find(q => q.sectionId === 'regulatory');
const munQuiz = ENGINEERING_PERMITTING_QUIZZES.find(q => q.sectionId === 'municipal');
const aesoQuiz = ENGINEERING_PERMITTING_QUIZZES.find(q => q.sectionId === 'aeso');

export default function EngineeringPermittingEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="watt-purple" />
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}><EPIntroSection /></Suspense>
        <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={ENGINEERING_PERMITTING_FLASHCARDS} /></div>

        <Suspense fallback={<SectionLoader />}><RegulatoryLandscapeSection /></Suspense>
        {regQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={regQuiz.title} questions={regQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><MunicipalPermitsSection /></Suspense>
        {munQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={munQuiz.title} questions={munQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><SafetyCodesSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><AESOConnectionSection /></Suspense>
        {aesoQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={aesoQuiz.title} questions={aesoQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><AUCApprovalSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><ElectricalEngineeringSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><EnvironmentalComplianceSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><SiteEngineeringSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><TimelineCostSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><EPCTASection /></Suspense>
      </main>
      <NextModuleRecommendation moduleId="engineering-permitting" />
      <LandingFooter />
    </div>
  );
}
