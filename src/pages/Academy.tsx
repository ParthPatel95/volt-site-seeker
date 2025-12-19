import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AcademyHeroSection } from "@/components/academy/AcademyHeroSection";
import { LearningPathsSection } from "@/components/academy/LearningPathsSection";
import { CurriculumSection } from "@/components/academy/CurriculumSection";
import { AcademyCTASection } from "@/components/academy/AcademyCTASection";
import { QuickStartDashboard } from "@/components/academy/QuickStartDashboard";
import { LearningJourneyMap } from "@/components/academy/LearningJourneyMap";
import { useEffect } from "react";

// Module info for progress tracking
const academyModules = [
  { id: "bitcoin", title: "Bitcoin Fundamentals", route: "/bitcoin", totalSections: 12 },
  { id: "datacenters", title: "Mining Infrastructure", route: "/datacenters", totalSections: 10 },
  { id: "aeso", title: "Alberta Energy Market", route: "/aeso-101", totalSections: 10 },
  { id: "hydro", title: "Hydro Cooling Systems", route: "/hydro-datacenters", totalSections: 12 },
  { id: "electrical", title: "Electrical Infrastructure", route: "/electrical-infrastructure", totalSections: 12 },
  { id: "noise", title: "Noise Management", route: "/noise-management", totalSections: 10 },
  { id: "immersion", title: "Immersion Cooling", route: "/immersion-cooling", totalSections: 10 },
  { id: "site-selection", title: "Site Selection", route: "/site-selection", totalSections: 9 },
  { id: "mining-economics", title: "Mining Economics", route: "/mining-economics", totalSections: 8 },
  { id: "operations", title: "Operations & Maintenance", route: "/operations", totalSections: 8 },
  { id: "risk-management", title: "Risk Management", route: "/risk-management", totalSections: 8 },
  { id: "scaling-growth", title: "Scaling & Growth", route: "/scaling-growth", totalSections: 8 },
];

const Academy = () => {
  useEffect(() => {
    document.title = "WattByte Academy | Comprehensive Bitcoin Mining & Energy Education";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        <AcademyHeroSection />
        
        {/* Quick Start Dashboard for returning users */}
        <QuickStartDashboard modules={academyModules} />
        
        <LearningPathsSection />
        
        {/* Learning Journey Map */}
        <div id="journey-map">
          <LearningJourneyMap />
        </div>
        
        <CurriculumSection />
        <AcademyCTASection />
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Academy;
