import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BookOpen, MapPin, Building2, FileCheck, Zap, Scale, CircuitBoard, Volume2, HardHat, Calendar, FileText } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

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

export default function EngineeringPermittingEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="watt-purple" />
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}><EPIntroSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><RegulatoryLandscapeSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><MunicipalPermitsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><SafetyCodesSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><AESOConnectionSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><AUCApprovalSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><ElectricalEngineeringSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><EnvironmentalComplianceSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><SiteEngineeringSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><TimelineCostSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><EPCTASection /></Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
