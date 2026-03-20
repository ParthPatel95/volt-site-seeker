import React, { lazy, Suspense, useMemo } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ModuleExam } from '@/components/academy/ModuleExam';
import { BITCOIN_QUIZZES } from '@/constants/quiz-data';
import { BITCOIN_FLASHCARDS } from '@/constants/flashcard-data';

const WhatIsBitcoinSection = lazy(() => import('@/components/bitcoin-education/WhatIsBitcoinSection'));
const BitcoinHistorySection = lazy(() => import('@/components/bitcoin-education/BitcoinHistorySection'));
const HowBitcoinWorksSection = lazy(() => import('@/components/bitcoin-education/HowBitcoinWorksSection'));
const BitcoinWalletsSection = lazy(() => import('@/components/bitcoin-education/BitcoinWalletsSection'));
const BitcoinMiningSection = lazy(() => import('@/components/bitcoin-education/BitcoinMiningSection'));
const DatacenterCoolingSection = lazy(() => import('@/components/bitcoin-education/DatacenterCoolingSection'));
const MiningPoolsSection = lazy(() => import('@/components/bitcoin-education/MiningPoolsSection'));
const MiningSustainabilitySection = lazy(() => import('@/components/bitcoin-education/MiningSustainabilitySection'));
const BitcoinEconomicsSection = lazy(() => import('@/components/bitcoin-education/BitcoinEconomicsSection'));
const BitcoinBenefitsSection = lazy(() => import('@/components/bitcoin-education/BitcoinBenefitsSection'));
const GlobalBitcoinAdoptionSection = lazy(() => import('@/components/bitcoin-education/GlobalBitcoinAdoptionSection'));
const BitcoinFutureSection = lazy(() => import('@/components/bitcoin-education/BitcoinFutureSection'));
const BitcoinCTASection = lazy(() => import('@/components/bitcoin-education/BitcoinCTASection'));
const CryptographyDeepDiveSection = lazy(() => import('@/components/bitcoin-education/CryptographyDeepDiveSection'));
const ConsensusGameTheorySection = lazy(() => import('@/components/bitcoin-education/ConsensusGameTheorySection'));
const NetworkArchitectureSection = lazy(() => import('@/components/bitcoin-education/NetworkArchitectureSection'));
const BitcoinScriptingSection = lazy(() => import('@/components/bitcoin-education/BitcoinScriptingSection'));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const BitcoinEducation: React.FC = () => {
  const examQuestions = useMemo(() => BITCOIN_QUIZZES.flatMap(q => q.questions), []);

  return (
    <ModuleLayout moduleId="bitcoin">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={BITCOIN_FLASHCARDS} /></div>

      <div id="what-is-bitcoin"><Suspense fallback={<SectionLoader />}><WhatIsBitcoinSection /></Suspense></div>
      {BITCOIN_QUIZZES.find(q => q.sectionId === 'what-is-bitcoin') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: What is Bitcoin?" questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'what-is-bitcoin')!.questions} /></div>
      )}

      <div id="history"><Suspense fallback={<SectionLoader />}><BitcoinHistorySection /></Suspense></div>
      <div id="how-it-works"><Suspense fallback={<SectionLoader />}><HowBitcoinWorksSection /></Suspense></div>

      <div id="cryptography"><Suspense fallback={<SectionLoader />}><CryptographyDeepDiveSection /></Suspense></div>
      {BITCOIN_QUIZZES.find(q => q.sectionId === 'cryptography') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Cryptography" questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'cryptography')!.questions} /></div>
      )}

      <div id="consensus"><Suspense fallback={<SectionLoader />}><ConsensusGameTheorySection /></Suspense></div>
      {BITCOIN_QUIZZES.find(q => q.sectionId === 'consensus') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Consensus" questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'consensus')!.questions} /></div>
      )}

      <div id="network"><Suspense fallback={<SectionLoader />}><NetworkArchitectureSection /></Suspense></div>
      <div id="scripting"><Suspense fallback={<SectionLoader />}><BitcoinScriptingSection /></Suspense></div>

      <div id="wallets"><Suspense fallback={<SectionLoader />}><BitcoinWalletsSection /></Suspense></div>
      {BITCOIN_QUIZZES.find(q => q.sectionId === 'wallets') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Bitcoin Wallets" questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'wallets')!.questions} /></div>
      )}

      <div id="mining"><Suspense fallback={<SectionLoader />}><BitcoinMiningSection /></Suspense></div>
      {BITCOIN_QUIZZES.find(q => q.sectionId === 'mining') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Bitcoin Mining" questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'mining')!.questions} /></div>
      )}

      <div id="cooling"><Suspense fallback={<SectionLoader />}><DatacenterCoolingSection /></Suspense></div>
      <div id="pools"><Suspense fallback={<SectionLoader />}><MiningPoolsSection /></Suspense></div>
      <div id="sustainability"><Suspense fallback={<SectionLoader />}><MiningSustainabilitySection /></Suspense></div>

      <div id="economics"><Suspense fallback={<SectionLoader />}><BitcoinEconomicsSection /></Suspense></div>
      {BITCOIN_QUIZZES.find(q => q.sectionId === 'economics') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Bitcoin Economics" questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'economics')!.questions} /></div>
      )}

      <div id="benefits"><Suspense fallback={<SectionLoader />}><BitcoinBenefitsSection /></Suspense></div>
      <div id="adoption"><Suspense fallback={<SectionLoader />}><GlobalBitcoinAdoptionSection /></Suspense></div>
      <div id="future"><Suspense fallback={<SectionLoader />}><BitcoinFutureSection /></Suspense></div>

      <div id="module-exam" className="max-w-4xl mx-auto px-4 py-8">
        <ModuleExam title="Bitcoin Fundamentals Final Exam" questions={examQuestions} moduleId="bitcoin" />
      </div>

      <Suspense fallback={<SectionLoader />}><BitcoinCTASection /></Suspense>
    </ModuleLayout>
  );
};

export default BitcoinEducation;
