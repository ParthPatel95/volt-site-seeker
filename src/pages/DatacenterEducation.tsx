import React, { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ComparisonMatrix } from '@/components/academy/ComparisonMatrix';
import { DecisionTree } from '@/components/academy/DecisionTree';
import { DATACENTER_QUIZZES } from '@/constants/quiz-data';
import { DATACENTER_FLASHCARDS } from '@/constants/flashcard-data';
import { Building2, Container, Warehouse } from 'lucide-react';
import type { DecisionNode } from '@/components/academy/DecisionTree';

const EnergySourceSection = lazy(() => import('@/components/datacenter-education/EnergySourceSection'));
const ElectricalInfrastructureSection = lazy(() => import('@/components/datacenter-education/ElectricalInfrastructureSection'));
const FacilityDesignSection = lazy(() => import('@/components/datacenter-education/FacilityDesignSection'));
const AirflowContainmentSection = lazy(() => import('@/components/datacenter-education/AirflowContainmentSection'));
const CoolingSystemsVisualSection = lazy(() => import('@/components/datacenter-education/CoolingSystemsVisualSection'));
const MiningHardwareShowcaseSection = lazy(() => import('@/components/datacenter-education/MiningHardwareShowcaseSection'));
const OperationsMonitoringSection = lazy(() => import('@/components/datacenter-education/OperationsMonitoringSection'));
const DatacenterEconomicsSection = lazy(() => import('@/components/datacenter-education/DatacenterEconomicsSection'));
const InteractiveFacilityTour = lazy(() => import('@/components/datacenter-education/InteractiveFacilityTour'));
const EnhancedCTASection = lazy(() => import('@/components/datacenter-education/EnhancedCTASection'));

const facilityQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'facility-design');
const coolingQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'cooling-systems');
const hardwareQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'hardware');

const FACILITY_FEATURE_LABELS = [
  { key: 'deployTime', label: 'Deployment Time' },
  { key: 'capex', label: 'CapEx per MW' },
  { key: 'scalability', label: 'Scalability' },
  { key: 'permitting', label: 'Permitting Complexity' },
  { key: 'cooling', label: 'Cooling Efficiency' },
  { key: 'mobility', label: 'Relocatability' },
  { key: 'bestFor', label: 'Best For' },
];

const FACILITY_OPTIONS = [
  {
    name: 'Container / Modular',
    features: { deployTime: '4–8 weeks', capex: '$150K–$300K', scalability: 'High (add units)', permitting: 'Low', cooling: 'Good (direct air)', mobility: true, bestFor: 'Rapid deployment, remote sites' },
    highlighted: false,
  },
  {
    name: 'Purpose-Built Building',
    features: { deployTime: '6–12 months', capex: '$400K–$800K', scalability: 'Medium', permitting: 'High', cooling: 'Excellent (custom HVAC)', mobility: false, bestFor: 'Large-scale, permanent ops' },
    highlighted: true,
  },
  {
    name: 'Retrofitted Warehouse',
    features: { deployTime: '2–4 months', capex: '$200K–$500K', scalability: 'Medium (limited)', permitting: 'Medium', cooling: 'Variable', mobility: false, bestFor: 'Cost-effective, urban locations' },
    highlighted: false,
  },
];

