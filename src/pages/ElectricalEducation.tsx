import React, { Suspense, lazy } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Zap, Globe, Cable, CircuitBoard, ToggleLeft, Battery, Server, Cpu, Activity, Anchor, AlertTriangle, Shield } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

// Lazy load sections for performance
const ElectricalIntroSection = lazy(() => import('@/components/electrical/ElectricalIntroSection'));
const GridConnectionSection = lazy(() => import('@/components/electrical/GridConnectionSection'));
const HighVoltageSection = lazy(() => import('@/components/electrical/HighVoltageSection'));
const TransformersSection = lazy(() => import('@/components/electrical/TransformersSection'));
const SwitchgearSection = lazy(() => import('@/components/electrical/SwitchgearSection'));
const LowVoltageSection = lazy(() => import('@/components/electrical/LowVoltageSection'));
const PDUSection = lazy(() => import('@/components/electrical/PDUSection'));
const MiningPowerSection = lazy(() => import('@/components/electrical/MiningPowerSection'));
const PowerQualitySection = lazy(() => import('@/components/electrical/PowerQualitySection'));
const GroundingSection = lazy(() => import('@/components/electrical/GroundingSection'));
const ArcFlashSection = lazy(() => import('@/components/electrical/ArcFlashSection'));
const RedundancySection = lazy(() => import('@/components/electrical/RedundancySection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-watt-bitcoin"></div>
  </div>
);

// Navigation sections config
const navSections = [
  { id: 'intro', icon: Zap, label: 'Introduction', time: '5 min' },
  { id: 'grid-connection', icon: Globe, label: 'Grid Connection', time: '7 min' },
  { id: 'high-voltage', icon: Cable, label: 'High Voltage', time: '8 min' },
  { id: 'transformers', icon: CircuitBoard, label: 'Transformers', time: '7 min' },
  { id: 'switchgear', icon: ToggleLeft, label: 'Switchgear', time: '6 min' },
  { id: 'low-voltage', icon: Battery, label: 'Low Voltage', time: '6 min' },
  { id: 'pdu', icon: Server, label: 'PDU', time: '5 min' },
  { id: 'mining-power', icon: Cpu, label: 'Mining Power', time: '6 min' },
  { id: 'power-quality', icon: Activity, label: 'Power Quality', time: '6 min' },
  { id: 'grounding', icon: Anchor, label: 'Grounding', time: '5 min' },
  { id: 'arc-flash', icon: AlertTriangle, label: 'Arc Flash', time: '6 min' },
  { id: 'redundancy', icon: Shield, label: 'Redundancy', time: '5 min' },
];

const ElectricalEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      {/* Section Navigation - hidden on mobile, toggleable on desktop */}
      <EducationSectionNav sections={navSections} accentColor="watt-bitcoin" />
      
      <main>
        <Suspense fallback={<SectionLoader />}>
          <ElectricalIntroSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <GridConnectionSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <HighVoltageSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TransformersSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <SwitchgearSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <LowVoltageSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PDUSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <MiningPowerSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PowerQualitySection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <GroundingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ArcFlashSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <RedundancySection />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ElectricalEducation;
