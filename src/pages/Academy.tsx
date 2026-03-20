import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AcademyHeroSection } from "@/components/academy/AcademyHeroSection";
import { CurriculumSection } from "@/components/academy/CurriculumSection";
import { AcademyCTASection } from "@/components/academy/AcademyCTASection";
import { useEffect, useState } from "react";

const Academy = () => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "WattByte Academy | Bitcoin Mining & Energy Education";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        <AcademyHeroSection 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
        <CurriculumSection searchQuery={searchQuery} />
        <AcademyCTASection />
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Academy;
