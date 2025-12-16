import { BookOpen, GraduationCap, Layers, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";

const stats = [
  { icon: BookOpen, value: "47", label: "Lessons" },
  { icon: Layers, value: "4", label: "Modules" },
  { icon: Clock, value: "~4h", label: "Total Time" },
  { icon: GraduationCap, value: "Free", label: "Access" },
];

export const AcademyHeroSection = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-watt-navy via-watt-navy/95 to-watt-navy/90">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-watt-bitcoin/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-watt-blue/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6">
              <GraduationCap className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Free Educational Platform</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              WattByte{" "}
              <span className="bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/70 bg-clip-text text-transparent">
                Academy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Master Bitcoin mining, datacenter operations, and energy market optimization 
              with our comprehensive curriculum designed for investors and operators.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8"
                onClick={() => scrollToSection('learning-paths')}
              >
                Start Learning
              </Button>
              <Button 
                size="lg" 
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                onClick={() => scrollToSection('curriculum')}
              >
                View Full Curriculum
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <stat.icon className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
