import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { RealWorldInsight } from '@/components/academy/RealWorldInsight';
import { KeyTermsGlossary } from '@/components/academy/KeyTermsGlossary';
import { NETWORKING_QUIZZES } from '@/constants/quiz-data';
import { NETWORKING_FLASHCARDS } from '@/constants/flashcard-data';
import { NETWORKING_KEY_TERMS } from '@/constants/academy-glossary';

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

const ispQuiz = NETWORKING_QUIZZES.find(q => q.sectionId === 'connectivity');
const secQuiz = NETWORKING_QUIZZES.find(q => q.sectionId === 'security');
const redQuiz = NETWORKING_QUIZZES.find(q => q.sectionId === 'redundancy');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function NetworkingEducation() {
  return (
    <ModuleLayout moduleId="networking">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <QuickFlashcard deck={NETWORKING_FLASHCARDS} />
        <KeyTermsGlossary moduleTitle="Networking" terms={NETWORKING_KEY_TERMS} />
      </div>

      <div id="intro"><Suspense fallback={<SectionLoader />}><NetIntroSection /></Suspense></div>
      <div id="connectivity"><Suspense fallback={<SectionLoader />}><NetConnectivitySection /></Suspense></div>
      {ispQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={ispQuiz.title} questions={ispQuiz.questions} /></div>}

      <div id="redundancy"><Suspense fallback={<SectionLoader />}><NetRedundancySection /></Suspense></div>
      {redQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={redQuiz.title} questions={redQuiz.questions} /></div>}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RealWorldInsight insight="In rural Alberta, always negotiate SLA penalties into your ISP contract. Dual-ISP redundancy with automatic failover is the minimum standard for any operation above 5MW." source="Rural Infrastructure Experience" />
      </div>

      <div id="topology"><Suspense fallback={<SectionLoader />}><NetTopologySection /></Suspense></div>
      <div id="ip-management"><Suspense fallback={<SectionLoader />}><NetIPManagementSection /></Suspense></div>
      <div id="pool-connectivity"><Suspense fallback={<SectionLoader />}><NetPoolConnectivitySection /></Suspense></div>
      <div id="security"><Suspense fallback={<SectionLoader />}><NetSecuritySection /></Suspense></div>
      {secQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={secQuiz.title} questions={secQuiz.questions} /></div>}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RealWorldInsight insight="Mining pools use Stratum V2 protocol which encrypts the connection between miners and the pool. Without it, man-in-the-middle attacks can redirect hashrate to an attacker's address." source="Mining Pool Security" />
      </div>

      <div id="monitoring"><Suspense fallback={<SectionLoader />}><NetMonitoringSection /></Suspense></div>
      <div id="hardware"><Suspense fallback={<SectionLoader />}><NetHardwareSection /></Suspense></div>
      <div id="case-study"><Suspense fallback={<SectionLoader />}><NetCaseStudySection /></Suspense></div>
    </ModuleLayout>
  );
}
