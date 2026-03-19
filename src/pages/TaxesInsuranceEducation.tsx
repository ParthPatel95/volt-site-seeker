import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BookOpen, MapPin, Building2, Calculator, DollarSign, Bitcoin, Gift, Shield, ShieldCheck, FileText } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';
import { NextModuleRecommendation } from '@/components/academy/NextModuleRecommendation';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { TAXES_INSURANCE_QUIZZES } from '@/constants/quiz-data';
import { TAXES_INSURANCE_FLASHCARDS } from '@/constants/flashcard-data';

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

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[hsl(var(--watt-purple))] border-t-transparent rounded-full animate-spin" />
  </div>
);

const navSections = [
  { id: 'intro', icon: BookOpen, label: 'Introduction', time: '5 min' },
  { id: 'jurisdictions', icon: MapPin, label: 'Jurisdictions', time: '8 min' },
  { id: 'corporate-structure', icon: Building2, label: 'Corporate Structure', time: '7 min' },
  { id: 'capex', icon: Calculator, label: 'Capital Expenses', time: '8 min' },
  { id: 'opex', icon: DollarSign, label: 'Operating Expenses', time: '6 min' },
  { id: 'crypto-tax', icon: Bitcoin, label: 'Crypto Tax', time: '10 min' },
  { id: 'incentives', icon: Gift, label: 'Incentives', time: '8 min' },
  { id: 'property-insurance', icon: Shield, label: 'Property Insurance', time: '7 min' },
  { id: 'liability-insurance', icon: ShieldCheck, label: 'Liability', time: '7 min' },
  { id: 'case-study', icon: FileText, label: 'Case Study', time: '9 min' },
];

const cryptoQuiz = TAXES_INSURANCE_QUIZZES.find(q => q.sectionId === 'crypto-tax');
const insuranceQuiz = TAXES_INSURANCE_QUIZZES.find(q => q.sectionId === 'property-insurance');

export default function TaxesInsuranceEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="watt-purple" />
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}><TaxesInsuranceIntroSection /></Suspense>
        <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={TAXES_INSURANCE_FLASHCARDS} /></div>

        <Suspense fallback={<SectionLoader />}><TaxJurisdictionSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><CorporateTaxStructureSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><CapitalExpenseSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><OperatingExpenseSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><CryptoTaxTreatmentSection /></Suspense>
        {cryptoQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={cryptoQuiz.title} questions={cryptoQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><IncentivesCreditsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><PropertyInsuranceSection /></Suspense>
        {insuranceQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={insuranceQuiz.title} questions={insuranceQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><LiabilityInsuranceSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><AlbertaCaseStudySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><TaxesInsuranceCTASection /></Suspense>
      </main>
      <NextModuleRecommendation moduleId="taxes-insurance" />
      <LandingFooter />
    </div>
  );
}
