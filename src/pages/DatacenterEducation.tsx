import React, { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ComparisonMatrix } from '@/components/academy/ComparisonMatrix';
import { DecisionTree } from '@/components/academy/DecisionTree';
import { DATACENTER_QUIZZES } from '@/constants/quiz-data';
import { DATACENTER_FLASHCARDS } from '@/constants/flashcard-data';

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

const FACILITY_COMPARISON = {
  title: 'Facility Type Comparison',
  features: ['Deployment Time', 'CapEx per MW', 'Scalability', 'Permitting Complexity', 'Cooling Efficiency', 'Mobility / Relocatability', 'Best For'],
  items: [
    {
      name: 'Container / Modular',
      values: ['4–8 weeks', '$150K–$300K', 'High (add units)', 'Low', 'Good (direct air)', 'High', 'Rapid deployment, remote sites'],
      highlighted: false,
    },
    {
      name: 'Purpose-Built Building',
      values: ['6–12 months', '$400K–$800K', 'Medium (expand building)', 'High', 'Excellent (custom HVAC)', 'None', 'Large-scale, permanent operations'],
      highlighted: true,
    },
    {
      name: 'Retrofitted Warehouse',
      values: ['2–4 months', '$200K–$500K', 'Medium (limited by structure)', 'Medium', 'Variable', 'None', 'Cost-effective, urban locations'],
      highlighted: false,
    },
  ],
};

const FACILITY_DECISION_TREE = {
  title: 'Which Facility Type Is Right for You?',
  description: 'Answer a few questions to get a recommendation based on your situation.',
  nodes: [
    {
      id: 'start',
      question: 'What is your target deployment timeline?',
      options: [
        { label: 'Under 3 months', nextNodeId: 'budget-fast' },
        { label: '3–6 months', nextNodeId: 'budget-medium' },
        { label: '6+ months (willing to wait)', nextNodeId: 'scale-large' },
      ],
    },
    {
      id: 'budget-fast',
      question: 'What is your power capacity target?',
      options: [
        { label: 'Under 5 MW', nextNodeId: 'result-container' },
        { label: '5–20 MW', nextNodeId: 'result-multi-container' },
        { label: '20+ MW', nextNodeId: 'budget-medium' },
      ],
    },
    {
      id: 'budget-medium',
      question: 'Do you have an existing building or land?',
      options: [
        { label: 'Existing warehouse / industrial building', nextNodeId: 'result-retrofit' },
        { label: 'Raw land only', nextNodeId: 'scale-large' },
        { label: 'Neither — still searching', nextNodeId: 'result-container' },
      ],
    },
    {
      id: 'scale-large',
      question: 'What is your total power budget?',
      options: [
        { label: 'Under $500K CapEx', nextNodeId: 'result-container' },
        { label: '$500K–$2M CapEx', nextNodeId: 'result-retrofit' },
        { label: '$2M+ CapEx', nextNodeId: 'result-purpose-built' },
      ],
    },
    {
      id: 'result-container',
      result: {
        title: 'Container / Modular Datacenter',
        description: 'Best for rapid deployment with minimal permitting. Pre-fabricated units can be online in 4–8 weeks. Ideal for testing new sites or remote locations with temporary power.',
        confidence: 85,
      },
    },
    {
      id: 'result-multi-container',
      result: {
        title: 'Multi-Container Array',
        description: 'Deploy multiple container units in parallel for 5–20 MW capacity. Maintains fast timeline while scaling. Consider shared electrical infrastructure to reduce per-unit costs.',
        confidence: 80,
      },
    },
    {
      id: 'result-retrofit',
      result: {
        title: 'Retrofitted Warehouse / Industrial Building',
        description: 'Leverage existing structure to reduce build time and cost. Focus budget on electrical upgrades and cooling infrastructure. Typical 2–4 month deployment.',
        confidence: 78,
      },
    },
    {
      id: 'result-purpose-built',
      result: {
        title: 'Purpose-Built Facility',
        description: 'Maximum efficiency and control. Custom-designed HVAC, electrical, and security. Longer build time (6–12 months) but lowest operating cost per MW at scale.',
        confidence: 90,
      },
    },
  ],
};

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
        <ComparisonMatrix
          title={FACILITY_COMPARISON.title}
          features={FACILITY_COMPARISON.features}
          items={FACILITY_COMPARISON.items}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <DecisionTree
          title={FACILITY_DECISION_TREE.title}
          description={FACILITY_DECISION_TREE.description}
          nodes={FACILITY_DECISION_TREE.nodes}
        />
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
