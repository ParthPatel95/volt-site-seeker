import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AcademyHeroSection } from "@/components/academy/AcademyHeroSection";
import { CurriculumSection } from "@/components/academy/CurriculumSection";
import { AcademyCTASection } from "@/components/academy/AcademyCTASection";
import { ContinueLearningBar } from "@/components/academy/ContinueLearningBar";
import { useEffect } from "react";
import { getModulesForProgress } from "@/constants/curriculum-data";

const academyModules = getModulesForProgress();

const Academy = () => {
  useEffect(() => {
    document.title = "WattByte Academy | Bitcoin Mining & Energy Education";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        <AcademyHeroSection />
        <ContinueLearningBar modules={academyModules} />
        <CurriculumSection />
        <AcademyCTASection />
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Academy;
