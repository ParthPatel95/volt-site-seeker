import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BookOpen, Globe, Shield, Network, Hash, Server, Lock, Activity, Cpu, MapPin } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

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

export default function NetworkingEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="watt-purple" />
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}><NetIntroSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetConnectivitySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetRedundancySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetTopologySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetIPManagementSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetPoolConnectivitySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetSecuritySection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetMonitoringSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetHardwareSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><NetCaseStudySection /></Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