const FACILITY_DECISION_NODES: DecisionNode[] = [
  {
    id: 'start',
    question: 'What is your target deployment timeline?',
    options: [
      { label: 'Under 3 months', nextId: 'budget-fast' },
      { label: '3–6 months', nextId: 'budget-medium' },
      { label: '6+ months', nextId: 'scale-large' },
    ],
  },
  {
    id: 'budget-fast',
    question: 'What is your power capacity target?',
    options: [
      { label: 'Under 5 MW', result: { title: 'Container / Modular Datacenter', description: 'Pre-fabricated units can be online in 4–8 weeks.', recommendation: 'Deploy container units for rapid time-to-hash. Ideal for testing new sites or remote locations.', confidence: 'high' } },
      { label: '5–20 MW', result: { title: 'Multi-Container Array', description: 'Deploy multiple containers in parallel for scale.', recommendation: 'Use shared electrical infrastructure to reduce per-unit costs. Consider a central control room.', confidence: 'medium' } },
      { label: '20+ MW', nextId: 'budget-medium' },
    ],
  },
  {
    id: 'budget-medium',
    question: 'Do you have an existing building or land?',
    options: [
      { label: 'Existing warehouse / industrial building', result: { title: 'Retrofitted Warehouse', description: 'Leverage existing structure to reduce build time and cost.', recommendation: 'Focus budget on electrical upgrades and cooling. Typical 2–4 month deployment.', confidence: 'medium' } },
      { label: 'Raw land only', nextId: 'scale-large' },
      { label: 'Neither — still searching', result: { title: 'Container / Modular (Site Flexibility)', description: 'Containers work on almost any prepared pad.', recommendation: 'Start with containers while you search for a permanent site. Relocate later if needed.', confidence: 'medium' } },
    ],
  },
  {
    id: 'scale-large',
    question: 'What is your total CapEx budget?',
    options: [
      { label: 'Under $500K', result: { title: 'Container / Modular', description: 'Best ROI at lower budgets with fast deployment.', recommendation: 'Start with 1–2 containers and scale as revenue allows.', confidence: 'high' } },
      { label: '$500K–$2M', result: { title: 'Retrofitted Warehouse', description: 'Good balance of cost and capacity for mid-range budgets.', recommendation: 'Look for industrial buildings near substations for lower interconnection costs.', confidence: 'medium' } },
      { label: '$2M+', result: { title: 'Purpose-Built Facility', description: 'Maximum efficiency and control at scale.', recommendation: 'Custom HVAC, electrical, and security. Lowest operating cost per MW long-term.', confidence: 'high' } },
    ],
  },
];

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const DatacenterEducation = () => {
  return (
    <ModuleLayout moduleId="datacenters">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={DATACENTER_FLASHCARDS} /></div>

      <div id="power-journey"><Suspense fallback={<SectionLoader />}><EnergySourceSection /></Suspense></div>
      <div id="electrical"><Suspense fallback={<SectionLoader />}><ElectricalInfrastructureSection /></Suspense></div>
      <div id="facility-layout"><Suspense fallback={<SectionLoader />}><FacilityDesignSection /></Suspense></div>
      {facilityQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={facilityQuiz.title} questions={facilityQuiz.questions} /></div>}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ComparisonMatrix title="Facility Type Comparison" featureLabels={FACILITY_FEATURE_LABELS} options={FACILITY_OPTIONS} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <DecisionTree title="Which Facility Type Is Right for You?" subtitle="Answer a few questions to get a recommendation based on your situation." nodes={FACILITY_DECISION_NODES} />
      </div>

      <div id="airflow"><Suspense fallback={<SectionLoader />}><AirflowContainmentSection /></Suspense></div>
      <div id="cooling"><Suspense fallback={<SectionLoader />}><CoolingSystemsVisualSection /></Suspense></div>
      {coolingQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={coolingQuiz.title} questions={coolingQuiz.questions} /></div>}

      <div id="hardware"><Suspense fallback={<SectionLoader />}><MiningHardwareShowcaseSection /></Suspense></div>
      {hardwareQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={hardwareQuiz.title} questions={hardwareQuiz.questions} /></div>}

      <div id="operations"><Suspense fallback={<SectionLoader />}><OperationsMonitoringSection /></Suspense></div>
      <div id="economics"><Suspense fallback={<SectionLoader />}><DatacenterEconomicsSection /></Suspense></div>
      <div id="tour"><Suspense fallback={<SectionLoader />}><InteractiveFacilityTour /></Suspense></div>
      <div id="cta"><Suspense fallback={<SectionLoader />}><EnhancedCTASection /></Suspense></div>
    </ModuleLayout>
  );
};

export default DatacenterEducation;
