import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BookOpen, Globe, Shield, Network, Hash, Server, Lock, Activity, Cpu, MapPin } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { NETWORKING_QUIZZES } from '@/constants/quiz-data';
import { NETWORKING_FLASHCARDS } from '@/constants/flashcard-data';

const NetIntroSection = lazy(() => import('@/components/networking/NetIntroSection'));
const NetConnectivitySection = lazy(() => import('@/components/networking/NetConnectivitySection'));
const NetRedundancySection = lazy(() => import('@/components/networking/NetRedundancySection'));
const NetTopologySection = lazy(() => import('@/components/networking/NetTopologySection'));
const NetIPManagementSection = lazy(() => import('@/components/networking/NetIPManagementSection'));
const NetPoolConnectivitySection = lazy(() => import('@/components/networking/NetPoolConnectivitySection'));
const NetSecuritySection = lazy(() => import('@/components/networking/NetSecuritySection'));
const NetMonitoringSection = lazy(() => import('@/components/networking/NetMonitoringSection'));
const NetHardwareSection = lazy(() => import('@/components/networking/NetHardwareSection'));
const NetCaseStudySection = lazy(() => import('@/components/networking/NetCaseStudySection'));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[hsl(var(--watt-purple))] border-t-transparent rounded-full animate-spin" />
  </div>
);

const navSections = [
  { id: 'intro', icon: BookOpen, label: 'Introduction', time: '5 min' },
  { id: 'connectivity', icon: Globe, label: 'ISP Options', time: '10 min' },
  { id: 'redundancy', icon: Shield, label: 'Redundancy', time: '8 min' },
  { id: 'topology', icon: Network, label: 'Topology', time: '10 min' },
  { id: 'ip-management', icon: Hash, label: 'IP Management', time: '8 min' },
  { id: 'pool-connectivity', icon: Server, label: 'Pool Connectivity', time: '8 min' },
  { id: 'security', icon: Lock, label: 'Security', time: '8 min' },
  { id: 'monitoring', icon: Activity, label: 'Monitoring', time: '8 min' },
  { id: 'hardware', icon: Cpu, label: 'Hardware', time: '8 min' },
  { id: 'case-study', icon: MapPin, label: '45MW Case Study', time: '10 min' },
];

const ispQuiz = NETWORKING_QUIZZES.find(q => q.sectionId === 'connectivity');
const secQuiz = NETWORKING_QUIZZES.find(q => q.sectionId === 'security');
const redQuiz = NETWORKING_QUIZZES.find(q => q.sectionId === 'redundancy');

export default function NetworkingEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="watt-purple" />
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}><NetIntroSection /></Suspense>
        <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={NETWORKING_FLASHCARDS} /></div>

        <Suspense fallback={<SectionLoader />}><NetConnectivitySection /></Suspense>
        {ispQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={ispQuiz.title} questions={ispQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><NetRedundancySection /></Suspense>
        {redQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={redQuiz.title} questions={redQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><NetTopologySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetIPManagementSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetPoolConnectivitySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetSecuritySection /></Suspense>
        {secQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={secQuiz.title} questions={secQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><NetMonitoringSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetHardwareSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetCaseStudySection /></Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
