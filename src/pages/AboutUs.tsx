import React, { useState } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LeadershipTeamSection } from '@/components/landing/LeadershipTeamSection';
import GlobalPresenceSection from '@/components/landing/GlobalPresenceSection';
import { InteractiveStats } from '@/components/landing/InteractiveStats';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ContactFormDialog } from '@/components/contact/ContactFormDialog';

// Import animated components
import { AnimatedHero } from '@/components/about/AnimatedHero';
import { AnimatedTimeline } from '@/components/about/AnimatedTimeline';
import { AnimatedMissionVision } from '@/components/about/AnimatedMissionVision';
import { AnimatedApproach } from '@/components/about/AnimatedApproach';
import { AnimatedWhatWeDo } from '@/components/about/AnimatedWhatWeDo';
import { AnimatedAdvantages } from '@/components/about/AnimatedAdvantages';
import { AnimatedCTA } from '@/components/about/AnimatedCTA';

const AboutUs: React.FC = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      <LandingBackground />
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10">
        {/* Animated Hero Section */}
        <AnimatedHero />

        {/* Our Story - Interactive Timeline */}
        <ScrollReveal>
          <AnimatedTimeline />
        </ScrollReveal>

        {/* Mission & Vision - 3D Tilt Cards */}
        <ScrollReveal>
          <AnimatedMissionVision />
        </ScrollReveal>

        {/* Our Approach - Animated Process Flow */}
        <ScrollReveal>
          <AnimatedApproach />
        </ScrollReveal>

        {/* What We Do - Interactive Showcase */}
        <ScrollReveal>
          <AnimatedWhatWeDo />
        </ScrollReveal>

        {/* Competitive Advantages - Bento Grid */}
        <ScrollReveal>
          <AnimatedAdvantages />
        </ScrollReveal>

        {/* By the Numbers - Enhanced Stats */}
        <ScrollReveal>
          <section className="relative py-16 md:py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
                  By the Numbers
                </h2>
                <p className="text-lg text-watt-navy/70">
                  Real infrastructure, real scale, real progress
                </p>
              </div>

              <InteractiveStats />
            </div>
          </section>
        </ScrollReveal>

        {/* Global Presence */}
        <GlobalPresenceSection />

        {/* Leadership Team Section */}
        <LeadershipTeamSection />

        {/* Join Our Mission CTA - Animated */}
        <ScrollReveal>
          <AnimatedCTA onContactClick={() => setIsContactDialogOpen(true)} />
        </ScrollReveal>

        <LandingFooter />
      </div>

      {/* Contact Form Dialog */}
      <ContactFormDialog 
        open={isContactDialogOpen} 
        onOpenChange={setIsContactDialogOpen}
      />
    </div>
  );
};

export default AboutUs;
