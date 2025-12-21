import { BookOpen, GraduationCap, Layers, Sparkles, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Module data with actual lesson counts
const moduleData = [
  { id: "bitcoin", lessons: 12 },
  { id: "datacenters", lessons: 10 },
  { id: "aeso", lessons: 10 },
  { id: "hydro", lessons: 12 },
  { id: "electrical", lessons: 12 },
  { id: "noise", lessons: 10 },
  { id: "immersion", lessons: 10 },
  { id: "site-selection", lessons: 9 },
  { id: "mining-economics", lessons: 8 },
  { id: "operations", lessons: 8 },
  { id: "risk-management", lessons: 8 },
  { id: "scaling-growth", lessons: 8 },
];

const TOTAL_LESSONS = moduleData.reduce((sum, m) => sum + m.lessons, 0);
const TOTAL_MODULES = moduleData.length;

export const AcademyHeroSection = () => {
  const stats = [
    { icon: Layers, value: String(TOTAL_MODULES), label: "Modules" },
    { icon: BookOpen, value: String(TOTAL_LESSONS), label: "Lessons" },
    { icon: GraduationCap, value: "Free", label: "Forever" },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-28 pb-20 bg-gradient-to-b from-watt-navy to-watt-navy/95">
      {/* Simple Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Subtle Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-watt-bitcoin/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-watt-blue/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6">
            <Sparkles className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-medium text-watt-bitcoin">Free Educational Platform</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            WattByte{" "}
            <span className="bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/80 bg-clip-text text-transparent">
              Academy
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Master Bitcoin mining, datacenter operations, and energy market optimization 
            with comprehensive, industry-verified content.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              size="lg" 
              className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 group"
              onClick={() => scrollToSection('curriculum')}
            >
              <Play className="w-4 h-4 mr-2" />
              Browse Modules
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
              onClick={() => window.location.href = '/bitcoin'}
            >
              Start with Bitcoin 101
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
