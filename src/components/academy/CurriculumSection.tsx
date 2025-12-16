import { useState } from "react";
import { ChevronDown, BookOpen, Bitcoin, Server, Zap, Droplets } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Explicit color classes to avoid Tailwind purge issues
const colorClasses = {
  "watt-bitcoin": {
    bgLight: "bg-watt-bitcoin/10",
    text: "text-watt-bitcoin",
  },
  "watt-blue": {
    bgLight: "bg-watt-blue/10",
    text: "text-watt-blue",
  },
  "watt-success": {
    bgLight: "bg-watt-success/10",
    text: "text-watt-success",
  },
} as const;

type ColorKey = keyof typeof colorClasses;

interface Lesson {
  title: string;
  anchor?: string;
}

interface Module {
  id: string;
  title: string;
  icon: React.ElementType;
  color: ColorKey;
  route: string;
  lessons: Lesson[];
}

const curriculum: Module[] = [
  {
    id: "bitcoin",
    title: "Bitcoin Fundamentals",
    icon: Bitcoin,
    color: "watt-bitcoin",
    route: "/bitcoin",
    lessons: [
      { title: "What is Bitcoin", anchor: "what-is-bitcoin" },
      { title: "Bitcoin History", anchor: "history" },
      { title: "How It Works", anchor: "how-it-works" },
      { title: "Wallets & Storage", anchor: "wallets" },
      { title: "Mining Basics", anchor: "mining" },
      { title: "Datacenter Cooling", anchor: "cooling" },
      { title: "Mining Pools", anchor: "pools" },
      { title: "Mining Sustainability", anchor: "sustainability" },
      { title: "Bitcoin Economics", anchor: "economics" },
      { title: "Benefits & Use Cases", anchor: "benefits" },
      { title: "Global Adoption", anchor: "adoption" },
      { title: "Future Outlook", anchor: "future" },
      { title: "Getting Started", anchor: "cta" },
    ],
  },
  {
    id: "datacenters",
    title: "Mining Infrastructure",
    icon: Server,
    color: "watt-blue",
    route: "/datacenters",
    lessons: [
      { title: "Energy Source to Facility", anchor: "power-journey" },
      { title: "Electrical Infrastructure", anchor: "electrical" },
      { title: "Facility Design & Layout", anchor: "facility-layout" },
      { title: "Airflow & Containment", anchor: "airflow" },
      { title: "Cooling Systems Deep Dive", anchor: "cooling" },
      { title: "Mining Hardware", anchor: "hardware" },
      { title: "Operations & Monitoring", anchor: "operations" },
      { title: "Datacenter Economics", anchor: "economics" },
      { title: "Interactive Facility Tour", anchor: "tour" },
      { title: "Next Steps", anchor: "cta" },
    ],
  },
  {
    id: "aeso",
    title: "Alberta Energy Market",
    icon: Zap,
    color: "watt-success",
    route: "/aeso-101",
    lessons: [
      { title: "What is AESO", anchor: "what-is-aeso" },
      { title: "Market Participants", anchor: "participants" },
      { title: "Pool Pricing Explained", anchor: "pool-pricing" },
      { title: "Price Trends & Analysis", anchor: "price-trends" },
      { title: "12CP Explained", anchor: "12cp" },
      { title: "Savings Programs", anchor: "savings" },
      { title: "Rate 65 Explained", anchor: "rate-65" },
      { title: "Grid Operations", anchor: "grid-ops" },
      { title: "Generation Mix", anchor: "generation" },
      { title: "Energy Forecast", anchor: "forecast" },
      { title: "Market Optimization", anchor: "optimization" },
      { title: "Take Action", anchor: "cta" },
    ],
  },
  {
    id: "hydro",
    title: "Hydro Cooling Systems",
    icon: Droplets,
    color: "watt-blue",
    route: "/hydro-datacenters",
    lessons: [
      { title: "Why Hydro-cooling", anchor: "advantages" },
      { title: "Container Products", anchor: "containers" },
      { title: "Cooling Methods", anchor: "cooling-methods" },
      { title: "Site Selection", anchor: "site-selection" },
      { title: "Modular Layout Design", anchor: "layout" },
      { title: "Water Systems", anchor: "water-systems" },
      { title: "Electrical Infrastructure", anchor: "electrical" },
      { title: "Network & Security", anchor: "network" },
      { title: "Construction & Acceptance", anchor: "construction" },
      { title: "Economics & ROI", anchor: "economics" },
      { title: "Waste Heat Recovery", anchor: "waste-heat" },
      { title: "Implementation Guide", anchor: "cta" },
    ],
  },
];

const ModuleCard = ({ module, index }: { module: Module; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const navigate = useNavigate();
  const colors = colorClasses[module.color];

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.anchor) {
      navigate(`${module.route}#${lesson.anchor}`);
    } else {
      navigate(module.route);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${colors.bgLight} flex items-center justify-center`}>
            <module.icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-watt-navy">
              Module {index + 1}: {module.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {module.lessons.length} lessons
            </p>
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Lessons List */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[1000px]" : "max-h-0"
      )}>
        <div className="border-t border-border">
          {module.lessons.map((lesson, lessonIndex) => (
            <button
              key={lesson.title}
              onClick={() => handleLessonClick(lesson)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors text-left border-b border-border/50 last:border-b-0"
            >
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {lessonIndex + 1}
              </div>
              <span className="text-sm text-watt-navy/80 hover:text-watt-navy">
                {lesson.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CurriculumSection = () => {
  const totalLessons = curriculum.reduce((acc, module) => acc + module.lessons.length, 0);

  return (
    <section id="curriculum" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              {totalLessons} Total Lessons
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Full Curriculum
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore all modules and lessons. Click any lesson to jump directly to that topic.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-4">
          {curriculum.map((module, index) => (
            <ScrollReveal key={module.id} delay={index * 50}>
              <ModuleCard module={module} index={index} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};