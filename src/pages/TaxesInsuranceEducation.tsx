import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { RealWorldInsight } from '@/components/academy/RealWorldInsight';
import { TAXES_INSURANCE_QUIZZES } from '@/constants/quiz-data';
import { TAXES_INSURANCE_FLASHCARDS } from '@/constants/flashcard-data';
import { KeyTermsGlossary } from '@/components/academy/KeyTermsGlossary';
import { TAXES_INSURANCE_KEY_TERMS } from '@/constants/academy-glossary';

const TaxesInsuranceIntroSection = lazy(() => import('@/components/taxes-insurance/TaxesInsuranceIntroSection'));
const TaxJurisdictionSection = lazy(() => import('@/components/taxes-insurance/TaxJurisdictionSection'));
const CorporateTaxStructureSection = lazy(() => import('@/components/taxes-insurance/CorporateTaxStructureSection'));
const CapitalExpenseSection = lazy(() => import('@/components/taxes-insurance/CapitalExpenseSection'));
const OperatingExpenseSection = lazy(() => import('@/components/taxes-insurance/OperatingExpenseSection'));
const CryptoTaxTreatmentSection = lazy(() => import('@/components/taxes-insurance/CryptoTaxTreatmentSection'));
const IncentivesCreditsSection = lazy(() => import('@/components/taxes-insurance/IncentivesCreditsSection'));
const PropertyInsuranceSection = lazy(() => import('@/components/taxes-insurance/PropertyInsuranceSection'));
const LiabilityInsuranceSection = lazy(() => import('@/components/taxes-insurance/LiabilityInsuranceSection'));
const AlbertaCaseStudySection = lazy(() => import('@/components/taxes-insurance/AlbertaCaseStudySection'));
const TaxesInsuranceCTASection = lazy(() => import('@/components/taxes-insurance/TaxesInsuranceCTASection'));

const cryptoQuiz = TAXES_INSURANCE_QUIZZES.find(q => q.sectionId === 'crypto-tax');
const insuranceQuiz = TAXES_INSURANCE_QUIZZES.find(q => q.sectionId === 'property-insurance');
const capexQuiz = TAXES_INSURANCE_QUIZZES.find(q => q.sectionId === 'capex');
const liabilityQuiz = TAXES_INSURANCE_QUIZZES.find(q => q.sectionId === 'liability-insurance');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function TaxesInsuranceEducation() {
  return (
    <ModuleLayout moduleId="taxes-insurance">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <QuickFlashcard deck={TAXES_INSURANCE_FLASHCARDS} />
        <KeyTermsGlossary moduleTitle="Taxes & Insurance" terms={TAXES_INSURANCE_KEY_TERMS} />
      </div>

      <div id="intro"><Suspense fallback={<SectionLoader />}><TaxesInsuranceIntroSection /></Suspense></div>
      <div id="jurisdictions"><Suspense fallback={<SectionLoader />}><TaxJurisdictionSection /></Suspense></div>
      <div id="corporate-structure"><Suspense fallback={<SectionLoader />}><CorporateTaxStructureSection /></Suspense></div>
      <div id="capex"><Suspense fallback={<SectionLoader />}><CapitalExpenseSection /></Suspense></div>
      {capexQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={capexQuiz.title} questions={capexQuiz.questions} /></div>}

      <div id="opex"><Suspense fallback={<SectionLoader />}><OperatingExpenseSection /></Suspense></div>
      <div id="crypto-tax"><Suspense fallback={<SectionLoader />}><CryptoTaxTreatmentSection /></Suspense></div>
      {cryptoQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={cryptoQuiz.title} questions={cryptoQuiz.questions} /></div>}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RealWorldInsight insight="In Canada, mined Bitcoin is treated as business income at fair market value on the day it is received. Operators who implement real-time price tracking at the block level have the cleanest audit trails." source="CRA Guidance" />
      </div>

      <div id="incentives"><Suspense fallback={<SectionLoader />}><IncentivesCreditsSection /></Suspense></div>
      <div id="property-insurance"><Suspense fallback={<SectionLoader />}><PropertyInsuranceSection /></Suspense></div>
      {insuranceQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={insuranceQuiz.title} questions={insuranceQuiz.questions} /></div>}

      <div id="liability-insurance"><Suspense fallback={<SectionLoader />}><LiabilityInsuranceSection /></Suspense></div>
      {liabilityQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={liabilityQuiz.title} questions={liabilityQuiz.questions} /></div>}

      <div id="case-study"><Suspense fallback={<SectionLoader />}><AlbertaCaseStudySection /></Suspense></div>
      <Suspense fallback={<SectionLoader />}><TaxesInsuranceCTASection /></Suspense>
    </ModuleLayout>
  );
}
