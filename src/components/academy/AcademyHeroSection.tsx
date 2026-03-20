import { BookOpen, GraduationCap, Layers, Clock, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TOTAL_MODULES, TOTAL_LESSONS, TOTAL_HOURS } from "@/constants/curriculum-data";

const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let frame: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return <span>{count}</span>;
};

interface AcademyHeroSectionProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AcademyHeroSection = ({ searchQuery = "", onSearchChange }: AcademyHeroSectionProps) => {
  const stats = [
    { icon: Layers, value: TOTAL_MODULES, label: "Courses" },
    { icon: BookOpen, value: TOTAL_LESSONS, label: "Lessons" },
    { icon: Clock, value: TOTAL_HOURS, label: "Hours", suffix: "+" },
    { icon: GraduationCap, label: "Free Forever", isText: true },
  ];

  return (
    <section className="relative bg-gradient-to-b from-foreground to-foreground/95 text-primary-foreground overflow-hidden pt-24 md:pt-28 pb-16 md:pb-20">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mb-6 text-sm"
          >
            <GraduationCap className="w-4 h-4" />
            Free Learning Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
          >
            WattByte Academy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-lg md:text-xl text-white/70 mb-8 max-w-xl mx-auto"
          >
            Master Bitcoin mining, datacenter operations, and energy markets with industry-verified courses.
          </motion.p>

          {/* Search bar */}
          {onSearchChange && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="max-w-lg mx-auto mb-10"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses, lessons, or topics..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-card text-foreground border-border shadow-lg text-base"
                />
              </div>
            </motion.div>
          )}

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex justify-center gap-8 md:gap-14"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-1.5 text-white/50" />
                <div className="text-2xl md:text-3xl font-bold">
                  {stat.isText ? (
                    <span className="text-lg font-semibold">Free</span>
                  ) : (
                    <>
                      <AnimatedCounter target={stat.value as number} />
                      {stat.suffix}
                    </>
                  )}
                </div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
